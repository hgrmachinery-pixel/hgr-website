# Phase 4: Public used-excavator inventory — Context

**Gathered:** 2026-10-02
**Status:** Ready for local implementation; public media integration remains gated

<domain>
## Phase Boundary

Build the public, English used-excavator inventory browse and physical-machine detail experience on top of the existing Payload model. Continue to use synthetic data for local checks. A migration for the approved optional YouTube field may be generated and reviewed locally, but not applied. Do not provision or contact external services, turn on public photo delivery, add lead forms or wire contact providers, or begin Phase 5.

Phase 3's exact existing disposable PostgreSQL/GCS live checks remain pending. This does not block local UI, route, projection, filtering, status, URL, and synthetic-data implementation. It does block any claim that public machine photo bytes are safe or usable in a real service environment. Preserve `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED` as default-denied. Do not weaken Phase 3's publication requirement for a human-approved General / Exterior derivative.
</domain>

<decisions>
## Locked Decisions

### Inventory and identity
- **D-01:** Public inventory path is `/used-excavators`; public unit path remains `/machines/{readable-slug-with-permanent-HGR-ID}`. Resolve the current slug and historical slugs only to the same physical machine; never reassign a URL.
- **D-02:** Show Published, non-archived machines only. Sort Available first, then Reserved, then Sold; preserve a deterministic secondary order. Available count and homepage picks use only Available units.
- **D-03:** Search brand/model and allow simple Brand and Status filters. These are client-facing query states, not indexable landing pages. Clear filters and show honest no-results and zero-stock states. Provide crawlable pagination or equivalent accessible result links; do not rely on infinite scroll.
- **D-04:** Homepage lists up to six Published + Available units; if there are none, show an honest empty state and a route to the full inventory. Do not pad with Reserved/Sold units.
- **D-05:** Display status, public price only when `priceMode=public` and a valid amount exists, or Contact for Price only when explicitly selected. Unknown/hidden price stays absent. Use RM formatting for genuine public prices.

### Detail and media
- **D-06:** Show only facts in the public allow-list and actual stored values. Omit unknown values and private fields; never invent data. Sold remains a truthful historical record and links back to available stock.
- **D-07:** Present eligible categorized derivative photos as one ordered accessible gallery with category navigation. Never use master URLs or bypass the current Payload/GCS authorization gate. With no eligible media, render a deliberate neutral unavailable-image state; never show a broken image, fixture, or master fallback.
- **D-08:** Provide keyboard and touch-accessible gallery controls and meaningful alt text. Add an optional, validated YouTube URL field and privacy-enhanced click-to-load preview; do not connect to YouTube until the visitor elects to load it. Generate and review its PostgreSQL migration locally, but do not apply it without the separate approved disposable service check.
- **D-09:** Provide similar Available machines where suitable records exist; otherwise a clear inventory return. Related fallback for Reserved/Sold is Available inventory, not arbitrary Reserved/Sold filler.

### Owner workflow and implementation boundary
- **D-10:** Keep a staff-only Copy Machine Link action in Payload Admin using the permanent public URL; preserve manually sharing on Mudah and avoid any Mudah integration.
- **D-11:** Use a fresh public allow-list projection and server-side Published/non-archived queries. Do not spread Payload documents, expose draft/archived/private data, or rely on client filtering as the security boundary.
- **D-12:** Do not alter photo/document authorization or deployment settings. Real publication and photo display require Phase 3 approved service verification; local synthetic fixture paths must not become public production sources.

### Agent's Discretion
- Choose the simplest responsive page/component layout consistent with mobile-first accessibility and centralized HGR brand tokens where those exist.
- Choose page size, deterministic tie-break sort, small screen filter presentation, and stable framework-native server/client boundaries.
- Keep Stage/unknown business/contact facts out of public copy. Phase 5 owns contact links/forms; Phase 4 may provide a generic inventory return only.
</decisions>

<owner-decision-audit>
No unresolved owner business decision blocks local Phase 4 implementation. Pagination/load-more, similar-machine fallback, and sold-price display are recorded in the roadmap as confirm items but have safe choices already supplied by approved requirements: accessible crawlable paging, Available alternatives with empty fallback, and per-unit approved price visibility. Exact phone/address/machine locations are launch inputs, not required for inventory UI. Phase 3 media service verification is a technical/approval gate, not a business preference; it remains closed and is not bypassed.
</owner-decision-audit>

<canonical_refs>
- `AGENTS.md`, `MODEL-ROUTING.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`
- `.planning/phases/02-machine-model-and-payload-owner-workflow/02-CONTEXT.md`
- `.planning/phases/03-photography-media-processing-and-jpj-protection/03-CONTEXT.md`
- `.planning/phases/03-photography-media-processing-and-jpj-protection/03-04-SERVICE-READINESS.md`
- `src/collections/Machines.ts`, `src/collections/MachineMedia.ts`, `src/lib/machines/publicProjection.ts`, `src/lib/machines/media.ts`, `src/app/(site)/page.tsx`
</canonical_refs>

---
*Phase: 04-public-used-excavator-inventory*
*Context gathered: 2026-10-02*
