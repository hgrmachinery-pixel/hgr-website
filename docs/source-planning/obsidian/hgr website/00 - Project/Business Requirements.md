# HGR Business Requirements

## 1. Purpose

This document defines the operational requirements of the HGR Equipment Resources website.

The website is primarily a lead-generation platform for used excavator sales. Used Excavators remains the strongest product and lead-generation focus; Rental, Machinery Services and Lubricants are secondary opportunities.

The conversion priority is WhatsApp, phone, then website enquiry/email. Machinery sales, rental and service quotations/transactions normally proceed offline after enquiry; lubricant enquiries may also proceed offline in V1.

The system must remain simple enough for the business owner to manage machinery listings without coding knowledge.

---

## 2. Machinery Inventory

### Initial Inventory

The website is expected to launch with approximately:

- 20–30 excavator listings

### Ongoing Inventory

Approximately:

- 3–5 new machinery listings per month

The system should comfortably support a significantly larger inventory in the future without requiring the website to be rebuilt.

---

## 3. Machinery Management

HGR requires a simple administration interface.

Authorized users must be able to:

- Create a new machinery listing
- Edit an existing listing
- Upload photos
- Add video links
- Change machine status
- Change pricing
- Hide or display pricing
- Edit specifications
- Edit descriptions
- Publish listings
- Unpublish listings

The administration system should be simple enough for a non-technical user.

The business owner will be responsible for adding and maintaining most machinery listings.

Initial training will be provided to the owner.

---

## 4. Machinery Status

Each machinery listing should have a status.

Initial statuses:

- Available
- Reserved
- Sold

Available machinery should receive priority in listings.

Reserved machinery may remain visible with a clear Reserved status.

Sold machinery should remain publicly accessible rather than being automatically deleted.

Sold machinery should generally appear below available machinery in listing results.

Keeping sold machinery pages accessible may also provide historical inventory information and preserve useful indexed URLs.

---

## 5. Machinery Pricing

Pricing should be controlled individually for each machine.

Each listing should support:

### Display Price

Example:

RM 120,000

### Hide Price

Display:

**Contact for Price**

The administrator should be able to switch between these options without modifying code.

---

## 6. Machinery Information

Machinery listings should support the following information where applicable:

- Brand
- Model
- Year
- Operating hours
- Engine
- Operating weight
- Condition
- Country of origin
- Price
- Description
- Availability status
- Photos
- Video

Not every field must be mandatory.

The system should allow specifications to evolve as additional machinery categories are introduced.

Also support verified Machine Location and optional Serial Number. Serial Number may be stored internally with optional owner/admin-controlled public display; it must never be mandatory to publish. A private serial must not leak through metadata, schema, URLs or analytics.

---

## 7. Machinery Photography

Each machine should support multiple photographs.

The website should not impose an unnecessarily low photo limit.

The system should automatically optimise uploaded images for web use where possible.

Requirements include:

- Multiple photos per machine
- Main / featured image
- Image gallery
- Mobile-friendly gallery
- Automatic image resizing/optimisation where practical
- Appropriate modern image formats where practical

Original unnecessarily large images should not be served directly to normal website visitors.

Photo categorisation may be optional, but the owner must not be required to classify every image. Batch upload, featured selection, ordering/removal and publishing remain simple.

---

## 8. Machinery Video

Machinery listings should support video.

Preferred implementation:

**YouTube-hosted video embedded or linked within the machinery page.**

Large video files should not normally be uploaded directly to the HGR website hosting.

This reduces:

- Website storage requirements
- Hosting bandwidth usage
- Video delivery load
- Backup size

The administration interface should allow the owner to paste a YouTube video URL into a machinery listing.

The website should then display the video appropriately on the machine page.

Direct website video hosting is not required for the initial release.

---

## 9. Machinery Listing Page

A primary Used Excavators listing page should display HGR's machinery inventory.

Initial focus:

**Used Excavators for Sale**

Available machines should receive priority.

Sold machines should remain visible but appear after active inventory where appropriate.

