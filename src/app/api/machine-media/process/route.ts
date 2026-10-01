import { getPayload } from "payload";

import config from "@payload-config";
import { processMachinePhoto } from "@/lib/machines/media-process";

export const runtime = "nodejs";

function response(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie, Origin" },
  });
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config });
    const result = await processMachinePhoto({ request, payload });
    return response(result, result.status);
  } catch {
    return response({ error: "Photo processing failed. The private master remains available." }, 500);
  }
}
