# Phase 2: Machine model and Payload owner workflow - Context

**Gathered:** 2026-10-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish permanent identity for every physical machine and a protected, understandable Payload workflow for two staff accounts to create, edit, preview, publish, unpublish, find, and archive inventory records. Capture machine facts accurately, preserve private serial data unless explicitly approved for public display, and keep editorial publication separate from stock status. Build and verify locally using synthetic data where required. Local Phase 2 work may proceed while PostgreSQL, object storage, production hosting, and external email remain pending; do not provision or modify external services or hosting.

</domain>

<decisions>
## Implementation Decisions

### Machine identity and URLs
- **D-01:** Assign each physical machine a permanent sequential HGR ID beginning `HGR-000001` and increasing onwards. Never reuse an ID. Keep it separate from the manufacturer serial number. — **Reversibility:** one-way — replacing IDs after they have become machine records, public references, URLs, and staff references requires data migration and risks identity collisions.
- **D-02:** Use a public path such as `/machines/{seo-slug}-hgr-000001` (or an equivalent category path), always including the permanent HGR ID. Published URLs must remain stable. If a correction is necessary, retain a 301 redirect from the prior URL to the same physical machine. Never reuse a machine URL for another unit. — **Reversibility:** one-way — changing an established public URL affects shared links and search indexing, so preserve the historical route with a redirect.
- **D-03:** Assume there are no existing WordPress machine pages to migrate. If any are later discovered, inventory them before planning migration or redirects.
- **D-04:** Display the HGR ID as a small “Reference” field on the machine page; do not make it a prominent headline or selling detail. — **Reversibility:** reversible — presentation can be adjusted without changing machine identity or URLs.

### Publication, stock status, and publishing rules
- **D-05:** Keep Publication State separate from Stock Status. Publication State is Draft, Published, or Archived. Stock Status is Available, Reserved, or Sold. Draft is admin-only. Published Available is public; Published Reserved is public with a Reserved badge; Published Sold is public with a Sold badge. Archived is admin-only. Archiving is for withdrawn, duplicate, or obsolete listings and preserves the historical record and permanent machine ID. — **Reversibility:** costly — combining or changing these states later would require data migration and could expose drafts or hide published historical listings.
- **D-06:** Publishing requires HGR ID, Category, Brand, Model, Stock Status, a selected Featured Image, and at least one Gallery Image. Price (including Contact for Price), Year, Hours, specifications, serial number, attachments, and location are optional. Unknown optional facts remain blank; never invent values. — **Reversibility:** costly — changing the minimum later requires reviewing existing records and their publication state.
- **D-07:** A featured image may be selected from the gallery; do not require owners to upload a duplicate image solely to satisfy both roles. Keep serial-number storage private by default and its public visibility independent. Do not treat Category as a substitute for any approved machine facts.

### Staff access and recovery
- **D-08:** Provide two separate protected initial staff accounts: owner and website administrator. Use owner-controlled email password reset for account recovery. Configure email delivery later; Phase 2 planning/implementation must not provision an email service or require credentials. — **Reversibility:** costly — changing recovery depends on account ownership and the configured email delivery path.

### the agent's Discretion
- Use the simplest maintainable Payload model and owner-facing workflow that satisfies these decisions and MODL/ADMN requirements.
- Decide technical field grouping, validation wording, admin list/search/filter layout, safe default visibility, and implementation-level URL slug generation within the locked identity and URL rules.
- When local integration depends on absent PostgreSQL or object-storage services, complete independent local work and record infrastructure verification as pending. Do not create services or require Phase 1 external verification to continue.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and owner requirements
- `.planning/ROADMAP.md` — Phase 2 boundary, success criteria, and later phase ownership.
- `.planning/REQUIREMENTS.md` — MODL-01 through MODL-08 and ADMN-01 through ADMN-05 and ADMN-10; authoritative requirement details.
- `.planning/PROJECT.md` — approved architecture, portability, privacy, scope, and the approved separation between publication and stock status.
- `AGENTS.md` — repository instructions for identity, CMS operation, privacy, engineering quality, and owner approval.
- `MODEL-ROUTING.md` — Luna default routing and risk-based Sol escalation policy.
- `docs/planning-analysis/RECONCILIATION-REPORT.md` — source reconciliation, including separate publication and stock status, protected draft previews, stable identity, and publishing validation.

