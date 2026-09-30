# Lubricants Page Specification

## 1. Purpose

The Lubricants page remains a public V1 section for request/supply-based opportunities.

URL:

`/lubricants`

HGR may offer lubricant products when suitable products or supply opportunities are available. Exact brands/products/specifications remain [TO CONFIRM]; permanent stock must not be implied.

For V1:
- Explain that customers can ask about lubricant availability.
- Provide WhatsApp, phone and enquiry routes.
- Allow enquiries and initial transactions to progress offline.
- Keep the page useful even when no products are listed.
- Preserve the owner's ability to add catalogue/enquiry products when available or in a future phase.

Lubricant stock/product listings are not a prerequisite for V1 launch. Online purchasing is [FUTURE], not V1.

---

# 2. Primary Customer Journey

Lubricants Page → describe product/application requirement → WhatsApp HGR / Call HGR / Send Enquiry → HGR checks possible supply and verified product details → quotation/transaction offline where available.

If actual products are listed, customers may browse them before enquiring. A listing does not automatically imply permanent stock or online checkout.

---

# 3. Page Structure

Recommended V1 structure:

1. Header
2. Lubricants Hero
3. Actual Lubricant Categories / Products only if verified and available
4. Why Correct Lubrication Matters
5. Product Enquiry
6. Final Contact CTA
7. Footer

The exact sections may be adjusted once HGR's actual lubricant range is confirmed. Omit empty product/category blocks if there are no products; the public enquiry page can still launch.

---

# 4. Hero

Suggested heading:

**Lubricants for Heavy Machinery**

Supporting message direction:

**Lubricant products may be available upon request. Contact HGR with your requirements to check current supply and product details.**

Primary CTA:

**WhatsApp HGR**

Secondary CTA:

**Enquire About Lubricants**

Final wording will be handled during the Content phase.

---

# 5. Product Accuracy

Only lubricant products and categories actually supplied by HGR should be advertised.

Do not invent:

- Product specifications
- Brand approvals
- Compatibility
- Performance claims
- Certifications
- Machinery manufacturer recommendations

Product information should be based on actual manufacturer or supplier information.

---

# 6. Lubricant Categories

The website architecture should allow lubricant categories.

Potential categories may include:

- Engine Oil
- Hydraulic Oil
- Gear Oil
- Grease
- Transmission / Drivetrain Fluids
- Other Machinery Lubricants

These are structural examples only.

The final categories should be based on HGR's actual product range.

---

# 7. V1 Product Presentation

If verified products become available in V1, they may be presented as simple catalogue/enquiry cards. No products or permanent stock are required for launch. Until then, use the broad enquiry page without invented examples presented as real products.

Potential information:

- Product Image
- Brand
- Product Name
- Lubricant Type
- Grade / Viscosity where relevant
- Packaging Size
- Short Description
- Enquire

Do not force machinery-specific fields onto lubricant products.

---

# 8. Product Pricing

Pricing may be handled as:

**Contact for Price**

unless HGR decides to publish fixed lubricant prices.

The architecture should allow public pricing to be added later without redesigning the entire section.

---

# 9. Product Availability

Do not imply guaranteed stock availability unless inventory is actively maintained.

Where stock is not synchronised with the website, use:

**Contact HGR to Check Availability**

This avoids displaying inaccurate stock information.

---

# 10. Lubricant Enquiry

Each lubricant or product category should provide an easy enquiry path.

CTA:

**Enquire About Lubricants**

The enquiry should identify the product automatically where possible.

---

# 11. WhatsApp Enquiry

Suggested message structure:

Hi HGR, I'm interested in this lubricant:

Product:
Grade / Specification:
Packaging:

Please let me know the price and availability.

Where the enquiry originates from an individual product, the product page URL should also be included automatically.

---

# 12. General Lubricant Enquiry

Customers who do not know exactly which product they require should still be able to contact HGR.

Suggested heading:

**Need Help Choosing a Lubricant?**

CTA:

**Enquire About Lubricants**

Supporting direction:

**Tell HGR your machinery and lubricant requirement.**

The customer may provide:

- Machinery type
- Brand / model
- Current lubricant if known
- Required quantity
- Question / requirement

HGR can then respond directly.

---

# 13. Enquiry Form

Recommended fields:

### Name

Required

### Company

Optional

### Phone

Required

### Email

Optional

### Product / Lubricant Required

Optional

### Machinery Type / Model

Optional

### Quantity

Optional

### Message

Optional

CTA:

**Send Enquiry**

Keep the form simple.

---

# 14. Product Images

Lubricant product images should clearly represent the actual product.

Where available, use:

- Manufacturer product photography
- HGR's own product photography
- Approved supplier assets

Do not use AI-generated packaging that could misrepresent the actual product.

---

# 15. Product Documents

The future system may support product documents such as:

- Technical Data Sheet
- Product Data Sheet
- Safety Data Sheet

These should only be provided when HGR has the correct official documents.

Documents should be associated with the relevant product.

This feature is optional for V1.

---

# 16. Future Individual Product Pages

