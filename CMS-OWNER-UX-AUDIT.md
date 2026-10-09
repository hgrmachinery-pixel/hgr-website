# CMS Owner UX Audit

**Audience:** Non-technical HGR owner  
**Scope:** Creating one Used Machine, Spare Part, or Lubricant through the current Payload CMS  
**Method:** Code-based review of Payload collection fields, access rules, publishing checks, and the custom machine photo uploader. The CMS was not usability-tested with an owner, so time estimates are informed estimates rather than timed observations.

## Summary

| Item type | Current owner workflow | Can create a structured item today? | Estimated owner time | Priority |
|---|---|---:|---:|---|
| Used Machine | Create a Machine record, enter details, upload and approve photos, select the featured image, then publish | Yes | 25–45 minutes for a normal listing with a small photo set; longer when photo review/redaction is needed | High |
| Spare Part | No Spare Parts inventory collection or item detail route exists. Pages can hold general copy, not individual stock items. | No | Not currently possible. Target after a simple structured workflow exists: 5–10 minutes | High |
| Lubricant | No Lubricants inventory collection or item detail route exists. The Lubricants page is editable page content, not a set of products. | No | Not currently possible. Target after a simple structured workflow exists: 3–7 minutes | Medium |

The main owner-facing issue is inconsistency: the CMS can manage individual machines, but cannot manage individual spare parts or lubricants as inventory. The machine workflow also asks the owner to move between a machine record and a separate technical photo-processing/review workflow.

## 1. Used Machine

### Current workflow

1. Sign in to Payload and open **Machines**.
2. Create a Machine record. The system assigns the HGR reference and URL; the reference is read-only and the URL fields are hidden.
3. Enter the machine identity and available specifications.
4. Upload photographs using the custom **Machine photos** panel. Select a photo category, choose files, and upload them. The system saves a private original and processes a separate web image.
5. Review each processed photo against a ten-item sensitive-information checklist. Approve clear photos; if identifiers are found, mark redaction areas and process a new revision. Uncertain photos must stay unapproved and be escalated to the Owner.
6. Select an approved **General / Exterior** photo as Featured Image and also include it in Gallery Images.
7. Save/publish the machine. Publication is blocked until the HGR reference, category, brand, model, stock status, and featured image are present and the featured image is in the gallery. The selected public images must be current approved derivatives.

This is about **7 major steps**, with photo handling adding several substeps for every image. A small photo set can mean one batch upload, processing, and a ten-answer review for each derivative, followed by selecting the featured image and gallery.

### Fields

**Required to publish:**

- Category (currently the only offered value is Excavator)
- Brand
- Model
- Stock Status (Available, Reserved, or Sold)
- Featured Image, which must also be in Gallery Images and must be an approved General / Exterior derivative
- HGR Reference is required by the publication check but is generated automatically

**Optional or conditionally entered:**

- Year of Manufacture
- Hours
- Engine
- Operating Weight
- Condition
- Country of Origin
- Machine Origin / Registration Status
- Registration Date
- Description
- YouTube video URL
- Price Display and price (price is only needed when “Show Price” is selected; “Contact for Price” is available)
- Machine serial number and whether it may be shown publicly
- Additional gallery images
- Archived flag

The schema marks several fields as optional even though publication later requires them. That mismatch can make an ordinary save appear successful and only reveal the real requirements at publish time.

### Pain points

- **The record is busy and flat.** Identity, specifications, origin/registration, pricing, privacy, photos, and publication controls appear as one long form rather than owner-oriented groups.
- **Some required fields are only required at publication.** Category, Brand, Model, Stock Status, and Featured Image can look optional while drafting, then block publication.
- **Photo handling is technical and lengthy.** Terms and states such as “private master,” “derivative,” “revision,” “Needs Review,” and processing status describe the implementation rather than the owner’s task.
- **The photo-review checklist is demanding.** Ten checks are useful for privacy, but owners must repeat them for each derivative. The interface should explain which images need review and which are safe to publish.
- **The featured-photo rule is easy to miss.** The featured image must be both selected in a separate field and present in the gallery, and it must be an approved General / Exterior image.
- **Price has an avoidable unset state.** “Not entered” is the default, even though the public listing needs a clear price choice such as Contact for Price or Show Price.
- **Some values use mixed terminology.** “Machine Origin / Registration Status” combines two ideas; “Stock Status” could be confused with a machine’s mechanical condition, which is a separate field.
- **The public listing identity is mostly system-owned.** Automatic reference and URL generation is good, but the owner should see a plain-language explanation that these are assigned automatically and should not be edited.
- **Documents are a separate workflow.** Registration documents use their own sensitive-document review and publication controls; they should not be mistaken for ordinary machine photos.

### Recommended improvements

