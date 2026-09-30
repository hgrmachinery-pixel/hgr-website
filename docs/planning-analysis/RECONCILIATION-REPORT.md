# HGR V1 planning reconciliation

**Date:** 28 September 2026; owner clarification recorded 30 September 2026  
**Status:** Approved reconciliation basis for formal GSD planning.  
**Material reviewed:** All 31 preserved Markdown documents, the source index, import manifest, import report, snapshot audit, current repository AGENTS.md, and the current conversation decisions.

## 1. Findings at a glance

The planning consistently supports an inventory-led, English-language enquiry website. The approved Next.js + Payload + PostgreSQL + external-storage architecture can support that scope. Nothing found requires restarting business discovery or choosing a different CMS.

The main reconciliation work is to replace historical undecided architecture and optional photo categorisation with the current decisions, preserve several easily overlooked V1 requirements, and finish implementation and launch inputs at the appropriate time.

- **No unresolved contradiction between two confirmed core business decisions was established.** The owner placed machine-location verification before public launch and made accessible button treatment a design requirement. Neither blocks development.
- **Retain requirements absent from the short launch summary:** two admin accounts, Draft/Published separate from availability, password recovery, protected previews, simple inventory search/filtering, configurable watermark support, optional YouTube video support, email enquiry delivery, policy/404 pages, owner acceptance, backups and recovery testing.
- **Do not lose newer requirements absent or incomplete in the vault:** private JPJ originals and approved public derivatives, structured photo categories, separate manufacture/registration dates and verified origin status, generated media filenames, Payload-managed ordinary content and host portability.
- **The most important technical uncertainty is the existing Exabytes account's actual capability.** This report does not establish that the account can run the application, process uploads, or connect to PostgreSQL. It also does not establish that it cannot.
- Most missing business facts belong to content approval before launch, not before development. Optional biographies, videos, reviews, lubricant stock and detailed service claims are not universal launch prerequisites.

The source files remain historical evidence. This report records how to interpret them; it does not rewrite them or grant permission to publish, buy services, change DNS or deploy.

## 2. Authority, method and limits

### Authority used

1. Current explicit user instructions in this conversation.
2. Current repository [AGENTS.md](../../AGENTS.md).
3. The preserved source documents, including their explicit confirmed/deferred/future distinctions and prior human reconciliations.
4. Examples, draft copy, proposed designs and historical schedule estimates are supporting material, not new decisions.

The import manifest's ADR/SPEC/PRD/DOC types describe document purpose. An older ADR does not override current instructions. Where sources permit optional alternatives, this report preserves that flexibility rather than declaring a contradiction. Substantive business conflicts must not be decided merely by document type.

The 31 files were reviewed in three groups, with cross-checks for scope, forms, photography, lubricant timing, source authority and factual discrepancies. Source references below use **S01–S31**, mapped to every original file in Appendix A. Section numbers/headings identify supporting passages. **A** means AGENTS.md; **U** means the current conversation instructions. This is an analysis inventory, not the final numbered GSD requirements document.

Technical validation was limited to official Payload, Next.js, Google Cloud and W3C documentation to assess compatibility and concrete risks. It did not research a replacement stack, inspect hosting accounts, provision resources, audit Malaysian law, or test an application. Proposed mitigations are identified as recommendations, not existing implementation.

The preserved corpus is 388,529 bytes. All 31 files matched the original snapshot hashes at the start of analysis. The original vault and excluded ZIP archives were not accessed in this stage. Availability of launch photographs, credentials, accounts and operational services cannot be inferred from their planning checklists.

## 3. Confirmed V1 requirements

“Confirmed” here means established by the source/current instructions, not built or verified in software. Optional presentation details are explicitly distinguished.

### Business scope and public experience

| Area | Requirement carried into V1 | Evidence |
|---|---|---|
| Primary purpose | Used-excavator inventory → machine detail → WhatsApp/call/enquiry → arrange viewing → offline transaction. No checkout, CRM or customer registration barrier. | U; A Core Business; S01 §§1, 11–23; S28 D01–D08, D37 |
| Public pages | Homepage, Used Excavators, Rental, Machinery Services, Lubricants, About and Contact. Navigation excludes Home; logo links home. Established routes include `/used-excavators`, `/excavator-rental`, `/machinery-services`, `/lubricants`, `/about`, `/contact`. | S14 §§2–8, 18; S09 §4 |
| Homepage stock | Product-led homepage; immediate inventory action; normally 3–6 Published + Available machines, fewer if fewer exist. No Reserved/Sold filler. Honest empty state with contact route. Secondary services follow inventory. | S09 §§7, 16, 20, 22; S19 §4; A Public Website UX |
| Inventory discovery | Brand/model search, simple Brand and Status filters, clear/reset controls, result count and no-results help. Available before Reserved before Sold; newest available units first. Accessible crawlable navigation through results. No infinite scroll dependency. | S15 §§4–15, 22–24, 33, 36; S29 Register |
| Unit page | Real-unit photography, known specifications, approved price or Contact for Price, availability, description where supplied, optional video, approved supporting documents, direct contact, viewing route and return to inventory. Simple relevant alternatives where available; no elaborate recommendation engine. | U; A Machine Inventory/Documents; S10 §§7–30 |
| Reserved/Sold | Clear textual status. Reserved prompts checking availability/similar stock. Sold pages keep stable URLs and genuine historical details, directing interest to available units; avoid implying the sold unit can still be bought or viewed as available. | S10 §§25–28, 34; S19 §§5, 7; S28 D03–D04, D41 |
| Viewing | Klang yard viewing/inspection, preferably by appointment using WhatsApp/phone/enquiry; confirm the particular machine location before travel. No online appointment system. | A; S06 §14; S08 §17; S10 §28 |
| Rental | Broad opportunity/availability-based enquiry page; offline quotation; no public fixed rental pricing initially, guaranteed stock, booking calendar or permanent rental catalogue. Sales availability does not imply rental availability. | S13 §§1, 5–15, 21; S28 D28–D29 |
| Machinery Services | Broad enquiry page about assistance HGR may provide/arrange; publish only verified capabilities and coverage. Navigation label Machinery Services; no mandatory service catalogue, instant pricing or emergency-service promise. | S12 §§2, 6–7, 13–19; S28 D30 |
| Lubricants | Broad request/supply enquiry page works with zero products. Owner edits its ordinary content in Payload. Simple verified product information is conditional; a dedicated product catalogue/admin module is not required for launch. | U; S11 §§1, 7, 19–21, 24, 28; S29 Register |
| About and contact | Concise truthful business/yard information, clear contact and directions. Optional biography/history/testimonials are included only with verified facts and permission. | S06 §§6–16, 24; S08 §§5–8, 15–18, 28; S16 |

