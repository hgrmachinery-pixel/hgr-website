# Used Excavators Page Specification

## 1. Purpose

The Used Excavators page is the primary machinery discovery page for HGR Equipment Resources.

URL:

`/used-excavators`

The page should allow visitors to:

1. Immediately see available excavators
2. Quickly identify machines relevant to them
3. Understand basic machine information
4. Open an individual machine page
5. Contact HGR easily

This page should work effectively for visitors arriving from:

- Homepage
- Google Search
- Google Ads
- Social media
- Direct links
- Returning customers

The page should not assume that the visitor has previously visited the homepage.

This is the primary V1 organic-search landing page. Approved research-informed themes are used excavator Malaysia, used excavator for sale Malaysia and excavator for sale Malaysia, with natural Klang/Selangor context. These themes are not volume-ranked.

Inventory is core content: expose it quickly with Available first and crawlable links to each actual unit. V1 SEO is inventory-led, not blog-led.

---

# 2. Primary User Experience Principle

The machinery should appear quickly.

Avoid placing large amounts of introductory content before the inventory.

Recommended structure:

Page Heading

↓

Short Introduction

↓

Search / Simple Filters

↓

Machinery Inventory

↓

Contact CTA

↓

SEO / Supporting Content where appropriate

↓

Footer

The customer should not need to scroll through company information before seeing machinery.

---

# 3. Page Heading

Primary heading:

**Used Excavators for Sale in Malaysia**

Supporting text should remain short.

Example direction:

**Browse HGR's current selection of used excavators. Contact us directly for machine details, inspection or availability.**

Final copy will be defined separately under Content.

---

# 4. Inventory Priority

Machines should normally appear in this order:

1. Available
2. Reserved
3. Sold

Within Available machines, the default order should generally prioritise:

**Newest listings first**

This allows returning visitors to quickly identify newly added machines.

The exact sorting logic may be refined during development.

---

# 5. Machine Status

Every machine should have a clearly visible status.

Supported statuses:

**Available**

**Reserved**

**Sold**

Status must be understandable without requiring the visitor to interpret colours alone.

---

# 6. Available Machines

Available machines should receive the strongest visibility.

Display normally.

Primary action:

**View Machine**

Optional direct action:

**WhatsApp About This Machine**

The main objective is still to encourage visitors to open the machine page before enquiring where practical.

---

# 7. Reserved Machines

Reserved machines should remain visible.

Clearly display:

**Reserved**

The machine page should remain accessible.

HGR may still receive enquiries because:

- The reservation could fall through
- The customer may want a similar machine
- HGR may have another machine available

Reserved machines should normally appear after available machines.

---

# 8. Sold Machines

Sold machinery should remain publicly accessible.

This full inventory page may contain Available, Reserved and Sold. The separate homepage Available Excavators section is restricted to Published + Available machines only (approximately 3–6; fewer if fewer are available).

Clearly display:

**Sold**

Sold machines should appear after Available and Reserved inventory.

Sold machine pages should remain accessible unless there is a specific reason to remove them.

Potential benefits include:

- Showing previous HGR inventory
- Search engine value
- Helping buyers identify machines HGR handles
- Generating enquiries for similar machines

A sold machine page should encourage:

**Looking for a similar excavator? Contact HGR.**

---

# 9. Search

Provide a simple machinery search.

Placeholder example:

**Search brand or model**

Search should allow common queries such as:

`Komatsu`

`PC200`

`Hitachi`

`ZX200`

Avoid complicated search behaviour.

Results should update clearly.

---

# 10. Filters

Initial filtering should remain intentionally simple.

Recommended V1 filters:

### Brand

Examples may include:

- Komatsu
- Hitachi
- Caterpillar
- Kobelco
- Sumitomo
- Other

Only display brands that actually exist within inventory where practical.

### Status

- Available
- Reserved
- Sold

### Year

A simple year range may be provided if useful.

### Price

A price range may be added if inventory and customer behaviour justify it.

Do not create excessive filters for V1.

Approved priority: **Status, Brand and Search**. Year and Price range are additional options only if justified. For the planning scale of approximately 20–30 units, avoid marketplace-scale controls. Filter/faceted URLs primarily support UX, not automatic indexable landing pages; implementation remains [DEFERRED].

