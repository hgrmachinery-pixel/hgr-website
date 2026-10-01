# Requirements: HGR Equipment Resources Website

**Defined:** 2026-09-30  
**Core Value:** HGR can independently publish accurate used-excavator listings that lead customers to a direct enquiry and an arranged viewing.

## Source and interpretation

These are the formal V1 requirements derived from the [31-file source index](../docs/source-planning/SOURCE-INDEX.md), the [approved reconciliation](../docs/planning-analysis/RECONCILIATION-REPORT.md), current `AGENTS.md`, and the owner's 30 September 2026 scope and portability clarification. Source document examples, historical dates and TO CONFIRM markers are not implemented facts. Source decisions superseded by current instructions are described in the reconciliation.

Each checkbox stays unchecked until the capability is built, verified and recorded as complete. The phase assignment below identifies **one owning phase per requirement**; earlier phases may create foundations and later phases may retest it.

## V1 Requirements

### Portable foundation and feasibility — Phase 1

- [ ] **PORT-01**: Developers can build a Next.js and Payload application using PostgreSQL without using the existing Exabytes MariaDB database.
- [ ] **PORT-02**: Deployers can set database, media, mail, domain and other environment-specific values without editing source code or committing secrets.
- [ ] **PORT-03**: Developers can keep uploaded media in external object storage, with Google Cloud Storage as the planned first adapter, independently of the application host.
- [ ] **PORT-04**: Developers can rebuild and redeploy the same application source on a compatible application host without rewriting or materially redesigning it.
- [ ] **PORT-05**: Developers can run a representative Next.js/Payload startup, PostgreSQL connection, external-media operation and upload-processing smoke test against the actual existing Exabytes account before depending on it for production.
- [ ] **PORT-06**: Maintainers can document the actual Exabytes test results and required host capabilities without substituting MariaDB or committing to a paid host change.
- [x] **PORT-07**: Source code and deployment instructions are kept in the GitHub-backed project with secrets excluded and an environment-variable-name example available.

### Physical-machine content model — Phase 2

- [ ] **MODL-01**: An administrator can create a distinct record with a unique internal ID for every physical machine, including otherwise identical brand/model/year units.
- [ ] **MODL-02**: A physical machine receives a unique stable public URL that is never assigned to a different unit, including after sale.
- [ ] **MODL-03**: An administrator can record Available, Reserved or Sold independently of Draft or Published state.
- [ ] **MODL-04**: An administrator can enter supported machine facts, including Year of Manufacture separately from Registration Date and an explicitly verified Machine Origin / Registration Status.
- [ ] **MODL-05**: An administrator can choose a public RM price or Contact for Price for each unit; public outputs never treat a hidden price as zero.
- [ ] **MODL-06**: An administrator can store a serial number privately and independently approve whether its field value is publicly visible.
- [ ] **MODL-07**: The public machine data omits unknown optional facts instead of inventing values or claims such as Recond or Local New.
- [ ] **MODL-08**: An administrator can manage normal structured page/contact content in Payload without code or a deploy.

### Owner/admin inventory workflow — Phase 2

- [ ] **ADMN-01**: The owner and a website administrator have two separate protected initial accounts.
- [ ] **ADMN-02**: An administrator can recover account access through a protected recovery workflow.
- [ ] **ADMN-03**: An administrator can find a unit by machine ID, brand or model in a usable inventory list.
- [ ] **ADMN-04**: An administrator can create, edit and save a machine draft without making it public.
- [ ] **ADMN-05**: An authorized administrator can preview a draft through a protected preview that does not expose it publicly.
- [x] **ADMN-06**: An administrator can publish and unpublish a unit after understandable minimum-field validation, including a suitable featured/general photo.
- [ ] **ADMN-07**: An administrator can update price and Available/Reserved/Sold status without developer work; public availability reflects saved changes.
- [ ] **ADMN-08**: An administrator can obtain and copy the exact public machine URL for manual sharing, including use on Mudah where permitted.
- [ ] **ADMN-09**: An administrator can perform normal inventory editing and photo upload from a phone with understandable progress, validation and recoverable errors.
- [ ] **ADMN-10**: Routine Sold status does not delete the unit or permit accidental reuse of its public URL.

