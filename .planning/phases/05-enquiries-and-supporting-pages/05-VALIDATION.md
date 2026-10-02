---
phase: "05"
slug: "enquiries-and-supporting-pages"
status: draft
nyquist_compliant: true
wave_0_complete: true
created: "2026-10-02"
---

# Phase 05 — Validation Strategy

## Test infrastructure

| Property | Value |
|---|---|
| Framework | Node.js built-in `node:test` |
| Focused checks | `node --test tests/phase5-enquiries.test.mjs tests/phase5-pages.test.mjs` |
| Integration checks | `npm run typecheck`; `npm run build`; `git diff --check` |
| External services | None; test delivery uses injected fakes only |

## Required cases

| Requirement area | Local evidence |
|---|---|
| Input validation | Required/optional field matrix for general, machine, rental, services, lubricant; invalid and oversized inputs; honeypot rejection |
| Privacy/context | No PII in URLs/logs; machine context derived from published slug; no private machine fields sent |
| Delivery result | Fake accepted adapter returns success; no-delivery/rejected/error returns fallback; production adapter remains no-delivery when unconfigured |
| Contact actions | WhatsApp URL contains machine public identity and canonical URL; absent phone/WhatsApp values omit actions |
| Supporting pages | Fixed slugs only; published-only content; absent content and unknown slugs do not expose drafts |
| Legal and navigation | Legal copy unavailable without owner-approved publication; exact six requested navigation links, logo-to-home, no Home item; useful 404 |
| Regression | Empty/unconfigured contact data, missing optional content, unusual field lengths, sold/reserved machine contact context |

Actual SMTP/mailbox receipt, real Payload/GCS behavior, browser/device review, deployment and infrastructure verification are deferred as authorized. SITE-06 stays pending until reviewed legal copy exists. Responsive browser verification occurs in the deployment verification milestone.

---
*Phase: 05-enquiries-and-supporting-pages*
