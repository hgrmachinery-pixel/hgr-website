import { getPayload } from "payload";

import config from "@payload-config";
import { isSameOriginDocumentPost, submitMachineDocumentForReview } from "@/lib/machines/documents";
import { isStaffUser } from "@/lib/machines/access";

export const runtime = "nodejs";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  Vary: "Cookie, Origin",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  // Validate Origin and Fetch Metadata before parsing or mutating request data.
  if (!isSameOriginDocumentPost(request, process.env.SERVER_URL)) {
    return Response.json({ error: "A same-origin request is required." }, { status: 403, headers: privateHeaders });
  }

  const { action } = await params;
  if (action !== "submit") {
    return Response.json({ error: "This document action is unavailable." }, { status: 404, headers: privateHeaders });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(contentLength) || contentLength < 1 || contentLength > 8192) {
    return Response.json({ error: "The request is too large or incomplete." }, { status: 413, headers: privateHeaders });
  }

  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) {
    return Response.json({ error: "Staff sign-in is required." }, { status: 401, headers: privateHeaders });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Submission details could not be read." }, { status: 400, headers: privateHeaders });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "A document revision and digest are required." }, { status: 400, headers: privateHeaders });
  }

  const data = body as Record<string, unknown>;
  const id = typeof data.id === "number" ? data.id : typeof data.id === "string" && /^\d+$/.test(data.id) ? Number(data.id) : undefined;
  const digest = typeof data.digest === "string" ? data.digest : "";
  if (id === undefined || Object.keys(data).some((key) => key !== "id" && key !== "digest")) {
    return Response.json({ error: "A document revision and digest are required." }, { status: 400, headers: privateHeaders });
  }

  const result = await submitMachineDocumentForReview({
    payload,
    user: auth.user as { id: number; collection?: string },
    id,
    digest,
  });
  return Response.json(result, { status: result.status, headers: privateHeaders });
}
