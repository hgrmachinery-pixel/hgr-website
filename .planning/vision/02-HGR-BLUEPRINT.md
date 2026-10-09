# 02 — HGR Blueprint

## Purpose

This document describes the intended visual and interaction structure of the HGR digital showroom. It is a design reference, not an implementation plan. Exact content remains limited to verified business and machine facts.

## Desktop Wireframes

### Homepage

```text
┌──────────────────────────────────────────────────────────────────┐
│ Header: HGR logo/home link | Used Excavators | Rental | Services  │
│        Lubricants | About | Contact                               │
├──────────────────────────────────────────────────────────────────┤
│ Hero: product statement and primary action | approved real HGR    │
│       excavator visual, with anchored body and optional boom      │
├──────────────────────────────────────────────────────────────────┤
│ Available Excavators: heading, short orientation, 3–6 unit cards │
│ [machine] [machine] [machine] [machine if available]              │
│ View all excavators                                                │
├──────────────────────────────────────────────────────────────────┤
│ Direct contact/viewing prompt                                      │
├──────────────────────────────────────────────────────────────────┤
│ Secondary business areas: Rental | Services | Lubricants           │
├──────────────────────────────────────────────────────────────────┤
│ Footer: contact, about, supporting links and required policies     │
└──────────────────────────────────────────────────────────────────┘
```

The hero leads into inventory rather than a long corporate introduction. The available set shows only Published and Available machines. It contains fewer than the normal target if fewer genuine units are available. If no suitable hero asset exists, the available-inventory section and its first genuine photograph (or its heading and text) become the visual anchor.

### Inventory

```text
┌──────────────────────────────────────────────────────────────────┐
│ Header                                                            │
├──────────────────────────────────────────────────────────────────┤
│ Breadcrumb / page title / concise explanation                     │
│ Search by brand or model | Brand | Status | Clear                 │
├──────────────────────────────────────────────────────────────────┤
│ Machine cards in responsive grid                                  │
│ [photo, identity, status, price state, details] ...                │
├──────────────────────────────────────────────────────────────────┤
│ Ordinary result navigation                                        │
│ Empty or failure state with a direct enquiry route where needed   │
├──────────────────────────────────────────────────────────────────┤
│ Footer                                                            │
└──────────────────────────────────────────────────────────────────┘
```

Available machines precede Reserved and Sold machines. Cards identify their machine clearly, use a genuine featured image, show a readable status, and present an approved price or Contact for Price. Filtering does not create a separate indexable destination. Result navigation remains available without infinite scrolling.

### Machine Page

```text
┌──────────────────────────────────────────────────────────────────┐
│ Header / inventory return link                                    │
├──────────────────────────────────────────────────────────────────┤
│ Machine identity, year if known, status, price/contact state      │
│ Direct actions: WhatsApp / call / enquire, when configured        │
├──────────────────────────────────┬───────────────────────────────┤
│ Unified image gallery             │ Known specifications         │
│ featured image, category controls │ evidence links where useful  │
│ thumbnails / previous-next        │                               │
├──────────────────────────────────┴───────────────────────────────┤
│ Description and other verified details                            │
│ Approved video or document availability, only when present        │
├──────────────────────────────────────────────────────────────────┤
│ Status-appropriate contact prompt / available alternatives         │
├──────────────────────────────────────────────────────────────────┤
│ Footer                                                            │
└──────────────────────────────────────────────────────────────────┘
```

Desktop may place the gallery and key specifications side by side. The primary identity and status must remain visible before or alongside the main gallery. No empty placeholder modules appear for absent optional facts, photos, video, or documents.

## Mobile Wireframes

### Homepage