The listing architecture should allow filtering and sorting functionality to be introduced where useful.

The listing system should also allow other machinery categories to be added in the future.

---

## 10. Individual Machinery Page

Each machine should have its own permanent page and URL.

Example structure:

hgrmachinery.com/used-excavators/[machine-name]

The exact URL structure will be determined during the SEO and technical planning stage.

Each page should contain appropriate information including:

- Machine name
- Status
- Price / Contact for Price
- Specifications
- Description
- Photos
- Video where available
- WhatsApp enquiry
- Contact/enquiry option
- Related machinery where appropriate

Each URL remains associated with one physical machine. A later unit of the same model must receive a new URL; do not replace the contents of a sold unit's page with another machine. Machine page identity should naturally use year where available, brand, model and machinery type. Technical slug generation remains [DEFERRED].

Mudah listings should link to the matching public unit page where current policy permits. Provide an easy owner/admin way to obtain the exact public URL, such as Copy Machine Link. This is not automatic marketplace integration.

---

## 11. WhatsApp Enquiries

WhatsApp is a primary conversion channel.

Every machinery page should contain a prominent WhatsApp enquiry option.

When a visitor clicks WhatsApp from a particular machine page, the website should generate a pre-filled message.

Example:

"Hi HGR, I'm interested in the Komatsu PC200-8 listed on your website.

[Machine page URL]"

The machine page URL should be included so both the customer and HGR can immediately return to the relevant listing.

WhatsApp clicks should be tracked as conversion events.

---

## 12. General Enquiry Form

The website should provide a simple enquiry form.

Initial fields:

- Name (required)
- Company (optional)
- Phone (required)
- Email (optional)
- Machine / subject of enquiry (optional; prefilled for a machine-specific enquiry)
- Message (required)

Forms submitted from a specific machine page should automatically identify the relevant machine where possible.

For the initial website, submitted enquiries should be delivered by email.

A CRM is not required.

The system should not be unnecessarily complicated by CRM functionality that HGR is unlikely to use.

Rental and Machinery Services forms may ask for relevant project/machine details without unnecessary duplication; their specifications define required and optional fields. WhatsApp remains an easier alternative.

The architecture should not prevent CRM integration in the future.

---

## 13. Quotation Requests

A separate quotation system is not required for the initial website.

Customers can request pricing or quotations through:

- WhatsApp
- Contact/enquiry form
- Telephone

A dedicated quotation workflow may be introduced later if business requirements change.

---

## 14. Excavator Rental

HGR intends to offer excavator rental when suitable machinery or an opportunity is available. HGR does not necessarily maintain permanent rental inventory, and there may be periods with no excavators available for rent.

Keep the public Rental page enquiry-led. Customers can provide project requirements and ask HGR to check availability; negotiations and rental transactions proceed offline. Rental pricing is quotation/enquiry based and is not published for V1.

Use Enquire About Rental, WhatsApp About Rental and Call HGR. Do not imply guaranteed availability, a permanent rental catalogue or that every sales machine can be rented.

If sales machinery is shown, identify it as potential enquiry context and require rental availability to be checked separately. V1 does not require a rental catalogue, online booking, scheduling, checkout or payment.

---

## 15. Machinery Servicing

Public page name: **Machinery Services**. Page heading: **Heavy Machinery Services**.

HGR may provide or arrange machinery servicing/repair assistance on an enquiry and quotation basis. Exact technical service scope remains [TO CONFIRM]; potential services are internal verification items, not a confirmed public catalogue.

The customer contacts HGR, describes the machine/problem, provides relevant details and discusses any necessary inspection and quotation. Commercial arrangements proceed offline.

Support WhatsApp, phone and website enquiry/email. Use Enquire About Machinery Services, WhatsApp HGR, Call HGR and Send Enquiry. Do not require online service booking, fixed service packages or checkout.

---

## 16. Lubricants

Lubricants may be available upon request when products or supply opportunities exist. Exact brands, products and specifications remain [TO CONFIRM]. Do not imply permanent stock.

