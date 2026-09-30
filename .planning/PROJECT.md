# HGR Equipment Resources Website

## What This Is

An English-language website and inventory administration system for HGR Equipment Resources, focused on selling individual used excavators in Malaysia. HGR staff manage machines and ordinary content through Payload CMS; customers inspect real machine details and contact HGR to arrange viewing and an offline sale. Rental, Machinery Services and Lubricants are simple enquiry sections at first launch.

## Core Value

HGR can independently publish accurate used-excavator listings that lead customers to a direct enquiry and an arranged viewing.

## Business Context

- **Customer:** Buyers of used excavators, with secondary rental, service and lubricant enquirers.
- **Revenue model:** Offline machinery sales and separately arranged quotations after website enquiries; no V1 checkout.
- **Success measure:** Staff can manage genuine stock without developer tools, and visitors can find a unit and contact HGR. Baseline lead and sale conversion numbers are not yet known.
- **Strategy notes:** [Approved reconciliation](../docs/planning-analysis/RECONCILIATION-REPORT.md) and the [preserved 31-document source index](../docs/source-planning/SOURCE-INDEX.md).

## Requirements

### Validated

(None yet — the website and workflows have not been built or shown to work.)

### Active

- [ ] Payload owner/admin inventory workflow with two accounts, protected drafts/previews, independent publication and availability states, and stable physical-machine identity.
- [ ] Structured real-unit photography, automatic responsive processing and configurable watermarks, with distinct private-original and approved-redacted-public documentation handling.
- [ ] Fast, mobile-first, inventory-led public pages for available, reserved and sold machines, plus direct machine-specific WhatsApp, phone and enquiry routes.
- [ ] Simple editable Rental, Machinery Services, Lubricants, About and Contact sections, with accurate English content and no invented business claims.
- [ ] Inventory-first SEO, accessible design, privacy-safe analytics, reliable lead delivery, protected staging, backup/recovery and owner acceptance.
- [ ] Portable Next.js + Payload + PostgreSQL + external-storage deployment, with representative tests on the existing Exabytes account before reliance on it for production.

Atomic V1 requirements, deferred items and exact phase mapping live in [REQUIREMENTS.md](REQUIREMENTS.md).

### Out of Scope

- Ecommerce, online payment/checkout and shipping — V1 transactions follow enquiries offline.
- CRM, customer accounts and advanced lead management — email delivery and direct contact cover the V1 journey.
- Rental booking/calendar, permanent rental stock and instant quotations — rental is opportunity based.
- Automatic Mudah publishing or synchronization — Mudah stays independently managed.
- BM/Chinese pages and translations — separate-language content and URLs are future work.
- Other machinery divisions, distributorship, full lubricant catalogue/admin and dedicated product pages — wait for verified stock and need.
- Blog, mass brand/model/location landing pages, advanced filters/comparison/favourites and offline sale attribution — wait for evidence and a separate scope decision.

## Context

- The original Obsidian vault was snapshotted as 31 unchanged Markdown files under `docs/source-planning/obsidian/`. The source index, manifest, import report and hash audit remain there; no preserved document is edited by this planning setup.
- [RECONCILIATION-REPORT.md](../docs/planning-analysis/RECONCILIATION-REPORT.md) identifies superseded historical choices, confirmed V1 scope, open facts, design risk and technical checks. Current user instructions and `AGENTS.md` take precedence where older notes conflict.
- Approximate 20–30 initial excavators and 3–5 new listings per month are planning capacity estimates, not public claims or database limits.
- HGR's yard is in Klang, Selangor. Viewing is preferably by appointment; the location of each listed machine must be confirmed before a visitor travels. The fact of whether every current unit is stored at the yard remains to verify before publication.
- Qualitative SEO themes are already approved. Keyword volumes, rankings, business reviews, machine facts and detailed service claims must not be invented.

## Constraints