### Retained Phase 1 foundation and pending infrastructure
- `.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-CONTEXT.md` — approved foundation boundaries, fake-data policy, host portability, and separation from external service provisioning.
- `.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-04-SUMMARY.md` — Exabytes facts and the exact database, object-storage, runtime, and second-host checks still pending.
- `src/payload.config.ts` — existing Payload configuration and database/storage adapter integration points.
- `src/collections/FoundationFixture.ts` — existing synthetic Payload collection pattern; replace or extend it only as Phase 2 plans direct.
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — existing Payload Admin route.
- `src/app/(payload)/api/[...slug]/route.ts` — existing Payload API route.
- `docs/development/dependency-review.md` — approved dependency tuple and runtime limits; do not redo package installation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/payload.config.ts`: configured Payload/PostgreSQL/GCS integration is the base for collections and access configuration.
- `src/collections/FoundationFixture.ts`: synthetic collection pattern available for local test-only fixture behavior; ensure it does not become a public machine collection accidentally.
- `src/app/(payload)/admin/[[...segments]]/page.tsx` and `src/app/(payload)/api/[...slug]/route.ts`: standard Payload Admin and API mounts already exist.
- `src/migrations/`: generated migration history exists; schema work must follow Payload's migration process and must not be applied without a suitable disposable database.

### Established Patterns
- TypeScript, Next.js App Router, Payload 3.90.2, PostgreSQL adapter, and environment-based configuration are established.
- Database and GCS adapter configuration are portable and already present. Live database, storage, Exabytes, and second-host verification remains pending; no external service is available for Phase 2 use or provisioning.
- Configuration/access tests and an explicit disposable integration smoke boundary exist from Phase 1. Follow those safety controls and do not weaken them to simulate unavailable infrastructure.

### Integration Points
- Add Phase 2 machine and user/authorization modeling in Payload collections/configuration and migrations.
- Public machine URL resolution must use the stable HGR ID alongside the approved readable slug; public exposure must be mediated by publication state, while stock status controls public status presentation.
- Payload Admin must support two separate protected accounts and protected draft previews; owner password reset wiring depends on later approved email configuration.

</code_context>

<specifics>
## Specific Ideas

- Internal ID pattern: `HGR-000001` onwards, never reused and separate from manufacturer serial numbers.
- Public path pattern: `/machines/{seo-slug}-hgr-000001` or equivalent category path, with the permanent ID in every URL.
- Publication State: Draft / Published / Archived. Stock Status: Available / Reserved / Sold.
- Published Available, Reserved, and Sold units remain public; show a Reserved or Sold badge as appropriate. Draft and Archived are admin-only.
- Required before publishing: HGR ID, Category, Brand, Model, Stock Status, Featured Image, and at least one Gallery Image. Price and other machine facts remain optional.
- Account recovery uses owner-controlled email reset; email configuration happens later.
- Show HGR ID as a small “Reference” field on the public machine page.
- Assume no current WordPress machine pages; inventory any discovered pages before migration.

</specifics>

<deferred>
## Deferred Ideas

Phase 3 owns structured photo-category uploads, processing, watermarks, and protected JPJ/document workflows. Phase 4 owns polished public inventory/detail presentation and copy-link actions. Phase 5 owns actual email provider setup and form delivery. No new deferred ideas were raised.

</deferred>

---

*Phase: 02-machine-model-and-payload-owner-workflow*
*Context gathered: 2026-10-01*