### Structured photographs and processing — Phase 3

- [ ] **IMAG-01**: An administrator can add machine photographs under the 12 current structured categories: General / Exterior, Side View 1, Side View 2, Front View, Rear View, Cabin / Interior, Hour Meter, Chassis / Serial Number, Engine, Undercarriage / Tracks, Boom / Arm / Bucket and Other / Details.
- [ ] **IMAG-02**: An administrator can upload multiple images in a category, choose a featured image, reorder images and preview them without completing every category.
- [ ] **IMAG-03**: Where supported, an administrator can set a focal point for a photograph without changing its preserved master.
- [ ] **IMAG-04**: An administrator can upload good-quality originals without manually resizing each file; an appropriate master is retained.
- [ ] **IMAG-05**: Public machine images are automatically oriented, resized and optimized into responsive derivatives; ordinary visitors are not served multi-megabyte originals.
- [x] **IMAG-06**: Public generated machine-image filenames use stable machine identity, photo category and sequence rather than trusting the uploader filename.
- [ ] **IMAG-07**: An administrator can set factual image alt text separately from the filename without invented visual details.
- [ ] **IMAG-08**: The system can generate public derivatives with centrally configurable No Watermark, HGR Logo or HGR Logo + domain treatment, including placement, size, opacity and margin; original masters remain unwatermarked.
- [x] **IMAG-09**: Representative batches of approximately 10–30 images per machine can complete or report recoverable processing errors without a rigid ~200 KB owner-upload limit.

### Sensitive machine documentation — Phase 3

- [x] **JPJD-01**: Authorized staff can store a JPJ or ownership document original separately from public machine photos and documents.
- [x] **JPJD-02**: Anonymous visitors and public API/media requests cannot fetch private document originals or their private derivatives.
- [x] **JPJD-03**: Authorized staff can create or upload a separate redacted public derivative without overwriting its private original.
- [x] **JPJD-04**: A human reviewer must explicitly approve a redacted derivative before any public display; pending or rejected copies are not exposed.
- [x] **JPJD-05**: Staff can see and change a document's not-uploaded, uploaded, pending-review or approved state without code.
- [x] **JPJD-06**: A public machine page can state document availability or display the redacted derivative only when the corresponding statement or copy is approved.
- [x] **JPJD-07**: Public photography and data exposure respect a private serial number, including review of readable chassis/serial plate images before publication.

### Public inventory listing — Phase 4

- [ ] **LIST-01**: Visitors can open an English `/used-excavators` page and immediately browse Published machines, ordered Available then Reserved then Sold.
- [ ] **LIST-02**: Visitors can search by brand or model and use simple Brand and Status filters.
- [ ] **LIST-03**: Visitors can clear filters and see a useful empty/no-results state with a direct contact path.
- [ ] **LIST-04**: Visitors can see a machine's genuine featured photo, identity, status and approved price or Contact for Price on each card.
- [ ] **LIST-05**: Visitors and search engines can reach all Published listings through accessible, crawlable result navigation without relying on infinite scroll.
- [ ] **LIST-06**: The homepage normally shows 3–6 Published + Available units, or fewer when fewer exist, with no Reserved/Sold filler.
- [ ] **LIST-07**: A zero-available homepage state stays truthful and guides visitors to contact HGR or browse inventory.
- [ ] **LIST-08**: Changes to publication, price or availability reach public listing/homepage data without a manual owner deployment.

### Public physical-machine detail — Phase 4

