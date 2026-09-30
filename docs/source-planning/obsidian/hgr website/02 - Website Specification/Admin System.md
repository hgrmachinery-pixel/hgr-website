# HGR Admin System Specification

## 1. Purpose

The HGR Admin System allows authorised users to manage machinery listings without editing code.

Initial administrators:

- HGR owner
- Website administrator

The system should be intentionally simple.

Administrators should not need to understand:

- HTML
- Website development
- Git
- GitHub
- VS Code
- Databases
- Command line tools

The administration experience should resemble a simple inventory management system.

---

# 2. Primary Admin Workflow

The normal workflow should be:

Login

↓

Machinery Dashboard

↓

Add Machine

↓

Enter Machine Details

↓

Upload Photos

↓

Add Video if available

↓

Preview

↓

Publish

After publishing, the machine should automatically appear on:

- Used Excavators page
- Homepage Available Excavators only when Published and Status = Available (approximately 3–6 units; never fill with Reserved/Sold)
- Its own individual machine page

No developer action should be required.

---

# 3. Admin Access

The administration area must require authentication.

Public visitors must not have access.

Initial users:

**Owner**

**Administrator**

Additional user accounts may be supported later.

---

# 4. Login

Provide a simple login page.

Fields:

- Email / Username
- Password

Actions:

**Login**

**Forgot Password**

The exact authentication system will be decided during technical architecture.

---

# 5. Security

The admin system should follow appropriate security practices.

Requirements include:

- Secure authentication
- HTTPS
- Password protection
- Protected admin routes
- Secure session handling
- Appropriate login protection
- No credentials stored directly in public source code

Where appropriate, additional security measures may be introduced.

---

# 6. Admin Dashboard

After login, display a simple dashboard.

Primary actions:

**Add Machine**

**Manage Machines**

The dashboard may also show:

- Total machines
- Available
- Reserved
- Sold
- Draft

Avoid unnecessary analytics or complicated widgets in V1.

---

# 7. Machinery List

The admin should provide a simple table/list of machinery.

Recommended columns:

- Thumbnail
- Machine ID
- Brand
- Model
- Year
- Price
- Machine Status
- Publishing Status
- Last Updated
- Actions

Actions:

**Edit**

**Preview**

Additional actions may include:

**Duplicate**

**Delete**

where appropriate.

---

# 8. Admin Search

Provide simple search.

Administrators should be able to search by:

- Brand
- Model
- Machine ID

Example:

`PC200`

or:

`HGR-EXC-001`

---

# 9. Admin Filters

Simple filters may include:

### Machine Status

- Available
- Reserved
- Sold

### Publishing Status

- Draft
- Published

Avoid excessive filtering.

---

# 10. Add Machine

Provide a prominent:

**Add Machine**

button.

The form should be divided into clear sections rather than presenting one intimidating long form.

Recommended sections:

1. Basic Information
2. Pricing & Status
3. Specifications
4. Photos
5. Video
6. Description
7. Preview & Publish

---

# 11. Basic Information

Fields:

### Brand

Example:

Komatsu

### Model

Example:

PC200-8

### Year

Example:

2018

### Machine ID

Example:

HGR-EXC-001

The system may automatically generate the machine ID if appropriate.

---

# 12. Brand Field

Where practical, the Brand field should provide existing brands as selectable options.

Example:

- Komatsu
- Hitachi
- Caterpillar
- Kobelco
- Sumitomo

There should also be a practical method to add another brand.

Do not require a developer to add a new machinery brand.

---

# 13. Model Field

The Model field should allow normal text entry.

Example:

`PC200-8`

Do not unnecessarily restrict model names.

---

# 14. Machine ID

Every machine should have a unique internal identifier.

Suggested format:

`HGR-EXC-001`

`HGR-EXC-002`

`HGR-EXC-003`

The system should prevent duplicate IDs.

Automatic generation is preferred if it remains simple and reliable.

---

# 15. Pricing

Provide:

### Price

Example:

`138000`

The website should display this appropriately as:

**RM 138,000**

The administrator should not need to manually enter commas or "RM".

---

# 16. Price Visibility

Provide a simple control:

**Show Price**

ON / OFF

If ON:

Display the entered price.

If OFF:

Display:

**Contact for Price**

This allows HGR to decide pricing individually for each machine.

---

# 17. Machine Status

Provide a clear status selector:

**Available**

**Reserved**

**Sold**

Changing status should update the public website automatically once saved/published.

---

# 18. Publishing Status

Publishing status is separate from machine status.

Publishing options:

**Draft**

**Published**