### Owner administration and machine information

- **Two initial authenticated accounts:** owner and website administrator. Login, recovery, protected administration and appropriate access controls. No public sign-up or advanced role-management project. Routine inventory and ordinary page/contact content must be manageable in Payload without code or deployment. [S07 §§1–8, 54–55; S28 D08–D09; A CMS Principle; U.]
- **Independent publication and availability:** Draft/Published is distinct from Available/Reserved/Sold. Add/edit/save draft/preview/publish/unpublish; previews remain protected. A Published Sold unit remains public; an Available Draft does not. [S07 §§18, 33–37; S28 D10.]
- **Stable physical-unit identity:** unique internal machine ID and unique durable public URL, including duplicate brand/model/year units. Never reuse a sold URL for a different machine. Automatically create sensible names/slugs, avoid collisions, and provide easy access to the exact published machine link for manual sharing. Exact format and prominent display of the internal ID remain open. [S07 §§14, 31–32; S10 §§31–32; S28 D41; S31 T15; A Mudah.]
- **Structured facts:** brand, model, Year of Manufacture, hours, engine, operating weight, condition, country of origin, Machine Origin / Registration Status, separate Registration Date where relevant, price/contact-for-price, description, status, photos, optional video/documents and optional serial with independent public visibility. Unknown facts must not be invented or exposed as misleading zero values. Do not infer Recond/Local New from documents. [A Machine Inventory/Documents; S01 §6; S07 §§11–20; S10 §§10, 14–16.]
- **Price visibility:** show an approved RM price or Contact for Price consistently across cards, details, sharing and machine-readable outputs. Hidden prices are not zero-priced offers. The source does not set a separate automatic sold-price policy. [S07 §§15–16; S10 §9; S21 “Titles and meta descriptions”; S23 “Structured data”.]
- **Publishing validation:** suitable featured/general photo required by current instructions. Source recommends brand/model/status/featured image as minimum; exact additional rules remain implementation detail. Do not make all optional specifications, videos, JPJ documents or all photo categories mandatory. [A Structured Machine Photography; S07 §§34, 45–46; S10 §§41–43.]
- **Simple daily workflow:** sectioned forms, list/search/status filters, plain-language validation, progress and recoverable errors; practical phone-based editing and uploading. Warn about unsaved edits where practical. Normal sold inventory is retained, not deleted. A removal action must be deliberate and exceptional. [S07 §§6–10, 25, 37–47; S01 §3.]

### Photography, video and private documentation

**The current list contains 12 photo categories**, despite the older descriptive reference to “eleven” sections: General / Exterior; Side View 1; Side View 2; Front View; Rear View; Cabin / Interior; Hour Meter; Chassis / Serial Number; Engine; Undercarriage / Tracks; Boom / Arm / Bucket; Other / Details. Use the explicit category list. This is a counting discrepancy, not a new business decision. [A Structured Machine Photography.]

- Category-based upload, batch-friendly handling, featured choice, ordering, preview and focal point where supported; a unified public gallery with useful category navigation. Not all categories need content. Linking a specification to evidence such as its hour-meter photo is useful where practical, not a requirement to prove every field photographically. [A; U.]
- Owner uploads good originals without manual resizing. Preserve appropriate masters; generate responsive, optimized derivatives, correct orientation, use modern formats where practical, and avoid serving multi-megabyte originals for ordinary browsing. Generate filenames from machine identity/category/sequence; alt text is separate and factual. [A Image Processing; S07 §§22–28, 56–58; S24 “Processing and public delivery”; S26 “Required upload and processing workflow”.]
- Support realistic batches (source guidance roughly 10–30 images per machine). Approximately 200 KB is a practical derivative goal, not a universal maximum or upload limit. Preserve detail needed to inspect machine condition. [S07 §§23–25, 56; S26.]
- **Configurable automatic watermarks are a retained source V1 requirement:** None, HGR Logo, or HGR Logo + domain; centrally controlled position, size, opacity and margin. Apply to generated public images; keep originals unwatermarked for regeneration. Bottom-right is a proposal, not approved policy. A separate decision would be needed to defer the feature. [S07 §57; S24 “Watermark requirements”; S26 “Watermarks”; S28 D12; S29 “Boundaries that must not drift”.]
- Optional YouTube URL field; no owner-written embed code or direct video-hosting system. Missing video does not prevent publishing; embeds must be lightweight. [S01 §8; S07 §§29–30; S10 §§17–18, 38; S26 “Video capture and publication”.]
- Machine documentation is separate from photo galleries. Private JPJ/ownership originals never become public. Keep a separate redacted derivative with explicit human approval before publication, considering owner/company names, identification numbers, addresses and other sensitive identifiers. Never overwrite the private source or rely solely on AI redaction. [A Machine Documentation and JPJ Documents; U.]
- Distinguish public photos, responsive derivatives, approved public documents and private originals in storage/access design. Suggested document states are Not uploaded, Uploaded, Public copy pending review, Approved for website; exact UI labels can be finalized later without weakening approval. Actual documents are optional per machine; the protected workflow is a V1 capability. [A; U.]

