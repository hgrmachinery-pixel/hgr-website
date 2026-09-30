# HGR Technical Architecture Decisions

## Purpose

Phase 2 planning record. The technology stack has deliberately not been finalised. This note separates fixed requirements from implementation choices and does not recommend a winner.

Sources: [[00 - Project/HGR Project]], [[00 - Project/Business Requirements]], [[00 - Project/Project Roadmap]], [[02 - Website Specification/Admin System]], [[02 - Website Specification/Sitemap]], [[01 - Brand/Design System]] and the public-page specifications.

[DEFERRED] means a decision is intentionally pending, not that the requirement can be omitted from V1. [TO CONFIRM] identifies missing operational input. [FUTURE] means later delivery scope.

## DECIDED

- Lead generation with used excavators as the V1 focus; secondary Rental, Machinery Services and Lubricants must not compete with inventory. No checkout, dedicated quotation platform, CRM or rental booking system required.
- Conversion priority: WhatsApp, phone, then website enquiry/email. Machinery sales, rental and service quotations/transactions proceed offline; lubricant enquiries may also proceed offline in V1.
- Rental is opportunity/availability based and may have no stock. Keep the public enquiry page without a permanent rental catalogue. Machinery Services may provide/arrange assistance, with exact scope [TO CONFIRM]. Lubricants are request/supply based; no products or stock are required for launch.
- Confirmed yard viewing/inspection, preferably by appointment via WhatsApp/contact. Verify each machine location before the visit; no online appointment system required.
- Homepage Available Excavators shows only Published + Available units, approximately 3–6 or fewer if fewer exist. Full inventory retains Available/Reserved/Sold. Final homepage CTA: WhatsApp HGR, then Call HGR, with Send Enquiry optional.
- Established public routes: /, /used-excavators, /excavator-rental, /machinery-services, /lubricants, /about, /contact. Individual machine pattern remains proposed.
- Two initial admin accounts: owner and website administrator. Routine inventory management requires no code, Git, command line or developer deployment.
- Available / Reserved / Sold is separate from Draft / Published. Sold published pages remain accessible; drafts are private.
- Each physical machine has a unique identity and stable public URL. A sold unit's URL must never be reused for a different physical machine, even of the same model. Optional Serial Number supports internal storage and separately approved public display; it is not required for publication or to generate a public URL. Brand, Model, Status and Featured Image are the current recommended publishing minimum; optional facts must not be fabricated.
- Public RM price or Contact for Price per machine; visibility must remain consistent in public outputs.
- Multiple actual-unit photos, featured selection, ordering and automatic processing. Support approximately 10–30 photos; around 200 KB per generated image where practical, not an absolute upload cap.
- Configurable automatic watermark support on derivatives; originals remain unwatermarked. Physical storage and pipeline are undecided.
- Optional YouTube URL; no initial requirement for direct video hosting.
- V1 enquiry delivery by email with low-friction anti-spam and machine context. General form required fields are Name, Phone and Message; page-specific forms retain their specified fields.
- Responsive accessible mobile/desktop presentation, fast browsing and SEO foundations.
- Homepage anchored-excavator arm animation concept with performance/mobile/reduced-motion/static fallback requirements; technique undecided.
- Inter and central design-token direction are established; approximate colour values retain their existing status.
- GA4, GTM, Search Console and Google Ads conversion measurement are established products/requirements. Their detailed implementation is open.
- English V1 and a practical expansion path for structured multilingual content and new machinery/product divisions.
- Separate future repeatable product models from individual physical used units and lubricant content. Allow the owner to add lubricant catalogue/enquiry products when available or in a future phase. [FUTURE] Selected-product online purchasing should remain possible without a full rebuild, but is not V1. Payment gateway, commerce platform, checkout and shipping technology remain [DEFERRED]; none is selected. Do not implement unused future systems.

These principles are recorded in [[07 - Decisions/Decision Log]]. They are not a claim that any software has been installed or configured.

