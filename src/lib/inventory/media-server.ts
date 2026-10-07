import { createHash } from "node:crypto";
import { createLocalReq, type Payload } from "payload";
import sharp from "sharp";
import { isStaffUser } from "../machines/access.ts";
import { inventoryMediaReviewChecklist, type InventoryMediaCategory } from "./media.ts";

type Req = { user?: unknown; payload: any };
const idOf = (value: any) => typeof value === "string" || typeof value === "number" ? String(value) : value && typeof value === "object" && (typeof value.id === "string" || typeof value.id === "number") ? String(value.id) : "";
const currentOwner = async (payload: any, media: any) => {
  if (!media || !["spare-part", "lubricant"].includes(media.ownerType)) return null;
  try {
    const owner = await payload.findByID({ collection: media.ownerType === "spare-part" ? "spare-parts" : "lubricants", id: media.ownerId, depth: 0, overrideAccess: true });
    return owner?._status === "published" && owner.archived !== true && String(owner.id) === String(media.ownerId) ? owner : null;
  } catch { return null; }
};

function hasCurrentHumanApproval(media: any) {
  if (!media || media.reviewStatus !== "approved" || !media.approvedBy || typeof media.approvedAt !== "string" || !Number.isFinite(Date.parse(media.approvedAt))) return false;
  const history = Array.isArray(media.reviewHistory) ? media.reviewHistory : [];
  const event = history.at(-1);
  const checklist = event?.checklist;
  return event?.event === "approved" && String(event.actor) === String(media.approvedBy) && event.at === media.approvedAt && event.digest === media.contentDigest && Number(event.revision) === Number(media.revision) && inventoryMediaReviewChecklist.every((key) => checklist?.[key] === "clear");
}

export const validateInventoryPublicationMedia = async ({ data, originalDoc, req, collection }: { data: Record<string, any>; originalDoc?: Record<string, any> | null; req: any; collection: { slug?: string } }) => {
  const item = { ...(originalDoc ?? {}), ...data };
  if (item._status !== "published") return data;
  const ids = [item.featuredImage, ...(Array.isArray(item.gallery) ? item.gallery : [])].map(idOf).filter(Boolean);
  if (ids.length < 1 || !idOf(item.featuredImage) || !ids.includes(idOf(item.featuredImage))) throw new Error("A featured approved image must also be selected in the gallery before publishing");
  const records = await Promise.all(ids.map((id) => req.payload.findByID({ collection: "inventory-media", id, depth: 0, overrideAccess: true, req }).catch(() => null)));
  const kind = collection.slug === "lubricants" ? "lubricant" : "spare-part";
  for (const record of records) {
    if (!record || record.assetKind !== "derivative" || !hasCurrentHumanApproval(record) || record.processingStatus !== "ready" || record.ownerType !== kind || String(record.ownerId) !== String(item.id ?? originalDoc?.id) || !record.contentDigest || !record.sourceMaster) throw new Error("Only approved current images for this inventory item can be selected for publication");
    const master = await req.payload.findByID({ collection: "inventory-media", id: idOf(record.sourceMaster), depth: 0, overrideAccess: true, req }).catch(() => null);
    if (!master || master.assetKind !== "master" || master.contentDigest !== record.sourceDigest || String(master.ownerId) !== String(record.ownerId) || master.ownerType !== record.ownerType || master.category !== record.category || Number(master.revision) !== Number(record.revision)) throw new Error("Only approved current images for this inventory item can be selected for publication");
  }
  return data;
};

