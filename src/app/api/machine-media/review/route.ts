import { getPayload } from "payload";

import config from "@payload-config";
import { reviewMachinePhoto } from "@/lib/machines/media-review";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config });
    const result = await reviewMachinePhoto({ request, payload });
    return Response.json(result, {
      status: result.status,
      headers: { "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie, Origin" },
    });
  } catch {
    return Response.json({ error: "Photo review could not be saved." }, {
      status: 500,
      headers: { "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie, Origin" },
    });
  }
}
