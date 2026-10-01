---
phase: "02"
slug: "machine-model-and-payload-owner-workflow"
status: draft
nyquist_compliant: false
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
| 02-01-01 | 01 | 1 | MODL-01, MODL-02, ADMN-10 | T-02-01 | Unique IDs are immutable, never reused, included in stable URLs; routine delete/duplicate cannot reuse identity | unit + disposable PostgreSQL integration | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 1 | MODL-03, MODL-04, MODL-05, MODL-07 | T-02-04 | Draft/archive visibility is independent of stock status; unknown facts are omitted; hidden price is not zero | unit | `node --test tests/machine-model.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 2 | MODL-06, ADMN-01, ADMN-02 | T-02-02, T-02-03 | Private serials and staff accounts are not exposed; only protected reset flow is enabled | access/auth integration with a disposable database; reset email delivery deferred | `node --test tests/machine-access.test.mjs` | ❌ Wave 0 | ⬜ pending |
| 02-02-02 | 02 | 2 | MODL-08, ADMN-03, ADMN-04, ADMN-05 | T-02-01, T-02-03 | Anonymous reads exclude drafts/archives; authorized staff can find and preview drafts; normal content uses Payload | API/access tests plus manual Admin check when a database is available | `node --test tests/machine-access.test.mjs` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/machine-model.test.mjs` — identity formatting, immutable ID/URL rules, publication/stock combinations, publishing minimum, price modes, and omission of unknown facts.
- [ ] `tests/machine-access.test.mjs` — protected machine/draft/archive/serial reads, staff-only changes, protected preview, and recovery behavior with a stubbed reset-email delivery.
- [ ] Live PostgreSQL, media-storage, and Admin/API integration can run only against already available disposable services. Currently pending; do not provision resources or apply schema migrations to production.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Owner and administrator can find records and use the normal Payload Admin workflow, including a protected preview | MODL-08, ADMN-01, ADMN-03, ADMN-04, ADMN-05 | Confirming that the screens and recovery flow are understandable requires a running Admin and an authorized account; external email delivery is configured later | When an approved disposable PostgreSQL service is available, sign in separately with the two fake test accounts; search by HGR ID/brand/model; save a Draft, verify anonymous access is denied, and verify the authorized preview. Capture only synthetic data. Do not configure email in this phase. |
| Real database migration and machine-image upload | MODL-01, MODL-02, ADMN-06 | No disposable PostgreSQL or object-storage service currently exists | Pending until an approved disposable service is already available. Never use production data or provision a paid service for the test. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (estimate)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
