---
phase: 06-accessible-design-and-inventory-seo
plan: 01
subsystem: public-seo
tags: [nextjs, metadata, canonical, json-ld, inventory]
requires:
  - phase: 04-public-used-excavator-inventory
    provides: Published-only public machine projections and stable machine paths.
provides:
  - Shared validated-origin and fail-closed index policy helpers.
  - Factual route metadata for machine, home, inventory and supporting pages.
  - Machine breadcrumbs and visible-fact Product structured data.
affects: [06-02, 06-03, 06-05, phase-07-measurement]
actuals:
  tokens: 5590
  tasks: 2
  commits: 5
commits: 5
plan_head_before: f2d3b9f796e3e7d1d379ddeecc75ddd48dbe5085
plan_head_after: a1fb45ee5613ba7afc7cbb0a92085d1a05a5bad8
tech-stack:
  added: []
  patterns:
    - Route metadata built from public projections and visible page copy.
    - Production indexing requires an explicit environment opt-in and valid origin.
key-files:
  created:
    - src/lib/siteMetadata.ts
    - tests/phase6-seo.test.mjs
  modified:
    - src/app/(site)/machines/[slug]/page.tsx
    - src/app/(site)/layout.tsx
    - src/app/(site)/page.tsx
    - src/app/(site)/used-excavators/page.tsx
    - src/app/(site)/[supportingPage]/page.tsx
    - .env.example
key-decisions:
  - "Keep indexing disabled by default; production, explicit opt-in, and a validated SERVER_URL are all required."
  - "Only expose Product offers for Available machines with a displayed public price; omit machine images from metadata and schema."
  - "Keep empty legal pages unavailable and without publishable metadata."
requirements-completed: [SEO-01, SEO-02, SEO-04, SEO-05, SEO-06, SEO-07, SEO-09]
coverage:
  - id: D1
    description: Stable machine identity is shared by canonical metadata, breadcrumb and factual structured data.
    requirement: SEO-02
    verification:
      - kind: unit
        ref: tests/phase6-seo.test.mjs#machine metadata and schema use only visible projected facts and stable slug
        status: pass
    human_judgment: true
    rationale: The metadata helper is covered synthetically; route-level rendered markup was not exercised in a browser or live Payload session.
  - id: D2
    description: Home, inventory and supporting pages use distinct factual canonicals and filtered inventory variants stay noindex.
    requirement: SEO-01
    verification:
      - kind: unit
        ref: tests/phase6-seo.test.mjs#inventory query variants remain canonical to the base route and noindex
        status: pass
      - kind: unit
        ref: tests/phase6-seo.test.mjs#supporting page metadata follows visible content and withholds empty legal pages
        status: pass
    human_judgment: true
    rationale: Route metadata builders are tested, but dynamic CMS page metadata was not exercised against a running Payload service.
  - id: D3
    description: Indexing fails closed outside production with explicit opt-in and a valid public origin.
    requirement: SEO-04
    verification:
      - kind: unit
        ref: tests/phase6-seo.test.mjs#indexing fails closed unless production and explicit opt-in are both set
        status: pass
      - kind: other
        ref: synthetic npm run build with HGR_PUBLIC_INDEXING_ENABLED=false
        status: pass
    human_judgment: false
  - id: D4
    description: Search Console and later landing measurement have stable canonical-origin and route foundations.
    requirement: SEO-09
    verification: []
    human_judgment: true
    rationale: Search Console account verification and analytics activation are explicitly deferred to Phase 7 and deployment configuration.
duration: 11 min
completed: 2026-10-02
status: complete
---

# Phase 6 Plan 1: Factual route metadata Summary

**Stable machine and public-route canonicals with a fail-closed indexing policy and visible-fact JSON-LD.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-10-02T03:34:00Z
- **Completed:** 2026-10-02T03:45:01Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added validated public-origin, indexing, machine metadata, Product schema, and safe JSON-LD helpers.
- Connected the machine detail route to its projected physical unit, current canonical slug, visible breadcrumb, and Sold-aware structured data.
- Added distinct home, inventory, and supporting-page metadata. Search, brand, status, and page query variants stay noindex and canonical to the base inventory route.
- Documented the public indexing opt-in by variable name only; legal pages still require owner-published content.

## Task Commits

1. **Task 1: Trace one published machine through canonical metadata** — `37e0551` (RED tests), `24745dd` (implementation), `c767e1d` (aligned assertions).
2. **Task 2: Set factual metadata on the public page routes** — `cf72488` (RED tests), `a1fb45e` (implementation).

## Files Created/Modified

- `src/lib/siteMetadata.ts` — Validates configured origin and opt-in indexing policy; builds route and machine metadata/schema.
- `src/app/(site)/machines/[slug]/page.tsx` — Adds canonical metadata, breadcrumb and safely serialized JSON-LD from the public machine.
- `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/used-excavators/page.tsx`, `src/app/(site)/[supportingPage]/page.tsx` — Apply shared metadata policy and route canonicals.
- `tests/phase6-seo.test.mjs` — Covers origin validation, noindex policy, metadata/schema facts, filters, legal pages and JSON-LD escaping.
- `.env.example` — Documents `HGR_PUBLIC_INDEXING_ENABLED` without a value.

## Decisions Made

- Applied Phase 6 decisions D-05 and D-07: derive SEO from public visible facts, preserve stable machine identities, and omit unverified claims.
- Applied D-09: used local focused tests, typecheck, diff hygiene and a synthetic build; no live services or deployment were used.
- Omitted machine images from share and schema metadata because this plan has no verified image approval signal.

## Deviations from Plan

None - plan executed as specified. The existing `.planning/config.json` edit was present before execution and was left untouched.

## Issues Encountered

- The sandbox initially denied Git index writes. After approved sandbox escalation, the required test-first and implementation commits were created normally.
- Git metadata storage is read-only to the default command, so the plan ledger file could not be written there. Commit count and before/after HEAD values were measured directly from the captured starting SHA with `git rev-list` and `git rev-parse`.
- The prior STATE.md position used prose instead of a parseable current-plan marker, so the state SDK could not advance the plan counter. Updated the position to Plan 2 and retained the recorded metric and session updates.
- The state progress helper withheld its progress-bar update because the legacy progress sentence is not in its recognized format. Updated the plan position, totals and progress sentence directly; the roadmap plan counts and status already match disk.

## User Setup Required

None - no external service configuration is required for this plan. Indexing remains disabled until an operator intentionally configures the documented opt-in in a production environment.

## Verification

- `node --test tests/phase6-seo.test.mjs tests/public-inventory.test.mjs tests/phase5-pages.test.mjs` — 24 passed.
- `npm run typecheck` — passed.
- `npm run build` with synthetic local database/storage settings and indexing disabled — passed.
- `git diff --check` — passed.

## Next Phase Readiness

Plan 06-01 is complete. The next SEO work in Phase 6 may add robots and sitemap outputs; Search Console accounts and analytics activation remain deferred.

## Self-Check: PASSED

- All eight implementation and test files exist.
- Task commits `37e0551`, `24745dd`, `c767e1d`, `cf72488`, and `a1fb45e` are present in Git history.

---
*Phase: 06-accessible-design-and-inventory-seo*
*Completed: 2026-10-02*
