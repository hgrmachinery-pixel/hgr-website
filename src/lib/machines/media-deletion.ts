import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { buildStoragePathData } from "@payloadcms/plugin-cloud-storage/utilities";
import type { Payload } from "payload";
import { sql } from "@payloadcms/db-postgres";

const retryBaseMs = 30_000;
const retryMaxMs = 6 * 60 * 60 * 1000;

export function machineMediaObjectKeys(files: Array<{
  filename?: unknown;
  prefix?: unknown;
  objectKey?: unknown;
  sizes?: unknown;
}>): string[] {
  return files.flatMap((file) => {
    const sizes = file.sizes && typeof file.sizes === "object" ? Object.values(file.sizes as Record<string, { filename?: unknown }>) : [];
    return [file.filename, ...sizes.map((size) => size?.filename)]
      .filter((filename): filename is string => typeof filename === "string" && filename.length > 0)
      .map((filename) => buildStoragePathData({
        collectionPrefix: "machine-media",
        docPrefix: [file.prefix ?? "machine-media", file.objectKey].filter((value) => typeof value === "string" && value.length > 0).join("/"),
        filename,
        useCompositePrefixes: false,
      }).storageFilePath);
  });
}

export function mediaDeletionRetryDelayMs(attempt: number): number {
  const safeAttempt = Number.isSafeInteger(attempt) && attempt > 0 ? Math.min(attempt, 20) : 1;
  return Math.min(retryMaxMs, retryBaseMs * 2 ** (safeAttempt - 1));
}

export function safeMediaDeletionErrorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "storage-delete-failed";
  const name = (error as { name?: unknown }).name;
  const code = (error as { Code?: unknown; code?: unknown }).Code ?? (error as { code?: unknown }).code ?? name;
  return typeof code === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(code) ? code : "storage-delete-failed";
}

export async function runMachineMediaDeletionAttempt({
  attempt,
  deleteObject,
  markCompleted,
  scheduleRetry,
}: {
  attempt: number;
  deleteObject: () => Promise<unknown>;
  markCompleted: () => Promise<unknown>;
  scheduleRetry: (errorCode: string, delayMs: number) => Promise<unknown>;
}): Promise<"completed" | "retry-scheduled"> {
  try {
    await deleteObject();
    await markCompleted();
    return "completed";
  } catch (error) {
    await scheduleRetry(safeMediaDeletionErrorCode(error), mediaDeletionRetryDelayMs(attempt));
    return "retry-scheduled";
  }
}

let workerTimer: NodeJS.Timeout | undefined;
let draining = false;

/** Starts an opt-in server worker; every request deletes one exact, committed outbox key. */
export function startMachineMediaDeletionWorker(payload: Payload): void {
  if (workerTimer || process.env.HGR_MEDIA_CLEANUP_WORKER_ENABLED !== "true") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    payload.logger.error({ msg: "Machine photo cleanup worker is enabled but storage configuration is incomplete" });
    return;
  }
  const client = new S3Client({
    endpoint, region: "auto", forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  const drain = async () => {
    if (draining) return;
    draining = true;
    try {
      const claimed = await payload.db.execute({ drizzle: payload.db.drizzle, sql: sql`
        WITH next_job AS (
          SELECT "id" FROM "machine_media_deletion_jobs"
          WHERE ("status" = 'pending' AND "next_attempt_at" <= now())
             OR ("status" = 'processing' AND "lease_until" < now())
          ORDER BY "created_at", "id"
          FOR UPDATE SKIP LOCKED LIMIT 1
        )
        UPDATE "machine_media_deletion_jobs" AS job
        SET "status" = 'processing', "attempts" = job."attempts" + 1,
            "lease_token" = gen_random_uuid(), "lease_until" = now() + interval '5 minutes', "updated_at" = now()
        FROM next_job WHERE job."id" = next_job."id"
        RETURNING job."id", job."bucket", job."object_key", job."attempts", job."lease_token"
      ` });
      const job = claimed.rows[0] as { id: number; bucket: string; object_key: string; attempts: number; lease_token: string } | undefined;
      if (!job) return;
      if (job.bucket !== bucket || !job.object_key || job.object_key.startsWith("/") || job.object_key.includes("..")) {
        await payload.db.execute({ drizzle: payload.db.drizzle, sql: sql`
          UPDATE "machine_media_deletion_jobs" SET "status" = 'pending', "last_error_code" = 'target-mismatch',
            "next_attempt_at" = now() + interval '1 hour', "lease_token" = NULL, "lease_until" = NULL, "updated_at" = now()
          WHERE "id" = ${job.id} AND "lease_token" = ${job.lease_token}
        ` });
        payload.logger.error({ msg: "Machine photo cleanup job target did not match configured storage" });
        return;
      }
      await runMachineMediaDeletionAttempt({
        attempt: job.attempts,
        deleteObject: () => client.send(new DeleteObjectCommand({ Bucket: bucket, Key: job.object_key })),
        markCompleted: () => payload.db.execute({ drizzle: payload.db.drizzle, sql: sql`
          UPDATE "machine_media_deletion_jobs" SET "status" = 'completed', "completed_at" = now(),
            "lease_token" = NULL, "lease_until" = NULL, "last_error_code" = NULL, "updated_at" = now()
          WHERE "id" = ${job.id} AND "lease_token" = ${job.lease_token}
        ` }),
        scheduleRetry: (errorCode, delay) => payload.db.execute({ drizzle: payload.db.drizzle, sql: sql`
          UPDATE "machine_media_deletion_jobs" SET "status" = 'pending', "last_error_code" = ${errorCode},
            "next_attempt_at" = now() + (${delay} * interval '1 millisecond'),
            "lease_token" = NULL, "lease_until" = NULL, "updated_at" = now()
          WHERE "id" = ${job.id} AND "lease_token" = ${job.lease_token}
        ` }),
      }).then((result) => {
        if (result === "retry-scheduled") payload.logger.error({ msg: "Machine photo object deletion failed; retry scheduled", jobID: job.id });
      });
    } catch (error) {
      payload.logger.error({ msg: "Machine photo cleanup worker could not claim a job", errorCode: safeMediaDeletionErrorCode(error) });
    } finally {
      draining = false;
    }
  };
  void drain();
  workerTimer = setInterval(() => { void drain(); }, 15_000);
  workerTimer.unref();
}