Example:

A machine may be:

**Available + Draft**

This means it is available but not publicly visible yet.

A machine may also be:

**Sold + Published**

This means it has been sold but its historical page remains publicly accessible.

---

# 19. Specifications

Supported specification fields should include:

### Hours

Example:

`6230`

Website display:

**6,230 Hours**

### Engine

Example:

`Komatsu SAA6D107E-1`

### Operating Weight

Example:

`20,000 kg`

### Condition

Example:

`Used`

### Country of Origin

Example:

`Japan`

Fields should be optional where information is unavailable.

### Machine Location

Optional verified location for this particular unit. Do not assume every listing is at the Klang yard.

### Serial Number

Optional field for internal storage, with a separate owner/admin choice to display it publicly. Never require the serial for publication or force public disclosure. Omit private serials from public data, metadata, schema, URLs, copyable links and analytics. Internal Machine ID and Serial Number are distinct; one must not silently replace the other.

---

# 20. Missing Information

Administrators should not be forced to enter incorrect information.

If an optional field is blank, the public website should normally omit it.

Do not automatically display:

- 0 Hours
- Unknown
- N/A

unless intentionally configured.

---

# 21. Description

Provide a simple description field.

The administrator should be able to write normal paragraphs.

Basic formatting may include:

- Paragraphs
- Bullet points
- Bold text

Avoid providing a complicated page builder.

The administrator should not design the page.

The website template controls presentation.

---

# 22. Photos

The administrator should be able to upload multiple machine photographs at once.

Target workflow:

**Drag photos into upload area**

or

**Select multiple photos**

The system should support typical machinery photo sets without requiring one-at-a-time uploads.

Do not require manual classification of every photograph. Optional photo categories must not block batch upload, featured selection, ordering/removal and publishing.

---

# 23. Photo Quantity

The system should comfortably support approximately:

**10-30 photographs per machine**

A reasonable technical limit may be implemented to prevent abuse or accidental excessive uploads.

---

# 24. Photo Processing

Where technically appropriate, uploaded images should automatically be:

- Resized
- Optimised
- Compressed
- Converted to efficient web formats
- Prepared in multiple responsive sizes

The administrator should not need to manually resize every image before uploading.

Original/high-quality versions may be retained where appropriate.

---

# 25. Upload Feedback

While uploading photographs, show clear feedback.

Examples:

**Uploading 3 of 15**

**Processing Images**

**Upload Complete**

The administrator should understand what the system is doing.

---

# 26. Featured Image

One image must be selectable as:

**Featured Image**

This image is used for:

- Used Excavators card
- Homepage machine card
- Machine page primary image
- Social sharing where appropriate

Selecting the featured image should be simple.

---

# 27. Photo Ordering

The administrator should be able to change photo order.

Preferred interaction:

**Drag and drop**

The first image does not necessarily have to determine the featured image if a separate Featured Image setting is provided.

---

# 28. Photo Removal

Administrators should be able to remove an incorrectly uploaded photograph.

Deletion should require a clear action to reduce accidental removal.

---

# 29. Video

Provide:

**YouTube Video URL**

Example:

`https://www.youtube.com/watch?v=...`

The administrator pastes the URL.

The public machine page automatically displays the video.

The administrator should not need to write embed code.

---

# 30. No Video

Video is optional.

If the field is blank:

The public website should not display an empty video section.

---

# 31. Machine URL

The public URL should be generated automatically.

Example:

Brand:

Komatsu

Model:

PC200-8

Year:

2018

Generated URL concept:

`/used-excavators/komatsu-pc200-8-2018`

The administrator should not normally need to manually create URLs.

Allow the owner/admin to easily obtain the exact published public URL, for example with **Copy Machine Link**. Do not copy a private preview URL for marketplace use.

This supports manually linking a Mudah listing to the corresponding HGR unit page where current marketplace policy permits. The website and Mudah remain separately manageable; no automatic publishing or synchronisation is required for V1. Convenient generation of a permitted tracked Mudah URL may be considered later; exact tracking conventions and implementation remain [DEFERRED].

---

# 32. Duplicate URLs

If two machines would generate the same URL, the system must automatically keep them unique.

The technical method may use:

- Machine ID
- Unique suffix
- Another stable identifier

The administrator should not need to solve URL conflicts manually.

The uniqueness rule applies across current and sold physical units. Never overwrite a sold record's URL/content with a later machine of the same model. Preserve public URLs after publication wherever practical; technical generation remains [DEFERRED].

---

# 33. Preview

Before publishing, provide:

**Preview**