- [ ] **MACH-01**: Every Published unit has its own readable stable page showing real photographs, known facts, status and approved price/Contact for Price.
- [ ] **MACH-02**: The page presents categorised photographs in one usable gallery with useful category navigation, not separate long category sections.
- [ ] **MACH-03**: Gallery controls work by touch and keyboard, show meaningful alternatives and do not rely on colour alone.
- [ ] **MACH-04**: A Reserved unit clearly indicates its status and offers an appropriate availability/similar-stock enquiry.
- [ ] **MACH-05**: A Sold unit remains accessible with truthful historical details and a route to Available machines, without an available-to-buy/view-this-unit claim.
- [ ] **MACH-06**: A machine may show an optional YouTube video URL through a lightweight preview; a missing video leaves no empty player/section.
- [ ] **MACH-07**: Visitors can return to inventory and see simple available alternatives where suitable records exist.

### Direct lead generation — Phase 5

- [ ] **LEAD-01**: Visitors can open WhatsApp from a machine page with that unit's public identity and page URL prefilled.
- [ ] **LEAD-02**: Visitors can call HGR from clear, usable mobile and desktop phone actions.
- [ ] **LEAD-03**: Visitors can submit a general or machine enquiry with required Name, Phone and Message; Company and Email remain optional, and machine context is filled when applicable.
- [ ] **LEAD-04**: Visitors can submit a rental enquiry with Name, Phone and Project Location required and other listed project inputs optional.
- [ ] **LEAD-05**: Visitors can submit a Machinery Services enquiry with Name, Phone, Machine Location and Issue/Message required.
- [ ] **LEAD-06**: Visitors can submit a lubricant enquiry with Name and Phone required while product, application, quantity, email and message remain optional.
- [ ] **LEAD-07**: Valid enquiries reach a configured HGR receiving mailbox with enquiry type, relevant unit/page and safe source context; success is shown only after the defined accepted-submission state.
- [ ] **LEAD-08**: Invalid/spam submissions receive low-friction validation, and a delivery failure gives a clear message and WhatsApp/phone alternative.
- [ ] **LEAD-09**: Visitors can arrange yard viewing by WhatsApp, phone or enquiry, with appointment preference and a prompt to confirm that unit's location before travel.

### Secondary and utility content — Phase 5

- [ ] **SITE-01**: Visitors can reach Used Excavators, Rental, Machinery Services, Lubricants, About and Contact from simple navigation; the logo links Home and no Home menu item is needed.
- [ ] **SITE-02**: HGR can edit the broad Rental page through Payload while it remains enquiry/quotation based without guaranteed stock or online booking.
- [ ] **SITE-03**: HGR can edit a broad Machinery Services enquiry page without publishing unverified capability or coverage claims.
- [ ] **SITE-04**: HGR can edit a Lubricants enquiry page that remains useful when no products are listed, without a dedicated V1 product admin module.
- [ ] **SITE-05**: Visitors can read verified About/yard and Contact content without invented hours, owner history, address or machine-location claims.
- [ ] **SITE-06**: Visitors can reach reviewed Privacy Policy and Website Terms pages and recover from a helpful 404 page; ordinary text content is manageable without code.

### Brand, accessibility and homepage polish — Phase 6

- [ ] **UX-01**: The public site uses central approved HGR colour tokens and Inter with a practical, mostly light responsive layout and selected dark sections.
- [ ] **UX-02**: Action buttons and text meet applicable accessibility contrast requirements while retaining approved HGR brand colours.
- [ ] **UX-03**: Public navigation, forms and galleries work with keyboard focus, visible labels, readable status text and practical touch targets.
- [ ] **UX-04**: The homepage foregrounds real used excavators and direct contact before secondary service promotion.
- [ ] **UX-05**: A real-HGR-excavator hero can show the planned scroll-responsive boom/arm motion with anchored body/tracks where it passes performance and usability checks.
- [ ] **UX-06**: Mobile, weak-device and reduced-motion visitors receive a static or simplified hero with immediate access to inventory and contact actions.
- [ ] **UX-07**: Approved logo, favicon, sharing assets and real-machine images are used only with appropriate rights; placeholder or fabricated images/claims are absent at launch.

### Inventory-first SEO — Phase 6

