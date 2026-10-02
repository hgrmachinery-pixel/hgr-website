---
phase: "04"
slug: "public-used-excavator-inventory"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-02"
---

# Phase 04 — Validation Strategy

## Test infrastructure

| Property | Value |
|---|---|
| Framework | Node.js built-in `node:test` |
| Focused command | `node --test tests/public-inventory.test.mjs tests/phase4-migration.test.mjs` |
| Integration checks | `npm run typecheck`; `npm run build` with synthetic environment; `git diff --check` |
| External services | None used or provisioned |

## Required cases

| Requirement | Automated/manual evidence |
|---|---|
| Public query/projection | Published + non-archived only; private serial, unset/hidden price, drafts and unknown fields omitted |
| Sort and filters | Available → Reserved → Sold; brand/model search; valid brand/status filters; clear/no-results and zero-available states |
| Navigation | Bounded page values; every page reachable through links; duplicate brand/model records remain separate by HGR identity |
| Detail | Current URL unique; same-machine historical slug redirect; unknown/ambiguous slug not found; Sold and Reserved language stays truthful |
| Media | Only a Payload-authorized eligible derivative URL; no master or fixture fallback; no eligible image renders a neutral placeholder; photo delivery flag stays false |
| Gallery | Category navigation and image controls usable by keyboard/touch, meaningful alt text, visible focus, status not communicated by color alone |
| Owner action | Copy Machine Link copies current stable public route; no external Mudah dependency |
| Video | Allow only supported HTTPS YouTube hosts/11-character IDs; produce youtube-nocookie embed; iframe is absent until explicit visitor click; migration up fields and guarded down refusal are covered statically |
| Regression | Synthetic empty inventory, all sold/reserved, optional fields/photos absent, unusually long values and invalid URL filters |

Responsive visual inspection is required at narrow mobile and desktop widths. Phase 3 real handler verification remains pending and cannot be replaced with mocks; this phase does not claim live image bytes work. No contact path needs to be invented before Phase 5.

## Execution evidence (2026-10-02)

- Synthetic public-inventory, machine-model, access and media suites: 47 passed.
- TypeScript check: passed.
- Synthetic-environment production build: passed; `/`, `/used-excavators`, and `/machines/[slug]` compile as dynamic routes.
- `git diff --check`: passed (Git reports expected CRLF normalization warnings for edited files).
- Sol static security review: addressed historical JSONB lookup exactness and anonymous media relationship population; no remaining material finding.
- Not verified: database-backed page rendering, browser/device responsive inspection, real Payload/GCS media delivery, or public image bytes. The exact approved disposable service target remains unavailable; delivery gate remains false/default-denied.
- No migration, external service, paid resource, production system or real private document was used.

---
*Phase: 04-public-used-excavator-inventory*
