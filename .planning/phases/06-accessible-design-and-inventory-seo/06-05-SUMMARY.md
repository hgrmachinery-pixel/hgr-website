---
phase: accessible-design-and-inventory-seo
plan: 05
subsystem: public-seo
tags: [nextjs, robots, sitemap, inventory]
requires:
  - phase: 06-01
    provides: Validated public origin and fail-closed indexing policy.
  - phase: 04
    provides: Published-only public machine query and stable machine paths.
provides:
  - Environment-aware robots instructions for public crawler guidance.
  - Canonical sitemap routes for fixed public pages and published machines.
affects: [SEO-03, SEO-04, SEO-09]
tech-stack:
  added: []
  patterns:
    - Crawler metadata routes reuse the validated origin and explicit production indexing opt-in.
    - Pure SEO route builders keep output behavior covered with synthetic records.
key-files:
  created:
    - src/app/robots.ts
    - src/app/sitemap.ts
  modified:
    - src/lib/siteMetadata.ts
    - tests/phase6-seo.test.mjs
key-decisions:
  - Keep public pages crawlable while page-level noindex metadata remains observable in closed environments.
  - Emit a sitemap only when production, explicit opt-in, and a valid credential-free public origin all agree.
  - Exclude legal pages until published and include Sold inventory pages returned by the public query.
metrics:
  duration: 7 min
  completed: 2026-10-02
status: complete
actuals:
  tokens: 1565
  tasks: 2
  commits: 3
commits: 3
plan_head_before: fafde25037a53047d6c8a54c780e2a95399670a
plan_head_after: de1611ce63751475785586e8c458be8198b6a960
requirements-completed: [SEO-03, SEO-04, SEO-09]
coverage:
  - id: D1
    description: Robots guidance shares the safe indexing policy and excludes internal/private routes.
    requirement: SEO-04
    verification:
      - kind: unit
        ref: tests/phase6-seo.test.mjs#robots builder keeps pages crawlable while withholding sitemap until indexing is enabled
        status: pass
    human_judgment: false
  - id: D2
    description: Sitemap contains only canonical fixed public routes and published public machines, including Sold units.
    requirement: SEO-03
    verification:
      - kind: unit
        ref: tests/phase6-seo.test.mjs#public sitemap builder emits only fixed routes and published machine paths when indexing is enabled
        status: pass
      - kind: unit
        ref: tests/public-inventory.test.mjs#public projection omits private fields, invalid price and unpublished records
        status: pass
    human_judgment: false
  - id: D3
    description: Configured-origin sitemap metadata supports later Search Console verification and measurement setup.
    requirement: SEO-09
    verification:
      - kind: other
        ref: tests/phase6-seo.test.mjs#configured origin and closed/enabled crawler route builders
        status: pass
    human_judgment: true
    rationale: Search Console ownership, analytics accounts, and measurement activation remain deferred to later setup.
---

# Phase 6 Plan 5: Safe robots instructions and canonical sitemap Summary

**Robots and sitemap output use the shared fail-closed policy and expose only canonical public routes and published inventory.**

## Accomplishments

- Added `robots.ts` with public-page crawl access and explicit exclusions for admin, API, and private machine-document paths. It includes a sitemap URL only under the shared production opt-in policy.
- Added `sitemap.ts` with fixed public routes and machine paths from `getPublicMachines()`. Sold machines are retained; draft records, query filters, legal pages, and internal destinations are excluded.
- Added pure output builders and synthetic tests for closed/invalid configurations, published inventory, and empty inventory results.
- Kept Search Console verification, analytics setup, indexing activation, and production changes deferred.

## Task Commits

1. **RED tests:** `fb24d6c` — crawler route behavior tests.
2. **Task 1:** `361bf17` — robots policy and shared route builders.
3. **Task 2:** `de1611c` — canonical sitemap route and edge-case assertions.

## Deviations from Plan

**1. Added pure route builders to the existing SEO helper module.**
- **Found during:** Task 1
- **Reason:** The existing policy helpers validated the origin and index opt-in but did not provide a deterministic way to test crawler output against synthetic inputs.
- **Change:** Added reusable robots and sitemap output builders in `src/lib/siteMetadata.ts`; route files remain thin wrappers around the shared policy.
- **Files modified:** `src/lib/siteMetadata.ts`

## Verification

- `node --test tests/phase6-seo.test.mjs tests/public-inventory.test.mjs` — 20 passed.
- `npm run typecheck` — passed.
- `git diff --check` — passed.
- No live inventory services, public indexing, Search Console, analytics, production, or infrastructure were used.

## Self-Check: PASSED

- Summary file exists.
- Task commits `fb24d6c`, `361bf17`, and `de1611c` exist in Git history.

---
*Phase: 06-accessible-design-and-inventory-seo*
*Completed: 2026-10-02*