### Enquiries and measurement

Machine WhatsApp actions prefill the public machine identity and page URL; phone actions are direct. Viewing is arranged through these channels. Customer forms carry page/enquiry type and machine context rather than making the customer retype the unit. [S01 §§11–12, 19; S10 §§19–23; S19 §13.]

| Form | Required fields established in the sources | Other inputs |
|---|---|---|
| General / machine enquiry | Name, Phone, Message | Company and Email optional; general Machine / Subject optional; unit context supplied automatically on a machine form. |
| Rental | Name, Phone, Project Location | Company, Email, preferred machine/size, rental period, start date and combined work/message inputs optional as specified. |
| Machinery Services | Name, Phone, Machine Location, combined Issue / Message | Company, Email, machine type and brand/model optional. |
| Lubricants | Name, Phone | Company, Email, product/application/quantity and message inputs optional as specified. |

Evidence: S08 §9, S10 §22, S13 §12, S12 §10, S11 §13, S19 §13 and S18 “Enquiry forms and privacy wording”. These are intentional form-specific rules; making email or every message field mandatory would change them.

- Deliver enquiries by email to verified HGR recipients. Low-friction spam protection, server validation, understandable errors, safe retry behaviour and WhatsApp/phone fallback are required. A successful button click is not evidence of delivery; define the actual accepted-submission state and test delivery handling. No CRM or customer database is implied. [S01 §19; S08 §§11–14; S18.]
- GA4, GTM, Search Console and Google Ads measurement remain V1, including useful page/unit/contact/form events and source context. Mudah referrals/campaigns and viewing actions should be measurable where practical. No names, phone numbers, emails or free-text in routine analytics. Clicks do not prove conversations or offline sales. Avoid duplicate conversion counting. [S01 §20; S18 “Analytics, advertising and cookies”; S22 “Measurement”; S28 D24, D50; S31 T11.]
- Mudah remains separately managed. Link to exact unit pages where permitted; no automatic publishing/sync or dependence on marketplace stock. Tracking convenience is optional; source attribution has practical limits. [S28 D47–D50; S29 “SEO and marketplace expansion boundaries”; U.]

### Design, SEO and operational readiness

- Centralized current brand tokens and Inter; practical, mostly light, mobile-first interface, selected dark sections, real machinery imagery, keyboard access, visible focus/labels, readable contrast and reduced motion. Status must not rely on colour alone. [A Brand/Engineering; S04 §§11–18; S05 §§2–8, 28–30.]
- Real-HGR-excavator hero with anchored body/tracks and scroll-driven arm/boom is the intended enhancement. Inventory and contact stay accessible immediately. Approved static/simplified/reduced-motion fallbacks are supported; do not silently abandon the intent or make a performance-failing animation a launch prerequisite. [S09 §§9–15, 25; S04 §§12–14; S05 §§24–27; S24 “V1 required and conditional inventory”.]
- Inventory-first English SEO: unique metadata, canonical URLs, XML sitemap, redirects for genuine URL changes, appropriate robots/noindex rules, crawlable listings and truthful visible-content-matched structured data. Private/draft/admin content and staging must not be indexed. No automatic indexable filter pages. Unknown/private prices and serials must not leak through schema or sharing metadata. [A SEO; S20–S23; S28 D39–D46.]
- Qualitative keyword themes already exist; quantitative volumes/CPC/competition remain uncollected. Do not invent metrics, rankings, reviews, current stock, service coverage or dealer status. BM/Chinese content and separate language URLs/hreflang are future work. [S20 “Research status and authority”; S22; S28 D40, D46.]
- Privacy Policy, Terms, form notices and 404 recovery are part of public readiness. Legal Content is a planning checklist, not approved legal text. Review actual data handling, providers, retention and tracking controls before publication; no blanket promise about legal compliance or cookie-banner necessity is made here. [S14 §18; S18; S19 §§16–17.]
- Favicon/default sharing artwork and real-unit sharing photos; approval and rights for published assets/copy. No fake stock, unsupported claims or public placeholders. [S24–S26; S17 §§16, 24–27.]
- Backups and recovery of database/content/media/configuration, restore verification, protected staging, owner training and real owner acceptance of the daily workflow. Relevant automated checks, responsive/accessibility/failure-state QA and secret review. [S07 §52; S31 T12–T13; S03 QA/launch sections; A Quality Assurance.]
- The original roadmap calls for first-14-days monitoring of uptime, errors, leads, analytics/indexing, performance and owner workflow. Retain this as a handover/operations requirement, not an automation created by this report. Historical week estimates are not a new promised schedule. [S03 “Phase 12 - Post-Launch Monitoring”.]

## 4. Superseded decisions and explicit replacements

