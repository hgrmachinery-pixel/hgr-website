---
phase: "1"
slug: "portable-foundation-and-exabytes-feasibility"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-30"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None exists yet; choose only what is needed by the foundation scaffold. |
| **Config file** | None — no application scaffold or package manifest exists. |
| **Quick run command** | `npm run smoke:foundation` — create this command to check app/Payload startup, PostgreSQL read/write, external object put/get, upload processing, and public output. |
| **Full suite command** | Run `npm run build`, then `npm run smoke:foundation`; add only required automated checks as the scaffold is planned. |
| **Estimated runtime** | Not measured; target the smoke command to complete in under 30 seconds once implemented. |

## Sampling Rate

- **After every task commit:** Run `npm run smoke:foundation` once created; do not substitute an unimplemented command.
- **After every plan wave:** Run `npm run build` and `npm run smoke:foundation`.
- **Before `$gsd-verify-work`:** Run the full available foundation checks and review manual evidence statuses.
- **Max feedback latency:** 30 seconds for the smoke command, excluding unavailable external host checks.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | PORT-01 | — | PostgreSQL only; fake record persists; no Exabytes MariaDB connection | integration | `npm run smoke:foundation` | ❌ Wave 0 | ⬜ pending |
| 1-01-02 | 01 | 1 | PORT-02 | — | Environment settings are external; example contains names only; secrets are excluded | configuration/security smoke | `npm run smoke:foundation` plus ignore/secret review | ❌ Wave 0 | ⬜ pending |
| 1-01-03 | 01 | 1 | PORT-03 | — | Fake image bytes are stored and retrieved through an external object adapter; local disk alone does not satisfy this check | integration | `npm run smoke:foundation` | ❌ Wave 0; local endpoint compatibility unverified | ⬜ pending |
| 1-01-04 | 01 | 1 | PORT-04 | — | Same source rebuilds with fresh host environment settings and no source redesign | deployment/manual smoke | `npm run build`; manual host checklist | ❌ pending until a compatible second host is available | ⬜ pending |
| 1-01-05 | 01 | 1 | PORT-05 | — | Actual Exabytes workload result is evidence-based; no remote write/upload without specific approval | manual host integration | Record reviewed capabilities and run approved fake-data smoke only after approval | ❌ pending evidence and approval | ⬜ pending |
| 1-01-06 | 01 | 1 | PORT-06 | — | Report states observed limits and missing evidence; no MariaDB substitution or paid host change | documentation review | Manual evidence review | ❌ Wave 0 | ⬜ pending |
| 1-01-07 | 01 | 1 | PORT-07 | — | Source/docs are tracked; `.env` remains ignored; `.env.example` has no values or secrets | configuration/security smoke | `npm run smoke:foundation` plus repository diff/secret review | ❌ Wave 0 | ⬜ pending |

## Wave 0 Requirements

- [ ] Foundation scaffold, lockfile, and compatible Next.js/Payload/PostgreSQL integration.
- [ ] Minimal fake record and synthetic image, public output, external-storage operation, and `smoke:foundation` command.
- [ ] Isolated disposable local PostgreSQL plus an external-storage test endpoint compatible with the selected adapter, or an explicit pending result if none is available.
- [ ] Names-only `.env.example`, `.env` ignore rule, and understandable setup/rebuild instructions.
- [ ] Exabytes evidence checklist and an owner approval checkpoint before any specific write/upload test.
- [ ] Second-host availability check; if none exists, document the repeatable deployment process and leave actual deployment verification pending.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Existing Exabytes account capability and representative host workload | PORT-05, PORT-06 | Requires evidence from the actual existing account; initial review is read-only and any write/upload test needs the owner's explicit approval for that specific test. | Record the account's observed Node/runtime, process/resource, external PostgreSQL/storage connectivity, request/upload and image-processing limits. Do not change the WordPress environment. Keep unknowns pending and request exact missing evidence. Execute a remote fake-data write/upload only after its specific approval. |
| Rebuild/redeploy on a second compatible application host | PORT-04 | A suitable second host is not confirmed and no new account or chargeable resource may be created without explicit approval. | Use an already available compatible test host only. Rebuild the same GitHub source with separate environment values and fake data. If none exists, document prerequisites and keep deployment verification pending. |
| No unintended secrets or private production data in tracked files | PORT-02, PORT-07 | Requires review of the final repository changes and environment example. | Confirm `.env` is ignored, `.env.example` contains variable names only, and changed files contain no credentials or real/sensitive test data. |

## Validation Sign-Off

- [ ] All tasks have automated verification or explicit Wave 0 dependencies.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verification.
- [ ] Wave 0 covers the currently missing test infrastructure.
- [ ] No watch-mode flags.
- [ ] `nyquist_compliant: true` set in frontmatter after the checks exist and pass.

**Approval:** pending
