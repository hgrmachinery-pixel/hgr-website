import assert from "node:assert/strict";
import test from "node:test";
import { isPublicPageSlug, lexicalPlainText, safePhone, safeWhatsApp } from "../src/lib/siteContent.ts";
import { Pages } from "../src/collections/Pages.ts";
import { readFile } from "node:fs/promises";

test("only the approved supporting-page slugs are public", () => {
  for (const slug of ["rental", "machinery-services", "lubricants", "about", "contact", "privacy-policy", "website-terms"]) assert.equal(isPublicPageSlug(slug), true);
  for (const slug of ["draft-page", "admin", "", "../privacy-policy"]) assert.equal(isPublicPageSlug(slug), false);
});

test("contact actions are omitted for unset or malformed values", () => {
  assert.equal(safePhone(undefined), undefined);
  assert.equal(safePhone("call me"), undefined);
  assert.equal(safePhone("++60 3 1234 5678"), undefined);
  assert.equal(safePhone("+60 3 1234 5678"), "+60 3 1234 5678");
  assert.equal(safeWhatsApp("+60 12 345 6789"), "60123456789");
  assert.equal(safeWhatsApp("not a phone"), undefined);
});

test("published rich text is extracted as inert plain text", () => {
  assert.deepEqual(lexicalPlainText({ root: { children: [{ type: "paragraph", children: [{ text: "HGR contact text" }] }] } }), ["HGR contact text"]);
  assert.deepEqual(lexicalPlainText(null), []);
});

test("navigation and 404 recovery expose only the fixed routes", async () => {
  const header = await readFile(new URL("../src/app/(site)/siteHeader.tsx", import.meta.url), "utf8");
  const notFound = await readFile(new URL("../src/app/not-found.tsx", import.meta.url), "utf8");
  assert.match(header, /href="\/used-excavators"/);
  assert.doesNotMatch(header, />Home<\/Link>/);
  for (const route of ["rental", "repair-services", "spare-parts", "lubricants", "about", "contact"]) assert.ok(header.includes(`/${route}`));
  assert.match(header, /href="\/repair-services">Repair &amp; Services<\/Link><Link href="\/spare-parts">Spare Parts/);
  assert.match(notFound, /\/contact/);
  assert.match(notFound, /\/used-excavators/);
});

test("legal routes require published content and never include generic legal clauses", async () => {
  const page = await readFile(new URL("../src/app/(site)/[supportingPage]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /if \(legal && \(!page \|\| body\.length === 0\)\) notFound\(\)/);
  assert.doesNotMatch(page, /By using this website|we may collect|governing law/i);
});

function requestAs(roleKey, pages = []) {
  return {
    user: { collection: "users", id: 7, role: { key: "owner" } },
    payload: {
      async findByID({ collection, id, draft }) {
        if (collection === "users") return { id, role: { id: 3, key: roleKey } };
        if (collection === "roles") return { id, key: roleKey };
        return pages.find((page) => page.id === id && page.draft === draft) ?? { id, slug: "about" };
      },
    },
  };
}

test("only the persisted Owner can save, publish or remove legal pages", async () => {
  const beforeChange = Pages.hooks.beforeChange[0];
  const beforeDelete = Pages.hooks.beforeDelete[0];
  const adminReq = requestAs("website-administrator");
  const ownerReq = requestAs("owner", [{ id: 1, slug: "privacy-policy", draft: false }]);

  await assert.rejects(() => beforeChange({ data: { slug: "privacy-policy" }, operation: "create", req: adminReq }), /Only the Owner/);
  await assert.rejects(() => beforeChange({ data: { body: {} }, operation: "update", id: 1, originalDoc: { slug: "website-terms" }, req: adminReq }), /Only the Owner/);
  await assert.rejects(() => beforeChange({ data: { slug: "privacy-policy" }, operation: "update", id: 1, originalDoc: { slug: "about" }, req: requestAs("website-administrator", [{ id: 1, slug: "privacy-policy", draft: false }]) }), /Only the Owner/);
  await assert.rejects(() => beforeChange({ data: { body: {} }, operation: "update", originalDoc: { id: 1, slug: "about" }, req: requestAs("website-administrator", [{ id: 1, slug: "privacy-policy", draft: false }]) }), /Only the Owner/);
  await assert.rejects(() => beforeChange({ data: { body: {} }, operation: "update", originalDoc: { id: 1, slug: "about" }, req: requestAs("website-administrator", [{ id: 1, slug: "website-terms", draft: true }]) }), /Only the Owner/);
  await assert.rejects(() => beforeChange({ data: { slug: "about" }, operation: "update", originalDoc: { id: 1, slug: "privacy-policy" }, req: adminReq }), /Only the Owner/);
  await assert.rejects(() => beforeDelete({ id: 1, req: requestAs("website-administrator", [{ id: 1, slug: "privacy-policy", draft: false }]) }), /Only the Owner/);

  assert.deepEqual(await beforeChange({ data: { slug: "privacy-policy" }, operation: "create", req: ownerReq }), { slug: "privacy-policy" });
  await beforeDelete({ id: 1, req: ownerReq });
  assert.deepEqual(await beforeChange({ data: { slug: "about" }, operation: "update", id: 1, originalDoc: { slug: "about" }, req: adminReq }), { slug: "about" });
});