- V1 SEO is inventory-led, prioritising /used-excavators, individual units and Klang trust. No blog or automatic model/category/location/state-rental SEO pages.
- Qualitative research-informed themes are approved; quantitative Keyword Planner metrics remain uncollected.
- Mudah remains an active separately managed acquisition channel. Link to matching HGR unit pages only where marketplace rules permit; no hard-coded photo limits, technical dependency or automatic publishing/synchronisation in V1.
- Owner/admin must easily obtain the exact public machine URL, for example Copy Machine Link. A tracked-link convenience may be considered later without choosing implementation now.
- Measure source-associated website actions, including Mudah referral/campaign journeys and Arrange a Viewing where practical. Analytics alone does not prove offline sales.
- Photo categorisation is optional; the owner is not required to classify every photo.
- Future language expansion uses separate language URLs/content and appropriate hreflang; exact technical implementation remains deferred.

## TO BE DECIDED

### T01 — Frontend/framework

Status: [DEFERRED]

Decision required: Select and document frontend/framework.

Why it matters: Public content rendering, maintainability and performance depend on it.

V1 requirements: Responsive accessible pages, crawlable machine details, stable URLs, reusable components and efficient updates.

Options to evaluate later: Server-rendered, pre-rendered with automated updates, or a suitable hybrid approach; evaluate products later.

Decision timing: Phase 2 before foundation development.

### T02 — CMS/admin implementation

Status: [DEFERRED]

Decision required: Select and document cms/admin implementation.

Why it matters: The owner must maintain stock independently.

V1 requirements: Two accounts, secure access, drafts/preview, machine editing, multi-image upload, price/status controls and no manual deployments.

Options to evaluate later: Managed content administration, a tailored admin interface or an appropriate combined system.

Decision timing: Phase 2; validate with an owner-workflow prototype before commitment.

### T03 — Database/content persistence

Status: [DEFERRED]

Decision required: Select and document database/content persistence.

Why it matters: Machine identity and content must survive device loss and updates.

V1 requirements: Unique machine IDs, independent publishing/status fields, optional specifications, optional internally stored Serial Number with owner-controlled public display, and future content-type expansion. Keep private serials out of public outputs.

Options to evaluate later: CMS-managed persistence or separate structured database; evaluate lifecycle, portability and costs.

Decision timing: Phase 2 alongside admin/content modelling.

### T04 — Hosting

Status: [DEFERRED]

Decision required: Select and document hosting.

Why it matters: Public and admin experiences need reliable operation.

V1 requirements: HTTPS, appropriate runtime support, performance, secure configuration and manageable cost.

Options to evaluate later: Managed hosting or an appropriately managed server approach; no winner selected.

Decision timing: Phase 2 once application and data requirements are understood.

### T05 — Image/object storage

Status: [DEFERRED]

Decision required: Select and document image/object storage.

Why it matters: Originals and many generated photos require durable organised storage.

V1 requirements: Original uploads, separated unwatermarked masters/derivatives, access control and regeneration.

Options to evaluate later: Integrated media management or separate object storage.

Decision timing: Phase 2 before final upload architecture.

### T06 — CDN/image delivery

Status: [DEFERRED]

Decision required: Select and document cdn/image delivery.

Why it matters: Responsive galleries need efficient scalable delivery.

V1 requirements: Appropriate device sizes, caching, invalidation after updates and hidden/draft asset controls.

Options to evaluate later: Platform-integrated delivery or a separate image/CDN service.

Decision timing: Phase 2 with storage and processing evaluation.

### T07 — Authentication

Status: [DEFERRED]

Decision required: Select and document authentication.

Why it matters: Only authorised staff may manage inventory.

V1 requirements: Two initial accounts, protected routes/sessions, login recovery and appropriate login protection.

Options to evaluate later: CMS-provided authentication or a suitable separate managed authentication approach.

Decision timing: Phase 2 before admin development.

### T08 — Email/form delivery provider

Status: [DEFERRED]

Decision required: Select and document email/form delivery provider.

Why it matters: V1 enquiries must reach HGR reliably.

V1 requirements: Validated forms, spam protection, machine/source context, understandable failure handling and verified receiving mailbox.

Options to evaluate later: Suitable transactional delivery service or an appropriate authenticated mail integration.

