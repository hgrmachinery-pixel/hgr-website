# Phase 6: Accessible Design and Inventory SEO - Pattern Map

**Mapped:** 2026-10-02
**Files analyzed:** 11 likely modified/new implementation and focused-test files
**Analogs found:** 10 / 11 (crawler metadata has framework conventions but no in-repo analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/(site)/layout.tsx` | route/layout, metadata config | request-response / SSR | existing public layout | exact |
| `src/app/(site)/page.tsx` | page component | request-response / SSR | existing homepage | exact |
| `src/app/(site)/used-excavators/page.tsx` | page component | request-response / SSR | existing inventory page | exact |
| `src/app/(site)/machines/[slug]/page.tsx` | page component | request-response / SSR | existing machine detail page | exact |
| `src/app/(site)/[supportingPage]/page.tsx` | page component | request-response / SSR | existing supporting page | exact |
| `src/app/(site)/site.css` | stylesheet/config | transform (presentation) | existing shared site stylesheet | exact |
| `src/app/robots.ts` or framework-valid root metadata location | route/config | request-response / SSR | none; Next metadata convention | no in-repo analog |
| `src/app/sitemap.ts` or framework-valid root metadata location | route/config | request-response / SSR + read-only query | `src/lib/machines/publicQueries.ts` | partial |
| `src/lib/siteMetadata.ts` (if extracted) | utility | transform | `src/lib/machines/publicInventory.ts` | role-match |
| `tests/phase6-seo.test.mjs` (or focused equivalent) | test | transform / request-response assertions | `tests/public-inventory.test.mjs` | role-match |
| `tests/phase6-accessibility.test.mjs` (or focused equivalent) | test | transform assertions | `tests/phase5-pages.test.mjs` | role-match |

File names beyond the already-existing route/CSS files are planning inferences, not locked filenames. CONTEXT and UI-SPEC require local focused checks but do not mandate test filenames. Verify Next 16 route-file placement for metadata conventions before choosing a crawler file path; the `(site)` route group currently has a nested layout, while Next metadata conventions are ordinarily discovered under `src/app`.

## Pattern Assignments

### Public pages and route metadata (existing route files)

**Analogs:** `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/used-excavators/page.tsx`, `src/app/(site)/machines/[slug]/page.tsx`, `src/app/(site)/[supportingPage]/page.tsx`

The project uses Next server components and typed metadata exports. Current shared metadata (`layout.tsx:6-9`) sets `robots: { index: false, follow: false }`; inventory (`used-excavators/page.tsx:8-9`) and machine detail (`machines/[slug]/page.tsx:12-13`) also set noindex. Route metadata must account for inherited metadata and preserve noindex for non-production environments, admin/private routes, and filter variants.

**Dynamic route/data pattern** (`machines/[slug]/page.tsx:15-28`):

```tsx
export default async function MachineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await getPublicMachineForSlug(slug);
  if (resolved.unavailable) notFound();
  const machine = resolved.machine;
  if (!machine) notFound();
  if (machine.slug !== slug) permanentRedirect(publicMachinePath(machine.slug));
  // Continue deriving visible page content from this same public machine.
}
```

Use the same published public read for `generateMetadata`; return no invented fallback facts if resolution fails. Keep the unique physical-unit slug and same-unit redirect behavior. Sold machines are intentionally rendered as accessible historical records (`machines/[slug]/page.tsx:47-49`); metadata and structured data must reflect Sold truthfully.

**Supporting-page allow-list/content pattern** (`[supportingPage]/page.tsx:6-27`):

```tsx
const pages = { /* fixed approved public slugs */ } as const;
if (!Object.prototype.hasOwnProperty.call(pages, supportingPage)) notFound();
const page = await getPublishedPage(key);
const legal = key === "privacy-policy" || key === "website-terms";
if (legal && (!page || body.length === 0)) notFound();
```

Metadata for CMS-backed pages should use the same slug allow-list and published page data. Keep Privacy Policy and Website Terms routes unpublished until owner-supplied legal content exists; do not infer or publish legal copy. Contact details continue to be read through `getPublicContact()` and remain hidden while unset; this phase does not configure phone/WhatsApp/legal content.

### `src/app/robots.ts` and `src/app/sitemap.ts` (new crawler metadata routes)

**Analog:** `src/lib/machines/publicQueries.ts` (`getPublicMachines`, lines 36-56; `getPublicMachineForSlug`, lines 58-102)
**Match:** partial; no existing robots or sitemap file was found.

Use Next's typed `MetadataRoute` convention with a server-only implementation and configured canonical origin. Sitemap machine URLs must come from `getPublicMachines()` and its existing published/non-archived query plus public projection. That query catches operational failure and returns `{ machines: [], unavailable: true }`, so sitemap must avoid fabricating machine rows when unavailable. Include canonical fixed public routes and published Sold units where approved for indexing; exclude drafts, archived, admin, APIs, documents, and query/filter variants. Do not add arbitrary timestamps.

**Public query safety excerpt** (`publicQueries.ts:36-55`):

```ts
const result = await payload.find({
  collection: "machines",
  where: { and: [{ _status: { equals: "published" } }, { archived: { not_equals: true } }] },
  limit: 500,
  page: 1,
  depth: 0,
  overrideAccess: false,
  sort: "hgrId",
});
// Public projection filters malformed/private data; failures return empty/unavailable.
```

Robots directives are indexing guidance only, never a privacy boundary. Preserve actual Payload/API/media access controls. Keep staging access protection deferred to the deployment milestone; do not claim it has been verified here.

### `src/lib/siteMetadata.ts` (if a shared helper is warranted)

**Analog:** `src/lib/machines/publicInventory.ts` (`normalizeInventoryFilters`, lines 50-62; `publicMachinePath`, lines 152-154)
**Match:** role-match.

Follow pure typed helper style: normalize/validate inputs, return explicit values, and keep URL construction centralized. Existing path helper:

```ts
export function publicMachinePath(slug: string): string {
  return `/machines/${encodeURIComponent(slug)}`;
}
```

Origin resolution should reject malformed or absent configuration safely and must not hard-code the production host. The current detail page reads `process.env.SERVER_URL` (`machines/[slug]/page.tsx:27-29`); inspect existing environment configuration before deciding whether this is the canonical-origin variable. Do not change environment/hosting configuration in this phase.

### `src/app/(site)/site.css` (shared styling and progressive hero fallback)

**Analog:** same file, especially lines 1-17, 31-48, 51-70, 99-101
**Match:** exact.

Existing token/focus pattern (`site.css:1-17`):

```css
:root {
  --hgr-orange: #f86c00;
  --hgr-orange-hover: #e85f00;
  --hgr-accent: #f89800;
  --hgr-ink: #171717;
  --hgr-muted: #5f6368;
  --hgr-paper: #fff;
  --hgr-soft: #f5f5f5;
  --hgr-border: #e2e2e2;
  --hgr-dark: #151515;
  --hgr-dark-surface: #222;
}
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid #1267a5;
  outline-offset: 3px;
}
```

Existing responsive and reduced-motion conventions (`site.css:99-101`):

```css
@media (max-width: 850px) { .machine-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } /* ... */ }
@media (max-width: 560px) { .machine-grid { grid-template-columns: 1fr; } /* ... */ }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
```

Extend existing selectors/tokens; keep primary buttons with dark text on orange, retain non-color status labels, and preserve a separate visible focus outline. Existing gallery controls use `min-width`/`min-height: 44px` (`site.css:63-68`); pagination is currently 42px (`site.css:54-56`) and should be brought to the UI-SPEC target when modified. The hero stays useful as static server-rendered content and is omitted as imagery unless an approved asset already exists. No motion package or infrastructure/browser validation is in scope.

### Inventory/server-rendered links and accessible interaction

**Analogs:** `src/app/(site)/page.tsx:8-17`, `src/app/(site)/used-excavators/page.tsx:15-36`, `src/components/site/InventoryFilters.tsx:1-25`, `src/components/site/MachineGallery.tsx:7-34`

Homepage already obtains public machine data and caps the Available selection (`page.tsx:8-16`). Inventory filtering is a labelled GET form with native controls (`InventoryFilters.tsx:3-23`), while result cards/pagination are ordinary Next links (`used-excavators/page.tsx:27-34`). Preserve server-rendered anchors so content is available without client animation. The gallery uses native buttons, `aria-pressed`, a live photo count, and an empty-photo fallback (`MachineGallery.tsx:17-32`); retain keyboard operation, labels, and minimum targets.

### Focused tests

**Analog:** `tests/public-inventory.test.mjs:1-14,33-57,99-113` and `tests/phase5-pages.test.mjs:1-5,26-40`

Tests use Node's built-in runner and strict assertions, importing TypeScript helpers directly:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { projectPublicMachine } from "../src/lib/machines/publicInventory.ts";

test("public projection omits private fields and unpublished records", () => {
  const machine = projectPublicMachine(record({ serialNumber: "PRIVATE", showSerialPublicly: false }));
  assert.equal("serialNumber" in machine, false);
  assert.equal(projectPublicMachine(record({ _status: "draft" })), null);
});
```