**Group fields into short, labeled areas:**

1. **Machine identity:** HGR Reference (read-only, clearly marked “Assigned automatically”), Category, Brand, Model, Year of Manufacture.
2. **Specifications:** Hours, Engine, Operating Weight, Condition.
3. **Origin and registration:** Country of Origin, Machine Origin / Registration Status, Registration Date.
4. **Availability and price:** Stock Status, Price Display, Price.
5. **Description and video:** Description, YouTube video URL.
6. **Photos:** upload, category, preview, featured selection, ordering, and review state in one guided area.
7. **Sensitive details:** serial number and public-visibility setting, visually separated with a plain warning about public display.

**Simplify the photo path:**

- Use owner language: “Original photo,” “Website-ready photo,” “Review needed,” and “Approved for website.” Keep technical audit details in an expandable advanced area.
- Provide a clear progress summary such as “4 photos ready; 2 need your review.”
- Default the category to **General / Exterior**, show a preview, and let the owner change category per file before upload.
- Explain that one General / Exterior photo is needed for publication and offer a one-click “Use as featured image” action after approval.
- Keep privacy review mandatory. Present the checklist in plain language and make the escalation instruction prominent; do not weaken the review gate.
- Allow image upload and photo review to be completed before or after saving the machine draft, with a clear next action.

**Pre-fill safely:**

- Generate HGR Reference, URL, photo filename, and standard photo focal point automatically.
- Default Stock Status to **Available** for a new listing, with the owner asked to confirm it before publication.
- Default Price Display to **Contact for Price** rather than “Not entered”; show price entry only after “Show Price” is selected.
- Default Show Serial Number Publicly to off.
- Set Archived to off for new records and keep it away from the normal listing path.
- Do not guess Year, Origin / Registration Status, Registration Date, Condition, or specification values.

**Validation improvements:**

- Mark Brand, Model, Category, and Stock Status required in the form itself, not only in the publish-time error.
- At publish time, state the exact missing item and provide a direct link to it, for example: “Choose a General / Exterior photo and set it as Featured Image.”
- Require a non-negative Hours value and a plausible year no later than the current year; retain the existing YouTube URL validation.
- Require Price only for Show Price, and clearly distinguish a legitimate zero price from a missing price if zero is not meaningful for HGR.
- Validate that the selected featured image is approved, current, and included in the gallery, while explaining those terms to the owner.
- Keep Year of Manufacture separate from Registration Date and keep Machine Origin / Registration Status explicit; do not infer either from uploaded documents.

**Estimated creation time:** **25–45 minutes** for a complete, ordinary listing with a small photo set and no redactions. This includes entering the machine details and completing photo processing/review. A larger photo batch or any uncertain/sensitive image can take longer. Once familiar, a repeat listing with photos ready may be closer to 15–25 minutes.

**Priority: High.** Machines are the core business and the CMS already supports them; reducing repeat effort and making publication requirements visible will directly improve listing throughput and reduce mistakes.

## 2. Spare Part

### Current workflow

There is no structured Spare Parts collection, item-level admin route, or part detail route in the current CMS/application. The CMS has a general **Pages** collection for page title, URL slug, SEO text, and rich-text body. That can edit general page copy, but it does not create an individual spare-part listing.

An owner therefore cannot currently create a structured Spare Part with its own name, reference, category, compatible machine, status, photos, or Contact for Price setting. Editing the Spare Parts page as a workaround would mix multiple items into page copy and would not produce independent listings or stable item pages.

**Current number of steps:** No valid item-creation workflow exists. The page editor is not an appropriate substitute.

### Required and optional fields

**Current structured fields:** None; there is no spare-part inventory schema.

**Recommended initial required fields for a future workflow:**

- Part Name
- Part Reference (system-generated or unique and stable)
- Availability status
- At least one suitable photo if the public card/detail design depends on photos
- Price Display, defaulted to Contact for Price

**Recommended optional fields:**

- Category
- Brand
- Part number / manufacturer reference
- Compatible machine brand and model (including the optional Machine Model enquiry context)
- Condition
- Description
- Additional photos
- Public price, only when the owner chooses Show Price

These are recommendations for a future design, not fields available in the present CMS.

### Pain points

- The owner has no way to add or update individual parts without editing website copy or asking for a code change.
- Page copy cannot reliably express availability, unique references, or a separate Contact for Price action per item.
- There is no part-specific image workflow or compatibility structure.
- Reusing the Machine collection would expose machine-specific fields and rules that do not fit parts; a dedicated Parts collection should be planned.

### Recommended improvements

