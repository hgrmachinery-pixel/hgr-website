---
phase: "06"
slug: "accessible-design-and-inventory-seo"
status: validated
nyquist_compliant: false
wave_0_complete: true
created: "2026-10-02"
---

# Phase 06 — Validation Strategy

## Test infrastructure

| Property | Value |
|---|---|
| Framework | Node.js built-in `node:test`; project test files use `.mjs`. |
| Focused invocation | `node --test <focused test files>` from the repository root. |
| Test script | `package.json` has no `test` script; invoke Node's runner directly. |
| Type check | `npm run typecheck` (`tsc --noEmit`). |
| Production build | `npm run build` (`next build`) with synthetic local environment values. |
| Diff hygiene | `git diff --check`. |
| New dependencies or services | None; tests use synthetic records and existing local tooling. |

## Plan task → focused automated checks

Every task runs its listed focused Node test command and `npm run typecheck`; commands assume the repository root as the working directory. The task verification blocks in the plans contain the same test/type-check commands.

| Plan/task | Requirements | Focused Node command |
|---|---|---|
| 06-01 / Task 1 — machine metadata tracer | SEO-01, SEO-02, SEO-05, SEO-07 | `node --test tests/phase6-seo.test.mjs tests/public-inventory.test.mjs` |
| 06-01 / Task 2 — public route metadata | SEO-01, SEO-04, SEO-06, SEO-09 | `node --test tests/phase6-seo.test.mjs tests/phase5-pages.test.mjs` |
| 06-02 / Task 1 — brand, contrast and navigation | UX-01, UX-02, UX-03 | `node --test tests/phase6-brand.test.mjs tests/phase5-pages.test.mjs` |
| 06-02 / Task 2 — static-first homepage | UX-04, UX-05, UX-06, UX-07 | `node --test tests/phase6-hero.test.mjs tests/public-inventory.test.mjs` |
| 06-03 / Task 1 — safe responsive image projection | SEO-08 | `node --test tests/phase6-media.test.mjs tests/public-inventory.test.mjs` |
| 06-03 / Task 2 — responsive gallery and share metadata | SEO-05, SEO-08 | `node --test tests/phase6-media.test.mjs tests/phase6-seo.test.mjs tests/public-inventory.test.mjs` |
| 06-04 / Task 1 — field-keyed server errors | UX-03 | `node --test tests/phase6-accessibility.test.mjs tests/phase5-pages.test.mjs` |
| 06-04 / Task 2 — accessible field error output | UX-03 | `node --test tests/phase6-accessibility.test.mjs tests/phase5-pages.test.mjs` |
| 06-05 / Task 1 — environment-aware robots | SEO-04 | `node --test tests/phase6-seo.test.mjs` |
| 06-05 / Task 2 — canonical sitemap | SEO-03, SEO-04, SEO-09 | `node --test tests/phase6-seo.test.mjs tests/public-inventory.test.mjs` |

## Requirement → automated evidence

| Requirement | Planned evidence |
|---|---|
| UX-01 | 06-02 Task 1: centralized approved palette/type and responsive styling checks. |
| UX-02 | 06-02 Task 1: calculated WCAG contrast ratios for every applied text/background pair and interactive state. |
| UX-03 | 06-02 Task 1 navigation/focus assertions; 06-04 Tasks 1–2 field validation and accessible error-association tests. |
| UX-04 | 06-02 Task 2 homepage order, stock links and enquiry recovery-path tests. |
| UX-05 | 06-02 Task 2 static/no-image and existing approved-media projection tests. |
| UX-06 | 06-02 Task 2 reduced-motion and small-screen fallback source/behavior checks. |
| UX-07 | 06-02 Task 2 and 06-03 Tasks 1–2 safe image and factual-alt assertions. |
| SEO-01 | 06-01 Tasks 1–2 route metadata and canonical assertions. |
| SEO-02 | 06-01 Task 1 same-unit slug/canonical regression using `tests/public-inventory.test.mjs`. |
| SEO-03 | 06-05 Task 2 canonical sitemap allow-list and public inventory projection tests. |
| SEO-04 | 06-01 Task 2 filter/query noindex checks; 06-05 Tasks 1–2 default, staging, origin and crawler-output policy tests. |
| SEO-05 | 06-01 Task 1 visible-fact/schema serialization assertions; 06-03 Task 2 safe image share metadata assertions. |
| SEO-06 | 06-01 Task 2 internal route/breadcrumb and existing crawlable pagination checks. |
| SEO-07 | 06-01 Task 1 Sold identity, status and metadata regression. |
| SEO-08 | 06-03 Tasks 1–2 responsive derivatives, factual alt text, safe gallery and share-image checks. |
| SEO-09 | 06-01 Tasks 1–2 and 06-05 Task 2 configured-origin, canonical/sitemap and readiness assertions; no analytics activation. |

## Requirement coverage audit

The listed commands and behavioral test cases were cross-checked against all five plans and summaries. The Phase 6 automated suite, type check, synthetic build and diff hygiene passed in the completed phase run. The focused tests provide automated evidence for the source-level behaviors in the map above. UX-05 and UX-07 remain manual-only because the scroll-motion acceptance depends on an approved layered HGR asset and live performance/usability review, while image rights require human review. These are not treated as automated passes.

