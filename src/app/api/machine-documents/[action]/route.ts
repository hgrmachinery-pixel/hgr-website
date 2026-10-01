import { createLocalReq, getPayload } from "payload";

import config from "@payload-config";
import { hasPermission, APPROVE_PUBLIC_DOCUMENTS } from "@/lib/auth/permissions";
import { isStaffUser } from "@/lib/machines/access";
import { isSameOriginDocumentPost, publishMachineDocument, submitMachineDocumentForReview } from "@/lib/machines/documents";

export const runtime = "nodejs";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  Vary: "Cookie, Origin",
  "X-Content-Type-Options": "nosniff",
};
const json = (body: unknown, status: number) => Response.json(body, { status, headers: privateHeaders });

export async function GET(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
  const { action } = await params;
  if (action !== "capability" && action !== "preview") return json({ error: "This document action is unavailable." }, 404);
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return json({ error: "Staff sign-in is required." }, 401);
  const permissionReq = await createLocalReq({ user: auth.user }, payload);
  if (action === "capability") {
    return json({ canPublish: await hasPermission(permissionReq, APPROVE_PUBLIC_DOCUMENTS) }, 200);
  }

  if (!await hasPermission(permissionReq, APPROVE_PUBLIC_DOCUMENTS)) return json({ error: "Preview permission is required." }, 403);
  const url = new URL(request.url);
  const idValue = url.searchParams.get("id");
  const id = idValue && /^\d+$/.test(idValue) ? Number(idValue) : NaN;
  const digest = url.searchParams.get("digest") ?? "";
  if (!Number.isSafeInteger(id) || id < 1 || !/^sha256:[a-f0-9]{64}$/.test(digest)) return json({ error: "An exact document revision is required." }, 400);

  try {
    const revision = await payload.findByID({ collection: "machine-documents", id, depth: 0, overrideAccess: true, req: permissionReq });
    if (revision.documentKind !== "redacted-copy" || revision.contentDigest !== digest ||
      !["draft", "submitted", "published"].includes(String(revision.workflowStatus)) || typeof revision.filename !== "string") {
      return json({ error: "The exact redacted revision is not available for preview." }, 404);
    }
    const sourceID = typeof revision.sourceDocument === "object" && revision.sourceDocument ? revision.sourceDocument.id : revision.sourceDocument;
    if (sourceID === undefined || sourceID === null) return json({ error: "The private original is unavailable." }, 404);
    const source = await payload.findByID({ collection: "machine-documents", id: sourceID, depth: 0, overrideAccess: true, req: permissionReq });
    const latestID = typeof source.latestRedactedRevision === "object" && source.latestRedactedRevision ? source.latestRedactedRevision.id : source.latestRedactedRevision;
    if (source.documentKind !== "original" || String(latestID) !== String(revision.id) || String(source.machine) !== String(revision.machine)) {
      return json({ error: "Only the latest redacted revision can be previewed." }, 409);
    }
    if (!await hasPermission(permissionReq, APPROVE_PUBLIC_DOCUMENTS)) return json({ error: "Preview permission was removed." }, 403);

    const serverURL = process.env.SERVER_URL;
    if (!serverURL) return json({ error: "Private document preview is unavailable until its file service is verified." }, 503);
    const origin = new URL(serverURL).origin;
    const fileURL = new URL(`/api/machine-documents/file/${encodeURIComponent(revision.filename)}`, origin);
    const forwardedHeaders = new Headers();
    const cookie = request.headers.get("cookie");
    const range = request.headers.get("range");
    if (cookie) forwardedHeaders.set("cookie", cookie);
    if (range) forwardedHeaders.set("range", range);
    forwardedHeaders.set("cache-control", "no-store");
    const upstream = await fetch(fileURL, { headers: forwardedHeaders, cache: "no-store", redirect: "manual" });
    if (![200, 206].includes(upstream.status) || !upstream.body) return json({ error: "The private file service could not return this revision." }, upstream.status === 404 ? 404 : 503);
    const contentType = upstream.headers.get("content-type")?.split(";")[0].toLowerCase();
    if (!["application/pdf", "image/jpeg", "image/png"].includes(String(contentType))) return json({ error: "This private file format cannot be previewed." }, 415);
    const responseHeaders = new Headers(privateHeaders);
    responseHeaders.set("Content-Type", contentType!);
    responseHeaders.set("Content-Disposition", "inline");
    for (const header of ["Content-Length", "Content-Range", "Accept-Ranges"]) {
      const value = upstream.headers.get(header);
      if (value) responseHeaders.set(header, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return json({ error: "The private file service is unavailable." }, 503);
  }
  } catch {
    return json({ error: "The document action is unavailable." }, 503);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  if (!isSameOriginDocumentPost(request, process.env.SERVER_URL)) {
    return json({ error: "A same-origin request is required." }, 403);
  }
  const { action } = await params;
  if (action !== "submit" && action !== "publish") return json({ error: "This document action is unavailable." }, 404);
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(contentLength) || contentLength < 1 || contentLength > 8192) return json({ error: "The request is too large or incomplete." }, 413);
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return json({ error: "Staff sign-in is required." }, 401);
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Document action details could not be read." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "A document revision and digest are required." }, 400);
  const data = body as Record<string, unknown>;
  const id = typeof data.id === "number" ? data.id : typeof data.id === "string" && /^\d+$/.test(data.id) ? Number(data.id) : undefined;
  const digest = typeof data.digest === "string" ? data.digest : "";
  if (id === undefined || !Number.isSafeInteger(id) || id < 1) return json({ error: "A valid document revision is required." }, 400);
  if (action === "submit") {
    const permissionReq = await createLocalReq({ user: auth.user }, payload);
    if (await hasPermission(permissionReq, APPROVE_PUBLIC_DOCUMENTS)) return json({ error: "Use the single Publish action to approve and publish this revision." }, 403);
  }
  const result = action === "submit"
    ? Object.keys(data).some((key) => key !== "id" && key !== "digest")
      ? { status: 400 as const, error: "A document revision and digest are required." }
      : await submitMachineDocumentForReview({ payload, user: auth.user as { id: number; collection?: string }, id, digest })
    : Object.keys(data).some((key) => !["id", "digest", "checklist"].includes(key))
      ? { status: 400 as const, error: "A document revision, digest and review checklist are required." }
      : await publishMachineDocument({ payload, user: auth.user as { id: number; collection?: string }, id, digest, checklist: data.checklist });
  return json(result, result.status);
}
