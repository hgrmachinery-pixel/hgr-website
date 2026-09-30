# HGR Project Decision Log

## Purpose and interpretation

This log records established decisions, not new technology selections. Source links identify existing requirements; reasons summarise their stated purpose rather than inventing a historical approval discussion. No decision date is invented.

Confirmed means established in project documentation. A confirmed concept is not proof that it has been built, supplied or tested. [TO CONFIRM] marks missing business evidence; [DEFERRED] marks unresolved choices; [FUTURE] marks later scope.

## D01 — Lead generation is the primary website purpose

Decision: Lead generation is the primary website purpose.

Status: Confirmed.

Reason: Customers enquire through WhatsApp, phone and forms; V1 is not e-commerce.

Impact: Prioritise useful machine details and easy contact; no checkout or automated rental transaction.

Source/Related Document: [[00 - Project/HGR Project#5. Primary Website Objective]].

## D02 — Used excavators are the V1 priority

Decision: Used excavators are the V1 priority.

Status: Confirmed.

Reason: This is HGR's primary business and commercial website focus.

Impact: Give inventory prominent navigation, homepage placement and relevant Ads destinations.

Source/Related Document: [[00 - Project/Business Requirements#23. Initial Scope Principle]].

## D03 — Machine status is Available, Reserved or Sold

Decision: Machine status is Available, Reserved or Sold.

Status: Confirmed.

Reason: Buyers need an accurate indication of availability.

Impact: Show text labels and prioritise Available, then Reserved, then Sold.

Source/Related Document: [[02 - Website Specification/Used Excavators#4. Inventory Priority]].

## D04 — Sold listings remain publicly accessible

Decision: Sold listings remain publicly accessible.

Status: Confirmed.

Reason: Historical details and useful URLs can continue helping customers.

Impact: Retain useful pages, mark Sold clearly and link to available alternatives rather than deleting automatically.

Source/Related Document: [[02 - Website Specification/Individual Machine#27. Sold Machine Behaviour]].

## D05 — Per-machine public price or Contact for Price

Decision: Per-machine public price or Contact for Price.

Status: Confirmed.

Reason: HGR needs control of price visibility.

Impact: Owner toggles visibility; never use a misleading zero price or expose hidden pricing in metadata.

Source/Related Document: [[02 - Website Specification/Admin System#16. Price Visibility]].

## D06 — WhatsApp is a major CTA

Decision: WhatsApp is a major CTA.

Status: Confirmed.

Reason: Direct machinery enquiries are a central customer journey.

Impact: Machine-specific enquiries identify the unit and include its page URL; phone and forms remain alternatives.

Source/Related Document: [[00 - Project/Business Requirements#11. WhatsApp Enquiries]].

## D07 — V1 forms deliver enquiries by email

Decision: V1 forms deliver enquiries by email.

Status: Confirmed.

Reason: HGR needs a simple usable lead workflow.

Impact: Reliable email and low-friction anti-spam are required; provider is undecided and CRM is not V1.

Source/Related Document: [[00 - Project/Business Requirements#19. Lead Delivery]].

## D08 — Owner administration requires no coding

Decision: Owner administration requires no coding.

Status: Confirmed.

Reason: The owner maintains most machinery records.

Impact: Add/edit/upload/preview/publish/status/price changes must work without Git, command line or developer deployment.

Source/Related Document: [[02 - Website Specification/Admin System#55. Success Criteria]].

## D09 — Two initial administrator accounts and protected access

Decision: Two initial administrator accounts and protected access.

Status: Confirmed.

Reason: Owner and website administrator both need access.

Impact: Secure authenticated admin is V1; extra accounts and advanced roles are future scope.

Source/Related Document: [[02 - Website Specification/Admin System#54. V1 Admin Scope]].

## D10 — Publishing status is separate from machine availability

Decision: Publishing status is separate from machine availability.

Status: Confirmed.

Reason: An Available unit may still be a private draft.

Impact: Support Draft/Published and protect previews; Sold + Published remains a valid record.

Source/Related Document: [[02 - Website Specification/Admin System#18. Publishing Status]].

## D11 — Actual machine photographs and truthful editing

Decision: Actual machine photographs and truthful editing.

Status: Confirmed.

Reason: Trust depends on accurate evidence.

Impact: No AI-generated replacement for listing photos or material alteration of condition.

Source/Related Document: [[01 - Brand/Brand Guidelines#8. Photography]].

## D12 — Automatic image processing and configurable watermark support

Decision: Automatic image processing and configurable watermark support.

Status: Confirmed.

Reason: Owner should upload originals without manual web preparation.

Impact: Generate responsive derivatives; retain unwatermarked originals appropriately and configure watermark properties centrally.

Source/Related Document: [[02 - Website Specification/Admin System#56. Image Storage and Processing]].

## D13 — YouTube is the preferred machinery video host

Decision: YouTube is the preferred machinery video host.

Status: Confirmed.

Reason: Video should not burden ordinary site hosting/admin workflow.

Impact: Owner pastes a URL; video is optional and empty video sections are omitted.

Source/Related Document: [[00 - Project/Business Requirements#8. Machinery Video]].

## D14 — English-first V1

Decision: English-first V1.

Status: Confirmed.

Reason: English is the established primary website language.

Impact: No requirement to launch translations in V1.

Source/Related Document: [[03 - Content/Company Information#20. Languages]].

## D15 — Preserve future multilingual capability

Decision: Preserve future multilingual capability.

Status: Confirmed.

Reason: Additional languages may later meet business needs.

Impact: Avoid blocking structured translations; locale technical architecture is undecided and translation delivery is future work.

Source/Related Document: [[00 - Project/HGR Project#8. Languages]].

## D16 — Allow future machinery/product divisions without building them now

Decision: Allow future machinery/product divisions without building them now.

Status: Confirmed.

Reason: HGR may expand beyond current used excavator sales.

Impact: Maintain an expansion path; a used unit, repeatable new product model and lubricant product need distinct relevant information.

Source/Related Document: [[00 - Project/HGR Project#Future Product Division Expansion]].

## D17 — Use Machinery Services as the navigation/page category name

Decision: Use Machinery Services as the navigation/page category name.

Status: Confirmed.

Reason: The term is clearer than generic Services and allows wider machinery scope.

Impact: Keep /machinery-services and Heavy Machinery Services as the page heading; verify actual capabilities before claims.

Source/Related Document: [[02 - Website Specification/Machinery Services#2. Naming]].

## D18 — No separate Home item in primary navigation; logo links home

Decision: No separate Home item in primary navigation; logo links home.

Status: Confirmed.

Reason: Simple navigation should prioritise inventory.

Impact: Use Used Excavators, Rental, Machinery Services, Lubricants, About and Contact; breadcrumbs may still include Home.

Source/Related Document: [[03 - Content/Website Copy#15. Navigation Labels]].

## D19 — Modern presentation with simple familiar UX

Decision: Modern presentation with simple familiar UX.

Status: Confirmed.

Reason: Customers should understand the website immediately.

Impact: Use photography, spacing and clear hierarchy; do not copy Samsung's layout, identity or assets.

Source/Related Document: [[00 - Project/HGR Project#21. Simplicity Principle]].

## D20 — Animation must never interfere with navigation or enquiry

Decision: Animation must never interfere with navigation or enquiry.

Status: Confirmed.

Reason: Decorative effects are secondary to usability.

Impact: Inventory and WhatsApp/contact remain available immediately; no compulsory animation sequence.

Source/Related Document: [[00 - Project/HGR Project#20. Animation Principle]].

## D21 — Plan the homepage excavator arm interaction

Decision: Plan the homepage excavator arm interaction.

Status: Confirmed — concept only; implementation [DEFERRED].

Reason: A real-machine hero is the established signature concept.

Impact: Body/tracks remain anchored; boom/arm rise with scroll and reverse where practical. Method remains undecided and fallback is required.

Source/Related Document: [[02 - Website Specification/Homepage#10. Signature Scroll Interaction]].

## D22 — Performance and accessible fallbacks take priority

Decision: Performance and accessible fallbacks take priority.

Status: Confirmed.

Reason: Fast mobile browsing matters more than decorative complexity.

Impact: Test and simplify motion; provide reduced-motion/static fallback and responsive optimised media.

Source/Related Document: [[01 - Brand/Design System#26. Hero Animation Fallback]].

## D23 — Google Ads should use relevant landing pages and measurement

Decision: Google Ads should use relevant landing pages and measurement.

Status: Confirmed.

Reason: Traffic should reach the offering it is seeking.

Impact: Used excavator campaigns normally land on inventory/relevant units; other campaigns need confirmed matching offerings.

Source/Related Document: [[00 - Project/Business Requirements#17. Google Ads Landing Destination]].

## D24 — GA4, GTM, Search Console and conversion measurement are required

Decision: GA4, GTM, Search Console and conversion measurement are required.

Status: Confirmed.

Reason: Marketing needs measurable website actions.

Impact: Track meaningful contact and machine events; exact naming, tag setup, consent handling and Ads conversion configuration remain undecided.

Source/Related Document: [[00 - Project/Project Roadmap#Phase 8 - Analytics and Conversion Tracking]].

## D25 — Rental remains enquiry/quotation based in V1

Decision: Rental remains enquiry/quotation based in V1.

Status: Confirmed.

Reason: Machine/project availability and arrangements require confirmation.

Impact: No public rental prices or booking/payment/calendar system; sales listings do not imply rental availability.

Source/Related Document: [[02 - Website Specification/Rental#6. Rental Pricing]].

## D26 — Lubricants use a simple V1 enquiry page

Decision: Lubricants use a simple V1 enquiry page.

Status: Confirmed.

Reason: A full catalogue/admin/e-commerce system is not justified by assumed future volume.

Impact: V1 may launch with a broad request/supply-based enquiry page and no products. Owner-managed catalogue/enquiry listings can follow when available; online purchasing remains [FUTURE].

Source/Related Document: [[02 - Website Specification/Lubricants#28. V1 Simplicity Rule]].

## D27 — Technical architecture remains unfinalised

Decision: Technical architecture remains unfinalised.

Status: Confirmed.

Reason: Phase 2 must assess the actual requirements and operational tradeoffs.

Impact: Do not infer framework, CMS, database, storage, hosting or other providers from this documentation.

Source/Related Document: [[00 - Project/Project Roadmap#Phase 2 - Development Environment]].

## Human-review reconciliation

The following decisions were explicitly confirmed by the owner's human review and applied during documentation cleanup. Confirmation is not an implementation or launch approval.

## D28 — Rental is opportunity/availability based

Decision: Rental is opportunity/availability based.

Status: Confirmed.

Reason: HGR intends to offer rental when suitable machinery or opportunities exist; there may be no rental machines.

Impact: Keep the public Rental page enquiry-led without permanent stock/catalogue or guaranteed availability. Sales availability does not mean rental availability.

Source/Related Document: Owner's human-review instructions; [[02 - Website Specification/Rental]].

## D29 — Rental quotations and transactions proceed offline

Decision: Rental quotations and transactions proceed offline.

Status: Confirmed.

Reason: Customers contact HGR to check availability and discuss project needs.

Impact: Use Enquire About Rental / WhatsApp About Rental; no online booking or public rental prices.

Source/Related Document: Owner's human-review instructions; [[00 - Project/Business Requirements]].

## D30 — Machinery Services is enquiry, discussion/inspection and quotation based

Decision: Machinery Services is enquiry, discussion/inspection and quotation based.

Status: Confirmed.

Reason: HGR may provide or arrange servicing/repair assistance.

Impact: Exact technical scope remains [TO CONFIRM]. Use broad public wording and offline commercial arrangements; no fixed catalogue, Book Service or checkout.

Source/Related Document: Owner's human-review instructions; [[02 - Website Specification/Machinery Services]].

## D31 — Lubricants are request/supply based

Decision: Lubricants are request/supply based.

Status: Confirmed.

Reason: Products may be offered when supply opportunities exist; brands/products are not yet confirmed.

Impact: Keep the public page without requiring stock or products for V1 launch. Accept WhatsApp, phone and form enquiries with initial transactions offline.

Source/Related Document: Owner's human-review instructions; [[02 - Website Specification/Lubricants]].

## D32 — Support owner-managed lubricant catalogue/enquiry listings

Decision: Support owner-managed lubricant catalogue/enquiry listings.

Status: Confirmed.

Reason: Real products should be addable when available or in a future phase.

Impact: Preserve the capability without requiring a V1 catalogue/admin module or online checkout; use product-specific data.

Source/Related Document: Owner's human-review instructions; [[02 - Website Specification/Lubricants]].

## D33 — Selected-product online purchasing is future scope

Decision: Selected-product online purchasing is future scope.

Status: Confirmed — future direction only; no V1 implementation.

Reason: HGR may eventually sell selected products such as lubricants online.

Impact: [FUTURE] purchasing; preserve an expansion path. Payment gateway, commerce platform, checkout and shipping implementation remain [DEFERRED].

Source/Related Document: Owner's human-review instructions; [[07 - Decisions/Technical Architecture Decisions]].

## D34 — Klang-yard viewing/inspection is available, preferably by appointment

Decision: Klang-yard viewing/inspection is available, preferably by appointment.

Status: Confirmed.

Reason: Customers can arrange a viewing and continue negotiation/purchase offline.

Impact: Use Arrange a Viewing, prominently through WhatsApp. Confirm machine location before visiting; no online scheduling or mandatory booking form. Full address remains [TO CONFIRM].

Source/Related Document: Owner's human-review instructions; [[03 - Content/Company Information]].

## D35 — Homepage Available Excavators includes Available only

Decision: Homepage Available Excavators includes Available only.

Status: Confirmed.

Reason: The section must accurately present machines currently available.

Impact: Show approximately 3–6 Published + Available units; fewer if fewer exist. Never fill with Reserved/Sold. Full inventory retains all statuses and sold pages remain public.

Source/Related Document: Owner's human-review instructions; [[02 - Website Specification/Homepage]].

## D36 — Homepage final CTA prioritises direct contact

Decision: Homepage final CTA prioritises direct contact.

Status: Confirmed.

Reason: The visitor has already passed machinery discovery sections.

Impact: Looking for an Excavator? → WhatsApp HGR primary, Call HGR secondary, optional Send Enquiry. Earlier sections retain View Excavators.

Source/Related Document: Owner's human-review instructions; [[03 - Content/Website Copy]].

## D37 — V1 conversion is lead generation followed by offline transaction

Decision: V1 conversion is lead generation followed by offline transaction.

Status: Confirmed.

Reason: Used excavator sales remain the primary focus and secondary opportunities remain subordinate.

Impact: Prioritise WhatsApp, phone, then website enquiry/email. No mandatory online machinery purchasing, rental/service booking or payment.

Source/Related Document: Owner's human-review instructions; [[00 - Project/HGR Project]].

## D38 — Forms use aligned labels and minimal required fields

Decision: Forms use aligned labels and minimal required fields.

Status: Confirmed.

Reason: Website Copy must match detailed specifications without making enquiries unnecessarily long.

Impact: General Name/Phone/Message required; Company/Email/subject optional. Page-specific fields retain clear optionality and combined message fields; WhatsApp stays an easier alternative.

Source/Related Document: Owner's human-review instructions; [[03 - Content/Website Copy]].

## Reconciliation outcome and remaining review

The prior business-model, yard-viewing, homepage-feed, final-CTA and form-copy discrepancies have been resolved according to the human review. Phase 1 roadmap items now distinguish completed specifications from unfinished factual verification, research and final approval.

Remaining open work:
- Verify full address, contact details, hours, exact technical services, current products/supply, geographic coverage and specific commercial terms.
- Collect quantitative keyword metrics; external qualitative findings and human-approved themes have now been incorporated. Keyword Planner volume/CPC/competition, difficulty and forecasts remain uncollected.
- Finalise proposed individual machine URLs and other deferred architecture choices in Phase 2.
- Approve final public copy, assets/permissions and legal wording. Do not treat a planning draft as published content.

See [[07 - Decisions/Technical Architecture Decisions]] for unresolved technical choices and [[07 - Decisions/Deferred & Future Decisions]] for later scope. No framework or provider was selected in this reconciliation.

## SEO research and Mudah strategy approval

The following entries record the supplied external qualitative research and human-approved strategy. They do not claim quantitative research or technical implementation is complete.

## D39 — V1 SEO is inventory-led

Decision: V1 SEO is inventory-led.

Status: Confirmed — planning direction.

Reason: The approved Malaysian qualitative research prioritises real machinery discovery.

Impact: Prioritise Used Excavators, individual units, homepage, Klang trust, then Rental, Machinery Services and Lubricants. No V1 blog or unnecessary SEO page expansion.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/SEO Strategy]].

## D40 — Research-informed themes are approved; quantitative metrics are uncollected

Decision: Research-informed themes are approved; quantitative metrics are uncollected.

Status: Confirmed — planning direction.

Reason: External findings informed terminology and competitor patterns, not volume rankings.

Impact: Use the approved commercial/local/long-tail themes naturally. Do not invent Keyword Planner volume, CPC, Ads competition, difficulty or forecasts.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/Keyword Strategy]].

## D41 — Physical-machine URLs are stable and never reused for new units

Decision: Physical-machine URLs are stable and never reused for new units.

Status: Confirmed — planning direction.

Reason: Long-tail search and marketplace links must refer to the correct physical machine.

Impact: Each later unit gets a separate page, even of the same model. Sold pages normally remain public with real details and available alternatives; do not automatically delete or redirect.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[02 - Website Specification/Individual Machine]].

## D42 — Optional Serial Number supports internal storage and optional public display

Decision: Optional Serial Number supports internal storage and optional public display.

Status: Confirmed — planning direction.

Reason: Useful machinery detail need not become compulsory disclosure.

Impact: Owner/admin controls public display; private serials must not appear in public data, URLs, metadata, schema or analytics. Serial Number is not internal Machine ID.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[02 - Website Specification/Admin System]].

## D43 — Machine identity includes known year, brand, model and type naturally

Decision: Machine identity includes known year, brand, model and type naturally.

Status: Confirmed — planning direction.

Reason: Clear descriptive unit identity supports customers and long-tail search.

Impact: Do not invent missing year or treat structural examples as inventory. Technical slug generation remains deferred.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/On-Page SEO]].

## D44 — Extra model/category/location and informational pages are future evidence-led scope

Decision: Extra model/category/location and informational pages are future evidence-led scope.

Status: Confirmed — planning direction.

Reason: Small inventory and useful content matter more than page count.

Impact: No V1 blog, automatic model/category or multiple location pages. Require stock/coverage, unique content and search/Ads/enquiry evidence before expansion.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[07 - Decisions/Deferred & Future Decisions]].

## D45 — Secondary SEO stays limited to actual business capability

Decision: Secondary SEO stays limited to actual business capability.

Status: Confirmed — planning direction.

Reason: Rental availability varies, service scope is unconfirmed and lubricant products may not exist.

Impact: One rental page; broad Machinery Services until capabilities are verified; low-priority Lubricants with no empty products or V1 checkout.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/SEO Strategy]].

## D46 — English remains V1; future localisation uses separate language content

Decision: English remains V1; future localisation uses separate language content.

Status: Confirmed — planning direction.

Reason: Malay market terminology is a research input, not a reason to stuff English pages.

Impact: Future Bahasa Malaysia and Chinese if justified use separate URLs/content and appropriate hreflang; implementation is deferred.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/Keyword Strategy]].

## D47 — Mudah remains an active acquisition channel

Decision: Mudah remains an active acquisition channel.

Status: Confirmed — planning direction.

Reason: HGR will continue listing machinery on Mudah alongside its owned website.

Impact: Mudah complements the website rather than being replaced. Website pages provide richer genuine galleries, specs, description, video, status, viewing and contact information.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[00 - Project/HGR Project]].

## D48 — Mudah links target corresponding HGR unit pages where permitted

Decision: Mudah links target corresponding HGR unit pages where permitted.

Status: Confirmed — planning direction.

Reason: Customers should reach complete details for the same physical unit.

Impact: Use stable unit links; do not hard-code current marketplace photo limits or linking policies. Provide easy public-link access/copying in admin.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[02 - Website Specification/Admin System]].

## D49 — Website and marketplace inventory remain separately manageable

Decision: Website and marketplace inventory remain separately manageable.

Status: Confirmed — planning direction.

Reason: The website must not depend technically on Mudah.

Impact: No automatic Mudah publishing/synchronisation required for V1. Integration technology remains deferred and automation needs separate future approval.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[07 - Decisions/Technical Architecture Decisions]].

## D50 — Mudah-originated website traffic and actions should be measurable

Decision: Mudah-originated website traffic and actions should be measurable.

Status: Confirmed — planning direction.

Reason: HGR needs acquisition-source comparisons for useful website behaviour.

Impact: Plan referral/campaign identification and source-associated machine views, WhatsApp/phone/form/viewing actions. Exact UTM/GA4/GTM implementation remains deferred; no automatic offline-sale attribution.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/Technical & Local SEO]].

## D51 — Evidence guides future SEO expansion

Decision: Evidence guides future SEO expansion.

Status: Confirmed — planning direction.

Reason: Real search and customer behaviour should determine additions.

Impact: Use Search Console, GA4, Ads search terms/conversions, Mudah referral/campaign data, enquiries and inventory performance; no unsupported ranking guarantees.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[04 - SEO/SEO Strategy]].

## D52 — Photo categorisation is optional

Decision: Photo categorisation is optional.

Status: Confirmed — planning direction.

Reason: The owner needs a simple media workflow.

Impact: Retain batch upload, featured selection, ordering/removal, automatic optimisation and watermarks without requiring every photo to be manually classified.

Source/Related Document: Human-approved SEO/Mudah research instructions; [[05 - Assets/Photography & Video]].