The administrator should be able to see approximately how the machine page will appear publicly.

Preview should not make the draft publicly discoverable.

---

# 34. Publish

Provide a clear:

**Publish**

action.

Publishing should:

1. Save the machine
2. Generate/update the machine page
3. Add the machine to relevant inventory listings
4. Make the page publicly accessible
5. Update website data appropriately

The administrator should not need to run a deployment manually for normal inventory updates.

---

# 35. Save Draft

Provide:

**Save Draft**

This allows incomplete listings to be prepared gradually.

Example:

The owner uploads photographs today but adds pricing tomorrow.

The machine should not appear publicly until published.

---

# 36. Editing

Published machines should remain editable.

Example:

Owner changes:

**Available → Reserved**

The public website should reflect the updated status after saving.

No developer involvement should be required.

---

# 37. Marking Machine Sold

Normal workflow:

Open machine

↓

Change:

**Available / Reserved → Sold**

↓

Save

The public page remains available but displays:

**Sold**

The machine must leave the homepage Available Excavators section immediately after the saved status update. Reserved machines must also be excluded from that section.

The machine should move below active inventory where appropriate.

Do not require the owner to delete sold listings.

---

# 38. Duplicate Machine

A future or V1 convenience feature may provide:

**Duplicate**

This can be useful when adding similar machines.

Example:

Two Komatsu PC200-8 units.

Duplicating may copy:

- Brand
- Model
- Specifications

It should NOT automatically reuse:

- Machine ID
- Photos
- Machine-specific hours
- Machine-specific price

unless intentionally selected.

This feature is optional for initial launch.

A duplicated record represents a different physical unit: assign a new URL and Machine ID, clear the source Serial Number and verify location, hours, price and media. Never copy a sold unit's public identity to new stock.

---

# 39. Delete Machine

Permanent deletion should be available only where necessary.

Examples:

- Listing created accidentally
- Duplicate listing
- Test listing

Normal sold inventory should not be deleted.

Deletion should require confirmation.

Example:

**Are you sure you want to permanently delete this machine?**

---

# 40. Admin Mobile Support

The administration system should work on mobile.

However, desktop/laptop may remain the preferred environment for uploading and managing large photo sets.

On mobile, the owner should at minimum be able to:

- Login
- View machines
- Edit machine
- Change price
- Change status
- Publish
- Save

Where practical, mobile photo uploads should also work.

---

# 41. Photo Upload From Phone

Where supported, the owner should be able to select photos directly from a phone.

This may be useful when machinery photographs are taken at the yard.

The workflow should not require transferring every photo to a computer first.

Actual usability should be tested before launch.

---

# 42. Admin Performance

The admin should remain responsive even when machines contain many photographs.

Image processing should not cause the interface to appear frozen without feedback.

Large uploads should provide clear progress information.

---

# 43. Error Handling

Errors should use understandable language.

Good:

**Photo upload failed. Please try again.**

Bad:

**HTTP 413 Payload Too Large**

Technical errors may be logged separately for debugging.

The owner should receive simple instructions.

---

# 44. Unsaved Changes

Where practical, warn the administrator before accidentally leaving a machine form containing unsaved changes.

Example:

**You have unsaved changes. Leave without saving?**

---

# 45. Required Fields

Keep required fields to a minimum.

Recommended required fields:

- Brand
- Model
- Machine Status
- Featured Image

Other fields may remain optional.

Publishing rules may require additional fields if later determined necessary.

---

# 46. Validation

The system should prevent obvious mistakes.

Examples:

Year:

Should resemble a valid machinery year.

Price:

Numeric value.

Hours:

Numeric value.

YouTube:

Valid supported URL where practical.

Validation messages should explain how to fix the problem.

---

# 47. Automatic Formatting

The admin should enter simple raw values.

Example:

Admin enters:

`138000`

Website displays:

`RM 138,000`

Admin enters:

`6230`

Website displays:

`6,230 Hours`

Formatting should be handled automatically.

---

# 48. SEO Administration

Normal machine publishing should automatically handle most technical SEO requirements.

The owner should not need to understand SEO to publish a machine.

Automatically generate sensible defaults for:

- Page title
- Meta description
- URL
- Social sharing information

An administrator may optionally be given advanced SEO overrides later.

Metadata/name defaults should use year where known, brand, model and machinery type naturally. Keep unknown facts absent and private Serial Number undisclosed. Do not turn filters or duplicate-model units into automatic SEO category pages.

---

# 49. Sitemap Updates

When machines are published or updated, the website's XML sitemap should be updated automatically where required by the selected technical architecture.

