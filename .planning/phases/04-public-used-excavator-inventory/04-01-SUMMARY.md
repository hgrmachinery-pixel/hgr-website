---
phase: 04-public-used-excavator-inventory
plan: 01
status: local_implementation_complete_live_media_gate_pending
completed: 2026-10-02
---

# Phase 4 Plan 01 — Local Implementation Summary

## Delivered

- Replaced the synthetic foundation homepage with a product-led Available inventory section and truthful zero-stock/unavailable states.
- Added `/used-excavators` with Published/non-archived data, Available → Reserved → Sold ordering, brand/model search, Brand/Status filters, bounded accessible pagination, and empty results.
- Added stable per-machine pages, same-machine historical slug redirects, explicit Approved/Public price projection, known facts only, Reserved/Sold messaging, Available alternatives, and a category-aware keyboard/touch gallery.
- Added a Payload Admin Copy Machine Link action derived from the configured public site origin and permanent machine slug.
- Added a validated optional YouTube video field and click-to-load privacy-enhanced preview; generated and registered its current/version table migration and schema snapshot locally with a data-preserving rollback guard. Migration remains unapplied.
- Kept private serial/audit/history fields out of public projections. Strengthened public price validation and permanent HGR-reference/slug validation.
- Kept machine media list access denied. When the Phase 3 delivery flag is enabled, pages resolve each bounded media ID through normal per-record Payload access and only accept same-origin Payload file routes; bytes are rechecked by the existing per-file access rule.
- Phase 5 contact actions/forms were not started.

## Validation

- `node --test tests/public-inventory.test.mjs tests/phase4-migration.test.mjs tests/machine-model.test.mjs tests/machine-access.test.mjs tests/machine-media.test.mjs` — 50 passed (after final rerun).
- `npm run typecheck` — passed.
- `npm run build` with synthetic environment values — passed. Public page routes compile as dynamic server routes.
- `node .codex/gsd-core/bin/gsd-tools.cjs validate consistency` — passed; the only warning is pre-existing: Phase 3 `03-04-PLAN.md` is missing the `wave` frontmatter key.
- `node .codex/gsd-core/bin/gsd-tools.cjs phase-plan-index 4` — Plan 04-01 summarized; phase remains in progress for the gated live checks.
- `git diff --check` — passed; CRLF normalization warnings only.
- Sol read-only security review — two medium findings were fixed (private JSONB old-slug lookup and media relationships blocked by anonymous list access); re-review found no remaining material issue.
- GSD plan index — Phase 4 Plan 04-01 is complete with a summary; Phase 4 itself remains In Progress because live acceptance gates are outstanding.

## Remaining Gate

This completes the local page/query implementation, not live media acceptance. Phase 3's existing approved disposable PostgreSQL/GCS target is still unavailable. The video migration remains unapplied and `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` remains unset/default-denied. Therefore the video field cannot be persisted on a live database and no real machine media can be confirmed publicly viewable. Database-backed route rendering and actual browser/device responsive review are also pending. Do not enable public delivery or claim full Phase 4 acceptance until the exact service checks and visual acceptance pass. Phase 5 has not started.