Keep the public Lubricants page in V1 with WhatsApp, phone and enquiry options. Product stock or listings are not prerequisites for launch, and transactions may initially proceed offline.

The architecture must allow the owner to add lubricant catalogue/enquiry products when they become available or in a future phase. Relevant fields may include brand, product name, type, grade, pack size, description, images, availability enquiry and official documents; never invent these facts or reuse machinery-only fields such as operating hours.

[FUTURE] Selected products such as lubricants may support online purchasing. Preserve a practical expansion path without building checkout in V1 or choosing a payment gateway, commerce platform, checkout technology or shipping system now.

---

## 17. Google Ads Landing Destination

Google Ads will be used to generate traffic and leads.

Searches relating specifically to used excavators should normally direct visitors to the relevant used excavator inventory/listing page rather than automatically sending all traffic to the homepage.

Example:

Google Search
→ Google Ad
→ Used Excavators page
→ Individual machine
→ WhatsApp / enquiry

Dedicated campaign landing pages may also be created later where they provide an advantage over the standard inventory page.

Mudah is a separate ongoing acquisition channel. HGR will continue managing Mudah listings alongside the website. Matching machine pages provide richer galleries, specifications, description, video, viewing and contact details; the website is the primary owned information source.

Marketplace and website listings remain separately manageable. No automatic Mudah publishing/synchronisation or technical dependency is required for V1, and no permanent marketplace photo-limit or linking-policy assumption is made.

---

## 18. Website Administration

Initial website administrators:

- HGR owner
- Website/marketing administrator

The owner should be able to manage machinery listings without requiring development knowledge.

The administration interface should prioritize simplicity.

Routine actions should not require:

- Coding
- Git
- GitHub
- Command-line tools
- Editing website source files

Developer tools should remain separate from normal content administration.

---

## 19. Lead Delivery

Initial lead delivery method:

**Email**

A CRM is not required for the initial release.

Form submissions should reliably send enquiry information to the designated HGR email address.

Anti-spam protection should be implemented without creating unnecessary friction for legitimate customers.

---

## 20. Analytics Requirements

The website should track important lead-generation actions through Google Tag Manager and Google Analytics 4.

Initial events should include:

- WhatsApp click
- Phone click
- Enquiry form started
- Enquiry form submitted
- Machinery listing viewed
- YouTube/video interaction where practical

Google Ads conversion tracking should use appropriate conversion events.

The detailed measurement plan will be documented separately.

Include Arrange a Viewing actions and acquisition-source analysis for Google Organic, Google Ads, Mudah, Direct and other referrals. Identify Mudah visits, landing pages, machine views and subsequent contact/viewing actions where referral/campaign information is available.

Use consistent permitted campaign parameters where practical; conceptual values are source mudah, medium marketplace, campaign used_machinery. Exact UTM conventions, listing identity and GA4/GTM implementation remain [DEFERRED]. Preserve acquisition context where appropriate. Website events do not automatically establish an offline sale's source; offline attribution is [FUTURE].

---

## 21. User Experience Priorities

The website should prioritise:

1. Finding available excavators quickly
2. Viewing machine photographs easily
3. Understanding key specifications
4. Seeing price or Contact for Price clearly
5. Contacting HGR quickly
6. Strong mobile usability
7. Fast loading
8. Simple navigation

The customer should not be forced through unnecessary steps before contacting HGR.

---

## 22. Future Expansion

The architecture should allow future additions such as:

- Other heavy machinery categories
- More advanced inventory filtering
- Additional lubricant listings
- More rental functionality
- More service categories
- Additional languages
- CRM integration
- Additional lead tracking
- Advertising landing pages

Future capability should be considered without overcomplicating the initial website.

---

## 23. Initial Scope Principle

The first release should focus on the functionality HGR currently needs.

Do not build complex systems solely because they may possibly be useful in the future.

The initial priority is:

**Used excavator inventory + strong lead generation + simple administration + SEO + advertising measurement.**