The owner should not manually edit XML files.

---

# 50. Analytics Relationship

Machine identity should remain consistent between:

- Admin record
- Public listing
- Individual machine page
- Enquiry
- Analytics

This allows HGR to eventually understand which machines generate the most interest.

Use stable non-personal machine identity when measuring Mudah referral/campaign journeys and source-associated website contact/viewing actions. Do not put internal serial numbers or customer data into analytics. Attribution conventions remain [DEFERRED]; no automatic offline-sale attribution is implied.

---

# 51. Enquiry Identification

When a customer sends a machine-specific enquiry, HGR should receive enough information to identify the machine immediately.

Include where appropriate:

- Machine ID
- Brand
- Model
- Year
- Machine page URL
- Customer details
- Customer message

---

# 52. Backup and Data Protection

Machinery data should not depend on a single administrator's computer.

The selected hosting/database architecture should provide an appropriate backup/recovery strategy.

Machine records and website content should survive normal computer replacement or local device failure.

---

# 53. Admin Design Principle

The administration interface should prioritise:

**Simple > Powerful**

HGR does not require a complicated enterprise inventory platform.

The owner primarily needs to:

- Add machines
- Edit machines
- Upload photos
- Add video
- Set price
- Set status
- Publish

Anything that does not help those activities should be questioned before being added.

---

# 54. V1 Admin Scope

Required for V1:

- Secure login
- Two administrator accounts
- Machinery dashboard
- Add machine
- Edit machine
- Draft / Published
- Available / Reserved / Sold
- Price / Contact for Price
- Specifications
- Multiple photo upload
- Featured image
- Photo ordering
- YouTube URL
- Description
- Preview
- Publish
- Mobile-compatible administration

Optional / Future:

- Duplicate machine
- Advanced analytics dashboard
- CRM
- Customer database
- Automated marketing
- Advanced user permissions
- Bulk inventory import
- Inventory reports

Keep V1 focused.

[FUTURE] Allow the owner to add lubricant catalogue/enquiry products when products become available, using product-specific fields. Neither lubricant products nor a lubricant admin module is required for V1 launch. Preserve a practical path to selected-product online purchasing later, without choosing or building checkout now.

---

# 55. Success Criteria

The administration system is successful when the HGR owner can independently:

1. Login
2. Add a new machine
3. Enter its specifications
4. Enter its price
5. Upload its photographs
6. Choose the featured photograph
7. Add a YouTube video
8. Preview the listing
9. Publish it
10. Change its status later
11. Mark it sold

without using:

- Code
- VS Code
- Git
- GitHub
- Command line tools
- Developer assistance

This workflow should be tested with the actual HGR owner before launch.

---

# 56. Image Storage and Processing

The administrator should be able to upload original high-resolution machinery photographs without manually resizing them first.

The system should automatically process uploaded photographs for website use.

Processing should include where appropriate:

- Correct image orientation
- Resize excessively large originals
- Image optimisation
- Compression
- Modern web image formats
- Multiple responsive image sizes
- Thumbnail generation
- Website gallery versions
- Watermark generation

Website image optimisation should target approximately 200 KB or below where practical without unnecessarily reducing visible machinery detail.

The system should prioritise visual quality and performance rather than enforcing an absolute file-size limit for every generated image.

Original high-quality photographs should preferably be retained separately from generated website versions.

The website should serve appropriately sized images based on the visitor's device rather than automatically loading the original photograph.

The final image storage provider will be selected during technical architecture planning.

---

# 57. Watermark System

The image processing system should support automatic HGR watermarking.

Possible administrator/global settings:

- No Watermark
- HGR Logo
- HGR Logo + hgrmachinery.com

Watermarking should be applied automatically to generated public website images rather than permanently modifying the original uploaded photograph.

Watermark properties should be centrally configurable, including:

- Position
- Size
- Opacity
- Margin from image edges

Default proposed position:

**Bottom-right**

The watermark should remain visible without significantly obstructing machinery details.

Original source photographs should remain unwatermarked so website images can be regenerated if the HGR watermark design changes in the future.

---

# 58. Image Delivery

The website should use responsive image delivery.

Different image sizes may be generated for:

- Thumbnail
- Machinery card
- Standard machine page
- Large gallery view

The browser should receive an appropriately sized image for the visitor's device.

Images below the initially visible page area should normally use lazy loading.

A CDN or equivalent image delivery system should be considered during technical architecture planning.

The objective is to maintain:

- Fast page loading
- Good machinery image quality
- Low bandwidth usage
- Scalable photo storage