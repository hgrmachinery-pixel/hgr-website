# Phase 4: Public used-excavator inventory — Research

**Researched:** 2026-10-02
**Confidence:** High for current repository behavior; medium for real service integration pending the exact Phase 3 gate

## Findings from the current codebase

- The public site currently has one placeholder route at `src/app/(site)/page.tsx` and a robots-noindex site layout. It fetches only the synthetic `foundation-fixtures` collection.
- `Machines` already supports Payload draft versions, stable HGR identity/slug/history, separate stock status and archive flag, public price visibility, serial visibility, categorized photo relationships, and optional description/specification facts.
- Anonymous machine collection reads are constrained to `_status=published` and `archived != true`; use that access check for page data. Do not query drafts with `overrideAccess` for public rendering.
- `projectPublicMachine` is a fresh allow-list but currently omits media. Extend it only with validated derivative metadata/URLs that are reachable through current Payload authorization, or add a dedicated projection helper. Never spread raw Payload docs.
- Machine photo records combine private masters and derivatives. `publicMachineMediaAccess` allows anonymous bytes only when `HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED=true`, the exact current derivative is approved/ready/reviewed, same-machine, and linked from a published machine. The environment flag must remain unset/false until the exact approved installed-handler test passes.
- Machine publication currently validates that Featured Image is an approved `general-exterior` derivative and all selected photos pass current derivative policy. Do not relax this to enable text-only publication.
- `Pages`/Payload globals and App Router are existing patterns, but contact destinations and lead capture are Phase 5 and must not be fabricated in Phase 4.
- `Machines` currently has no video URL field. MACH-06 requires an optional editable YouTube URL; add strict HTTPS host/ID validation, project to a privacy-enhanced embed origin, and lazy-load only after visitor action. Generate the schema migration locally, review its rollback guard, and leave it unapplied until an approved disposable database is available.
- Historical slugs are stored as JSONB in a field with anonymous read denied. Resolve exact array membership in a parameterized server-only SQL read that returns IDs only, checks Published/non-archived and limits ambiguity; re-fetch the one result by ID with normal public access. Payload's text `contains` operator is not appropriate for this JSONB field.
- `MachineMedia` denies anonymous collection list access because its cross-record eligibility check needs a specific record ID. Payload's automatic relationship population uses a list query, so public pages must explicitly resolve bounded machine photo IDs through `findByID` with `overrideAccess:false` after the delivery gate, not weaken list access.
- No design-token stylesheet or real HGR logo/photo set is present in the site route yet. Phase 6 owns full design/hero polish; Phase 4 should use accessible practical layout and avoid invented assets.

## Recommended implementation

1. Add pure helpers for public-machine normalization, status ordering, search/filter matching, page selection, homepage available selection, safe public-image resolution and previous-slug matching. Cover with Node built-in tests and synthetic documents.
2. Use Payload's normal public access for Published/non-archived page queries; order/query on the server and validate every result with the public projection. Use deterministic pagination through standard query parameters with canonical page URLs or crawlable page links; do not create indexable facet combinations.
3. Build `/used-excavators`, stable `/machines/[slug]`, and the product-led homepage inventory section. Render real gallery records only when a permitted responsive derivative URL exists. Empty/error states must remain useful without implying stock facts.
4. On a stale slug, resolve only against that machine's own `previousSlugs` and issue a permanent redirect to its current route. Do not redirect unknown slugs to another machine or permit ambiguous matches.
5. Add a compact categorized gallery with semantic buttons, visible focus, keyboard operation, touch controls and factual alt text. When no public media is usable, show an intentional placeholder and retain the text/spec content.
6. Add a Payload Admin control that copies the exact canonical public URL based on the current server URL configuration; no Mudah network/API dependency.

## Verification constraints

- Local checks may use only synthetic fixture objects; create/review the approved video-field migration but do not apply it or contact external services.
- No verification proves real GCS/Payload delivery. Keep the public byte gate closed and record the exact Phase 3 service checkpoint as pending.
- Exercise anonymous draft/archived exclusion, unknown price/serial omission, sold page behavior, duplicate brand/model identities, category subsets, no eligible photos, no-results, zero available, invalid query values, pagination bounds, stale/unknown slug handling, mobile layout and keyboard gallery behavior.
- Keep Phase 5 WhatsApp/phone/forms out of the build. The inventory pages may point to the inventory itself until approved contact settings are implemented.

## Risks

| Risk | Mitigation |
|---|---|
| Direct media URLs escape current authorization | Use only Payload returned delivery URLs after the default-deny media access; never construct bucket/object URLs. |
| Route accidentally fetches drafts | Keep `overrideAccess: false`; separately validate projection and status. |
| Old slug resolves to another machine | Require a unique slug owner and match history only within that document; fail closed on ambiguity. |
| Filter URLs get indexed | Keep canonical metadata to base listing or mark query variations noindex; no generated facet routes. |
| Synthetic image state leaks | Fixtures are test-only; public rendering never falls back to FoundationFixture. |
| Video database change needs schema state | Generate a reviewed optional URL-field migration; keep it unapplied until the approved disposable PostgreSQL check is available; guard rollback against dropping entered values. |

---
*Phase: 04-public-used-excavator-inventory*
*Research complete: 2026-10-02*