- [ ] **SEO-01**: Public home, inventory, unit and supporting pages have appropriate unique titles/descriptions and accurate canonical URLs.
- [ ] **SEO-02**: Published machine pages have stable, physical-unit-specific URLs; genuine URL changes have redirects where required.
- [ ] **SEO-03**: A current XML sitemap lists appropriate public canonical pages and excludes drafts, private/admin and staging content.
- [ ] **SEO-04**: Robots and indexing controls prevent staging, draft, private-document and unwanted filter/facet URLs from becoming indexable.
- [ ] **SEO-05**: Machine structured data appears only when it accurately matches visible, verified content and never invents a hidden price, review or availability.
- [ ] **SEO-06**: Machine cards/pages, breadcrumbs and internal links let crawlers and visitors reach inventory without infinite-scroll dependence.
- [ ] **SEO-07**: Sold pages retain truthful metadata and stay accessible unless a documented specific reason requires removal.
- [ ] **SEO-08**: Real machine photos are served at suitable responsive sizes with factual alt text and sharing imagery.
- [ ] **SEO-09**: The site is ready for Search Console verification and appropriate GA4/GTM/Google Ads landing measurements without inventing keyword volumes or ranking claims.

### Measurement — Phase 7

- [ ] **ANLY-01**: HGR can configure GA4, GTM, Search Console and Google Ads conversion measurement through environment/account configuration without exposing credentials in Git.
- [ ] **ANLY-02**: Useful inventory/unit, WhatsApp, phone, form and viewing actions can be measured without claiming that a click proves an offline sale.
- [ ] **ANLY-03**: Successful form submission is distinguishable from a form start, button click or failed delivery in measurement.
- [ ] **ANLY-04**: Where practical and permitted, HGR can distinguish Mudah referral/campaign traffic from other sources while Mudah listings remain independently managed.
- [ ] **ANLY-05**: Names, phone numbers, emails, free-text messages and private serials do not enter ordinary analytics events, URLs or campaign parameters.
- [ ] **ANLY-06**: Conversion implementation avoids material duplicate counting and follows reviewed tag/consent controls.

### Security, privacy and operations — Phase 7

- [ ] **SAFE-01**: Public and unauthenticated requests cannot access unpublished machine records, private serial fields or original JPJ/ownership files through pages, APIs, generated media or cached responses.
- [ ] **SAFE-02**: Uploads and form input are validated, and administrator access follows least privilege appropriate to the two initial accounts.
- [ ] **SAFE-03**: Staging is protected and non-indexable, with test credentials/data and tags handled separately as appropriate.
- [ ] **SAFE-04**: Database, structured content, media and deployment configuration have a documented backup and recovery procedure.
- [ ] **SAFE-05**: Maintainers can demonstrate a restore of representative database and media content before launch.
- [ ] **SAFE-06**: Reviewed privacy/terms/form and third-party disclosures match actual enquiry, media, analytics, mail and embed behaviour before publication.
- [ ] **SAFE-07**: No passwords, API keys, database credentials, service-account credentials, private keys or `.env` secrets are committed to Git.

### Owner acceptance and launch readiness — Phase 8

- [ ] **RELS-01**: A real HGR owner/admin can add, photograph, preview, publish, reserve, mark sold and edit a machine in Payload without code, GitHub, VS Code or a terminal.
- [ ] **RELS-02**: The owner can change ordinary site/contact content and perform a useful phone-based inventory update after training.
- [ ] **RELS-03**: Representative tests cover invalid/missing facts, duplicate machines, empty inventory, sold inventory, absent optional photos/video/documents, long content and failed/slow operations.
- [ ] **RELS-04**: Important responsive states and accessibility checks pass on representative desktop and mobile devices, including hero fallbacks and colour contrast.
- [ ] **RELS-05**: Real WhatsApp/call/viewing actions, form receipt/failure handling and public/private-document access boundaries are verified before launch.
- [ ] **RELS-06**: HGR approves verified public business/location/machine facts, image rights, legal text and launch copy without unresolved placeholder claims.
- [ ] **RELS-07**: Production readiness checks cover HTTPS/domain access, public indexing and sitemap, Search Console, analytics/Ads measurement, backups, restore and operational responsibilities before any authorized launch.
- [ ] **RELS-08**: The launch handover includes owner instructions and an initial monitoring plan for uptime, errors, lead delivery, indexing, performance and inventory updates.