- Add a dedicated **Spare Parts** inventory area with a short create flow and stable unique references.
- Reuse familiar listing concepts—name, reference, status, featured photo, Contact for Price—without exposing machine-only fields such as hours, engine, registration date, or serial visibility.
- Group fields as **Part identity**, **Compatibility**, **Condition and description**, **Availability and price**, and **Photos**.
- Pre-fill status as Available and price display as Contact for Price; ask the owner to confirm availability before publishing.
- Validate unique references, prevent reuse after an item is sold/removed, require a part name and status, and only require a numeric price when Show Price is selected.
- Keep the initial workflow free of advanced filters and catalogue search.

**Estimated creation time:** No item can be created today. Target **5–10 minutes** for a future listing with details and one or two prepared photos.

**Priority: High.** Spare Parts is a requested top-level business area, but the present CMS cannot manage the individual inventory required for useful listings.

## 3. Lubricant

### Current workflow

There is no structured Lubricants product collection or item-level detail route. The current `/lubricants` page is a supporting page. Its page copy can be managed through **Pages**, but the page is not a product catalogue and cannot hold separate lubricant products with their own references, availability, photos, or pricing.

The public enquiry form is not an admin workflow for adding a lubricant. Its customer fields ask for machine brand, machine model, lubricant required, and quantity; this does not create or update inventory.

**Current number of steps:** No valid item-creation workflow exists. An owner can edit the general page copy, but cannot create an individual lubricant product.

### Required and optional fields

**Current structured fields:** None; there is no lubricant inventory schema.

**Recommended initial required fields for a future workflow:**

- Product Name
- Brand
- Availability status or enquiry-only status
- Price Display, defaulted to Contact for Price

**Recommended optional fields:**

- Product type / application
- Product code
- Pack size
- Product description
- Suitable equipment or machine models, when verified by HGR
- Photo
- Public price, only when the owner chooses Show Price

Machine Model on the enquiry form should remain optional, as customers may not know it. Do not make compatibility claims from a product label or user-submitted enquiry.

### Pain points

- The owner can update explanatory page text but cannot add, remove, or update individual products.
- A long page-copy workaround would not give each lubricant a stable URL, reference, status, or Contact for Price action.
- The customer-facing lubricant enquiry asks for machine brand and model as required information, which can block an enquiry from someone who does not know those details.
- There is no field grouping or validation for product-specific facts because product records do not exist.

### Recommended improvements

- Add a dedicated **Lubricants** inventory collection if HGR intends to publish multiple products individually; keep the general page as an introduction to the range.
- Use a short workflow grouped into **Product identity**, **Application**, **Availability and price**, and **Photos**.
- Pre-fill price display as Contact for Price and status as Available or Enquiry only, based on the agreed business rule. Ask the owner to confirm status before publishing.
- Keep Machine Model optional on the enquiry form. Use optional structured compatibility fields for verified models, not free-form public claims.
- Validate required product name and brand; validate pack size and numeric price only when those values are entered; do not require a public price.

**Estimated creation time:** No product can be created today. Target **3–7 minutes** for a future item with product details ready and no complex compatibility claims.

**Priority: Medium.** The page exists and enquiry is possible, but individual product inventory should be implemented only if HGR plans to publish products separately and maintain them as records.

## Cross-workflow recommendations

1. Keep **Machines**, **Spare Parts**, and **Lubricants** as clearly named inventory areas with only relevant fields in each area.
2. Use the same owner-facing steps across inventory types: **Add item → Enter details → Add photos → Preview → Publish**. Show a checklist of missing publication requirements before the owner reaches Publish.
3. Use **Contact for Price** as the normal starting choice; display a public price only when the owner intentionally selects it and enters a valid amount.
4. Prefer plain language in the CMS. Keep system-generated references, URLs, photo processing, and audit values read-only or hidden unless the owner needs to act on them.
5. Preserve draft/save recovery, clear success/error messages, and a direct preview link after publication.
6. Test the workflows with the owner before finalizing field order or time estimates. The estimates above are planning targets, not observed completion times.

## Evidence reviewed

- `src/collections/Machines.ts` — machine fields, publication checks, status/price controls, and system-generated identity.
- `src/lib/machines/identity.ts` — machine reference/slug generation and publication requirements.
- `src/components/payload/MachinePhotoUploader.tsx` — category selection, upload/processing, sensitive-content review, approval, and alt-text controls.
- `src/collections/MachineMedia.ts` and `src/collections/MachineDocuments.ts` — separate photo and sensitive-document workflows.
- `src/collections/Pages.ts` — general page content fields; no product-item schema.
- `src/payload.config.ts` — registered collections; includes Machines and machine media/documents but no Spare Parts or Lubricants inventory collection.
- `src/components/site/InventoryEnquiry.tsx` and `src/lib/enquiries/submit.ts` — customer-facing lubricant enquiry fields; these do not create CMS inventory items.
