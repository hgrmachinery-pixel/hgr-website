import { sql } from "@payloadcms/db-postgres";
import type { PayloadRequest } from "payload";

import { hasOwnerAuthority } from "../auth/permissions.ts";

type MachineDeletionEvidence = {
  status?: unknown;
  everPublished?: unknown;
  hasPublishedVersion?: unknown;
  hasMachineMedia?: unknown;
  hasMachineDocuments?: unknown;
  hasMediaReferences?: unknown;
  hasPendingCleanupJobs?: unknown;
};

function isTrue(value: unknown): boolean {
  return value === true || value === "true";
}

export function machineDeletionBlockReason(evidence: MachineDeletionEvidence): string | undefined {
  if (evidence.status === "published") return "This machine has been published. Archive it instead of permanently deleting it.";
  if (isTrue(evidence.everPublished) || isTrue(evidence.hasPublishedVersion)) {
    return "This machine has publication history. Archive it instead of permanently deleting it.";
  }
  if (evidence.everPublished !== false && evidence.everPublished !== "false") {
    return "This machine’s publication history cannot be verified. Keep it and archive it instead.";
  }
  if (isTrue(evidence.hasMachineMedia) || isTrue(evidence.hasMediaReferences)) {
    return "Delete the machine’s linked photos first. Their storage cleanup must finish before the machine can be deleted.";
  }
  if (isTrue(evidence.hasMachineDocuments)) {
    return "This machine has retained documents and cannot be permanently deleted. Archive it instead.";
  }
  if (isTrue(evidence.hasPendingCleanupJobs)) {
    return "Photo storage cleanup is still queued for this machine. Wait for cleanup to finish, then retry.";
  }
  if (evidence.status !== "draft") {
    return "Only a never-published draft machine can be permanently deleted. Archive it instead.";
  }
  return undefined;
}

type ExecuteDB = Parameters<PayloadRequest["payload"]["db"]["execute"]>[0]["db"];

export async function getMachineDeletionBlockReason(
  req: PayloadRequest,
  id: number | string,
  db?: ExecuteDB,
): Promise<string | undefined> {
  const result = await req.payload.db.execute({
    db,
    drizzle: req.payload.db.drizzle,
    // Keep this separate from the row-lock statement. Under READ COMMITTED it
    // obtains a fresh snapshot after waiting for a concurrent machine update.
    sql: sql`SELECT
      m."_status" AS "status",
      m."ever_published" AS "everPublished",
      EXISTS (
        SELECT 1 FROM "_machines_v" v
        WHERE v."parent_id" = m."id" AND v."version__status" = 'published'
      ) AS "hasPublishedVersion",
      EXISTS (
        SELECT 1 FROM "machine_media" media WHERE media."machine_id" = m."id"
      ) AS "hasMachineMedia",
      EXISTS (
        SELECT 1 FROM "machine_documents" document WHERE document."machine_id" = m."id"
      ) AS "hasMachineDocuments",
      (
        m."featured_image_id" IS NOT NULL OR
        EXISTS (SELECT 1 FROM "machines_rels" rel WHERE rel."parent_id" = m."id" AND rel."machine_media_id" IS NOT NULL) OR
        EXISTS (
          SELECT 1 FROM "_machines_v" v
          LEFT JOIN "_machines_v_rels" rel ON rel."parent_id" = v."id"
          WHERE v."parent_id" = m."id" AND
            (v."version_featured_image_id" IS NOT NULL OR rel."machine_media_id" IS NOT NULL)
        )
      ) AS "hasMediaReferences",
      EXISTS (
        SELECT 1 FROM "machine_media_deletion_jobs" job
        WHERE job."status" <> 'completed'
          AND lower(regexp_replace(job."object_key", '^.*/', '')) LIKE lower(m."hgr_id") || '-%'
      ) AS "hasPendingCleanupJobs"
    FROM "machines" m WHERE m."id" = ${id} LIMIT 1`,
  });
  const evidence = result.rows[0] as MachineDeletionEvidence | undefined;
  if (!evidence) return "This machine no longer exists. Reload the page and try again.";
  return machineDeletionBlockReason(evidence);
}

export async function canOwnerDeleteMachine(req: PayloadRequest, id?: number | string): Promise<boolean> {
  if (id === undefined) return false;
  try {
    if (!(await hasOwnerAuthority(req))) return false;
    return !(await getMachineDeletionBlockReason(req, id));
  } catch {
    // Permission checks fail closed when the database cannot verify eligibility.
    return false;
  }
}
