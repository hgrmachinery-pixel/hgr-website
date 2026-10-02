# Phase 07 Local Security Review

**Scope:** Plans 07-01 and 07-02 local implementation  
**Review date:** 2026-10-02  
**Reviewer:** GPT-6.1 Sol  
**Verdict:** No blocking local findings remain; external measurement and target verification remain open.

## Findings

| Threat | Severity | Status | Evidence and limit |
|---|---|---|---|
| T-07-01 — analytics event data exposure | High | Mitigated for application events | Event payloads are built from allowlisted fields and sentinel tests cover the application data-layer payload. These tests do not simulate automatic collection from an executed Google container. |
| T-07-02 — forged lead success | Medium | Mitigated locally | Only real accepted mail-adapter results are measurement-eligible; the local-review sample is explicitly ineligible. |
| T-07-03 — consent/tag lifecycle | Medium | Open; owner activation gate | Withdrawal suppresses further application events and cross-tab storage clearing returns consent to unknown. Removing a loader does not stop already-executed tag listeners, timers or autonomous collection. Advertising-category enforcement and automatic pageview/history/form/outbound collection remain unverified. Keep external analytics disabled until the account, consent behavior and actual container traffic pass 07-03 review. |
| T-07-04 — private/public access boundary | High | Mitigated by local regressions only | Tests cover public projections, anonymous private-document denial, no-store responses and master-media denial. They do not prove deployed host, cache or object-store behavior. |
| T-07-05 — role/input boundary | High | Mitigated by regression tests | Existing role and input-validation behavior is covered; no authorization architecture was changed. |
| T-07-06 — secret hygiene | High | Closed after correction | The scanner detects quoted and unquoted credential assignments, rejects tracked real `.env` files, and asserts that loopback-like substrings do not bypass findings. Diagnostics expose file names/categories only. No actual credential was identified by the check. |
| T-07-07 — recovery isolation | Medium | Procedure documented; live proof pending | The runbook requires synthetic data, matching DB/object capture points, isolation, permission parity, outbound mail/tags disabled and production stop conditions. It does not prove a live restore. |

## Verification

- `node --test tests/phase7-secrets.test.mjs tests/phase7-analytics.test.mjs` — 10 passed.
- `npm run typecheck` — passed.
- `git diff --check HEAD` — passed.
- Full suite — 133 passed; 3 existing foundation-config child-process tests failed before assertions because Node returned `uv_os_get_passwd` / `ENOMEM` in the sandbox.

The Sol review was read-only. It did not access Google accounts, production/staging infrastructure, databases or object storage. SAFE-01/03/05 external verification and ANLY-01/05/06 account, tag, consent and privacy gates remain open as recorded in the plans.