Decision timing: Phase 2; verify delivery before launch.

### T09 — Deployment platform and release process

Status: [DEFERRED]

Decision required: Select and document deployment platform and release process.

Why it matters: Changes must reach production safely without routine owner intervention.

V1 requirements: Separate environment configuration, repeatable release, secrets handling and rollback planning.

Options to evaluate later: Provider-integrated delivery or a separate deployment workflow compatible with selected hosting.

Decision timing: Phase 2 before first development deployment.

### T10 — Animation implementation/library

Status: [DEFERRED]

Decision required: Select and document animation implementation/library.

Why it matters: The signature concept must be realistic and lightweight.

V1 requirements: Anchored body/tracks, natural arm movement, immediate CTA, mobile/static/reduced-motion fallbacks.

Options to evaluate later: Layered 2D images, suitable SVG/transforms or another lightweight rendering method; a library only if justified.

Decision timing: Phase 2 feasibility planning, then prototype before committing to asset production.

### T11 — Analytics implementation details

Status: [DEFERRED]

Decision required: Select and document analytics implementation details.

Why it matters: Actions need consistent meaning across GA4/GTM and Ads.

V1 requirements: Required products remain established; define machine identity, contact/form events, no personal-data leakage and deduplication.

Options to evaluate later: Event/data-layer structure, direct versus imported Ads conversions, reviewed consent and tag-loading approaches.

Decision timing: Plan in Phase 2; finalise before analytics implementation and validate before launch.

Approved measurement additions: Mudah referral/campaign acquisition, source-associated machine views, WhatsApp/phone clicks, forms, Arrange a Viewing and video where practical. Compare Google Organic, Ads, Mudah, Direct and other referrals. Exact UTM convention, listing identifiers and context persistence remain undecided.

Conceptual values only: mudah / marketplace / used_machinery. Tracking parameters depend on current marketplace permission. No automatic offline-sale attribution; advanced manual/offline attribution is [FUTURE].

### T12 — Backup strategy

Status: [DEFERRED]

Decision required: Select and document backup strategy.

Why it matters: Records, assets and operational data need recovery beyond one computer.

V1 requirements: Recover content/media/configuration, identify responsible operator and test a restore.

Options to evaluate later: Managed backups, export-based recovery or an appropriate combined approach; retention and recovery targets to agree.

Decision timing: Phase 2 design; demonstrate recovery before launch.

### T13 — Staging architecture

Status: [DEFERRED]

Decision required: Select and document staging architecture.

Why it matters: Testing must not expose drafts or contaminate production.

V1 requirements: Protected non-indexable staging, separated credentials/data where appropriate, safe form/tag testing and clear production promotion.

Options to evaluate later: Protected preview environments or a separate staging environment.

Decision timing: Phase 2 before testing deployments.

### T14 — Multilingual technical architecture

Status: [DEFERRED]

Decision required: Select and document multilingual technical architecture.

Why it matters: Future languages should not require a core rebuild.

V1 requirements: English V1, ability to relate translated content and future metadata/URL variants.

Options to evaluate later: Structured locale records or translation relationships with a considered future URL strategy.

Decision timing: Phase 2 expansion-path decision; actual translation implementation [FUTURE].

### T15 — Machine URL/canonical conventions

Status: [DEFERRED]

Decision required: Select and document machine url/canonical conventions.

Why it matters: Similar units need distinct stable URLs and migration safety.

V1 requirements: Retain core routes; automated unique machine slug, stable identity, redirects for true URL changes.

Options to evaluate later: Readable slug plus stable ID/suffix; canonical host/slash rules and legacy redirect mapping.

Decision timing: Phase 2 with SEO planning before final templates.

URLs identify physical units permanently wherever practical; a later unit must not reuse a sold URL. Example /used-excavators/2018-komatsu-pc200-8-028 is structural only, not a selected algorithm. Do not derive a public identifier from an internal-only Serial Number. Provide a simple public-link copy workflow for manual marketplace use.

### T16 — Inventory loading and parameter policy

Status: [DEFERRED]

Decision required: Select and document inventory loading and parameter policy.

