# HGR Website Design System

## 1. Purpose

This document defines the visual and interface system for the HGR Equipment Resources website.

The objective is to create a website that is:

- Extremely easy to use
- Modern
- Professional
- Machinery-focused
- Highly readable
- Mobile-friendly
- Fast
- Visually consistent

The design should combine simple navigation with selected premium motion and visual effects.

Customer usability always takes priority over decorative design.

---

# 2. Core Colour System

The website colour palette is derived from the approved HGR logo.

The logo contains orange, near-black, white and metallic grey tones.

The website should simplify these into a controlled interface palette.

## Primary Orange

**HGR Orange**

Approximate starting value:

`#F86C00`

Use for:

- Primary buttons
- Important links
- Active states
- Selected filters
- Small highlights
- Icons where appropriate
- Important interface accents

Orange should be used deliberately rather than covering large portions of every page.

---

## Orange Hover

Approximate starting value:

`#E85F00`

Use for:

- Primary button hover
- Interactive orange elements
- Pressed states

---

## Accent Orange

Approximate starting value:

`#F89800`

This represents the brighter machinery orange visible within the HGR identity.

Use sparingly for:

- Decorative highlights
- Selected visual effects
- Gradients where appropriate
- Small brand accents

Do not use multiple orange shades unnecessarily within normal interface components.

---

# 3. Neutral Colours

## Primary Text

`#171717`

Use for:

- Headings
- Important text
- Machine names
- Prices

---

## Secondary Text

`#5F6368`

Use for:

- Supporting information
- Specifications
- Labels
- Secondary descriptions

---

## Light Background

`#FFFFFF`

Primary content background.

---

## Secondary Light Background

`#F5F5F5`

Use for:

- Alternate sections
- Machine listing areas
- Specification areas
- Subtle visual separation

---

## Border

`#E2E2E2`

Use for:

- Cards
- Inputs
- Dividers
- Specification separation

Borders should remain subtle.

---

## Dark Background

`#151515`

Use selectively for:

- Premium sections
- Footer
- Strong calls to action
- Selected homepage sections
- Visual transitions

---

## Dark Surface

`#222222`

Use for cards or components placed on dark backgrounds.

---

## Text on Dark Background

Primary:

`#FFFFFF`

Secondary:

`#D0D0D0`

---

# 4. Colour Architecture

Colours must be implemented through central design variables/tokens.

Example concept:

`brand-primary`

`brand-primary-hover`

`brand-accent`

`background-primary`

`background-secondary`

`background-dark`

`text-primary`

`text-secondary`

`border-default`

Do not repeatedly hard-code colours throughout individual components.

This allows the HGR colour palette to be changed in the future without redesigning the entire website.

---

# 5. Colour Usage Principle

The website should primarily use:

**White / Light Grey + Black / Dark Grey**

with:

**HGR Orange as the main brand accent.**

The orange should attract attention toward important actions.

Example:

White machinery listing page

↓

Dark machine name

↓

Dark specifications

↓

Orange price highlight where appropriate

↓

Orange "View Machine" or primary action

This makes orange meaningful rather than decorative noise.

---

# 6. Typography

## Primary Typeface

**Inter**

Fallback:

`Arial, Helvetica, sans-serif`

The website should use Inter throughout the primary interface.

Avoid unnecessary additional font families.

---

# 7. Typography Scale

Responsive typography should be used where appropriate.

These values are starting design targets and may be adjusted during implementation and testing.

## Hero Heading

Desktop:

`64-72px`

Mobile:

`40-48px`

Weight:

`700`

Use for the primary homepage message only.

---

## H1

Desktop:

`48-56px`

Mobile:

`36-40px`

Weight:

`700`

---

## H2

Desktop:

`36-42px`

Mobile:

`28-32px`

Weight:

`700`

---

## H3

Desktop:

`24-28px`

Mobile:

`22-24px`

Weight:

`600-700`

---

## Body Large

Desktop:

`20px`

Mobile:

`18px`

---

## Body

Desktop:

`18px`

Mobile:

`17px`

Recommended line height:

`1.5-1.6`

---

## Small Supporting Text

Minimum preferred:

`14-16px`

Avoid important information below `14px`.

---

## Buttons

`16-18px`

Weight:

`600`

Buttons should remain easy to read.

---

## Machine Price

Desktop:

`26-30px`

Mobile:

`24-28px`

Weight:

`700`

---

# 8. Typography Principle

Avoid long lines of text.

Content widths should be controlled so paragraphs remain easy to read.

Use:

- Short paragraphs
- Clear headings
- Strong visual hierarchy
- Adequate line spacing

Do not use small text simply to fit more information onto the screen.

---

# 9. Layout

The website should use generous spacing.

Maximum content width should generally be approximately:

`1200-1400px`

depending on the section.

Full-width sections may be used for:

- Hero areas
- Large imagery
- Dark visual sections
- Signature animation

Normal text content should remain within a comfortable content container.

---

# 10. Spacing System

Use a consistent spacing scale.

Suggested base system:

`4px`

`8px`

`12px`

`16px`

`24px`

`32px`

`48px`

`64px`

`80px`

`96px`

Larger spacing may be used for major desktop sections.

Avoid arbitrary spacing values unless technically necessary.

---

# 11. Section Spacing

Typical desktop section spacing:

`80-120px`

Typical mobile section spacing:

`48-72px`

Sections should feel spacious without forcing excessive scrolling.

---

# 12. Buttons

Buttons are extremely important because HGR's audience should immediately understand what can be clicked.

## Primary Button

Background:

**HGR Orange**

Text:

**White**

Recommended minimum height:

`52px`

Desktop horizontal padding:

`24-32px`

Mobile:

Large enough for comfortable thumb interaction.

Suggested corner radius:

`8px`

---

## Secondary Button

Light background:

- Transparent or white
- Dark text
- Clearly visible border

Dark background:

- White or transparent
- High contrast

---

## Button Labels

Use clear actions such as:

- View Excavators
- View Available Machines
- View Machine
- WhatsApp HGR
- Call HGR
- Send Enquiry

Avoid:

- Discover
- Explore
- Learn More

when a more specific action can be used.

---

# 13. Touch Targets

Interactive elements should have comfortable touch areas.

Target minimum:

Approximately `44-48px`

Important actions may be larger.

This is particularly important for:

- WhatsApp
- Phone
- Filters
- Navigation
- Machine cards
- Form controls

---

# 14. Cards

Machinery cards should be clean and easy to scan.

Suggested structure:

Machine Image

↓

Status

↓

Brand + Model

↓

Year / Hours

↓

Price

↓

View Machine

Cards should use:

- Large images
- Minimal borders
- Subtle shadows where appropriate
- Comfortable spacing
- Clear information hierarchy

Avoid excessive decorative effects.

---

# 15. Corner Radius

Use moderate rounding rather than extremely rounded interfaces.

Suggested system:

Small elements:

`6px`

Buttons:

`8px`

Cards:

`12px`

Large visual containers:

`16-24px`

The website should feel modern without looking like a consumer mobile application.

---

# 16. Shadows

Shadows should be subtle.

Use shadows primarily to:

- Separate cards from backgrounds
- Create slight visual depth
- Support floating visual elements

Avoid strong or heavy drop shadows.

---

# 17. Machinery Images

Listing photography should generally use consistent image ratios.

Recommended starting ratio:

`4:3`

Images should:

- Load quickly
- Maintain good visual quality
- Use responsive sizes
- Be automatically optimised
- Use modern image formats where appropriate

The original high-quality image should remain available where technically appropriate.

---

# 18. Navigation

Desktop navigation should remain simple.

Suggested primary navigation:

**Used Excavators**

**Rental**

**Machinery Services**

**Lubricants**

**About**

**Contact**

A prominent action should provide direct access to machinery inventory.

Avoid complex multi-level navigation unless future inventory expansion requires it.

---

# 19. Mobile Navigation