---

# 11. Filters Not Required Initially

Avoid unnecessary filters such as:

- Engine model
- Country of origin
- Exact operating weight
- Detailed technical specifications

unless actual customer behaviour demonstrates a need for them.

These specifications can remain available on individual machine pages.

---

# 12. Filter Usability

Filters should use familiar controls.

Desktop may use:

- Simple filter row
- Dropdowns
- Search box

Mobile may use:

- Search
- Filter button
- Simple filter panel

Avoid complex e-commerce filter sidebars unless they prove necessary.

---

# 13. Clear Filters

If filters are active, provide an obvious:

**Clear Filters**

or:

**Reset**

Visitors should never become confused about why machines have disappeared.

---

# 14. Results Count

Where useful, display a simple results count.

Example:

**18 Excavators**

or:

**18 Machines Found**

Avoid unnecessary technical language.

---

# 15. Machinery Grid

Desktop target:

Approximately **3 cards per row**

depending on final content width.

Tablet:

Approximately **2 cards per row**

Mobile:

**1 card per row**

Machine images should remain large and easy to inspect.

---

# 16. Machine Card Structure

Each machine card should show only the information necessary for initial comparison.

Recommended hierarchy:

**Machine Photo**

**Status**

**Brand + Model**

**Year**

**Hours**

**Price / Contact for Price**

**View Machine**

Example:

Komatsu PC200-8

2018

6,230 Hours

RM XXX,XXX

Available

[ View Machine ]

Avoid overcrowding the card with every technical specification.

---

# 17. Machine Photography

The featured image should be the strongest representative photograph of the machine.

Use actual HGR machinery photographs.

Images may receive professional correction and optimisation.

Machine cards should use a consistent image ratio where possible.

Recommended starting point:

**4:3**

Images should load efficiently.

---

# 18. Image Interaction

The entire machine image and/or card title should clearly behave as a link to the individual machine page.

Do not require the visitor to discover a small hidden button.

The **View Machine** button should remain available as an obvious action.

---

# 19. Pricing

Machines may use either:

**RM XXX,XXX**

or:

**Contact for Price**

This is controlled individually for each machine through the administration system.

Do not display:

RM0

RM0.00

or blank price fields.

---

# 20. Hours

Where machine hours are known:

Example:

**6,230 Hours**

If hours are unavailable, the interface should handle the missing information gracefully.

Do not display meaningless values such as:

**0 Hours**

unless zero is genuinely correct.

---

# 21. Year

Where known:

**2018**

If the year is unknown, omit it or use an approved alternative rather than displaying incorrect information.

---

# 22. Inventory Sorting

Default:

**Newest Listings**

Potential future sorting options:

- Newest
- Price Low to High
- Price High to Low
- Year Newest

For V1, additional sorting should only be included if it improves usability.

Do not add controls simply because e-commerce websites normally have them.

---

# 23. Pagination / Loading

With approximately 20-30 machines initially, the simplest appropriate loading method should be used.

Potential approaches:

- Standard pagination
- Load More

Avoid infinite scroll for V1.

A **Load More** approach may provide a simple browsing experience while keeping the page manageable.

Final implementation should consider SEO, accessibility and performance.

---

# 24. No Results State

If filters produce no results, display a helpful message.

Example:

**No excavators match these filters.**

Actions:

**Clear Filters**

and:

**WhatsApp HGR**

Supporting message:

**Tell us what machine you're looking for and we'll help check availability.**

A zero-result page should still provide a path toward an enquiry.

---

# 25. WhatsApp

WhatsApp should remain easily accessible.

From the inventory page, a general message may be used.

Example intent:

**Hi HGR, I'm looking for a used excavator.**

Individual machine-specific WhatsApp messages should primarily be generated from individual machine pages.

---

# 26. Machine Card Direct WhatsApp

A direct WhatsApp icon/action may be tested on machine cards.

However, avoid adding too many buttons to each card.

Preferred card priority:

**View Machine**

then machine-specific enquiry from the machine page.

If testing demonstrates that customers prefer direct WhatsApp from listings, it may be added.

