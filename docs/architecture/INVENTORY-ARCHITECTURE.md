# HGR Inventory Architecture

**Status:** Design recommendation; no implementation performed  
**Scope:** Used Machine, Spare Part, Lubricant, with Rental Machine and Attachment supported as later inventory types  
**Principles:** Preserve machine identity and URLs, keep owner workflows simple, reuse presentation and services, avoid ecommerce and advanced catalogue search in V1.

## Executive recommendation

Use a **shared inventory contract and shared application services over type-specific Payload collections**. Keep the existing `Machines` collection and its PostgreSQL table as the authoritative source for used machines. Add dedicated `SpareParts` and `Lubricants` collections when those types are implemented. Add Rental Machines and Attachments later using the same common field/service patterns.

This is a deliberate choice over moving every type into one large `InventoryItems` collection. The existing machine collection contains significant identity, photo processing, privacy review, document protection, and publication logic. Keeping its records and media relationships in place avoids a risky bulk move while still giving the website one normalized `PublicInventoryItem` contract and a consistent owner experience.

The shared contract is an application-level interface, not a new universal database table. Common field definitions, validation, publication checks, public projections, enquiry context, and UI components should be shared. Each Payload collection should retain only the fields and rules that make sense for its type.

### Key decisions

| Decision | Recommendation |
|---|---|
| Record storage | Keep Machines; create separate Spare Parts and Lubricants collections; use shared schema builders/services and a normalized inventory interface. |
| Machine migration | No initial machine-row migration. Preserve current `hgrId`, `slug`, history, drafts, media and document relationships. |
| Public references | Preserve current machine HGR references. Give new item types immutable, unique references from their own sequences; exact prefixes remain a business decision. |
| Media | Shared storage and processing contract, with type-aware media records and owner relationships. Retain the existing machine photo workflow behind an adapter during transition. |
| Publication | One owner-facing draft → completeness check → preview → publish workflow. Shared rules plus type-specific checks. |
| Public routes | Stable, type-prefixed list and detail paths; retain existing machine paths. |
| Search | Simple listing and pagination only. Do not add advanced filters or search in the initial Spare Parts implementation. |

## 1. Common fields for every inventory item

Every inventory record should expose the following normalized fields to shared services and presentation components. Collections may store them directly or map existing field names into the shared contract.

### Identity

- **Inventory type:** Used Machine, Spare Part, Lubricant, Rental Machine, or Attachment. System-managed; not editable after creation.
- **Internal record ID:** Payload ID, never shown as the public reference.
- **Reference number:** Unique and immutable within the HGR inventory system. Preserve existing machine references. Generate references for new types. Do not recycle references after sale, archival, or removal.
- **URL slug:** Stable public identifier. Generated from useful item details plus its immutable reference where practical. A changed display name must not silently take over another item’s URL.
- **Display name:** Public title used by cards, details, metadata, and enquiries. Machine display names can continue to be derived from year, brand, and model; other types should enter a short item/product name.
- **Brand / maker:** Optional common value, required only by types whose identity needs it.
- **Short description and full description:** Plain owner-entered facts. Omit blank values publicly.

### Availability and price

- **Availability status:** Shared presentation concept with allowed values configured by type. Common values are Available, Reserved, Sold, and Unavailable. Rental availability may add On Hire / Maintenance later.
- **Price display:** Contact for Price or Show Price. Default new records to Contact for Price; no public price is emitted unless Show Price is deliberately chosen and validated.
- **Price amount and currency:** Conditional on Show Price. Use MYR for the current Malaysian site unless a later requirement changes this.
- **Archived:** Separate from sale/availability state. Archiving removes an item from normal listings without deleting its identity or reusing its URL.

Availability is not publication state. A Sold item can remain published and accessible, especially for machines; only a separate archive action should remove it from normal public discovery. Keep the existing machine behavior where sold machine pages remain accessible.

### Media, SEO, and audit

- Featured public media reference and ordered gallery references.
- SEO title and SEO description overrides; default to the visible display name and a description derived from visible item content.
- Created/updated timestamps and owner/audit attribution managed by Payload.
- Draft/published state managed by the common publication workflow.

Do not duplicate media URLs, publication status, or references in manually editable text fields. Keep system-owned values read-only or hidden in the CMS.

## 2. Type-specific field groups

