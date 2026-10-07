import assert from "node:assert/strict";
import test from "node:test";
import { isApprovedInventoryDerivative } from "../src/lib/inventory/media-server.ts";

const owner = { id: 7, _status: "published", archived: false, featuredImage: 12, gallery: [12] };
const master = { id: 11, assetKind: "master", contentDigest: "sha256:source", ownerType: "spare-part", ownerId: "7", category: "featured", revision: 1 };
const approvedAt = "2026-10-07T00:00:00.000Z";
const checklist = { imageQuality: "clear", sensitiveIdentifiers: "clear", personalInformation: "clear", customerInformation: "clear", accurateAltText: "clear" };
const derivative = { id: 12, assetKind: "derivative", processingStatus: "ready", reviewStatus: "approved", approvedBy: "staff-1", approvedAt, reviewHistory: [{ event: "approved", actor: "staff-1", at: approvedAt, digest: "sha256:public", revision: 1, checklist }], contentDigest: "sha256:public", sourceDigest: "sha256:source", sourceMaster: 11, ownerType: "spare-part", ownerId: "7", category: "featured", revision: 1 };
function payloadWith({ item = owner, photo = derivative, original = master } = {}) {
  return { findByID: async ({ collection, id }) => {
    if (collection === "inventory-media") return String(id) === "11" ? original : photo;
    return item;
  } };
}

test("only a selected, approved current derivative for a published item is accepted", async () => {
  assert.equal(await isApprovedInventoryDerivative(payloadWith(), derivative), true);
  assert.equal(await isApprovedInventoryDerivative(payloadWith({ item: { ...owner, _status: "draft" } }), derivative), false);
  assert.equal(await isApprovedInventoryDerivative(payloadWith({ item: { ...owner, archived: true } }), derivative), false);
  assert.equal(await isApprovedInventoryDerivative(payloadWith({ item: { ...owner, featuredImage: null, gallery: [] } }), derivative), false);
  assert.equal(await isApprovedInventoryDerivative(payloadWith(), { ...derivative, reviewStatus: "needs-review" }), false);
  assert.equal(await isApprovedInventoryDerivative(payloadWith(), { ...derivative, ownerId: "8" }), false);
  assert.equal(await isApprovedInventoryDerivative(payloadWith({ original: { ...master, contentDigest: "sha256:changed" } }), derivative), false);
  assert.equal(await isApprovedInventoryDerivative(payloadWith({ original: { ...master, revision: 2 } }), derivative), false);
});
