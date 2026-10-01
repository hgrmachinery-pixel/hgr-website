---
phase: 02-machine-model-and-payload-owner-workflow
plan: 02
subsystem: inventory-content
tags: [payload, lexical, postgres, access-control]
requires: [02-01-permanent-machine-identity]
provides: [structured-machine-facts, publication-validation, public-projection, editable-pages-and-contact]
affects: [02-03, 03-photography-and-jpj-protection, 04-public-inventory]
completed: 2026-10-01
duration: 1 session
tasks: 3
requirements-completed: [MODL-03, MODL-04, MODL-05, MODL-06, MODL-07, MODL-08]
requirements-pending: []
status: complete
---

# Phase 2 Plan 02 Summary

**Payload now stores the approved machine facts and safe public projection, plus editable Pages and Site Contact content.**

## Accomplishments

- Kept stock status independent from draft, published, and archived state; validated publication against required facts and a real gallery reference.
- Added an explicit public machine allow-list that omits hidden prices, private serials, empty facts, drafts, and archived machines.
- Registered editable Pages and Site Contact content. Pages use the owner-approved official Payload Lexical editor package, `@payloadcms/richtext-lexical@3.90.2`.
- Generated Payload TypeScript types and included the Pages, contact, machine, and media schema in the Phase 2 migration.

## Files Created/Modified

- `src/collections/Machines.ts`, `src/collections/MachineMedia.ts` — structured machine content and media references.
- `src/collections/Pages.ts`, `src/globals/SiteContact.ts` — owner-editable page and contact content.
- `src/lib/machines/publicProjection.ts`, `src/lib/machines/identity.ts` — public allow-list and identity rules.
- `src/payload.config.ts`, `src/payload-types.ts` — registered editor/content configuration and generated types.
- `tests/machine-model.test.mjs` — publication, privacy, identity, and content access assertions.

## Decisions Made

- Installed only the approved official Payload Lexical package at the same version as the existing Payload packages. No external editor service or account is required.
- Unknown machine and contact facts remain blank; no public facts are inferred.

## Verification

- `node --test tests/machine-model.test.mjs tests/machine-access.test.mjs tests/smoke-environment.test.mjs` — passed (26 tests at final run).
- `npm run typecheck` — passed.
- `npm run build` — passed.
- The full `node --test` run remains affected by the existing sandbox `tsx` child-process failure (`uv_os_get_passwd returned ENOMEM`) in `foundation-config.test.mjs`; the Phase 2 tests pass.

## Next Phase Readiness

Structured content and publication rules are ready for later public inventory work. Live database-backed validation remains pending because no approved disposable PostgreSQL service is available.

---
*Phase: 02-machine-model-and-payload-owner-workflow*
*Completed: 2026-10-01*