Show only the group for the selected item type. Shared fields remain in the same order across collections. Use plain labels and inline explanations; do not expose technical database or media pipeline terminology.

### Used Machine

Retain the current machine facts and policies, grouped as:

1. **Machine identity:** Category (Excavator initially), Brand, Model, Year of Manufacture, HGR Reference (assigned automatically).
2. **Specifications:** Hours, Engine, Operating Weight, Condition.
3. **Origin and registration:** Country of Origin, Machine Origin / Registration Status, Registration Date.
4. **Availability and price:** Available / Reserved / Sold, Contact for Price / Show Price, conditional amount.
5. **Description and video:** Description, validated YouTube URL.
6. **Serial number privacy:** Serial number and separate, default-off permission to show it publicly.
7. **Machine photos:** Existing structured machine photography categories and required approved General / Exterior featured image.
8. **Machine documents:** Keep in the existing restricted document workflow; private original and approved redacted copy remain separate.

### Spare Part

Recommended initial fields:

1. **Part identity:** Part name, part category (optional initially), brand/maker, manufacturer part number if known, HGR reference (assigned automatically).
2. **Compatibility:** Compatible machine brand/model, with an optional Machine Model value where HGR cannot verify a precise fit. Clearly distinguish confirmed compatibility from owner notes.
3. **Condition and description:** New/used/reconditioned only when HGR confirms the value; free description.
4. **Availability and price:** Available / Reserved / Sold / Unavailable; Contact for Price by default; conditional public price.
5. **Photos:** One suitable featured photo plus optional supporting photos.

Do not add quantity tracking, supplier purchase orders, cart, checkout, or stock synchronization in V1. “Available” is a lead-generation status, not a live ecommerce stock promise.

### Lubricant

Recommended initial fields:

1. **Product identity:** Product name, brand, product code (optional), HGR reference.
2. **Product details:** Product type/application, grade/specification, pack size, factual description.
3. **Compatibility:** Optional verified equipment/machine guidance. Do not infer fitment or performance claims from a brand name.
4. **Availability and price:** Available / Unavailable or Enquiry Only; Contact for Price by default; conditional public price.
5. **Photos and supporting information:** Product image; safety data documents only if HGR chooses to maintain them and their review/publication rules are agreed.

Keep **Machine Model** optional on the Inventory Enquiry form. Do not make an enquiry depend on the customer knowing the exact machine model.

### Rental Machine (future)

- Prefer a rental offer/profile linked to the canonical Machine record when the same physical machine is also represented as a machine asset. Do not copy serial number, photos, or machine specifications into a second independent record without a clear reason.
- Add rental-specific fields only when rental operations are approved: availability window, rate basis, rental terms, location, operator availability, and on-hire/maintenance state.
- Keep rates/contact terms enquiry-based unless the business explicitly approves public rate rules.
- **Decision to confirm before implementation:** Can one physical machine be offered for sale and rental at the same time? The recommended linked-offer model supports that without two competing machine records.

### Attachment (future)

- Attachment name/type, maker/model, compatible machine make/model, condition, availability, description, photos, and price display.
- Reuse the Spare Part style of compatibility and availability, but do not expose machine-only hours, registration, serial visibility, or JPJ document controls unless a real requirement calls for them.

## 3. Shared media architecture

### Proposed contract

All public inventory media should follow one logical model:

- **Owner:** one inventory record, identified by its type and record ID.
- **Purpose/category:** a type-aware choice. Machine photography keeps the existing detailed categories; parts, lubricants, and attachments use a smaller set such as Featured, Product/Item, Label/Details, and Other.
- **Original:** preserved as a private master in configured object storage.
- **Web derivative:** separately generated, size-limited and optimized; never overwrite the original.
- **Review state:** Needs Review, Approved for Website, or Rejected / Escalated. Only an approved current derivative may be publicly delivered.
- **Presentation:** alt text, focal point, order, and an item-selected featured image.
- **Access:** media is public only through the application’s authorization-aware delivery path after confirming the owning record is published and the derivative is approved. Keep bucket objects private and URLs non-predictable.

Machine serial numbers, chassis identifiers, registration cards, ownership documents, and other sensitive content remain subject to stricter machine-specific review. Machine documents stay in `MachineDocuments`; they are not ordinary gallery media. Do not lower the existing human review or redaction controls to make media code look more uniform.

### Transition plan for media

