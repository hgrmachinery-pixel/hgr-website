# Individual Machine Page Specification

## 1. Purpose

The Individual Machine page is the primary sales and enquiry page for each excavator.

Proposed URL structure:

`/used-excavators/[machine-slug]`

Example:

`/used-excavators/komatsu-pc200-8-2018`

The exact URL structure will be confirmed during SEO and technical planning.

The page should allow a potential buyer to:

1. Clearly identify the machine
2. View real photographs
3. Understand the main specifications
4. See price and availability
5. Watch a machine video where available
6. Contact HGR immediately
7. Arrange an inspection
8. Browse similar machines

The page should prioritise factual machine information over marketing language.

Mudah visitors may arrive directly on this page. Provide richer information/media than the marketplace listing: larger gallery, complete known specifications, fuller description, video where available, transparent status, viewing information and direct HGR contact. Do not assume the visitor has seen the homepage or make the site technically dependent on Mudah.

---

# 2. Primary Customer Journey

The ideal journey is:

Machine Page

↓

View Photos

↓

Check Price + Specifications

↓

Watch Video if available

↓

WhatsApp HGR

or

Call HGR

or

Send Enquiry

The customer should not need to navigate elsewhere to obtain basic information about the machine.

---

# 3. Page Structure

Recommended V1 structure:

1. Header
2. Breadcrumb
3. Machine Gallery
4. Machine Summary
5. Primary Contact Actions
6. Machine Specifications
7. Description
8. Video
9. Inspection / Klang Yard CTA
10. Related Excavators
11. Final Contact CTA
12. Footer

The exact desktop arrangement may place the gallery and machine summary side-by-side.

---

# 4. Breadcrumb

Example:

Home → Used Excavators → Komatsu PC200-8

The breadcrumb should provide easy navigation back to inventory.

It may also support search engine understanding of the website hierarchy.

---

# 5. Main Desktop Layout

Recommended desktop structure:

LEFT

Large machinery gallery

RIGHT

Machine information

The right-hand information area should contain:

- Status
- Brand + Model
- Year
- Hours
- Price
- Key specifications
- WhatsApp
- Call
- Enquiry

The most important buying information should be visible without excessive scrolling where practical.

---

# 6. Mobile Layout

Recommended mobile order:

Machine Name

↓

Status

↓

Price

↓

Photo Gallery

↓

Key Specifications

↓

WhatsApp / Call

↓

Description

↓

Video

↓

Inspection

↓

Related Machines

Mobile layout should prioritise readability and easy contact.

---

# 7. Machine Title

Use a natural identity combining **Year where available + Brand + Model + machinery type**.

Structural heading example only:

**2018 Komatsu PC200-8 Used Excavator**

This is not actual HGR inventory. Omit an unknown year rather than inventing one. Keep the title readable without stuffing locations or specifications. Cards may retain concise Brand + Model with year nearby.

---

# 8. Status

Supported statuses:

**Available**

**Reserved**

**Sold**

Status must be clearly visible.

Do not rely on colour alone.

---

# 9. Price

When price is displayed:

Example:

**RM 138,000**

When the owner chooses not to display a price:

**Contact for Price**

Never display:

RM0

RM0.00

blank price

or placeholder pricing.

Price should be visually prominent.

---

# 10. Key Information

Important machine information should be easy to scan.

Potential summary:

**Year**

2018

**Hours**

6,230 Hours

**Condition**

Used

**Country of Origin**

Japan

The exact information displayed depends on available data.

Missing information should be omitted gracefully.

---

# 11. Photo Gallery

Actual machine photography should be a major part of the page.

Support multiple images.

Recommended gallery behaviour:

- Large primary image
- Thumbnail navigation
- Tap/click to enlarge
- Swipe on mobile
- Previous/next navigation
- Full-screen or lightbox viewing where appropriate

The interface should remain simple.

---

# 12. Photography Accuracy

Photos must represent the actual machine being sold.