| Historical source position | What governs now | What remains open |
|---|---|---|
| Architecture/framework/CMS/database unselected: S28 D27; S31 Purpose, T01–T03; S02 §§14, 17; S03 development-environment checklist; S29 technical-architecture entry. | U + A: Next.js, Payload, PostgreSQL. No reopening a generic framework/CMS selection. | Compatible versions, schema, authentication configuration, deployment mechanics and database operating arrangements. |
| Hosting/platform undecided: S31 T04/T09 and historical roadmap. | U + A: test application hosting on existing Exabytes; GitHub source control; preserve migration to Railway/upgraded Exabytes or suitable Node host. | Account capability, application runtime limits, PostgreSQL location, release/rollback details; no provisioned-service claim. Existing MariaDB is not an approved substitute. |
| Storage provider unselected: S07 §56; S24 Watermark requirements; S26 processing workflow; S31 T05–T06/T17. | U + A: external object storage, GCS currently planned; preserve independent media/app configuration. | Actual project/buckets/region/access, image pipeline, delivery/CDN and backup configuration. GCS is planned, not certified provisioned. |
| Optional photo categories: S01 §7; S07 §22; S26 processing workflow; S28 D52; S31 DECIDED. | U + A: structured categories required; use the explicit category list. | Batch-upload UX and useful defaults; category completeness remains flexible. |
| Generic year/serial/specification lists without full registration workflow: S01 §6; S07 §§11–20; S10 §§14, 41–42. | A + U add Year of Manufacture distinct from Registration Date, verified Machine Origin / Registration Status, private originals and independently approved public redactions. | Exact choices/labels and review responsibility. These are additions/clarifications, not evidence that an old public-document policy was approved. |
| Technical choice for administration open: S07 §4 and S31 T02/T07. | Payload is the owner interface for inventory and routine structured website content. | Access rules, usability and recovery configuration; avoid a second custom admin system without a demonstrated need. |
| Old sequencing: Phase 1 “complete”, Phase 2 selects stack, launch around Weeks 5–6 in S03. | Treat as historical planning context; current requested reconciliation precedes a new final roadmap. | Delivery estimates and implementation sequence will be assessed later. No launch date was supplied in this conversation. |

Already consistent and **not** reopened: English V1; no checkout; no automatic Mudah sync; sold URL retention; future languages/divisions; source themes already researched qualitatively. A future capability being mentioned does not make it a V1 build requirement.

## 5. Conflict and decision review

### BLOCKERS (0)

No unresolved contradiction between locked core business decisions was identified after applying U/A. There is no evidence here that the approved stack is inherently incompatible with V1. Hosting compatibility remains unverified, not proven impossible.

### WARNINGS (2)

**Owner disposition, 30 September 2026:** C01 is a before-launch content verification item and does not block development. C02 is a design acceptance requirement: preserve approved brand colours while choosing button/text treatment that meets accessibility standards. No further scope decision is needed to start development.

**[WARNING] C01 — The source asserts an unconfirmed machine-location fact.**

Found: S06 §14 says “not every listed machine is at the yard”. S16 §11, “Are All Listed Machines Stored at the Yard?”, explicitly says To Confirm. U/A confirm yard viewing and preferred appointments, not the location of every unit.

Impact: Publishing either a universal all-at-yard claim or a definitive some-offsite claim would treat an unverified fact as settled.

→ Owner verification before final location copy: are all current listed machines at the yard, or should the site describe varied locations? Until verified, the already-supported instruction to confirm the particular machine's location before visiting can stand. This does not decide the underlying fact or require a booking system.

**[WARNING] C02 — The specified button colours conflict with readable text contrast.**

Found: Design System §12 specifies white text on HGR Orange; §29 requires strong contrast. White on #F86C00 is approximately 2.943:1; white on hover #E85F00 is approximately 3.461:1. Neither meets 4.5:1 for normal-size text; the primary combination also falls below 3:1 for large text. Brand Assets already flags contrast validation.

Impact: Implementing the literal colour pairing would fail the cited text-contrast criterion. This is a design issue, not an architecture or business-model conflict.