## Deferred / future requirements

These are recorded for later consideration and have **no V1 phase assignment**.

- **FUTR-01**: Add BM and Chinese as separately maintained pages/URLs with appropriate hreflang when approved.
- **FUTR-02**: Add other physical machinery categories or repeatable new-model catalogues only when real stock and content justify them.
- **FUTR-03**: Add a dedicated owner-managed lubricant product catalogue and individual product pages if real range and operating need justify it.
- **FUTR-04**: Add evidence-backed model/category/location or campaign landing pages when unique stock/content and search/Ads results justify them.
- **FUTR-05**: Add richer rental availability or service information only when HGR can keep it accurate.
- **FUTR-06**: Consider advanced reporting, filters, comparisons, favourites or tracked-link conveniences after real user/admin need is observed.

## Out of Scope for V1

| Capability | Reason |
|---|---|
| Checkout, payments and shipping | Sales and quotations follow direct enquiry offline. |
| CRM, marketing automation, customer accounts and advanced lead pipeline | Email and direct contact cover current operating workflow. |
| Rental calendar/booking, guaranteed catalogue or instant quotations | Rental is opportunity based and handled offline. |
| Automatic Mudah publishing/synchronisation | Marketplace remains separate and policy-dependent. |
| Blog and mass SEO page generation | Inventory and genuine unique units take priority. |
| Full lubricant inventory/admin module | A broad editable enquiry page works without products. |
| Online appointment system | Viewing is arranged directly with HGR. |
| Automated JPJ redaction/publication without human approval | Sensitive originals require reviewed, separate public copies. |

## Traceability

Each V1 requirement is owned by exactly one phase. See the roadmap's phase details for goals and dependencies.