Professional enhancement may include:

- Exposure correction
- Colour correction
- Cropping
- Straightening
- Sharpening
- Background cleanup
- Minor distraction removal

Editing must not materially misrepresent machine condition.

---

# 13. Featured Image

Each machine should have one designated featured image.

The featured image will be used for:

- Inventory card
- Homepage featured machinery
- Individual machine page
- Social sharing where appropriate
- SEO/social metadata where appropriate

The administrator should be able to choose the featured image.

---

# 14. Specifications

Provide a clear specification section.

Supported fields should include:

- Brand
- Model
- Year
- Hours
- Engine
- Operating Weight
- Condition
- Country of Origin
- Status
- Price

Additional fields may be added later if required.

Include **Machine Location** where verified and optional **Serial Number**. The serial may be stored internally without public display. The owner/admin chooses whether to publish it; it is never a required public field. Keep private serials out of public page data, metadata, schema, URLs and analytics.

---

# 15. Specification Presentation

Specifications should be easy to scan.

Example:

| Specification | Details |
|---|---|
| Brand | Komatsu |
| Model | PC200-8 |
| Year | 2018 |
| Hours | 6,230 |
| Engine | [Engine] |
| Operating Weight | [Weight] |
| Condition | Used |
| Origin | Japan |

Do not show empty rows unnecessarily.

---

# 16. Description

Provide an optional machine description.

The description may contain information such as:

- Machine condition
- Previous usage
- Maintenance information
- Special features
- Attachments
- Additional remarks

Descriptions should remain factual.

Avoid exaggerated sales language.

---

# 17. Video

Machine pages should support a YouTube video URL.

The administrator should paste the YouTube URL into the machine record.

Where a video exists, display it within the machine page.

Potential heading:

**Watch This Machine**

The website should not require HGR to directly upload large video files.

YouTube should normally handle video hosting.

---

# 18. No Video

If no video exists:

Do not display an empty video section.

The page should automatically omit the section.

---

# 19. Primary WhatsApp CTA

WhatsApp is one of the most important conversion actions.

Suggested button:

**WhatsApp About This Machine**

The generated message should identify the machine automatically.

Example intent:

**Hi HGR, I'm interested in the Komatsu PC200-8 (2018).**

The message should also include the machine page URL.

This allows HGR and the customer to return to the exact listing.

---

# 20. WhatsApp Message Structure

Suggested structure:

Hi HGR, I'm interested in this machine:

Komatsu PC200-8  
2018

[Machine Page URL]

Is this machine still available?

The final message may be refined during development.

The system should generate the message dynamically from machine information.

---

# 21. Phone CTA

Provide:

**Call HGR**

The phone number should be clickable on supported devices.

Phone contact should remain visually secondary to or alongside WhatsApp depending on final testing.

---

# 22. Enquiry Form

Provide an enquiry option for customers who prefer forms.

The form may open:

- Inline
- In a clearly accessible section
- Through a simple modal if usability testing supports it

Recommended fields:

- Name (required)
- Company (optional)
- Phone (required)
- Email (optional)
- Message (required)

The machine should be automatically associated with the enquiry.

The customer should not need to type the machine model again.

---

# 23. Enquiry Delivery

For V1:

Enquiries should be delivered to the configured HGR email address.

The system should include:

- Machine identification
- Customer details
- Message
- Machine page URL

CRM integration is not required for V1.

---

# 24. Contact Visibility

Contact actions should remain easy to find throughout the page.

On desktop, the machine summary/contact area may remain visible for part of the browsing experience if this can be implemented without harming usability.

On mobile, a compact persistent contact action may be considered.

Avoid covering important content.

---

# 25. Available Machine Behaviour

When status is:

**Available**

Primary CTA:

**WhatsApp About This Machine**

Supporting actions:

**Call HGR**

**Send Enquiry**

Normal price should be shown where enabled.

---

# 26. Reserved Machine Behaviour

When status is:

**Reserved**

Clearly display:

**Reserved**

The page should remain accessible.

Suggested message:

**This machine is currently reserved. Contact HGR to check availability or ask about similar machines.**

CTA:

**WhatsApp HGR**

Do not imply that the machine is definitely available.

---

# 27. Sold Machine Behaviour

When status is:

**Sold**

Clearly display:

**Sold**

Do not remove the page automatically.

Primary message direction:

**This machine has been sold. Looking for something similar? Contact HGR.**

CTA:

**View Available Machines**

This leads to the Used Excavators page. A separate **WhatsApp HGR** action may invite enquiries about similar machines.

The sold page should continue providing useful information.

---

# 28. Klang Yard / Inspection

Customers can view/inspect machinery at HGR's Klang yard, preferably by appointment.

Suggested heading:

**View This Machine**

Supporting direction:

**Contact HGR to arrange a machine viewing at our Klang yard. Please confirm the machine's location before visiting.**

CTA:

**Arrange a Viewing**

WhatsApp should be prominent for arranging the visit. A website enquiry or phone call is also acceptable; no mandatory online booking form or scheduling system is required.

Flow: contact HGR → arrange viewing and confirm location → visit and inspect → continue negotiation/purchase offline. Do not claim a specific machine is physically at the yard unless its location is confirmed.

Suggested prefilled WhatsApp message:

Hi HGR, I'd like to arrange a viewing for the [MACHINE NAME].

[MACHINE PAGE URL]

Insert the actual public machine name and URL automatically. For sold units, offer available alternatives or a similar-machine enquiry instead of suggesting that the sold unit can be viewed/purchased.

---

# 29. Related Excavators

Near the bottom of the page, show relevant machines.

Suggested heading:

**Similar Excavators**

Display approximately:

**3 machines**

Priority may be based on:

- Same brand
- Similar model
- Similar operating weight
- Similar price range
- Available status

The exact recommendation logic may remain simple for V1.

Available machines should generally be prioritised.

---

# 30. Back to Inventory

Provide a clear route:

**View Excavators**

This returns to:

`/used-excavators`

Visitors should never feel trapped on an individual listing.

---

# 31. Machine Identification

Each machine should have an internal unique identifier.

This may be separate from the public machine name.

Example concept:

`HGR-EXC-001`

The internal ID may assist:

- Inventory management
- Enquiries
- Administration
- Future reporting

Whether the ID is displayed publicly can be decided later.

---

# 32. Machine URL

Each machine should receive a stable, readable URL.

Example:

`/used-excavators/komatsu-pc200-8-2018`

Avoid URLs such as:

`/machine?id=827361`

where practical.

If two machines have identical brand/model/year information, the system must still generate unique URLs.

The technical solution will be decided during development.

Each physical unit owns its URL permanently wherever practical, including after sale. Never reuse a sold machine URL for a later unit with the same model.

Structural example only: /used-excavators/2018-komatsu-pc200-8-028. The slug may combine readable identity and a unique identifier; this example is not inventory and does not select a generation algorithm. Do not use a private Serial Number as the public identifier.

Mudah links, where permitted, should target this exact unit page. Owner/admin should be able to copy its public URL easily; tracked-link generation remains an analytics implementation consideration.

---

# 33. SEO

Each machine page should support:

- Unique page title
- Unique meta description
- Canonical URL
- H1
- Image alt text
- Crawlable content
- Social sharing metadata
- Structured data where appropriate

Machine information should be available to search engines without requiring complicated user interaction.

---

# 34. Sold Machine SEO

Sold machines should generally remain accessible rather than automatically disappearing.

Where appropriate, sold pages may:

- Continue ranking for relevant searches
- Link to available alternatives
- Encourage enquiries
- Demonstrate previous inventory

Do not create misleading search snippets suggesting that a sold machine remains available.