→ During design, present an accessible button treatment for review—such as dark text on the existing orange or a suitably darker action background. Keep the brand colours centralized; no colour change is approved by this report. Threshold source: [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### INFO (4)

**[INFO] I01 — Lubricant scope has an explicit resolution in its detailed specification.**

Found: Some prose describes the owner adding products when available. S11 §§19–20 expressly says a dedicated product module is not required for V1 and permits a broad editable enquiry page.

Note: Preserve the extension path, but do not build a dormant catalogue to satisfy future prose. Verified simple content can be added within ordinary CMS content if needed. This is not an unresolved business contradiction.

**[INFO] I02 — Form differences are deliberate.**

Found: Rental, Services and Lubricants use different mandatory fields from the general enquiry form.

Note: Their detailed specifications and reconciled Website Copy agree. Do not “standardize” them into more compulsory fields.

**[INFO] I03 — Several apparent scope conflicts are examples or flexible targets.**

Found: Illustrative URLs without a unique suffix, proposed bottom-right watermarking, roughly 200 KB derivatives, 10–30 photos and suggested scroll distance appear in the sources.

Note: Stable identity, truthful photography, automatic processing and performance govern. Examples do not override those rules or become hard publication limits.

**[INFO] I04 — Optional features and unknown facts are not contradictory decisions.**

Found: Public internal-ID display, a distinct sold-price policy, document-review responsibility and optional service photo attachments are not fully selected.

Note: These are recorded below as open choices. No automatic sold-price hiding, separate approver role, new attachment system or public internal-ID rule has been invented.

## 6. TO CONFIRM register by timing

This groups repeated source markers by the decision they represent rather than repeating every occurrence. The original meaning of DEFERRED is important: many implementation choices must still be completed within V1. “Before launch” means before the affected claim/content/integration is made public, not necessarily a blocker to the entire site.

### A. Required before development

**No unresolved business-discovery answer was found that must block all development.** The following checks are needed before committing to the affected implementation or a credible delivery estimate. They do not authorize development in this stage.

| Item | Why/when needed | Responsible input and source |
|---|---|---|
| Existing Exabytes plan and runtime capabilities | Before relying on Exabytes for application hosting: supported Node runtime/process, deployment/build resources, image-processing capability, request limits and access to external PostgreSQL/storage/email. | Technical account evidence; S31 T04/T09/T13 + U/A. Unknown account details must not be replaced with assumptions about all Exabytes plans. |
| PostgreSQL and external-storage operating arrangement | Before real shared-environment data/media work: where the approved database and planned GCS will run, account ownership and access. Local isolated work need not wait for production provisioning. | Owner account/budget constraints + technical setup; S31 T03/T05 and Required inputs. |
| Operating budget, technical maintainer and release authority | Before choosing paid integrations or committing to ongoing operations. Source has no confirmed budget or responsible maintainer. | Owner; S31 Required inputs/Decision criteria. No purchases or infrastructure changes authorised here. |
| Any intended removal of an established requirement | Only if later planning proposes removing watermarks, core measurement, owner-managed content or another retained V1 requirement to meet time/cost. | Explicit owner decision; S28 D12/D24; S29 Boundaries. The present analysis retains them and does not require reconfirmation. |

### B. Can be confirmed during development, before the affected feature is finalized

| Item | Decision still needed | Evidence |
|---|---|---|
| Identity and URLs | Internal/public ID format and display policy; unique slug and redirect rules; safe copy-link action; host/canonical/trailing-slash convention. Never derive public identity from a private serial. | S07 §§14, 31–32; S10 §31; S31 T15 |
| CMS access and publication | Exact field minima, authentication/session/recovery protections, preview implementation, owner versus administrator responsibilities. The two accounts are already in scope. | S07 §§3–5, 18, 33–35, 45; S31 T07 |
| Document review and privacy | Who can view originals and approve public copies; redaction/replacement/revocation workflow; document types and practical upload limits; serial plate photo review consistent with private serials. Do not assume a second approver is mandatory. | A Documents/Security; U; S18 data-handling review |
| Media pipeline | Sizes/formats/crops/focal points, category upload UX, naming/collision handling, upload limits, progress/retries, watermark artwork/defaults, regeneration, master retention and storage delivery. | A; S07 §§22–28, 56–58; S24–S26; S31 T06/T17 |
| Sold-price behaviour | Whether ordinary per-machine price visibility remains sufficient or a separate automatic hide/retain policy is wanted for Sold. No separate rule is currently established. | S07 §§15–17, 37; S10 §§9, 27 |
| Browse mechanics | Pagination versus accessible Load More, filter URL/noindex behaviour, related-machine fallback and empty states. Keep Search/Brand/Status simple; additional filters optional. | S15 §§10–11, 22–24, 33; S31 T16 |
| Hero and accessible design | Accessible action colours (C02), responsive layouts, real hero source, motion technique/budget, fallback and practical asset production. | S04–S05; S09 §§9–15; S24–S26; S31 T10 |
| Email and forms | Delivery provider, accepted-success definition, error/retry handling and spam controls; whether any temporary retry/retention mechanism is necessary. No CRM implied. | S08 §§11–14; S18; S31 T08/T18 |
| Data handling | Actual recipients, logging/retention/deletion and privacy-request process; providers/regions and applicable reviewed controls. No invented retention period or legal conclusion. | S18 Privacy Policy requirements; S31 T11–T13 |
| Analytics and embeds | Event/data-layer names, acquisition/UTM handling, Ads conversion source/deduplication, reviewed tag activation/consent, efficient YouTube/maps, no customer identifiers in events. | S18; S22 Measurement; S31 T11/T19/T20 |
| Recovery and portability | Backup frequency/retention, recovery expectations, responsible operator, restore and rollback procedures; runtime configuration and migration proof. | S07 §52; S31 T09/T12/T13; A Deployment Portability |
| Site assets/content settings | Logo master/version, rights, font/icon sources, favicon/share artwork, content editor fields and approving owner; precise copy refinement. | S17; S24–S26 |
| Existing URLs | Whether a live predecessor site or existing indexable URLs require migration/redirect mapping. Verify before locking URL behaviour. | S31 Required inputs; S21 URLs and names; S23 Sitemap and URL identity |

### C. Required only before launch or before publishing the affected material

| Item | Required evidence/approval | Limitation |
|---|---|---|
| Business identity and contact | Registered identity where needed, privacy contact, real phone/WhatsApp, public email decision, receiving mailbox/recipients, full yard address/map, business/visiting hours as displayed. | S16 §§2, 11–12, 25, 29; S08 §28. Klang/appointment preference is already confirmed. |
| Location statement C01 | Confirm actual machine locations and final viewing copy. | Do not assume every unit is at the yard or some are offsite. |
| Published inventory | Real brand/model/specs/status/pricing or Contact for Price, actual-unit featured photo, accurate year/origin/registration facts, rights and public serial/document choices. | Per-unit verification; unknown optional fields/video/documents do not block an otherwise valid listing. S17 §§5–7; A. |
| Price/terms claims | What advertised prices include; any charges, quotation validity, warranty/finance/transport statements. | Confirm before making the claim. Do not invent tax, delivery or warranty terms. S18 Machinery, price and availability statements. |
| Secondary business wording | Actual capabilities, coverage, rental arrangements and service claims; product facts if shown. | Broad enquiry pages do not require permanent rental stock or lubricant products. Specific availability is checked per enquiry. S16 §§17–19; S11–S13. |
| Public copy and assets | Approval of published text, logo, hero/static fallback, photos/sharing assets and permissions. Remove draft markers, test units and unsupported claims. | Optional founder story, reviews, statistics, social links and videos may be omitted. S06 §§7, 15, 24; S17; S24–S26. |
| Policies and actual data handling | Reviewed Privacy Policy/Terms/form notices, policy owner/date and implemented behaviour matching disclosures; review tracking controls with actual providers. | S18 is not publishable legal text. No compliance conclusion is made here. |
| Real operating tests | End-to-end email receipt/failure handling, working WhatsApp/call/viewing links, private-original access rejection, owner no-code workflow, responsive/accessibility checks, backups and demonstrated restore. | S07 §52/55; S03 QA/Launch Definition; A Quality Assurance. |
| Launch accounts/configuration | Domain/DNS/HTTPS access, approved production settings, Search Console verification/sitemap, GA4/GTM and conversion validation; named technical operator. | Access does not authorize DNS or production changes. Ads campaign activation/budget is a separate business action. S03 Launch Definition; S22–S23. |
| Conditional optional claims/assets | Biography/history/experience, reviews, active social/profile URLs, supplier documents, distributor status, financing/delivery or warranty. | Only needed if the content is included. Possession of a file is not permission to publish it. S16 §§8–10, 21–29; S18 Asset permissions. |

### D. Future/deferred or optional; not universal launch gates

- BM/Chinese implementation; separate language URLs/hreflang when introduced. No mixed-language V1 pages. [U; S28 D14–D15/D46.]
- Other machinery divisions, repeatable new-model catalogues, authorised distributorships and their warranties/claims. Preserve a practical expansion path; do not prebuild them. [S02 Future Product Division Expansion; S16 §§27–28; S29.]
- Dedicated lubricant catalogue/admin/individual pages and product documents, unless separately justified with actual products; online purchasing/payment/shipping remains future. [S11 §§15–21; S29.]
- Rental inventory/calendar/booking, automatic quotation or logistics/finance calculators; dedicated service pages and customer service-file uploads. WhatsApp can carry service photos in V1. [S11–S13; S29; S31 T18.]
- CRM, advanced lead management, public customer accounts, saved/favourite/compare machines, bulk import/reporting and advanced permissions/search. Optional duplicate-machine convenience and extra filters must not become mandatory. [S07 §§38, 54; S15 §§10–11; S29.]
- Blog, automatic brand/model/category/location pages, state/city rental pages, dedicated campaign pages, marketing automation/remarketing, advanced dashboards and offline-sale attribution. Evidence and explicit scope decisions are required later. [S20–S23; S28 D44/D51; S29.]
- Automatic Mudah publishing/synchronisation; a convenient generated tracked-link tool is optional, while ordinary correct public linking and practical source measurement remain V1. [U; S28 D47–D50; S31 T20.]
- Quantitative keyword volumes/CPC/competition remain uncollected. Collect when useful for campaign decisions; not a reason to redo approved qualitative SEO work or block building inventory SEO. [S20 Remaining research and validation.]
- Reference sites/competitors/screens, print artwork and optional promotional videos are useful inputs, not missing mandatory website features. [S25 Web, print and source formats; S27 reference categories.]

## 7. What the short V1 summary could otherwise miss

There is no final generated V1 requirements document yet. The comparison here is against the current short launch description, not a claim that an existing final plan omitted work.

**Retain from the vault:**

1. Two admin accounts, password recovery, protected drafts/previews and publication state independent of availability. [S07; S28 D09–D10.]
2. Search/Brand/Status filtering, empty states, readable status labels and crawlable results. [S15.]
3. Automatic configurable watermark support, unwatermarked masters, batch progress/errors and derivative regeneration. [S07 §57; S24–S26; S28 D12.]
4. Optional YouTube integration, metadata/social sharing defaults, easy exact public-link access. “Optional video” means the field/workflow can exist while an individual machine has no video. [S07 §§29–32, 48–51.]
5. Email delivery plus page-specific form fields and delivery-failure alternatives; no compulsory email field simply because HGR receives email. [S01 §19; S08/S10–S13 forms; S19 §13.]
6. Privacy/Terms, form notices, 404, favicon/default sharing assets and privacy-safe analytics. [S14 §18; S18–S19; S24–S25.]
7. Owner training/acceptance, backup/restore, staging protection and post-launch operational monitoring. [S03; S07 §§52, 55; S31 T12–T13.]

**Carry forward from current instructions even though the vault does not fully specify them:**

1. Required structured photo categories and category-derived filenames; focal points where supported and unified public navigation. [A/U.]
2. Private JPJ/ownership originals, separate human-approved redactions, no inferred registration-origin claims, and separate manufacture/registration dates. Explicit JPJ/redaction workflow terms were not found in the preserved corpus during targeted search. [A/U; older inventory fields in S01/S07/S10 are insufficient alone.]
3. Approved stack/host portability, environment-based configuration, no Exabytes MariaDB substitution, and owner-managed ordinary content as well as machines. [A/U.]

**Implementation acceptance gaps to resolve, not invented business features:** exact protected-document access/revocation checks; media limits; cache refresh behaviour after changing status; recovery expectations; email failure handling and published-price semantics. Their purpose is to make existing promises testable. Do not turn them into a CRM, complex workflow engine or enterprise asset system.

## 8. Technical risk and architecture compatibility

Official documentation was checked on 28 September 2026. The findings below distinguish documented platform behaviour from project-specific risk assessment. No software or account was tested.

### T1 — Existing hosting capability is unverified

Payload documents production operation within a Next.js application, and Next.js documents self-hosting. The account must support the selected compatible runtime, an application process, database connectivity and the deployment/media workload. A PHP/static-only account would not satisfy that need; we have no evidence that the actual account is such an account. [Payload deployment](https://payloadcms.com/docs/production/deployment), [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting).

**Recommended check:** verify the actual Exabytes plan before relying on it, including upload/memory/time limits and outbound services. PostgreSQL can be operationally separate from the app; it must remain PostgreSQL. If the account fails, report the capability gap and use an approved host change/upgrade rather than altering the approved architecture. Purchases remain subject to explicit approval.

### T2 — Host portability is a source and design requirement

**Owner clarification, 30 September 2026:** the application must move between compatible hosts without rewriting or materially redesigning it. A normal rebuild and redeployment on the destination host is acceptable. The same pre-built artifact is **not** required to run unchanged everywhere.

Next.js browser-exposed `NEXT_PUBLIC_` values are inlined during build. This is compatible with the clarified requirement because a rebuild is allowed; environment-specific values and secrets must still be configured safely and kept out of source control. [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables), [self-hosting environment guidance](https://nextjs.org/docs/app/guides/self-hosting#environment-variables).

**Recommended acceptance evidence:** no Exabytes-specific paths or services embedded in application logic; documented build/deploy steps and environment variables; PostgreSQL and external media independent of the application host; successful representative build and deployment on a compatible destination host when migration is needed. Migration can involve ordinary build, deployment and data/configuration work.

### T3 — Private documents need more than hidden CMS fields

Payload has a GCS adapter, and its storage documentation warns that direct public storage URLs bypass Payload's file access checks. PostgreSQL has an official Payload adapter, so those approved choices have a documented integration path. [Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters), [Payload PostgreSQL](https://payloadcms.com/docs/database/postgres).

**Recommended safeguard:** isolate private originals from public assets with actual authorization, restricted storage permissions and denied anonymous file/API access. Do not use unpredictable filenames as the only protection. Ensure drafts, thumbnails, previews, derivatives, logs and caches cannot reveal originals. Public redactions must be distinct assets whose approval does not grant access to the source.

Google Cloud public-access prevention protects against public grants but does not prevent access through signed URLs. A signed link is a bearer access mechanism, not proof of an authenticated user. Avoid exposing original-document links in public pages or returning them to unauthorized callers. [Google Cloud public-access prevention](https://docs.cloud.google.com/storage/docs/public-access-prevention), [signed URLs](https://docs.cloud.google.com/storage/docs/access-control/signed-urls).

Payload's Local API bypasses access controls by default unless explicitly configured to respect them. Public server-rendered queries therefore need deliberate checks as well as REST/upload restrictions. [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control).

### T4 — Serial privacy can be defeated by an image

A private serial field does not hide a readable serial plate in the required Chassis / Serial Number category. This is a project-specific interaction between A's private/public visibility rule and photography requirements.

**Recommended safeguard:** review image publication as well as text fields. If the serial is private, withhold or appropriately redact identifying public imagery while retaining the source privately. Agree the practical approval procedure during development; do not assume field hiding performs image redaction or that all such photos must be public.

### T5 — Uploading originals plus watermarks is a real workload

Payload documents responsive image sizes and upload handling; it does not make the complete HGR workflow automatic without configuration. [Payload uploads](https://payloadcms.com/docs/upload/overview).

**Project risk:** batches of high-resolution phone photos multiplied into responsive and watermarked variants may exceed the unknown host's limits. Test representative inputs, recovery/progress and regeneration. Use suitable processing limits and safe retries; choose additional background processing only if needed. Do not solve it by making the owner manually resize images or discarding originals. Watermark/redaction transformations must not corrupt private document evidence.

### T6 — Inventory updates must invalidate stale public content

The source expects marking a unit Reserved/Sold to update public availability and remove it from homepage Available stock without owner deployment. Next.js has caching/revalidation mechanisms that need intentional use. [S07 §37; S09 §16; Next.js self-hosting caching](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr).

**Recommended test:** status/price/publication changes propagate to list, detail, homepage, metadata and sitemap; drafts never enter cached public responses. Do not choose a manually rebuilt static-only publishing workflow.

### T7 — Lead delivery and recovery must work operationally

Source requirements include email delivery and restore capability, but no provider, receiving mailbox, backup target or responsible operator is confirmed. Submission acceptance is not proof that a human received the email; lost leads must not be masked by unconditional success messages. [S08 §§11–14; S18; S31 T08/T12.]

**Recommended test:** real receipt, provider rejection, timeout/duplicate retry and fallback paths, plus a database-and-media restore. Decide minimal retention/retry handling separately from any future CRM. Do not invent a delivery SLA, retention period or guaranteed recovery time.

### T8 — Visual polish and colour treatment can undermine core usability

The C02 button pairing fails the cited contrast thresholds. Separately, large hero assets, video/maps and tags could undermine mobile speed, accessibility and Ads landing performance. [S05 §§24–29; S09 §§14–15; S18; W3C guidance in C02.]

**Recommended approach:** accessible action treatment, static fallback first, real-machine enhancement within measured limits, reduced motion, and efficient loading of optional embeds/tags. Final budgets and implementation need testing; no performance guarantee can be made from documents alone.

### T9 — SEO and measurement must stay truthful

Contact-for-price must not become a zero-price structured offer; sold listings must not appear available in schema/ads; private serials and customer inputs must not leak to tags. Filter routes must not generate uncontrolled indexable pages. [S18; S21–S23; A SEO.]

These are implementation checks for established requirements, not reasons to add SEO landing-page generators or advanced attribution systems. Applicable schema and tracking controls should be validated against current official guidance when implemented.

## 9. Scope focus and review outcome

The retained V1 remains proportionate to roughly 20–30 initial machines. Its necessary supporting work—secure owner administration, responsive photography, approved documentation, contact delivery, SEO, accessibility and recovery—directly supports trustworthy listings and enquiries.

Keep Rental, Services and Lubricants as editable enquiry pages. Do not expand them into separate inventory/booking/product systems to fill empty pages. Keep owner-managed content structured; a general page-layout builder is unnecessary. Keep the hero as a bounded enhancement with an acceptable fallback. Retain watermark capability because the sources explicitly require it; changing that scope must be visible to the owner.

For owner review now: acknowledge C01's location fact needs verification before publication; review C02's accessible treatment when designs exist; confirm any intended changes to the retained V1 scope rather than letting them disappear from the later plan. The other business facts and operational choices can be collected at the stages listed in section 6. This report does not ask the owner to redo documented discovery.

**Analysis stop point:** this report was prepared before formal GSD planning. On 30 September 2026, the owner approved its V1 scope and clarified portability; separate `.planning/` files were then generated. This report remains the source-reconciliation record. No application code, external infrastructure change or preserved-source edit was made by the analysis.

## Appendix A — All 31 source documents reviewed

The source IDs below are citation shortcuts only. They do not alter the import manifest or document authority.

| ID | Preserved source | Role in reconciliation |
|---|---|---|
| S01 | [hgr website/00 - Project/Business Requirements.md](<../source-planning/obsidian/hgr website/00 - Project/Business Requirements.md>) | Core business scope |
| S02 | [hgr website/00 - Project/HGR Project.md](<../source-planning/obsidian/hgr website/00 - Project/HGR Project.md>) | Project context and known facts |
| S03 | [hgr website/00 - Project/Project Roadmap.md](<../source-planning/obsidian/hgr website/00 - Project/Project Roadmap.md>) | Historical sequence and launch criteria |
| S04 | [hgr website/01 - Brand/Brand Guidelines.md](<../source-planning/obsidian/hgr website/01 - Brand/Brand Guidelines.md>) | Brand direction |
| S05 | [hgr website/01 - Brand/Design System.md](<../source-planning/obsidian/hgr website/01 - Brand/Design System.md>) | Design tokens and accessibility |
| S06 | [hgr website/02 - Website Specification/About.md](<../source-planning/obsidian/hgr website/02 - Website Specification/About.md>) | About and yard |
| S07 | [hgr website/02 - Website Specification/Admin System.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Admin System.md>) | Owner administration |
| S08 | [hgr website/02 - Website Specification/Contact.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Contact.md>) | Contact and forms |
| S09 | [hgr website/02 - Website Specification/Homepage.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Homepage.md>) | Homepage |
| S10 | [hgr website/02 - Website Specification/Individual Machine.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Individual Machine.md>) | Physical machine detail |
| S11 | [hgr website/02 - Website Specification/Lubricants.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Lubricants.md>) | Lubricant enquiry |
| S12 | [hgr website/02 - Website Specification/Machinery Services.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Machinery Services.md>) | Service enquiry |
| S13 | [hgr website/02 - Website Specification/Rental.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Rental.md>) | Rental enquiry |
| S14 | [hgr website/02 - Website Specification/Sitemap.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Sitemap.md>) | Public routes |
| S15 | [hgr website/02 - Website Specification/Used Excavators.md](<../source-planning/obsidian/hgr website/02 - Website Specification/Used Excavators.md>) | Inventory browse |
| S16 | [hgr website/03 - Content/Company Information.md](<../source-planning/obsidian/hgr website/03 - Content/Company Information.md>) | Business facts and TO CONFIRM |
| S17 | [hgr website/03 - Content/Content Requirements.md](<../source-planning/obsidian/hgr website/03 - Content/Content Requirements.md>) | Content readiness |
| S18 | [hgr website/03 - Content/Legal Content.md](<../source-planning/obsidian/hgr website/03 - Content/Legal Content.md>) | Legal/privacy planning |
| S19 | [hgr website/03 - Content/Website Copy.md](<../source-planning/obsidian/hgr website/03 - Content/Website Copy.md>) | Draft copy and form wording |
| S20 | [hgr website/04 - SEO/Keyword Strategy.md](<../source-planning/obsidian/hgr website/04 - SEO/Keyword Strategy.md>) | Keyword themes |
| S21 | [hgr website/04 - SEO/On-Page SEO.md](<../source-planning/obsidian/hgr website/04 - SEO/On-Page SEO.md>) | On-page SEO |
| S22 | [hgr website/04 - SEO/SEO Strategy.md](<../source-planning/obsidian/hgr website/04 - SEO/SEO Strategy.md>) | SEO strategy |
| S23 | [hgr website/04 - SEO/Technical & Local SEO.md](<../source-planning/obsidian/hgr website/04 - SEO/Technical & Local SEO.md>) | Technical/local SEO |
| S24 | [hgr website/05 - Assets/Asset Requirements.md](<../source-planning/obsidian/hgr website/05 - Assets/Asset Requirements.md>) | Asset inventory |
| S25 | [hgr website/05 - Assets/Brand Assets.md](<../source-planning/obsidian/hgr website/05 - Assets/Brand Assets.md>) | Brand asset approvals |
| S26 | [hgr website/05 - Assets/Photography & Video.md](<../source-planning/obsidian/hgr website/05 - Assets/Photography & Video.md>) | Photography and video |
| S27 | [hgr website/06 - References/Technical References.md](<../source-planning/obsidian/hgr website/06 - References/Technical References.md>) | Technical reference links |
| S28 | [hgr website/06 - References/Website References.md](<../source-planning/obsidian/hgr website/06 - References/Website References.md>) | Decision log |
| S29 | [hgr website/07 - Decisions/Decision Log.md](<../source-planning/obsidian/hgr website/07 - Decisions/Decision Log.md>) | Deferred scope register |
| S30 | [hgr website/07 - Decisions/Deferred & Future Decisions.md](<../source-planning/obsidian/hgr website/07 - Decisions/Deferred & Future Decisions.md>) | Technical decision register |
| S31 | [hgr website/07 - Decisions/Technical Architecture Decisions.md](<../source-planning/obsidian/hgr website/07 - Decisions/Technical Architecture Decisions.md>) | undefined |

## Appendix B — Verification

- All 31 preserved Markdown files matched their recorded SHA-256 values before analysis and again when this approved reconciliation report was finalized.
- Source index, manifest, prior import report and snapshot audit were used without modification.
- Report references and the 31-file coverage list were checked against existing local files.
- No application tests/build/lint were applicable: no application code was created or changed. These checks do not establish software readiness or hosting compatibility.
- At the original analysis stop point, no final roadmap existed. The subsequent owner-approved GSD roadmap is a separate `.planning/ROADMAP.md`; the historical Obsidian roadmap was treated solely as source material.