Phase 6 tests should match this small `node:test` structure; assert metadata/canonical/sitemap/robots policies and factual public projections. Avoid test-driven expectations that make legal pages public or invent contact settings. Existing tests cover published-only, private serial omission, same-unit slug resolution, and accessible route conventions; add focused tests for uncovered crawler output, contrast and fallback policy.

## Shared Patterns

### Published and privacy-safe machine data

**Source:** `src/lib/machines/publicQueries.ts:36-55,58-102`; `src/lib/machines/publicProjection.ts:35-50,81-95`
**Apply to:** machine metadata, sitemap, structured data and public route content.

`projectPublicMachine` rejects unpublished/archived/invalid identities and allow-lists public fields. Serial numbers appear only when `showSerialPublicly === true`. Reuse those reads/projections instead of spreading raw Payload documents into metadata or sitemap output. Robots/noindex rules do not replace authorization.

### Crawl and canonical URLs

**Source:** `src/lib/machines/publicInventory.ts:138-154`; `src/app/(site)/machines/[slug]/page.tsx:15-22`
**Apply to:** machine metadata and route links.

Current slugs are validated, historical slugs resolve only when unique, and a changed slug redirects permanently to that same machine's current URL. Preserve this identity behavior. Filter query strings must not be emitted as sitemap URLs or indexable canonical destinations.

### Index policy and owner-configured facts

**Source:** `src/app/(site)/layout.tsx:6-9`; `src/app/(site)/used-excavators/page.tsx:8-9`; `src/app/(site)/machines/[slug]/page.tsx:12-13`; `.planning/phases/06-accessible-design-and-inventory-seo/06-CONTEXT.md`
**Apply to:** all intended public route metadata.

The existing inherited noindex must be deliberately replaced with environment-aware public policy; route-specific overrides alone may not remove inherited robots settings. Keep staging non-indexable by default. Do not expose unpublished legal pages, unset phone/WhatsApp actions, or inferred contact/local-business facts.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/app/robots.ts` (or verified framework location) | route/config | request-response / SSR | No in-repository robots metadata route exists; use installed Next convention and explicit environment policy. |
| `src/app/sitemap.ts` (or verified framework location) | route/config | request-response / SSR | No existing sitemap; project query is the partial data-safety analog. |

## Metadata

**Analog search scope:** `src/app`, `src/components/site`, `src/lib/machines`, `tests`
**Tracked-source verification:** Every named source analog above was confirmed by `git ls-files`; no ignored runtime mirrors used.
**Pattern extraction date:** 2026-10-02