Keep the existing URL and genuine details/photos. Remove misleading available-to-buy/view-this-sold-unit actions; direct visitors to Available inventory and WhatsApp about similar machines. Do not automatically delete or redirect a page because it sold, or repurpose its URL for new stock.

---

# 35. Social Sharing

When a machine URL is shared through:

- WhatsApp
- Facebook
- Messaging apps
- Other compatible platforms

the page should provide appropriate social metadata where supported.

Suggested preview information:

Machine image

Brand + Model

Year

Price or Contact for Price

HGR Equipment Resources

---

# 36. Analytics

Potential events:

- Machine page viewed
- Gallery interaction
- Full image opened
- Video played
- WhatsApp clicked
- Phone clicked
- Enquiry started
- Enquiry submitted
- Arrange a Viewing clicked
- Similar machine clicked

Machine identity should be associated with relevant analytics events where appropriate.

This can help determine which machines generate the most interest.

Support Mudah-originated visits, landing pages, machine views, WhatsApp/phone clicks, form submissions, viewing actions and video interactions where practical. Compare source-associated website behaviour with Google Organic, Ads, Direct and other referrals; preserve permitted referral/campaign context where appropriate.

Exact UTM/GA4/GTM implementation remains [DEFERRED]. A website action does not prove an offline sale or automatically attribute it to Mudah.

---

# 37. Performance

Machine pages may contain many photographs.

Performance requirements:

- Optimised thumbnails
- Responsive images
- Modern image formats where appropriate
- Lazy loading
- Correct image dimensions
- Avoid downloading every full-resolution image immediately
- Efficient YouTube embedding

The primary machine image should load with appropriate priority.

---

# 38. YouTube Performance

Avoid loading unnecessary heavy YouTube resources before the visitor interacts with the video where practical.

A lightweight preview approach may be considered.

The final implementation should balance usability with performance.

---

# 39. Accessibility

Machine pages should support:

- Keyboard-accessible galleries
- Descriptive image alt text
- Clear headings
- Strong contrast
- Large touch targets
- Accessible forms
- Text-based status labels
- Clear focus states

Machine status must not depend on colour alone.

---

# 40. Administration Relationship

The public machine page should be generated from information entered through the HGR administration system.

The administrator should not manually build individual webpages.

Creating a machine in the administration system should automatically create the corresponding public machine page.

Updating machine information should update the public page.

---

# 41. Required Admin Fields

Recommended required fields:

- Brand
- Model
- Status
- Featured Image

Other fields may be optional depending on available machine information.

The system should avoid forcing the owner to invent information simply to publish a listing.

---

# 42. Optional Admin Fields

Possible optional fields:

- Year
- Hours
- Engine
- Operating Weight
- Condition
- Country of Origin
- Price
- Description
- YouTube URL
- Additional Photos
- Machine Location
- Serial Number (internal storage; optional public display)

If an optional field is empty, the public interface should normally omit it gracefully.

---

# 43. Machine Publishing

Admin should support:

**Draft**

and

**Published**

where technically appropriate.

This allows the owner to prepare a machine listing before making it publicly visible.

Published machines appear on the website.

Draft machines do not appear publicly.

---

# 44. Machine Removal

Deleting a machine should not be the normal response when it is sold.

Preferred workflow:

**Available → Reserved → Sold**

This preserves the page and machine history.

Permanent deletion should be used only when genuinely necessary.

---

# 45. Primary Design Principle

The machine page should answer the buyer's main questions before asking them to contact HGR.

The page should not intentionally hide basic machine information simply to generate an enquiry.

Provide useful information first.

Then make contacting HGR extremely easy.

---

# 46. Success Criteria

The Individual Machine page is successful when the customer can quickly answer:

**What machine is this?**

**What year is it?**

**How many hours has it run?**

**What condition is it in?**

**How much is it?**

**Is it available?**

**What does it actually look like?**

**Can I watch it operating?**

**Can I inspect it?**

**How do I contact HGR about this exact machine?**

The page should answer these questions with minimal effort.