export async function isApprovedInventoryDerivative(payload: any, derivative: any) {
  if (!derivative || derivative.assetKind !== "derivative" || !hasCurrentHumanApproval(derivative) || derivative.processingStatus !== "ready" || !derivative.contentDigest || !derivative.sourceMaster) return false;
  const owner = await currentOwner(payload, derivative);
  if (!owner || String(owner._status) !== "published") return false;
    const selected = idOf(owner.featuredImage) === String(derivative.id) || (Array.isArray(owner.gallery) && owner.gallery.some((item: any) => idOf(item) === String(derivative.id)));
  if (!selected) return false;
  try {
    const master = await payload.findByID({ collection: "inventory-media", id: idOf(derivative.sourceMaster), depth: 0, overrideAccess: true });
    return master?.assetKind === "master" && master.contentDigest === derivative.sourceDigest && String(master.ownerId) === String(derivative.ownerId) && master.ownerType === derivative.ownerType && master.category === derivative.category && Number(derivative.revision) === Number(master.revision);
  } catch { return false; }
}

export async function canReadInventoryMedia({ req, id }: { req: Req; id?: string | number }) {
  if (isStaffUser(req.user)) return true;
  if (!id || process.env.HGR_INVENTORY_MEDIA_DELIVERY_VERIFIED !== "true") return false;
  try {
    const record = await req.payload.findByID({ collection: "inventory-media", id, depth: 0, overrideAccess: true, req });
    return await isApprovedInventoryDerivative(req.payload, record) ? { id: { equals: record.id } } : false;
  } catch { return false; }
}

export function inventoryMediaDigest(buffer: Buffer) { return `sha256:${createHash("sha256").update(buffer).digest("hex")}`; }

export async function processInventoryMedia({ request, payload }: { request: Request; payload: Payload }) {
  const serverURL = process.env.SERVER_URL;
  let origin = "";
  try { origin = new URL(serverURL ?? "").origin; } catch { return { status: 403, error: "Image processing is unavailable" }; }
  if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") !== "same-origin") return { status: 403, error: "Same-origin image processing is required" };
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return { status: 401, error: "Staff sign-in is required" };
  const id = request.headers.get("x-hgr-inventory-media-id");
  if (!id || !/^\d{1,16}$/.test(id)) return { status: 400, error: "A valid image ID is required" };
  const max = Number(process.env.HGR_MACHINE_PHOTO_MAX_FILE_BYTES);
  const declaredSize = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(max) || max < 1 || !Number.isSafeInteger(declaredSize) || declaredSize < 1 || declaredSize > max) return { status: 413, error: "Image exceeds the configured processing limit" };
  const master = await payload.findByID({ collection: "inventory-media", id: Number(id), depth: 0, overrideAccess: false, user: auth.user });
  if (master.assetKind !== "master" || !master.contentDigest) return { status: 404, error: "Private image master was not found" };
  if (!master.filename || !/^[a-z0-9._-]+$/i.test(master.filename)) return { status: 422, error: "Private master storage path is invalid" };
  const inputType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (!inputType || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(inputType) || Number(master.filesize) !== declaredSize) return { status: 415, error: "Image request does not match the stored master" };
  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length !== declaredSize || inventoryMediaDigest(bytes) !== master.contentDigest) return { status: 422, error: "Image bytes do not match the private master" };
  let metadata: { format?: string };
  try { metadata = await sharp(bytes, { failOn: "error", limitInputPixels: 100_000_000 }).metadata(); } catch { return { status: 415, error: "Image could not be decoded" }; }
  const decodedType = metadata.format === "jpeg" ? "image/jpeg" : metadata.format ? `image/${metadata.format}` : "";
  if (!metadata.format || !["jpeg", "png", "webp", "avif"].includes(metadata.format) || decodedType !== inputType) return { status: 415, error: "Image contents do not match the supported file type" };
  const webp = await sharp(bytes, { failOn: "error", limitInputPixels: 100_000_000 }).rotate().webp({ quality: 84, effort: 4 }).toBuffer();
  const derivativeDigest = inventoryMediaDigest(webp);
  const ownerType = master.ownerType as "spare-part" | "lubricant";
  const owner = await payload.findByID({ collection: ownerType === "spare-part" ? "spare-parts" : "lubricants", id: master.ownerId, depth: 0, overrideAccess: true });
  const localReq = await createLocalReq({ user: auth.user, context: { inventoryMediaWorkflow: true } }, payload);
  const derivative = await payload.create({ collection: "inventory-media", data: {
    ownerType, ownerId: String(master.ownerId), category: master.category as InventoryMediaCategory, assetKind: "derivative", revision: Number(master.revision), sourceMaster: master.id, sourceDigest: master.contentDigest, contentDigest: derivativeDigest, processingStatus: "ready", reviewStatus: "needs-review", altText: master.altText || `Photo for ${owner.name}`, focalX: master.focalX ?? 50, focalY: master.focalY ?? 50, order: master.order ?? 0, processedBy: String(auth.user.id), processedAt: new Date().toISOString(), reviewHistory: [], auditHistory: [{ event: "processed", actor: String(auth.user.id), at: new Date().toISOString(), digest: derivativeDigest }],
  }, file: { data: webp, mimetype: "image/webp", name: `hgr-${ownerType}-${master.ownerId}-${String(master.category)}-r${master.revision}.webp`, size: webp.length }, overrideAccess: true, req: localReq });
  return { status: 200, derivativeId: derivative.id, digest: derivativeDigest };
}

