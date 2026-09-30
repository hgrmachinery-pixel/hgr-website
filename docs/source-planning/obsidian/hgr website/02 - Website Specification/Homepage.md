# HGR Homepage Specification

## 1. Purpose

The homepage has three primary jobs:

1. Immediately communicate that HGR sells used excavators in Malaysia.
2. Direct potential buyers to available excavators.
3. Make contacting HGR extremely easy.

The homepage should not attempt to explain every aspect of the company.

The primary customer journey is:

**Homepage → Used Excavators → Individual Machine → WhatsApp / Call / Enquiry**

The website should feel visually modern while remaining extremely simple to understand.

---

# 2. Homepage Design Principle

The homepage should combine:

**Samsung-inspired product presentation**

with:

**Simple machinery marketplace navigation**

The visual experience may be sophisticated.

The customer journey must remain simple.

A visitor should understand within several seconds:

- What HGR sells
- Where to view machines
- How to contact HGR

---

# 3. Homepage Structure

Recommended V1 structure:

1. Header
2. Hero + Excavator Motion
3. Available / Featured Excavators
4. Why HGR
5. Other HGR Services
6. Klang Yard / Visit HGR
7. Final Contact CTA
8. Footer

The homepage should not contain unnecessary sections simply to make the page longer.

---

# 4. Header

The header should be clean and simple.

## Desktop

Left:

**HGR Logo**

Main navigation:

- Used Excavators
- Rental
- Machinery Services
- Lubricants
- About
- Contact

Important action:

**View Excavators**

The exact layout may be adjusted during visual implementation.

---

## Mobile

Display:

**HGR Logo**

**Menu**

A direct inventory and/or WhatsApp action should remain easy to access.

The mobile menu should use large, clearly readable links.

Avoid complicated nested navigation.

---

# 5. Header Behaviour

The header may initially be transparent or visually integrated with the hero.

After scrolling, it may transition into a solid background for readability.

The transition should be subtle.

The header should remain easy to understand at all times.

A sticky header may be used if testing confirms that it improves navigation without consuming excessive mobile screen space.

---

# 6. Hero Objective

The hero should immediately communicate:

**USED EXCAVATORS FOR SALE IN MALAYSIA**

This should be the primary message.

Possible supporting copy:

**Quality used excavators with direct, personal service from HGR Equipment Resources.**

Final marketing copy may be refined later.

---

# 7. Hero Primary Action

Primary CTA:

**View Available Machines**

This button should link directly to:

`/used-excavators`

The CTA must be visible immediately.

The visitor must not be required to complete the hero animation before accessing inventory.

---

# 8. Hero Secondary Contact

A secondary contact option may be displayed:

**WhatsApp HGR**

This should not visually compete with the primary inventory CTA.

Priority:

1. View Available Machines
2. WhatsApp HGR

---

# 9. Hero Excavator Visual

The primary hero visual should feature a realistic excavator.

Where possible, use a real HGR machine or a professionally prepared visual based on a real HGR machine.

The excavator should initially appear:

- Stationary
- Side or three-quarter view
- Body level
- Tracks stationary
- Boom lowered
- Arm lowered naturally
- Bucket positioned on or close to the ground

The excavator should occupy a significant portion of the hero without making the text difficult to read.

---

# 10. Signature Scroll Interaction

The hero should include a scroll-controlled excavator movement.

The objective is to create a premium product-presentation experience without complicating navigation.

## Initial State

When the visitor arrives:

- Excavator body is stationary
- Tracks remain stationary
- Boom is lowered
- Arm is lowered
- Bucket is near/on the ground
- Hero headline is visible
- View Available Machines CTA is visible

---

## Scroll Progress

As the visitor scrolls downward:

**0%**

Bucket near ground.

Boom and arm in starting position.

**25%**

Boom begins rising gradually.

**50%**

Boom and arm continue upward.

Bucket follows natural excavator movement.

**75%**

Arm reaches a significantly raised position.

**100%**

Boom/arm reach a natural high position.

The excavator body remains anchored throughout.

---

# 11. Mechanical Movement