- **Approved stack:** Next.js, Payload CMS, PostgreSQL, external object storage (Google Cloud Storage planned), GitHub source control. The existing Exabytes MariaDB is not used for Payload.
- **Portability:** Move between compatible application hosts without rewriting or materially redesigning the application. A normal destination rebuild/redeployment is acceptable. Keep app, PostgreSQL, media and environment settings decoupled; avoid host-specific assumptions.
- **Initial hosting:** Test the existing Exabytes account representatively before relying on it for production. Its actual Node/application limits, external connections and media workload capability are unverified. Testing does not authorize upgrades, purchases or production changes.
- **Owner autonomy:** Routine machine and structured site-content work happens in Payload, without VS Code, GitHub, code or a terminal. Do not expose unnecessary layout/technical controls to normal staff.
- **Truth and privacy:** Every physical machine is distinct. Sold URLs remain public and cannot be reused. Private JPJ originals never have public access; redacted derivatives require human review and explicit approval. Unknown machine or business claims remain absent.
- **Visual/accessibility:** Preserve the approved HGR colour tokens and real photography; adjust actual text/button combinations to meet accessibility contrast. Motion has static/mobile/reduced-motion fallbacks and never blocks inventory or contact.
- **Security:** Secrets are environment-specific and excluded from Git. Drafts, private serials, originals and customer data are protected across API, media, metadata, analytics and caches.
- **Release:** English-only V1, no ecommerce, no CRM, no automatic Mudah sync; test responsive, accessibility, invalid/empty/sold cases, lead delivery, backup restore and owner workflow before launch.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Used excavator inventory and direct enquiries are V1 priority; secondary pages stay enquiry based. | Keeps the first launch useful without speculative stock or systems. | Approved for V1 |
| Next.js + Payload + PostgreSQL + external storage, with GCS planned. | Owner-managed content, structured unit data and media outside the app host. | Approved stack; service setup pending |
| Existing Exabytes account is the initial host test, with migration to a compatible Node host possible. | Reuse existing resources while preserving a realistic move. | Test required; suitability unverified |
| Portability allows a destination rebuild and redeployment, without source rewrite/material redesign. | Owner clarified the intended migration standard on 30 September 2026. | Approved |
| Structured photo categories and configurable watermarks remain V1. | Consistent, inspectable machine photography without manual resizing. | Approved |
| JPJ originals are private; public redactions are separate and human approved. | Protect sensitive identifiers while allowing approved evidence. | Approved |
| Draft/Published and Available/Reserved/Sold are independent. | Owners must control publication separately from sale status. | Approved |
| Sold machine pages keep their own unique URL and guide visitors toward available stock. | Preserves truthful history and SEO value. | Approved |
| Yard/location facts are verified before public launch. | Existing source wording is inconsistent about whether all units are on site. | Development may start; publication pending fact check |
| Keep HGR brand colours; choose accessible button/text treatment during UI design. | Exact white-on-orange treatment misses contrast targets. | Approved design requirement |
| English V1; Mudah manual; no ecommerce, CRM or customer accounts. | Supports current operations and keeps scope focused. | Approved |

## Open Inputs by Timing

- **Before dependent environment work:** actual Exabytes plan capabilities; ownership/access for a PostgreSQL instance and planned external storage; budget/operator for any paid resources. These do not block local design/data modelling.
- **During relevant phases:** public identifier/slug details, document approver and serial-in-photo policy, watermark defaults, media limits, email provider and failure handling, SEO parameter rules, analytics configuration, backup/recovery targets and staging setup.
- **Before public launch or specific claims:** verified address and machine locations, contact numbers/mailbox, actual inventory facts/assets/rights/prices, service/rental/lubricant claims, reviewed legal/privacy copy and owner acceptance.

## Evolution

This document evolves at phase transitions and milestone boundaries. After each phase, move shipped and verified requirements from Active to Validated, record invalidations and new decisions, and refresh context. At milestone close, recheck core value, business context, scope boundaries and remaining open inputs. Use the source documents and reconciliation report to avoid quietly changing approved decisions.

---
*Last updated: 2026-09-30 after approved source reconciliation and V1 planning authorization.*