export async function reviewInventoryMedia({ request, payload }: { request: Request; payload: Payload }) {
  const expected = (() => { try { return new URL(process.env.SERVER_URL ?? "").origin; } catch { return ""; } })();
  if (!expected || request.headers.get("origin") !== expected || request.headers.get("sec-fetch-site") !== "same-origin") return { status: 403, error: "Same-origin review is required" };
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return { status: 401, error: "Staff sign-in is required" };
  let input: any;
  try { input = await request.json(); } catch { return { status: 400, error: "Review details are invalid" }; }
  if (!input || !/^\d{1,16}$/.test(String(input.id)) || !["approved", "rejected"].includes(input.status)) return { status: 400, error: "Review details are invalid" };
  const media = await payload.findByID({ collection: "inventory-media", id: Number(input.id), depth: 0, overrideAccess: false, user: auth.user });
  if (media.assetKind !== "derivative" || media.processingStatus !== "ready" || media.reviewStatus === input.status) return { status: 409, error: "Image is not awaiting this review" };
  if (input.status === "approved" && (!input.checklist || inventoryMediaReviewChecklist.some((key) => input.checklist[key] !== "clear"))) return { status: 422, error: "Complete every human review check as clear before approval" };
  const history = Array.isArray(media.reviewHistory) ? media.reviewHistory : [];
  const at = new Date().toISOString();
  const event = { event: input.status, actor: String(auth.user.id), at, digest: media.contentDigest, revision: media.revision, checklist: input.checklist };
  const localReq = await createLocalReq({ user: auth.user, context: { inventoryMediaWorkflow: true } }, payload);
  await payload.update({ collection: "inventory-media", id: media.id, data: { reviewStatus: input.status, reviewHistory: [...history, event], auditHistory: [...(Array.isArray(media.auditHistory) ? media.auditHistory : []), event], ...(input.status === "approved" ? { approvedBy: String(auth.user.id), approvedAt: at } : {}) }, overrideAccess: true, req: localReq });
  if (input.status === "approved" && input.publishInGallery === true) {
    const ownerCollection = media.ownerType === "spare-part" ? "spare-parts" : "lubricants";
    const owner = await payload.findByID({ collection: ownerCollection, id: media.ownerId, depth: 0, overrideAccess: true });
    const gallery = Array.isArray(owner.gallery) ? owner.gallery.map(idOf).map(Number).filter(Number.isSafeInteger) : [];
    if (!gallery.includes(Number(media.id))) gallery.push(Number(media.id));
    const update: { featuredImage?: number; gallery: number[] } = media.category === "featured" ? { featuredImage: Number(media.id), gallery } : { gallery };
    await payload.update({ collection: ownerCollection, id: owner.id, data: update, overrideAccess: true, user: auth.user, context: { inventoryMediaWorkflow: true } });
  }
  return { status: 200, id: media.id, reviewStatus: input.status };
}