The current `MachineMedia` collection is deeply tied to Machines: it stores a required machine relation, machine reference, machine photo category, serial-visibility revision, audit history, and protected processing/review routes. Do not simply retarget that relation to every inventory type.

Instead:

1. Define a shared media service/API contract for upload, processing, human review, publication, URL generation, and gallery ordering.
2. Keep the current machine implementation as the first provider/adapter and preserve its exact privacy checks.
3. Add a generic inventory media provider for new collections, with an explicit polymorphic owner identity and type-aware category list.
4. Reuse common storage, responsive image generation, public-delivery checks, and admin language where safe; keep category and sensitive-content policies type-specific.
5. Consider moving machine media records to a consolidated media schema only after an audited migration and parity review. This consolidation is optional; the shared service contract does not require a risky table rename.

## 4. Shared SEO fields

Use the same SEO field names and fallback logic in every inventory collection:

- **SEO title** (optional override, recommended limit around 70 characters).
- **SEO description** (optional override, recommended limit around 160 characters).
- **Canonical URL:** generated from configured site origin and canonical route; not owner-entered.
- **Social image:** default to the approved featured derivative; no separate upload required in the normal flow.
- **Indexing:** published inventory items are indexable only when the site-level indexing policy is enabled. Drafts and staging remain noindex.
- **Sitemap:** include canonical published item URLs only. Exclude drafts, archived records, invalid slugs, and filter/query variants.
- **Structured data:** emit only schema that accurately reflects the item and visible content. Do not invent public price, availability, reviews, ratings, or compatibility claims.

For filter/search results, retain the existing policy of not creating indexable facet pages. Availability status in public data must match the visible page.

## 5. Shared enquiry integration

Use one shared `InventoryEnquiry` component and the existing enquiry submission/SMTP pipeline.

### Data passed by the page

The server resolves and supplies:

- Inventory Name
- Inventory Type
- Reference Number
- Canonical item URL

These values are displayed as pre-filled/read-only context and included in the enquiry email automatically. They are not customer-entered fields and must not be trusted from arbitrary form input. For existing machine enquiries, resolve the machine by its stable slug and use the current database record; for other types, resolve the listing using its server-side collection and ID/slug.

### Customer-entered fields

- Name, phone, optional email, preferred contact, and message using the shared contact controls.
- **Machine Model** optional for Spare Part, Lubricant, and later Attachment enquiries.
- Type-specific questions only when necessary; keep them optional unless the business needs the answer to respond.

The enquiry must remain a lead, not a reservation, booking, payment, or inventory adjustment. Reuse SMTP configuration, validation, spam controls, result messaging, and analytics. Add a stable inventory type/reference to analytics without sending personal form content to analytics.

Current component references: `InventoryEnquiry`, `sendEnquiry`, `submitEnquiry`, and `smtpEnquiryAdapter`.

## 6. Shared publishing workflow

Use one owner-facing sequence for all types:

1. **Add item:** choose Used Machine, Spare Part, or Lubricant. Future types appear only when enabled.
2. **Enter details:** show common identity/availability fields and only the selected type’s fields.
3. **Add photos:** upload originals, select a category, preview the result, and process web sizes.
4. **Review:** show plain-language progress and the exact media needing approval. Machine privacy review remains the existing stricter workflow.
5. **Preview:** use a signed preview link to see the complete public page before publication.
6. **Publish:** show a short checklist of missing required fields/media, with direct navigation to each item. Publish only after all checks pass.
7. **Manage later:** edit facts, change availability, unpublish/archive, and retain route/reference history. Deletion should remain disabled for items with a public identity.

The draft/save action should be separate from publication. A draft may be incomplete; the form should not pretend it is ready to publish. Error messages should name the owner-facing field and say how to fix it.

## 7. Shared status workflow

Keep two concepts separate:

### Editorial state

- **Draft:** private to staff; may be incomplete.
- **Published:** visible at the canonical URL and eligible for sitemap/indexing under site policy.
- **Archived:** hidden from active listings; identity and URL retained. Use an explicit restore action if reactivation is supported.

This aligns with Payload drafts plus a common archive policy. Only staff can create/edit; public read access returns published, non-archived records.

### Availability state

- Common: **Available**, **Reserved**, **Sold**, **Unavailable**.
- Rental extension when implemented: **Available for Hire**, **On Hire**, **Maintenance**, plus any approved reservation state.

