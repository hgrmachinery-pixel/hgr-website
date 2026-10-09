import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { MachineDocuments } from "../src/collections/MachineDocuments.ts";
import {
  configuredDocumentMimeTypes,
  isSameOriginDocumentPost,
  submitMachineDocumentForReview,
} from "../src/lib/machines/documents.ts";

test("Payload registers machine documents only on private object storage", async () => {
  const [config, outerRoute, submitRoute, submitControl] = await Promise.all([
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/(payload)/api/[...slug]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/machine-documents/[action]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/payload/SubmitDocumentForReview.tsx", import.meta.url), "utf8"),
  ]);
  const registeredCollections = config.match(/collections:\s*\[([\s\S]*?)\],\s*\n\s*globals:/)?.[1];
  assert.ok(registeredCollections);
  assert.match(registeredCollections, /MachineDocuments/);
  assert.match(config, /"machine-documents":\s*\{\s*prefix:\s*["']machine-documents["']\s*\}/);
  assert.match(config, /R2_BUCKET/);
  assert.match(config, /R2 does not support x-amz-acl/);
  assert.match(outerRoute, /machine-documents\/file/);
  assert.match(outerRoute, /private, no-store/);
  assert.ok(submitRoute.indexOf("isSameOriginDocumentPost") < submitRoute.indexOf("request.json()"));
  assert.match(submitRoute, /action !== "submit"/);
  assert.match(submitControl, /Submit for Owner review/);
  assert.doesNotMatch(submitControl, /Publish/i);
  assert.match(await readFile(new URL("../src/collections/MachineDocuments.ts", import.meta.url), "utf8"), /MachineDocumentActions#MachineDocumentActions/);
  assert.deepEqual(configuredDocumentMimeTypes(undefined), []);
  assert.deepEqual(configuredDocumentMimeTypes("application/pdf, image/jpeg, image/svg+xml"), ["application/pdf", "image/jpeg"]);
});

test("document records and uploaded files deny anonymous access and deletion", () => {
  assert.equal(MachineDocuments.slug, "machine-documents");
  assert.equal(MachineDocuments.access.read({ req: { user: null } }), false);
  assert.equal(MachineDocuments.access.read({ req: { user: { id: 3, collection: "users" } } }), true);
  assert.equal(MachineDocuments.access.delete(), false);
  assert.match(MachineDocuments.upload.modifyResponseHeaders({ headers: new Headers() }).get("Cache-Control"), /private, no-store/);
});

test("custom document POST actions require the exact same origin and fetch metadata", () => {
  const request = (headers = {}) => new Request("https://hgr.example/api/machine-documents/submit", {
    method: "POST",
    headers: { origin: "https://hgr.example", "sec-fetch-site": "same-origin", ...headers },
    body: "{}",
  });
  assert.equal(isSameOriginDocumentPost(request(), "https://hgr.example/path"), true);
  assert.equal(isSameOriginDocumentPost(request({ origin: "https://attacker.example" }), "https://hgr.example"), false);
  assert.equal(isSameOriginDocumentPost(request({ "sec-fetch-site": "cross-site" }), "https://hgr.example"), false);
  assert.equal(isSameOriginDocumentPost(request({ origin: undefined }), "https://hgr.example"), false);
  assert.equal(isSameOriginDocumentPost(request(), undefined), false);
});

test("staff can submit only the latest exact redacted revision without approving or publishing it", async () => {
  const revision = {
    id: 12,
    machine: 5,
    sourceDocument: 4,
    documentKind: "redacted-copy",
    revisionID: "revision-12",
    contentDigest: `sha256:${"a".repeat(64)}`,
    workflowStatus: "draft",
    auditHistory: [{ event: "uploaded", actor: 8, at: "2026-10-02T00:00:00.000Z" }],
  };
  const source = { id: 4, machine: 5, documentKind: "original", latestRedactedRevision: 12 };
  let saved;
  const payload = {
    findByID: async ({ id }) => String(id) === "12" ? revision : source,
    update: async (operation) => { saved = operation; return {}; },
  };
  const admin = { id: 8, collection: "users", role: "website-administrator" };
  const result = await submitMachineDocumentForReview({
    payload,
    user: admin,
    id: 12,
    digest: revision.contentDigest,
  });
  assert.deepEqual(result, { status: 200, submitted: true });
  assert.equal(saved.data.workflowStatus, "submitted");
  assert.equal(saved.context.machineDocumentSubmit, true);
  assert.equal(saved.data.auditHistory[0].event, "uploaded");
  assert.equal(saved.data.auditHistory[1].event, "submitted-for-review");
  assert.equal("approvedBy" in saved.data, false);
  assert.equal("publishedBy" in saved.data, false);

  source.latestRedactedRevision = 13;
  const stale = await submitMachineDocumentForReview({ payload, user: admin, id: 12, digest: revision.contentDigest });
  assert.equal(stale.status, 409);
  const original = await submitMachineDocumentForReview({ payload: {
    ...payload,
    findByID: async () => ({ ...revision, documentKind: "original" }),
  }, user: admin, id: 4, digest: revision.contentDigest });
  assert.equal(original.status, 403);
});

test("normal Local API updates cannot forge document review, approval, publication, or audit state", async () => {
  const hook = MachineDocuments.hooks.beforeChange[0];
  const req = { user: { id: 8, collection: "users" }, context: {}, payload: {} };
  await assert.rejects(hook({
    data: { workflowStatus: "submitted", approvedBy: 8, publishedBy: 8 },
    operation: "update",
    originalDoc: { id: 12, documentKind: "redacted-copy", workflowStatus: "draft" },
    req,
  }), /server-managed/);
  assert.throws(() => MachineDocuments.hooks.beforeDelete[0](), /deletion is disabled/);
});
test("Owner publishing is permission-gated and preview is exact-revision, private, and read-only", async () => {
  const [workflow, route, actions, documents] = await Promise.all([
    readFile(new URL("../src/lib/machines/documents.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/machine-documents/[action]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/payload/MachineDocumentActions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/collections/MachineDocuments.ts", import.meta.url), "utf8"),
  ]);
  assert.match(workflow, /export async function publishMachineDocument/);
  assert.match(workflow, /hasPermission\(req, APPROVE_PUBLIC_DOCUMENTS\)/);
  assert.match(workflow, /FOR UPDATE/);
  assert.match(workflow, /commitTransaction\(req\)/);
  assert.match(route, /action !== "publish"/);
  assert.match(route, /action !== "preview"/);
  assert.match(route, /private, no-store/);
  assert.match(route, /range/);
  assert.ok((route.match(/hasPermission\(permissionReq, APPROVE_PUBLIC_DOCUMENTS\)/g) ?? []).length >= 2);
  assert.doesNotMatch(route.slice(route.indexOf('if (action === "preview")') > -1 ? route.indexOf('if (action === "preview")') : 0), /payload\.update\(/);
  assert.match(route, /status: upstream\.status, headers: responseHeaders/);
  assert.match(route, /Cache-Control.*private, no-store/);
  assert.match(actions, />Publish<\/button>/);
  assert.match(actions, /Preview as Public/);
  assert.match(documents, /machineDocumentPublish/);
  assert.match(documents, /humanAttested/);
});