| Requirement | Owning phase | Status |
|---|---|---|
| PORT-01 | Phase 1 | Pending |
| PORT-02 | Phase 1 | Pending |
| PORT-03 | Phase 1 | Pending |
| PORT-04 | Phase 1 | Pending |
| PORT-05 | Phase 1 | Pending |
| PORT-06 | Phase 1 | Pending |
| PORT-07 | Phase 1 | Complete |
| MODL-01 | Phase 2 | Pending |
| MODL-02 | Phase 2 | Pending |
| MODL-03 | Phase 2 | Pending |
| MODL-04 | Phase 2 | Pending |
| MODL-05 | Phase 2 | Pending |
| MODL-06 | Phase 2 | Pending |
| MODL-07 | Phase 2 | Pending |
| MODL-08 | Phase 2 | Pending |
| ADMN-01 | Phase 2 | Pending |
| ADMN-02 | Phase 2 | Pending |
| ADMN-03 | Phase 2 | Pending |
| ADMN-04 | Phase 2 | Pending |
| ADMN-05 | Phase 2 | Pending |
| ADMN-06 | Phase 3 | Complete |
| ADMN-07 | Phase 4 | Pending |
| ADMN-08 | Phase 4 | Pending |
| ADMN-09 | Phase 3 | Pending |
| ADMN-10 | Phase 2 | Pending |
| IMAG-01 | Phase 3 | Pending |
| IMAG-02 | Phase 3 | Pending |
| IMAG-03 | Phase 3 | Pending |
| IMAG-04 | Phase 3 | Pending |
| IMAG-05 | Phase 3 | Pending |
| IMAG-06 | Phase 3 | Complete |
| IMAG-07 | Phase 3 | Pending |
| IMAG-08 | Phase 3 | Pending |
| IMAG-09 | Phase 3 | Complete |
| JPJD-01 | Phase 3 | Complete |
| JPJD-02 | Phase 3 | Complete |
| JPJD-03 | Phase 3 | Complete |
| JPJD-04 | Phase 3 | Complete |
| JPJD-05 | Phase 3 | Complete |
| JPJD-06 | Phase 3 | Complete |
| JPJD-07 | Phase 3 | Complete |
| LIST-01 | Phase 4 | Pending |
| LIST-02 | Phase 4 | Pending |
| LIST-03 | Phase 4 | Pending |
| LIST-04 | Phase 4 | Pending |
| LIST-05 | Phase 4 | Pending |
| LIST-06 | Phase 4 | Pending |
| LIST-07 | Phase 4 | Pending |
| LIST-08 | Phase 4 | Pending |
| MACH-01 | Phase 4 | Pending |
| MACH-02 | Phase 4 | Pending |
| MACH-03 | Phase 4 | Pending |
| MACH-04 | Phase 4 | Pending |
| MACH-05 | Phase 4 | Pending |
| MACH-06 | Phase 4 | Pending |
| MACH-07 | Phase 4 | Pending |
| LEAD-01 | Phase 5 | Pending |
| LEAD-02 | Phase 5 | Pending |
| LEAD-03 | Phase 5 | Pending |
| LEAD-04 | Phase 5 | Pending |
| LEAD-05 | Phase 5 | Pending |
| LEAD-06 | Phase 5 | Pending |
| LEAD-07 | Phase 5 | Pending |
| LEAD-08 | Phase 5 | Pending |
| LEAD-09 | Phase 5 | Pending |
| SITE-01 | Phase 5 | Pending |
| SITE-02 | Phase 5 | Pending |
| SITE-03 | Phase 5 | Pending |
| SITE-04 | Phase 5 | Pending |
| SITE-05 | Phase 5 | Pending |
| SITE-06 | Phase 5 | Pending |
| UX-01 | Phase 6 | Pending |
| UX-02 | Phase 6 | Pending |
| UX-03 | Phase 6 | Pending |
| UX-04 | Phase 6 | Pending |
| UX-05 | Phase 6 | Pending |
| UX-06 | Phase 6 | Pending |
| UX-07 | Phase 6 | Pending |
| SEO-01 | Phase 6 | Pending |
| SEO-02 | Phase 6 | Pending |
| SEO-03 | Phase 6 | Pending |
| SEO-04 | Phase 6 | Pending |
| SEO-05 | Phase 6 | Pending |
| SEO-06 | Phase 6 | Pending |
| SEO-07 | Phase 6 | Pending |
| SEO-08 | Phase 6 | Pending |
| SEO-09 | Phase 6 | Pending |
| ANLY-01 | Phase 7 | Pending |
| ANLY-02 | Phase 7 | Pending |
| ANLY-03 | Phase 7 | Pending |
| ANLY-04 | Phase 7 | Pending |
| ANLY-05 | Phase 7 | Pending |
| ANLY-06 | Phase 7 | Pending |
| SAFE-01 | Phase 7 | Pending |
| SAFE-02 | Phase 7 | Pending |
| SAFE-03 | Phase 7 | Pending |
| SAFE-04 | Phase 7 | Pending |
| SAFE-05 | Phase 7 | Pending |
| SAFE-06 | Phase 7 | Pending |
| SAFE-07 | Phase 7 | Pending |
| RELS-01 | Phase 8 | Pending |
| RELS-02 | Phase 8 | Pending |
| RELS-03 | Phase 8 | Pending |
| RELS-04 | Phase 8 | Pending |
| RELS-05 | Phase 8 | Pending |
| RELS-06 | Phase 8 | Pending |
| RELS-07 | Phase 8 | Pending |
| RELS-08 | Phase 8 | Pending |

**Coverage:** 108 V1 requirements; 108 mapped to one owning phase; 0 unmapped.

---
*Requirements defined and last updated: 2026-09-30 after owner-approved reconciliation and portability clarification.*
