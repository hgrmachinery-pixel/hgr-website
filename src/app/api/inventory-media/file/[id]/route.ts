import { getPayload } from "payload";
import config from "@payload-config";
import { isApprovedInventoryDerivative } from "@/lib/inventory/media-server";
import { inventoryObjectStorage } from "@/lib/inventory/media-storage";
import { isStaffUser } from "@/lib/machines/access";

export const runtime = "nodejs";
const sizes = new Set(["thumbnail", "card", "large"]);
function error(status: number) { return new Response("Not found", { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } }); }

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id;
  if (!/^\d{1,16}$/.test(id)) return error(404);
  const size = new URL(request.url).searchParams.get("size") ?? "large";
  if (!sizes.has(size)) return error(404);
  try {
    const payload = await getPayload({ config });
    const media = await payload.findByID({ collection: "inventory-media", id: Number(id), depth: 0, overrideAccess: true }) as Record<string, any>;
    const auth = await payload.auth({ headers: request.headers });
    const staffPreview = isStaffUser(auth.user) && media?.assetKind === "derivative" && media.processingStatus === "ready" && media.mimeType === "image/webp";
    if (!staffPreview && process.env.HGR_INVENTORY_MEDIA_DELIVERY_VERIFIED !== "true") return error(404);
    if (!staffPreview && !(await isApprovedInventoryDerivative(payload, media))) return error(404);
    const rendition = media.sizes?.[size as "thumbnail" | "card" | "large"] ?? (size === "large" ? media : undefined);
    const filename = rendition?.filename ?? media.filename;
    if (!filename || typeof filename !== "string" || filename.includes("/") || filename.includes("\\") || !/^[a-z0-9._-]+$/i.test(filename) || !filename.toLowerCase().endsWith(".webp") || (rendition?.mimeType ?? media.mimeType) !== "image/webp") return error(404);
    if (media.storageProvider !== "r2") return error(404);
    const bytes = await inventoryObjectStorage().read({ filename, prefix: rendition?.prefix ?? media.prefix, objectKey: rendition?._objectKey ?? media._objectKey });
    const etag = `"${String(media.contentDigest ?? "").replace(/[^a-f0-9]/gi, "")}"`;
    return new Response(new Uint8Array(bytes), { status: 200, headers: { "Content-Type": "image/webp", "Content-Length": String(bytes.length), "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie", "X-Content-Type-Options": "nosniff", ETag: etag, "Content-Disposition": "inline" } });
  } catch { return error(404); }
}
