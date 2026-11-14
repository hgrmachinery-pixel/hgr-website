import type { PayloadRequest } from "payload";

import { isStaffUser } from "./access.ts";

const MAX_MACHINE_MEDIA_BULK_DELETE = 100;
const PUBLISHED_MACHINE_DELETE_ERROR = "Unpublish the machine and remove this photo from any published machine before deleting it";

export type MachineMediaBulkDeleteResult = {
  deletedIDs: Array<number | string>;
  cascadedIDs: Array<number | string>;
  failures: Array<{ id: number | string; message: string }>;
};

function normalizeRecordID(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return value;
  if (typeof value !== "string" || !/^\d{1,16}$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function deleteFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message === PUBLISHED_MACHINE_DELETE_ERROR) return error.message;
  return "Could not delete this image. Refresh the list and try again; contact the Owner if the problem continues.";
}

/** Delete explicit image IDs sequentially through Payload's protected single-record operation. */
export async function deleteMachineMediaSelection(
  req: PayloadRequest,
  requestedIDs: unknown,
): Promise<MachineMediaBulkDeleteResult> {
  if (!isStaffUser(req.user)) throw new Error("Staff sign-in is required to delete machine photos");
  if (!Array.isArray(requestedIDs)) {
    throw new Error("Select valid machine images and try again.");
  }
  if (requestedIDs.length > MAX_MACHINE_MEDIA_BULK_DELETE) {
    throw new Error(`Select no more than ${MAX_MACHINE_MEDIA_BULK_DELETE} images at a time.`);
  }

  const normalizedIDs = requestedIDs.map(normalizeRecordID);
  if (normalizedIDs.some((id) => id === undefined)) throw new Error("Select valid machine images and try again.");
  const uniqueByKey = new Map<string, number>();
  for (const id of normalizedIDs as number[]) {
    if (!uniqueByKey.has(String(id))) uniqueByKey.set(String(id), id);
  }
  const uniqueIDs = [...uniqueByKey.values()];
  if (uniqueIDs.length < 2) throw new Error("Select at least two different machine images.");

  const result: MachineMediaBulkDeleteResult = { deletedIDs: [], cascadedIDs: [], failures: [] };
  const selectedKeys = new Set(uniqueIDs.map(String));
  const cascadedBy = new Map<string, number | string>();

  for (const id of uniqueIDs) {
    const cascadeParent = cascadedBy.get(String(id));
    if (cascadeParent !== undefined) {
      result.deletedIDs.push(id);
      result.cascadedIDs.push(id);
      continue;
    }

    try {
      // Passing an ID uses Payload's deleteByID operation and runs the same
      // beforeDelete/afterDelete hooks as the single-image Admin action.
      await req.payload.delete({ collection: "machine-media", id, overrideAccess: false, req });
      result.deletedIDs.push(id);

      const deletion = (req.context as Record<string, any> | undefined)?.machineMediaDeletion as
        Record<string, { childIDs?: Array<number | string> }> | undefined;
      for (const childID of deletion?.[String(id)]?.childIDs ?? []) {
        if (selectedKeys.has(String(childID))) cascadedBy.set(String(childID), id);
      }
    } catch (error) {
      result.failures.push({ id, message: deleteFailureMessage(error) });
    }
  }

  return result;
}

export async function machineMediaBulkDeleteEndpoint(req: PayloadRequest): Promise<Response> {
  if (!isStaffUser(req.user)) {
    return Response.json({ error: "Staff sign-in is required to delete machine photos." }, { status: 403 });
  }

  let body: unknown;
  try {
    if (typeof req.json !== "function") throw new Error("Request body is unavailable");
    body = await req.json();
  } catch {
    return Response.json({ error: "A valid JSON selection is required." }, { status: 400 });
  }

  const ids = body && typeof body === "object" && !Array.isArray(body)
    ? (body as { ids?: unknown }).ids
    : undefined;
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > MAX_MACHINE_MEDIA_BULK_DELETE || ids.some((id) => normalizeRecordID(id) === undefined)) {
    return Response.json({ error: `Select between 2 and ${MAX_MACHINE_MEDIA_BULK_DELETE} valid machine images.` }, { status: 400 });
  }

  try {
    return Response.json(await deleteMachineMediaSelection(req, ids));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The selected images could not be processed." }, { status: 400 });
  }
}
