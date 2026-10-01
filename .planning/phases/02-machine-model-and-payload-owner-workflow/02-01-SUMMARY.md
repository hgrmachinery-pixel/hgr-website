---
phase: 02-machine-model-and-payload-owner-workflow
plan: 01
subsystem: inventory
tags: [payload, postgres, machine-identity, routing]
requires: [portable-foundation, payload-postgres-adapter]
provides: [permanent-machine-reference, stable-machine-route, machine-collection]
affects: [02-02, 02-03, 04-public-inventory]
key-files:
  - src/collections/Machines.ts
  - src/collections/MachineMedia.ts
  - src/lib/machines/identity.ts
  - src/payload.config.ts
  - tests/machine-model.test.mjs
patterns:
  - Allocate permanent HGR references with a PostgreSQL sequence; accept gaps but never reuse values.
  - Keep descriptive machine routes tied to the permanent HGR reference and retain corrected prior slugs.
  - Keep the existing fake foundation media collection separate from machine photographs.
completed: 2026-10-01
duration: 1 session
tasks: 2
files: 5
requirements-completed: [MODL-01, MODL-02, ADMN-10]
requirements-pending: [MODL-03, MODL-04, MODL-05, MODL-06, MODL-07, MODL-08]
---

# Phase 2 Plan 01 Summary

**Payload machine records now use permanent HGR references and identity-bearing routes, with deletion and duplication disabled.**

## Accomplishments

- Added `HGR-000001` style references allocated through PostgreSQL `nextval`; a failed save may leave a gap, but an issued reference is never reused.
- Added a stable descriptive route ending in the machine's permanent HGR reference. Route corrections retain earlier slugs on the same record.
- Added the initial Machines collection with separate stock status, publication drafts, private-by-default serial visibility, and database unique fields for reference and route.
- Added the minimal staff-only Machine Images upload collection, separate from the synthetic foundation fixture, so later publication checks can use real image references.
- Disabled machine duplication and routine deletion.

## Files Created/Modified

- `src/lib/machines/identity.ts` — formats HGR references and machine routes.
- `src/collections/Machines.ts` — machine identity, access, and initial inventory fields.
- `src/collections/MachineMedia.ts` — staff-only machine image records on configured external storage.
- `src/payload.config.ts` — registers the collections and machine image storage.
- `tests/machine-model.test.mjs` — identity, route-history, and collection safety assertions.

## Decisions Made

- PostgreSQL sequence values may have gaps after unsuccessful saves. This is expected and preserves monotonic, non-reused identity under concurrent creation.
- Route history is kept on the physical-machine record and protected by a row lock in Payload's update transaction.
- Machine media remains staff-only and stored with the configured private GCS adapter; public delivery and optimized derivatives remain Phase 3 work.

## Deviations from Plan

- Added `MachineMedia` in this plan's implementation commit because the machine collection needs a registered real media relationship for later publication validation. This is the small collection foundation explicitly called for in the Plan 01 task; Phase 3 processing and categories remain deferred.

## Verification

- `node --test tests/machine-model.test.mjs` — passed (4 tests).
- `npm run typecheck` — passed.
- Live PostgreSQL uniqueness/concurrency proof and schema application remain pending because no approved disposable PostgreSQL service is available.

## Next Phase Readiness

Plan 02 can add the remaining structured facts, publication rules, public projection, and Payload-managed Pages and SiteContact content. The Phase 2 migration and external database verification remain for Plan 03 and the already recorded service checkpoint.

---
*Phase: 02-machine-model-and-payload-owner-workflow*
*Completed: 2026-10-01*