---

# 27. Contact CTA

After the active inventory, include a simple enquiry section.

Suggested heading:

**Can't Find the Excavator You Need?**

Supporting direction:

**Tell HGR what brand, model or size you're looking for.**

Primary CTA:

**WhatsApp HGR**

Secondary:

**Send Enquiry**

This allows HGR to capture demand even when the required machine is not currently listed.

---

# 28. SEO Supporting Content

SEO content may be included below the primary inventory.

It should not push machinery down the page.

Potential topics may include:

- Buying used excavators in Malaysia
- Machine inspection
- Brands commonly available
- HGR's Klang location
- Malaysia-wide enquiries

Content must be useful and natural.

Avoid keyword stuffing.

Detailed SEO copy will be created during the SEO/content phase.

Do not add long generic SEO paragraphs, a V1 blog, automatic brand/model/category pages or near-identical location pages. Future expansion requires useful content, real inventory/coverage and evidence from search, advertising or enquiries.

---

# 29. Google Ads

This page may be a primary Google Ads landing destination for searches with strong used-excavator buying intent.

Examples include searches related to:

- Used excavators for sale
- Used excavators Malaysia
- Second-hand excavators
- Excavators for sale

Actual keyword targeting will be determined during Google Ads planning.

Visitors arriving from advertising should immediately see relevant machinery.

---

# 30. Mobile Experience

Mobile is a priority.

The mobile inventory page should provide:

- Large machine images
- Readable model names
- Clear prices
- Clear status
- Large View Machine button
- Easy search
- Simple filtering
- Easy WhatsApp access

Avoid fitting multiple tiny cards across a mobile screen.

Use:

**1 machine per row**

---

# 31. Mobile Filter Behaviour

Suggested flow:

Search field

[ Filters ]

↓

User taps Filters

↓

Simple filter panel opens

↓

Brand

Status

Year if implemented

↓

[ Show Machines ]

[ Clear Filters ]

The interaction should feel familiar.

---

# 32. Loading Performance

The inventory page may contain many machinery photographs.

Performance requirements include:

- Responsive image sizes
- Image compression
- Modern image formats where appropriate
- Lazy loading below-the-fold images
- Proper image dimensions
- Avoid loading full-resolution originals into card thumbnails

The page should remain fast as inventory grows.

---

# 33. SEO Technical Requirements

The inventory page should support:

- Unique page title
- Meta description
- Canonical URL
- Proper heading structure
- Crawlable machine links
- Internal linking
- Structured data where appropriate

Filtering should not accidentally create large numbers of low-value indexable URLs.

Exact SEO implementation will be defined during technical SEO planning.

---

# 34. Analytics

Potential events to track:

- Machine search
- Filter used
- Machine card clicked
- View Machine clicked
- WhatsApp clicked
- Call clicked
- No-results enquiry
- View All / Load More interaction

Tracking should help HGR understand:

- Which machines receive interest
- Which brands receive interest
- Which visitors contact HGR
- Which advertising campaigns produce enquiries

Also evaluate acquisition context, including Mudah-originated visitors who navigate from a machine page into inventory. Compare Google Organic, Google Ads, Mudah, Direct and other referrals where practical; source tracking does not prove an offline sale.

---

# 35. Accessibility

Inventory browsing should remain accessible.

Requirements include:

- Keyboard-accessible controls
- Clear labels
- Strong contrast
- Visible focus states
- Useful image alt text
- Status communicated using text
- Adequate touch targets

Do not communicate Available / Reserved / Sold using colour alone.

---

# 36. V1 Simplicity Rule

HGR initially expects approximately:

**20-30 machines**

with approximately:

**3-5 new listings per month**

The inventory interface should be designed for this actual scale.

Do not build a complex marketplace interface designed for thousands of machines.

The system architecture may support future growth, but the customer interface should remain simple.

---

# 37. Success Criteria

The Used Excavators page is successful when a visitor can quickly answer:

**What machines are available?**

**What brand/model is this?**

**How old is it?**

**How many hours has it run?**

**How much does it cost?**

**Is it still available?**

**Where can I see more information?**

**How do I contact HGR?**

These answers should require minimal effort.