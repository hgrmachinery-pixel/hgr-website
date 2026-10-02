---
phase: "06"
slug: "accessible-design-and-inventory-seo"
status: draft
nyquist_compliant: true
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