Do not equate Sold with Archived. Keep sold machine pages accessible. Confirm per-type public treatment of sold/unavailable products before implementation; recommended default is to keep the public item page available with an accurate status and remove it from “available” listings.

## 8. CMS editing experience

- Provide a clear **Inventory** admin area with separate list views for Machines, Spare Parts, and Lubricants (or a unified list filtered by type if Payload’s list UX remains simple). A nontechnical owner should not need to open a terminal or edit code.
- Give each list useful columns: Reference, Name/Brand, Type, Availability, Publication, Updated.
- Use the same order of common fields and the same labels across types.
- Group the edit form into Identity, Details, Availability & Price, Photos, SEO, and Publishing. Type-specific groups appear only when relevant.
- Put automatic reference, slug, timestamps, media revision IDs, and audit data in read-only or hidden areas.
- Default new items to Draft, Contact for Price, Available (not yet public), Archived off, and serial-number visibility off. Do not invent facts such as year, origin, fitment, or specifications.
- Mark publish-required fields as required in the form and provide a pre-publication checklist. Avoid hidden publish-time requirements.
- Keep normal owner tasks prominent; move sensitive document review, audit history, and advanced media operations into focused controls with plain-language instructions.
- Preview uses the real public layout and route; “Copy link” is available only after a valid canonical URL exists.

## 9. Public routing strategy

Use explicit, stable paths that do not depend on filters or query parameters:

| Type | Listing path | Detail path |
|---|---|---|
| Used Machine | `/used-excavators` | `/machines/[slug]` (preserve existing URLs) |
| Spare Part | `/spare-parts` | `/spare-parts/[slug]` |
| Lubricant | `/lubricants` | `/lubricants/[slug]` |
| Rental Machine (future) | `/rental` | `/rental/[slug]` |
| Attachment (future) | `/attachments` | `/attachments/[slug]` |

Retain the existing machine detail path because machine URLs are already stable and should not be needlessly changed. The current `/spare-parts`, `/lubricants`, and `/rental` supporting pages can become listing pages while keeping a short introduction and enquiry CTA above or below their items. Use shared listing/detail components with type-specific content sections. Do not use a catch-all route that can collide with existing supporting pages or reserve a type path whose behavior is unclear.

Generate the slug once and keep it stable when name/specification fields change. Store slug history and redirect old paths to the current item. Never reuse a sold/archived item slug for another physical item. Keep canonical URLs and sitemap paths aligned with the route.

## 10. Migration strategy from the existing Machine collection

### Recommended: expand in place, no machine row move in the first release

1. **Inventory contract:** Define `InventoryType`, normalized public item shape, availability/price mapping, media interface, and enquiry identity contract. Add machine mapping from existing fields without changing storage.
2. **Shared services and UI:** Refactor public query/projection, cards, galleries, metadata, listing/detail shells, and enquiry context to accept the normalized contract. Keep current machine queries as the first adapter.
3. **New types:** Add Spare Parts and Lubricants collections with common field builders and type-specific groups. Add the shared media provider/API path for these collections. Keep their lists simple without advanced filters/search.
4. **Machine parity:** Run the existing machine collection through the new public adapter; compare card title, reference, status, price, images, detail facts, canonical URL, robots, and enquiry email. Preserve `/machines/[slug]` and all existing machine refs.
5. **Backfill only if needed:** If the architecture later requires every item in a single storage table, first take a verified database backup and create a dry-run mapping. Migrate one machine test fixture, including version drafts, `previousSlugs`, gallery relations, featured photo, photo revisions/review history, serial visibility, and machine documents. Validate counts, IDs, exact URLs, publication state, and media authorization before any wider cutover.
6. **Cut over only after approval:** Prepare reversible dual-read/rollback steps, freeze record edits for the migration window, preserve a copy of the legacy tables, then run the migration transactionally and verify before enabling writes to the new source. Do not delete legacy data as part of the initial architecture work.

The first four steps require no machine table rename or record copy. This avoids a risky migration of the existing machine identity and media/document web. A future physical consolidation is optional and should only happen if shared application contracts prove insufficient.

### Migration risk

**Initial recommended path: Medium overall / Low for existing machine data.** Risk remains in shared media authorization and public-query parity, but keeping the Machines table, `HGR` references, slugs, photo relations, document relations, and draft history intact avoids the highest-impact data migration risk.