```text
┌──────────────────────────────┐
│ HGR logo             Menu    │
├──────────────────────────────┤
│ Used excavators              │
│ Concise product statement    │
│ [View Available Excavators]  │
│ Approved static/simplified   │
│ hero photograph              │
├──────────────────────────────┤
│ Available Excavators         │
│ [machine card]               │
│ [machine card]               │
│ [View all]                   │
├──────────────────────────────┤
│ Direct enquiry               │
│ Rental / Services / Lubricants│
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

### Inventory

```text
┌──────────────────────────────┐
│ HGR logo             Menu    │
├──────────────────────────────┤
│ Used Excavators              │
│ Search                       │
│ Brand and status controls    │
│ Machine card                 │
│ Machine card                 │
│ Result links                 │
│ Footer                       │
└──────────────────────────────┘
```

Filters should remain easy to reach without crowding the first view. Cards form a single column where width requires it. Search and filter controls wrap vertically; no horizontal page scrolling is introduced.

### Machine Page

```text
┌──────────────────────────────┐
│ HGR logo             Menu    │
├──────────────────────────────┤
│ Back to excavators           │
│ Machine identity             │
│ Status / price state         │
│ Primary contact action       │
│ Main gallery image           │
│ Category navigation          │
│ Thumbnails / gallery controls│
│ Specifications               │
│ Description                  │
│ Enquiry / alternatives       │
│ Footer                       │
└──────────────────────────────┘
```

The gallery is touch- and keyboard-operable. Controls are large enough to use; category navigation may wrap or use a labelled, locally scrollable strip. Machine identity, status, and contact actions do not depend on a desktop side-by-side layout.

## Homepage Storyboard

1. **Orientation:** The customer sees that HGR sells used excavators and can identify the primary action.
2. **Physical anchor:** An approved image of a real HGR excavator establishes the product focus. No fabricated machinery image is substituted when an approved asset is unavailable.
3. **Optional movement:** Where appropriate, a restrained boom/arm movement relates to scroll while the machine body remains anchored.
4. **Inventory hand-off:** The hero gives way to genuine available units; motion is not needed to understand the section.
5. **Inspection entry:** Cards help a visitor recognise an individual unit and open its detail page.
6. **Direct next step:** Enquiry and contact paths are clear, followed by secondary business areas.

## Machine Page Storyboard

1. Identify the physical unit and its current public availability state.
2. Present its featured photograph and coherent category-based gallery.
3. Present known specifications and description without fabricating missing facts.
4. Connect selected facts to relevant evidence images where useful.
5. Offer a contact route appropriate to Available, Reserved, or Sold state.
6. Keep the visitor oriented with an inventory return path and useful available alternatives where records exist.

## Inventory Storyboard

1. State what inventory is being shown.
2. Provide simple brand/model search and brand/status filters.
3. Present genuine machine cards in status-aware ordering.
4. Preserve ordinary page/result navigation for keyboard users and search crawlers.
5. Explain zero-result and service-failure states in plain language and retain a contact route.

## Motion Timeline

| Stage | Visual behaviour | Requirement |
|---|---|---|
| Initial view | Hero statement, action, and machine are immediately understandable. | Static content is complete and usable. |
| Scroll begins | Optional boom/arm movement responds proportionally. | Body/tracks remain visually anchored; motion is supplemental. |
| Mid-transition | Hero recedes and available inventory becomes prominent. | Inventory heading and cards remain readable independent of animation. |
| Reduced motion or constrained device | Static or simplified hero. | No content, navigation, SEO, or conversion action is withheld. |

Motion should be short, restrained, reversible where practical, and performance-conscious. No timeline should delay the first usable content.

## Photography Placement

- **Homepage:** Use an approved, rights-cleared real HGR excavator image as the hero anchor. If unavailable, lead with available inventory and genuine inventory imagery; if no suitable image exists, use the section text without a substitute machine visual.
- **Inventory:** Use the chosen featured/general image for each unit's card, with neutral handling when absent in any non-public draft context. Public publication requires a suitable featured/general image.
- **Machine page:** Place the main gallery early, with categories presented as one navigable experience. Keep thumbnails and category choices subordinate to the primary image.
- **Specification evidence:** Link a fact to a relevant image only where it genuinely supports inspection, such as an hour-meter image alongside hours.
- **Documents:** Show only approved public derivatives. Never place private originals in public gallery presentation.

## Spacing Philosophy

Use a consistent 4-pixel-based scale. Compact spacing supports related controls; larger spacing separates distinct tasks and content areas. Preserve breathing room around machinery imagery and keep cards scannable. On smaller screens, reduce outer margins before reducing legibility. Interactive targets remain at least 44 by 44 pixels regardless of the spacing scale.

## Typography Philosophy

Use Inter with the existing sans-serif fallback. Establish a restrained hierarchy: body text at 16 pixels, labels at 14, headings at 24, and display text at 40, with readable line heights. Use the established regular and semibold weights. Reflow and wrap at narrow widths rather than shrinking text below the declared sizes. Keep labels and machine identities complete; do not truncate essential information.

## Navigation Philosophy

The HGR logo links to the homepage; there is no Home item. Main navigation order is Used Excavators, Rental, Machinery Services, Lubricants, About, Contact. Keep the inventory route prominent and provide a clear return path from machine pages. On narrow screens, use a compact menu with an accessible name and state. Do not bury contact or create navigation whose labels imply unverified offerings.

## Responsive Behaviour

Layouts reflow from desktop grid and side-by-side detail views to compact, primarily single-column mobile views. Text wraps, images retain useful proportions and focal points, and controls remain operable by touch, keyboard, and assistive technology. The hero uses static or simplified media on small or constrained devices. Loading and optional-media failures must not block the rest of the page.

## Component Hierarchy

```text
Site shell
├── Header
│   ├── HGR home link
│   └── Primary navigation
├── Main route
│   ├── Homepage
│   │   ├── Hero / visual anchor
│   │   ├── Available machine collection
│   │   └── Supporting business links
│   ├── Inventory
│   │   ├── Search and filters
│   │   ├── Machine collection
│   │   └── Result navigation / states
│   └── Machine detail
│       ├── Identity and status
│       ├── Gallery and category navigation
│       ├── Specifications and evidence links
│       ├── Description / optional verified media
│       └── Contact and alternatives
└── Footer
```

This hierarchy describes conceptual responsibilities only. It does not mandate particular files, libraries, or code structure.