The architecture should allow the owner to add individual lubricant catalogue/enquiry listings when products become available or in a future phase. These can work without checkout.

Potential structure:

`/lubricants/[product-slug]`

Example concept:

`/lubricants/example-hydraulic-oil-46`

The exact URL naming will be determined during SEO and technical planning.

---

# 17. Future Product Page

A future individual lubricant page may include:

- Product Name
- Brand
- Product Image
- Lubricant Type
- Grade / Viscosity
- Packaging Sizes
- Description
- Applications
- Technical Information
- Official Documents
- Price / Contact for Price
- Availability Enquiry
- WhatsApp CTA

Only relevant fields should be displayed.

---

# 18. Product Data Structure

Lubricant products should use their own data structure.

Do not reuse machinery fields such as:

- Machine hours
- Machine year
- Operating weight
- Machine status

Lubricants and machinery are different content types.

This distinction should be preserved in the backend architecture.

---

# 19. Future Lubricant Administration

The administration architecture should allow a future:

**Lubricants**

section.

Potential workflow:

Admin

↓

Lubricants

↓

Add Product

↓

Enter Product Details

↓

Upload Product Image

↓

Add Documents if applicable

↓

Preview

↓

Publish

The owner should eventually be able to manage these product listings without rebuilding the website. The module is not required for V1 launch; introduce it when real products and a confirmed operational need justify it. Catalogue/enquiry publishing does not require online purchasing.

---

# 20. V1 Administration

V1 may launch with no lubricant products listed. Manage the broad enquiry page as normal website content. If a small verified range becomes available, simple product information may be added without requiring a complete product-management module.

Do not build a complete lubricant inventory management system simply for a handful of products.

The technical architecture should, however, allow the dedicated product system to be introduced later.

---

# 21. E-Commerce

V1 does not require:

- Add to Cart
- Online Checkout
- Customer Accounts
- Online Payment
- Shipping Calculator
- Automatic Stock Management

The primary objective is enquiry generation.

[FUTURE] HGR may eventually allow selected products such as lubricants to be purchased directly online. Preserve a practical expansion path without rebuilding the entire website. Do not choose a payment gateway, e-commerce platform, checkout technology or shipping system now.

---

# 22. Why Correct Lubrication Matters

A short educational section may explain the importance of using suitable lubricants for machinery.

Content should remain practical.

Potential themes:

- Equipment protection
- Lubrication requirements
- Maintenance
- Correct lubricant selection

Avoid technical claims that are not supported by product/manufacturer documentation.

---

# 23. Mobile Experience

Mobile should prioritise:

1. Understand lubricant offering
2. Browse categories/products
3. Identify relevant product
4. WhatsApp HGR
5. Send enquiry

Product cards should remain large and readable.

Avoid displaying too much technical information on the initial card.

---

# 24. SEO

Lubricants are low SEO priority for V1. Keep /lubricants as a request/supply-based enquiry page while brands/products remain [TO CONFIRM]. Do not create empty product/category pages or optimise for products HGR does not offer.

When verified products exist, the owner should eventually be able to add catalogue/enquiry listings, with potential themes based on actual brand, product, grade/viscosity and application. A product listing does not require checkout.

Full online purchasing remains [FUTURE]. No payment gateway, checkout or shipping system is selected.

---

# 25. Future SEO Expansion

Individual lubricant products may become useful search landing pages.

Example structure:

Lubricants

↓

Category

↓

Individual Product

If the product catalogue grows substantially, category pages may later be introduced.

Example:

`/lubricants/hydraulic-oil`

Do not create category pages until there is sufficient genuine content to justify them.

---

# 26. Analytics

Potential events:

- Lubricant product viewed
- Lubricant WhatsApp clicked
- Product enquiry clicked
- Lubricant enquiry started
- Lubricant enquiry submitted
- Product document downloaded

Lubricant enquiries should be distinguishable from:

- Machinery sales
- Rental
- Machinery services
- General enquiries

---

# 27. Design Relationship

The Lubricants section should still feel like part of HGR.

Use the same:

- Typography
- Colour system
- Buttons
- Spacing
- Navigation
- Contact patterns

However, lubricant product cards should be designed specifically for packaged products rather than copying excavator cards.

---

# 28. V1 Simplicity Rule

Do not overbuild the lubricant section before HGR's actual product range and sales volume justify it.

V1 priority:

**Explain Potential Availability → Generate Enquiry → Check Supply → Complete Offline Where Available**

Future:

**Product Catalogue → Individual Products → Product Documents → Possible E-Commerce**

The architecture should allow this progression without requiring the entire website to be rebuilt.

---

# 29. Success Criteria

The Lubricants page is successful when a visitor can quickly answer:

**Can I ask HGR about lubricant availability?**

**Are any verified products currently listed, or should I enquire about supply?**

**Is there a lubricant suitable for my machinery?**

**How do I check price and availability?**

**How do I contact HGR?**

These answers should require minimal effort. It must remain clear that products may be unavailable and that no permanent stock or V1 checkout is promised.