**Single-table consolidation alternative: High.** Moving machine rows into a new universal collection would affect Payload collection IDs, versions, direct SQL identity locking, reference sequences, history redirects, relationship tables, machine photo foreign keys, document relations, preview tokens, public queries, and analytics. It would require a purpose-built migration and a tested rollback plan. Do not make this a prerequisite for Spare Parts or Lubricants.

Other risks to control:

- Public media must remain private in object storage and pass owner-publication/derivative review checks.
- Existing machine routes, canonical URLs, and sold pages must remain accessible.
- New status options must not accidentally remove reserved/sold items from detail URLs or misstate availability.
- Product compatibility, origin, public pricing, and technical specifications must be HGR-entered facts, not inferred copy.
- SEO behavior must keep staging non-indexable and avoid indexable facets.

## Existing component reuse and refactoring

### Reuse directly

- `InventoryEnquiry` and the existing server action/SMTP adapter for shared item identity and Contact for Price leads.
- `MachineCard` styling and responsive card conventions, after accepting the normalized item contract.
- `MachineGallery` visual layout and accessible gallery navigation where its category assumptions are not hard-coded.
- `TrackedContactLink`, analytics event gating, price display conventions, `NavigationToggle`, and shared site layout.
- `siteMetadata` origin, robots, canonical, sitemap policy helpers.
- Existing machine media processing and review safeguards for the machine adapter.

### Refactor behind shared interfaces

- `PublicMachine` / `projectPublicMachine` / `publicQueries.ts` → type-neutral public inventory projection and provider adapters.
- `publicInventory.ts` filtering/sorting/pagination → generic item list helpers; keep initial filters limited to existing Used Excavators behavior and do not add part/lubricant advanced search.
- `MachineCard` → shared inventory card with type-specific secondary facts.
- Machine detail page composition (`machines/[slug]/page.tsx`) → shared detail shell plus machine-specific sections.
- `MachineGallery` and `MachinePhotoUploader` → common media interface/owner language while retaining machine categories and privacy review specifics.
- Machine publication hook logic → reusable publication checklist service with machine-only media/document validation remaining in the machine policy.
- `Machines` field schema → common field builders introduced incrementally; do not rewrite the machine collection wholesale just to remove repeated schema lines.
- Analytics/enquiry metadata → common inventory type/reference dimensions while retaining established machine-view and enquiry event compatibility.

### Keep type-specific

- `MachineDocuments`, serial number access controls, year/registration distinctions, and machine photo sensitive-content review.
- Machine-specific specification sections and view/inspection interactions.
- Part and lubricant compatibility fields, which must not be presented as machine registration or operating facts.

## Estimated implementation effort

For one experienced engineer, with owner decisions on reference prefixes and rental availability, and including relevant automated checks and owner-facing preview review:

| Workstream | Estimate |
|---|---:|
| Shared inventory contract, field builders, status/price/SEO mapping | 3–5 days |
| Shared public query, listing/detail, canonical, sitemap, and analytics adapters | 4–6 days |
| Spare Parts and Lubricants CMS collections and owner editing groups | 3–5 days |
| Shared media interface and safe new-type upload/review/delivery flow | 5–8 days |
| Enquiry wiring, previews, migration/compatibility checks, accessibility and regression QA | 4–6 days |
| **Initial architecture and first two new inventory types** | **19–30 engineer-days (about 4–6 calendar weeks)** |

This estimate does not include rental operations, attachments, ecommerce, advanced search, migration into one database table, production deployment, or owner-entered content. A later Attachment type should be about 2–4 engineer-days if it uses the common media and listing contract. Rental Machine may take 4–8 engineer-days depending on whether it links to existing machines and how availability/rates are defined.

## Owner decisions before implementation

1. Reference format/prefix for Spare Parts and Lubricants (existing machine references must remain unchanged).
2. Whether sold Spare Parts and Lubricants remain on stable public detail URLs; recommended yes, matching machine identity retention.
3. What “Available” means for each item type and whether Enquiry Only is needed for Lubricants.
4. Whether one physical machine may be listed for both sale and rental at once; recommended a linked rental offer/profile.
5. Whether public price is needed for any non-machine type; recommended Contact for Price as the default.

No owner decision is needed to proceed with the recommended non-destructive foundation: shared application contract, keep Machines in place, and add type-specific collections as approved.