| Requirement | Audit status | Evidence / limitation |
|---|---|---|
| UX-01 | COVERED | `phase6-brand.test.mjs`: palette, type, touch-target and navigation assertions. |
| UX-02 | COVERED | `phase6-brand.test.mjs`: calculated contrast assertions for used text/action/focus pairings. |
| UX-03 | COVERED | `phase6-brand.test.mjs`, `phase6-accessibility.test.mjs`, and `phase5-pages.test.mjs`. |
| UX-04 | COVERED | `phase6-hero.test.mjs` and `public-inventory.test.mjs`: product-first actions and inventory behavior. |
| UX-05 | MANUAL-ONLY | No approved layered hero asset; real scroll-motion performance/usability review is deferred. Static fallback behavior is tested, but this does not verify the planned motion. |
| UX-06 | COVERED (SOURCE) | `phase6-hero.test.mjs` verifies a complete static/no-image path; device-level review is deferred below. |
| UX-07 | MANUAL-ONLY | Synthetic tests verify safe media projection and no fabricated fallback; rights clearance of real launch assets requires human review. |
| SEO-01 | COVERED | `phase6-seo.test.mjs`: route metadata and canonical behavior. |
| SEO-02 | COVERED | `phase6-seo.test.mjs` and `public-inventory.test.mjs`: stable identity and historical-slug resolution. |
| SEO-03 | COVERED | `phase6-seo.test.mjs` and `public-inventory.test.mjs`: canonical sitemap allow-list and published projection. |
| SEO-04 | COVERED (SOURCE) | `phase6-seo.test.mjs`: fail-closed environment and query behavior; staging access-layer verification remains manual-only. |
| SEO-05 | COVERED | `phase6-seo.test.mjs` and `phase6-media.test.mjs`: visible facts and safe sharing metadata. |
| SEO-06 | COVERED | `phase6-seo.test.mjs` and `phase5-pages.test.mjs`: breadcrumbs, route links and crawlable pagination. |
| SEO-07 | COVERED | `phase6-seo.test.mjs` and `public-inventory.test.mjs`: Sold identity/status behavior. |
| SEO-08 | COVERED (SOURCE) | `phase6-media.test.mjs`: safe derivatives, responsive sources and factual alt; visual review deferred. |
| SEO-09 | COVERED (READINESS ONLY) | `phase6-seo.test.mjs`: configured-origin/canonical/sitemap readiness; account ownership and analytics activation deferred. |

## Manual-only checks

| Requirement / area | Manual check still required | Reason |
|---|---|---|
| UX-05 | Review a rights-cleared layered HGR hero asset, then test scroll response, performance and usability on supported devices. | The checkout has no verified layered hero media and browser/device checks are deferred. |
| UX-07 | Human-review rights and factual suitability for each real launch image, logo, favicon and sharing asset. | Rights clearance cannot be established by synthetic tests. |
| UX-01, UX-03, UX-06, SEO-08 | Inspect rendered layouts, keyboard/touch behavior, screen-reader output and image presentation on real browsers/devices. | Source assertions do not replace browser/device review. |
| SEO-04 | Verify staging access protection at the deployment/access layer. | Robots and `noindex` metadata are crawler guidance, not access control. |
| SEO-09 | Verify Search Console ownership and any analytics/advertising setup when those accounts are configured. | Account checks and activation are intentionally deferred. |
| Data/media/deployment | Verify live PostgreSQL, GCS/media delivery, staging/deployment behavior and production configuration when explicitly in scope. | These external services and production checks are intentionally deferred. |

## Sign-Off

Automated source-level validation is recorded for requirements with passing behavioral tests. The phase is **partially validated**: UX-05 and UX-07 and the manual-only checks above are not certified by this test suite.

## Validation Audit 2026-10-02

| Metric | Count |
|--------|-------|
| Gaps found | 2 |
| Resolved automatically | 0 |
| Recorded as manual-only | 2 |

## Phase gate

After all plans complete, run from the repository root:

```powershell
node --test tests/phase6-brand.test.mjs tests/phase6-hero.test.mjs tests/phase6-seo.test.mjs tests/phase6-media.test.mjs tests/phase6-accessibility.test.mjs tests/public-inventory.test.mjs tests/phase5-pages.test.mjs
npm run typecheck
$env:DATABASE_URL = 'postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic'; $env:PAYLOAD_SECRET = '0123456789abcdef0123456789abcdef'; $env:PREVIEW_SECRET = '0123456789abcdef0123456789abcdef'; $env:SERVER_URL = 'http://localhost:3000'; $env:GCS_BUCKET = 'hgr-phase6-synthetic'; $env:GCS_PROJECT_ID = 'hgr-phase6-synthetic'; $env:HGR_PUBLIC_INDEXING_ENABLED = 'false'; npm run build
git diff --check
```

All environment values above are disposable local build values. They must not point to live services or enable public indexing. The build command uses `HGR_PUBLIC_INDEXING_ENABLED=false` so the synthetic origin remains non-indexable.

## Explicitly deferred manual and external checks

Real browser and device review, screen-reader review, visual responsive inspection, touch interaction, animation performance, rights-cleared machine-photo inspection, live PostgreSQL/GCS/media checks, deployment/staging access-layer verification, Search Console account checks and analytics activation are deferred by Phase 6 context decisions. The CSS/source and synthetic automated checks are the Phase 6 acceptance evidence; these manual, service and deployment checks do not block this phase.

---
*Phase: 06-accessible-design-and-inventory-seo*
