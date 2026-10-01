---
phase: "02"
slug: "machine-model-and-payload-owner-workflow"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-01"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner (`node:test`) |
| **Config file** | None — use the existing Node test files and TypeScript configuration |
| **Quick run command** | `node --test tests/machine-model.test.mjs` |
| **Full suite command** | `node --test` |
| **Estimated runtime** | ~30 seconds (planning estimate; remeasure after tests exist) |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/machine-model.test.mjs` and `npm run typecheck` when those targets exist.
- **After every plan wave:** Run `node --test` and `npm run typecheck`; include `npm run build` at the end of the final local wave where practical.
- **Before `$gsd-verify-work`:** Full suite must be green. Record PostgreSQL, media-storage, email-delivery, and live Admin/API checks as pending if their required external service is still unavailable; do not provision services to obtain a pass.
- **Max feedback latency:** 30 seconds (estimate; remeasure after tests exist).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 1 | MODL-01, MODL-02, ADMN-10 | T-02-01 | Unique IDs are immutable, never reused, included in stable URLs; routine delete/duplicate cannot reuse identity | unit; live database constraint/concurrency proof is conditional | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-01-T2 | 01 | 1 | MODL-01, MODL-02, ADMN-10 | T-02-01 | Assigned identity and historical URLs cannot move to another physical machine | unit | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-02-T1 | 02 | 2 | MODL-03, MODL-04, MODL-05, MODL-06, MODL-07, MODL-08 | T-02-02, T-02-03, T-02-04 | Independent lifecycle, correct optional facts/privacy, and staff-managed structured Pages/SiteContact with published-only anonymous reads | configuration/unit | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-02-T2 | 02 | 2 | MODL-01, MODL-03, MODL-06 | T-02-02, T-02-03 | Publishing minimums reference a real gallery image; featured image can be reused from gallery | unit; live upload check is conditional on object storage | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-02-T3 | 02 | 2 | MODL-03, MODL-05, MODL-06, MODL-07 | T-02-02, T-02-03 | Anonymous projection excludes drafts/archive, hidden price, and private serial; unknown facts remain omitted | unit | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-03-T1 | 03 | 3 | ADMN-01, ADMN-02, ADMN-03 | T-02-04 | One-time first-user bootstrap closes; owner alone creates the separate admin; no public registration; recovery and searchable Admin configuration are verified | local configuration/access tests; live Admin and delivery remain conditional | `node --test tests/machine-access.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-03-T2 | 03 | 3 | ADMN-04, ADMN-05 | T-02-04 | Anonymous/malformed preview is denied; authorized staff preview enables Draft Mode and redirects; public reads remain published-only | mocked route/API access test | `node --test tests/machine-access.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-03-T3 | 03 | 3 | MODL-01, MODL-08, ADMN-01, ADMN-10 | T-02-05 | Migration includes machine/media/pages/contact schema; local tests, typecheck and build run with or without database; live migration only targets an approved disposable database | local validation; disposable PostgreSQL migration is conditional | `node --test tests/machine-access.test.mjs && node --test && npm run typecheck && npm run build` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/machine-model.test.mjs` — identity formatting, immutable ID/URL rules, publication/stock combinations, publishing minimums, price/serial privacy, omitted unknown facts, and Pages/SiteContact registration and access rules.
- [ ] `tests/machine-access.test.mjs` — one-time owner bootstrap, owner-only second-account creation, disabled public registration, protected machine/draft/archive reads, staff-only changes, protected preview, recovery behavior with stubbed email delivery, and database-independent Admin configuration assertions.
- [ ] Live PostgreSQL, media-storage, and Admin/API integration can run only against already available disposable services. Currently pending; do not provision resources or apply schema migrations to production.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Owner and administrator can find records and use the normal Payload Admin workflow, including a protected preview | MODL-08, ADMN-01, ADMN-03, ADMN-04, ADMN-05 | Confirming that the screens and recovery flow are understandable requires a running Admin and an authorized account; external email delivery is configured later | When an approved disposable PostgreSQL service is available, sign in separately with the two fake test accounts; search by HGR ID/brand/model; save a Draft, verify anonymous access is denied, and verify the authorized preview. Capture only synthetic data. Do not configure email in this phase. |
| Real database migration and machine-image upload | MODL-01, MODL-02, ADMN-06 | No disposable PostgreSQL or object-storage service currently exists | Pending until an approved disposable service is already available. Never use production data or provision a paid service for the test. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify and sibling `<fails_when>` directions
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 coverage is mapped for all Phase 2 plan tasks
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (estimate)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planning contract complete; validation remains pending execution.