Mobile navigation must be extremely simple.

Use:

- Clear menu button
- Large navigation links
- Easy closing behaviour
- Direct access to inventory
- Direct access to contact

Do not hide important machinery access behind multiple navigation levels.

---

# 20. WhatsApp

WhatsApp is a primary conversion channel.

A persistent WhatsApp action may be provided where it does not obstruct content.

On individual machine pages, WhatsApp should automatically reference the machine being viewed.

The interaction should feel obvious and familiar.

---

# 21. Forms

Forms should be simple.

Use:

- Large fields
- Clear labels
- Strong contrast
- Simple validation
- Helpful error messages

Avoid unnecessary fields.

Do not rely solely on placeholder text as the field label.

---

# 22. Motion System

Motion should be subtle and deliberate.

Typical interface animation duration:

`150-300ms`

Larger visual transitions:

Approximately `300-600ms`

Scroll-controlled hero motion is an exception because its progress is controlled by the visitor's scroll position rather than a fixed animation duration.

---

# 23. Standard Motion

Acceptable effects include:

- Gentle fade
- Slight vertical entrance
- Small scale transition
- Subtle image movement
- Smooth button feedback
- Controlled parallax where appropriate

Avoid:

- Bouncing interfaces
- Excessive rotation
- Constant movement
- Large unnecessary zoom effects
- Animation on every element

---

# 24. Signature Excavator Animation

The homepage may use a scroll-controlled excavator animation.

Starting state:

- Excavator body stationary
- Tracks stationary
- Bucket near/on ground
- Boom and arm lowered naturally

During downward scrolling:

- Boom gradually rises
- Arm moves naturally
- Bucket follows realistic movement
- Excavator body remains anchored

At the end of the sequence:

- Excavator reaches a natural high-arm position
- The experience transitions into the next homepage section

Reverse scrolling should reverse the movement where technically practical.

---

# 25. Hero Animation Performance Budget

The signature animation must not compromise website usability.

Development should favour:

- GPU-friendly transforms
- Optimised image assets
- Minimal main-thread JavaScript
- Minimal layout recalculation
- No unnecessary high-resolution video download
- Responsive asset loading

The animation should be tested on real mobile and desktop devices.

If performance is poor, simplify the effect.

---

# 26. Hero Animation Fallback

The homepage must remain fully functional without the animation.

Possible fallback:

- Static excavator
- Simplified movement
- Static hero image

Visitors using reduced-motion settings should receive a reduced or static experience.

The primary "View Available Machines" action must remain accessible regardless of animation state.

---

# 27. Performance Principle

Performance is part of the design system.

Visual effects should not be considered successful if they make the website noticeably slow.

Images should be:

- Properly sized
- Compressed
- Responsive
- Lazy-loaded where appropriate

Above-the-fold assets should be prioritised appropriately.

---

# 28. Responsive Design

The website must be designed for:

- Mobile
- Tablet
- Laptop
- Desktop
- Large desktop

Layouts should adapt rather than simply shrink.

Desktop visual effects may be simplified on smaller devices.

---

# 29. Accessibility

The website should maintain:

- Strong colour contrast
- Readable text
- Keyboard-accessible navigation
- Clear focus states
- Descriptive form labels
- Meaningful image alt text
- Reduced-motion support
- Large interaction targets

Accessibility should be incorporated during development rather than added after the website is completed.

---

# 30. Design Priority

When making design decisions, use this order:

1. Can the customer understand it?
2. Can the customer use it easily?
3. Can the customer reach machinery quickly?
4. Can the customer contact HGR easily?
5. Does it perform well?
6. Does it look professional?
7. Does the animation or effect improve the experience?

A visual effect that fails the first five questions should not be used.

---

# 31. Future Theme Flexibility

The design system should allow future changes to:

- Primary brand colour
- Accent colour
- Background colours
- Typography
- Button style
- Card style
- Section appearance

These changes should be controlled centrally wherever technically practical.

The initial implementation should therefore avoid unnecessary hard-coded styling throughout individual pages.