The movement should visually resemble real excavator operation.

Avoid:

- Floating the complete machine
- Rotating the entire excavator
- Unrealistic arm movement
- Excessive bounce
- Cartoon-like motion

Where technically possible, the movement should respond directly to scroll position.

Scrolling downward:

**Arm rises**

Scrolling upward:

**Arm lowers**

---

# 12. Hero Scroll Length

The animation should not require excessive scrolling.

Starting target:

Approximately **1 to 1.5 additional viewport heights** of scroll-controlled movement.

This should be tested during development.

If the sequence feels slow or prevents customers from reaching inventory quickly, shorten it.

---

# 13. Hero Transition

At the end of the excavator movement, the page should transition naturally into the machinery inventory section.

The experience should feel approximately like:

**Excavator Hero**

↓

**Arm rises**

↓

**Available Excavators**

The transition should feel continuous rather than like an unrelated page section suddenly appearing.

---

# 14. Animation Performance

The implementation method should be selected during development based on performance testing.

Possible techniques may include:

- Layered 2D assets
- Optimised transparent images
- SVG where suitable
- Scroll-controlled transforms
- Other lightweight rendering approaches

Do not commit to a large video solution unless performance testing demonstrates that it is appropriate.

Website performance takes priority over animation complexity.

---

# 15. Animation Fallback

The homepage must work perfectly without the full animation.

Possible fallback experience:

**Static excavator + headline + CTA**

or

**Simplified excavator movement**

Reduced motion should be provided where appropriate.

The primary CTA must always remain usable.

---

# 16. Available Excavators Section

The first major section after the hero should show real available inventory.

Heading:

**Available Excavators**

Only published machines with **Status = Available** belong in this section. Do not include Reserved or Sold machines.

Target approximately **3–6 available machines**, depending on responsive layout and actual availability. If fewer are available, show only those machines rather than filling the section with Reserved/Sold units. If none are available, state that plainly and provide an enquiry route.

The full Used Excavators page may still show Available, Reserved and Sold in its specified order. Sold pages remain publicly accessible.

---

# 17. Featured Machine Card

Each machine card should prioritise:

1. Machine photograph
2. Brand + Model
3. Year
4. Hours
5. Price / Contact for Price
6. Status
7. View Machine

Example:

**Komatsu PC200-8**

2018

6,230 Hours

**RM XXX,XXX**

**Available**

[ View Machine ]

Actual fields depend on the information available for each machine.

---

# 18. Inventory CTA

Below the featured inventory:

**View Excavators**

This links to:

`/used-excavators`

The customer should never need to search the homepage for access to the full inventory.

---

# 19. Why HGR

After showing machinery, provide a short trust section.

Suggested heading:

**Buying Machinery Should Be Straightforward**

The section should remain concise.

Potential trust points:

### Real Machinery

View actual photos, specifications and videos of machines.

### Direct Communication

Speak directly with HGR about the machine you are interested in.

### Klang Yard

Arrange a viewing/inspection at HGR's Klang yard, preferably by appointment. Contact HGR to confirm the machine's location before visiting.

Avoid exaggerated claims.

Trust should come from useful information and real-world presence.

---

# 20. Other HGR Services

Introduce secondary business areas only after the machinery inventory.

Suggested heading:

**More From HGR**

Three simple cards:

### Excavator Rental

Rental may be available when suitable machinery is available. Contact HGR with your project requirements to check.

[ Enquire About Rental ]

### Machinery Services

Contact HGR about your machinery service requirements. Assistance and any quotation depend on the machine/problem; exact technical service scope remains [TO CONFIRM] internally.

[ Enquire About Machinery Services ]

### Lubricants

Lubricants may be available upon request. Enquire about current supply; permanent stock is not implied.

[ Enquire About Lubricants ]

These should remain visually secondary to used excavator sales.

---

# 21. Klang Yard Section

Purpose:

Create physical trust and allow customers to arrange an inspection.

Suggested content:

**Visit HGR in Klang**

