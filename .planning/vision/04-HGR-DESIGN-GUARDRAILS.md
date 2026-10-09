# 04 — HGR Design Guardrails

## Purpose

These guardrails protect HGR from slowly becoming an ordinary machinery website through a long series of small design compromises. They preserve the character and priorities of the digital showroom as it evolves.

They apply to all future user-interface work, regardless of technology, framework, or contributor. They govern design decisions; they are not a screen specification, engineering plan, or product roadmap.

## Guardrail 1 — The Machine Is the Hero

The excavator is the primary visual subject. Layout, typography, motion, and graphic treatment exist to clarify and support the machine. They must not compete with it for attention or make the interface itself the spectacle.

## Guardrail 2 — Trust Before Marketing

Evidence comes before claims. Never exaggerate, invent, or imply facts that have not been verified. Presentation should help visitors understand what is known and what they may need to ask HGR.

## Guardrail 3 — Motion Has Purpose

Animation is justified only when it improves orientation, understanding, or memory. It is never added solely to look impressive. It remains subordinate to the machine and the information about it.

## Guardrail 4 — Simplicity Wins

Every element must justify its existence. If removing an element improves clarity without hiding useful information or access, remove it. Prefer clear, maintainable patterns over decorative complexity.

## Guardrail 5 — Respect Customer Time

Each section should help a customer move toward a confident decision. Avoid unnecessary scrolling, interruption, repetition, and distraction. Put relevant information and the next useful action where they can be understood without searching.

## Guardrail 6 — One Primary Action

Each screen should make one action visually dominant. Secondary actions may remain available when useful, but they must not compete with the primary purpose of that screen.

## Guardrail 7 — Photography Is Evidence

Machine photography is product information. Images should support inspection and understanding of an individual machine rather than serve as decoration. Their presentation must not imply facts that the images cannot establish.

## Guardrail 8 — White Space Is Valuable

Do not fill an empty area simply because it exists. White space separates ideas, gives the machine and its evidence room to be seen, and helps visitors focus. Density must earn its place through usefulness.

## Guardrail 9 — Information Before Effects

Content remains understandable when animation and visual effects are disabled. Polish must never obscure, delay, or withhold important information, navigation, or actions.

## Guardrail 10 — The Website Mirrors the Yard

The digital experience should carry the clarity and practical character of visiting a professional machinery yard: real machines, useful orientation, and direct discussion. Avoid gimmicks that break this relationship or turn inspection into entertainment.

## Guardrail 11 — Performance Is Part of Design

Fast loading, responsive behaviour, and accessibility are design qualities. Never sacrifice them for decoration or effects. An experience that cannot be used promptly and comfortably is not well designed.

## Guardrail 12 — Owner Independence

Future improvements must not make routine business operations unnecessarily dependent on developers. Design should continue to support owners managing ordinary inventory and content through the CMS without exposing needless technical complexity.

## Guardrail 13 — Build Systems, Not Features

Prefer coherent, reusable design patterns over isolated additions. New work should fit the established visual and interaction language and remain understandable as the product grows. Reuse should improve consistency without obscuring purpose.

## Guardrail 14 — Design for Growth

A design decision should remain useful as HGR's inventory grows from its current scale to hundreds or thousands of machines. Avoid patterns that depend on a small, fixed set of listings or become confusing as records increase.

## Guardrail 15 — Preserve Identity

Every contributor should ask: “Does this strengthen HGR's identity?” If the answer is uncertain, pause and review the decision against the vision documents before implementation.

## Relationship to Other Vision Documents

The documents in `.planning/vision/` have distinct responsibilities:

- **`00-HGR-CONSTITUTION.md`** establishes the purpose, North Star, decision framework, and principles that govern the product as a whole.
- **`01-HGR-DIGITAL-SHOWROOM-BIBLE.md`** explains the philosophy and enduring intent behind HGR's digital showroom.
- **`02-HGR-BLUEPRINT.md`** translates that intent into a design reference for page structures, journeys, hierarchy, and responsive behaviour.
- **`03-HGR-BUILD-SPECIFICATION.md`** describes engineering expectations, acceptance criteria, and validation for implementation.
- **`04-HGR-DESIGN-GUARDRAILS.md`** protects the design philosophy from gradual drift in future interface decisions.
- **`CHANGELOG.md`** records versioned changes to the vision document set.

The Guardrails complement the other documents. They do not replace the Constitution's governing principles, the Blueprint's design reference, or the Build Specification's engineering requirements. If a proposed design conflicts with the wider vision, resolve the conflict against the governing documents before proceeding.

## Final Statement

A product rarely loses its identity through one major mistake.

It loses its identity through hundreds of small compromises.

These guardrails exist to ensure every future improvement strengthens HGR rather than slowly turning it into an ordinary website.

Protect the experience.

Everything else will follow.