Why it matters: Customers and search engines must reach all published stock.

V1 requirements: Simple search/filters, no infinite scroll, available-first ordering and controlled parameter indexing.

Options to evaluate later: Standard pagination or Load More with crawlable backing links; evaluate filter/canonical/noindex policy.

Decision timing: Before inventory implementation.

### T17 — Image processing/watermark pipeline

Status: [DEFERRED]

Decision required: Select and document image processing/watermark pipeline.

Why it matters: Automatic optimisation is a requirement, but the method is open.

V1 requirements: Orientation, responsive derivatives, approx. 200 KB where practical, original preservation and configurable watermark settings.

Options to evaluate later: Integrated media processing or dedicated processing jobs/service.

Decision timing: Phase 2 with upload/storage evaluation.

### T18 — Anti-spam and optional service attachments

Status: [DEFERRED]

Decision required: Select and document anti-spam and optional service attachments.

Why it matters: Forms must remain usable and safe without unnecessary complexity.

V1 requirements: Low-friction protection; reliable validation and delivery. Service photos may use WhatsApp in V1.

Options to evaluate later: Appropriate server-side controls and additional challenges only if needed; secure attachments only if justified.

Decision timing: Before form implementation; attachment scope is optional.

### T19 — Structured data and embed configuration

Status: [DEFERRED]

Decision required: Select and document structured data and embed configuration.

Why it matters: SEO, truthful representation, privacy and performance must agree.

V1 requirements: Accurate business/breadcrumb/unit data; hidden-price and sold handling; efficient YouTube and maps.

Options to evaluate later: Applicable schema based on actual fields; links/previews/delayed embeds where suitable.

Decision timing: During SEO/privacy implementation review before launch.

### T20 — Future Mudah integration and tracked-link convenience

Status: [DEFERRED] — automatic marketplace integration is [FUTURE], not required for V1.

Decision required: If separately approved later, evaluate marketplace integration or convenient tracked-link generation without assuming current policies/API access.

Why it matters: HGR needs independent website records, stable unit identity and policy-compliant acquisition links.

V1 requirements: Separately manageable listings, easy access/copying of the public machine URL, and planned referral/campaign measurement where practical. No automatic publishing/synchronisation.

Options to evaluate later: Manual linking remains sufficient for V1; tracked-link convenience and any permitted integration require an actual need, current policy review and separate approval. No technology is selected.

Decision timing: Basic URL-copy usability during admin implementation; tracking details during analytics implementation; automation only after separate future approval.

## DECISION CRITERIA

Evaluate every option against the actual owner and customer workflows, not brand familiarity.

| Criterion | Evidence needed before deciding |
|---|---|
| Owner usability | Owner can add, preview, publish, change price/status and mark sold without developer tools. |
| Performance | Representative inventory/gallery pages and hero prototype work acceptably on real phones; fallback is tested. |
| SEO | Rendered content, links, canonical identity, sitemap, status responses and parameter behaviour are inspectable. |
| Security/privacy | Protected admin/drafts, secret handling, minimal customer data collection and reviewed vendor/data flows. |
| Reliability/recovery | Form delivery/failure behaviour, backups and a restore demonstration. |
| Media workflow | Original batch upload, responsive processing, watermark regeneration and understandable progress. |
| Cost/maintenance | Total operating cost at current and plausible growing inventory/media volume; responsible maintainer [TO CONFIRM]. |
| Portability | Exportable content/media and realistic migration effort without locking the owner into developer routines. |
| Expansion | New product types and future translations can be added without building them in V1. |
| Scope | No unnecessary CRM, role engine, e-commerce or speculative catalogue features. |

## Required inputs and decision process

[TO CONFIRM] budget, account/domain access, operational maintainer, acceptable recovery targets, anticipated original-media volume, mailbox details and any existing URLs requiring migration.

Document evaluated approaches, evidence, costs, risks, selected outcome, approver and date when a decision is actually made. Add the resulting confirmed entry to Decision Log only after approval. Never treat an example option in this note as selected.

Documentation completion does not authorise development, package installation, Git/GitHub setup or GSD configuration. Those remain outside the current task.