Contact HGR to arrange a machine viewing at the Klang yard. Appointments are preferred; confirm the particular machine's location before visiting. WhatsApp can arrange the visit without an online scheduling system.

Include where appropriate:

- Klang, Selangor
- Map
- Directions
- WhatsApp
- Phone
- Yard photography

CTA:

**Get Directions**

and/or

**Arrange a Viewing**

Exact address and map implementation should use verified business information.

---

# 22. Final Contact CTA

Before the footer, provide one strong conversion section.

Confirmed heading:

**Looking for an Excavator?**

Supporting text:

**Tell us what machine you're looking for and we'll help you check what's available.**

Primary CTA:

**WhatsApp HGR**

Secondary CTA:

**Call HGR**

Optional:

**Send Enquiry**

Do not use View Excavators as the primary final CTA; inventory discovery actions remain prominent earlier on the homepage.

This section may use a dark background with HGR orange accents.

---

# 23. Footer

Footer should remain simple.

Include:

### Machinery

Used Excavators

Excavator Rental

### HGR

About

Machinery Services

Lubricants

Contact

### Contact

Phone

WhatsApp

Klang, Selangor

### Legal

Privacy Policy

Terms

Do not create an unnecessarily large footer.

---

# 24. Mobile Homepage

The mobile homepage should preserve the same customer journey but may simplify visual effects.

Priority order:

1. Understand what HGR sells
2. View excavators
3. Browse machines
4. Contact HGR

The hero should not consume so much vertical space that users struggle to reach inventory.

---

# 25. Mobile Hero

Mobile should display:

**Used Excavators for Sale in Malaysia**

Excavator visual

**View Available Machines**

Optional secondary:

**WhatsApp HGR**

The excavator animation may be simplified.

Possible mobile implementations:

- Reduced arm movement
- Shorter scroll sequence
- Static image
- Lightweight alternative animation

The final choice should depend on performance testing.

---

# 26. Persistent Mobile Contact

A persistent WhatsApp action may be used on mobile.

It must:

- Remain easy to identify
- Avoid blocking content
- Avoid covering important buttons
- Avoid interfering with navigation

It should be tested on common mobile screen sizes.

---

# 27. Homepage SEO

The homepage should clearly communicate:

- HGR Equipment Resources
- Used excavators
- Malaysia
- Machinery business
- Klang location where relevant

SEO language should remain natural.

Do not overload the homepage with repetitive keywords.

The external qualitative research and human-approved themes are recorded in SEO documentation. Support brand, used excavator and Malaysia relevance with genuine Klang/Selangor context. Keep inventory early; do not turn the homepage into an SEO article. Quantitative keyword metrics remain uncollected.

---

# 28. Homepage Analytics

Track important homepage interactions through GTM / GA4.

Potential events:

- View Excavators click (record its homepage section where useful)
- Machine card click
- WhatsApp click
- Phone click
- Rental click
- Machinery Services click
- Lubricants click
- Directions click
- Contact enquiry

The exact analytics event naming convention will be defined during analytics implementation.

Include Arrange a Viewing actions and source-associated behaviour for Google Organic, Google Ads, Mudah, Direct and other referrals where practical. Preserve permitted Mudah campaign/referral context if a visitor moves from a machine page to the homepage and then contacts HGR. Do not infer completed offline sales from website events.

---

# 29. Homepage Performance

The homepage is likely to contain some of the website's heaviest visual content.

Performance should therefore be actively controlled.

Priorities include:

- Fast initial render
- Optimised hero asset
- Responsive imagery
- Efficient animation
- Minimal unnecessary JavaScript
- Lazy-loading below-the-fold imagery
- Avoiding layout shifts

Visual sophistication must not significantly reduce usability or search performance.

---

# 30. Homepage Success Criteria

The homepage is successful when a new visitor can quickly answer:

**What does HGR sell?**

Used excavators.

**Where can I see them?**

View Available Machines.

**Can I see real machines?**

Yes.

**How do I contact HGR?**

WhatsApp, phone or enquiry.

**Can I inspect a machine?**

HGR has a yard in Klang.

The homepage should make these answers obvious without requiring the visitor to search for them.