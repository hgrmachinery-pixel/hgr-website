import { getPayload } from "payload";

import config from "@payload-config";
import { isStaffUser } from "@/lib/machines/access";
import { configuredImageLimits } from "@/lib/machines/media";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return Response.json({ error: "Staff sign-in is required" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const limits = configuredImageLimits();
  if (limits.perFileBytes === null || limits.batchBytes === null) {
    return Response.json({ error: "Photo upload limits are not configured" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
  return Response.json(limits, { headers: { "Cache-Control": "private, no-store" } });
}
