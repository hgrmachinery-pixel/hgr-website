import { getPayload } from "payload";
import config from "@payload-config";
import { processInventoryMedia } from "@/lib/inventory/media-server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config });
    const result = await processInventoryMedia({ request, payload });
    return Response.json(result, { status: result.status, headers: { "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie, Origin" } });
  } catch { return Response.json({ error: "Image processing failed; the private master remains available." }, { status: 500, headers: { "Cache-Control": "private, no-store", Vary: "Cookie, Origin" } }); }
}
