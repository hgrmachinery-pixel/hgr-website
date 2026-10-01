# Phase 2: Machine model and Payload owner workflow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-01
**Phase:** 2-machine-model-and-payload-owner-workflow
**Areas discussed:** Internal machine ID, public URLs, existing WordPress pages, publish minimum, account recovery, public ID display, publication and stock lifecycle

---

## Internal machine ID

| Option | Description | Selected |
|--------|-------------|----------|
| Permanent sequential ID | `HGR-000001` onwards, never reused, separate from manufacturer serial number | ✓ |
| Date-based/descriptive/random ID | Alternative stable identifier styles discussed | |

**User's choice:** Permanent sequential HGR IDs beginning `HGR-000001`.
**Notes:** Never reuse IDs; keep separate from manufacturer serial numbers.

## Public machine URLs

| Option | Description | Selected |
|--------|-------------|----------|
| SEO slug plus stable HGR ID suffix | `/machines/{seo-slug}-hgr-000001` or equivalent category path; stable after publication; 301 redirect if correction required | ✓ |
| Descriptive slug only | Shorter but can collide for otherwise identical units | |
| Changeable published slug | Easier to edit but risks broken links and search history | |

**User's choice:** Use the SEO slug plus HGR ID suffix; never change published URLs; use a 301 redirect for a correction.
**Notes:** ID is mandatory in every public URL.

## Existing WordPress pages

| Option | Description | Selected |
|--------|-------------|----------|
| Assume none; inventory if discovered | Avoids inventing migration work while preserving a safeguard | ✓ |
| Preserve a known list | Requires identifying existing machine pages now | |

**User's choice:** Assume none currently exist; inventory any later-discovered pages before migration.

## Minimum to publish

| Option | Description | Selected |
|--------|-------------|----------|
| Owner-defined minimum | HGR ID, Category, Brand, Model, Status, Featured Image, at least one Gallery Image; price and other facts optional | ✓ |
| Recommended lean minimum | ID, Brand, Model, Status, and one approved general/featured photo | |
| Require many specifications | Would delay publication when optional facts are unknown | |

**User's choice:** Owner-defined minimum above. Price may be Contact for Price; Year, Hours, specifications, serial number, attachments, and location are optional.
**Notes:** Unknown optional facts must remain blank.

## Account recovery

| Option | Description | Selected |
|--------|-------------|----------|
| Owner-controlled email password reset | Standard recovery flow; configure mail delivery later | ✓ |
| Manual reset by another administrator | Avoids email delivery but depends on another account holder | |

**User's choice:** Owner-controlled email password reset; configure email later.
**Notes:** No email service/account provisioning or credential handling is authorized in this decision.

## Public machine reference

| Option | Description | Selected |
|--------|-------------|----------|
| Small “Reference” field | Display the HGR ID without featuring it prominently | ✓ |
| No public ID | Use only the URL to identify the public machine | |
| Prominent ID | Make the internal reference a headline element | |

**User's choice:** Show a small “Reference” field on the machine page; do not feature prominently.

## Publication and stock lifecycle

| Option | Description | Selected |
|--------|-------------|----------|
| Separate publication and stock controls | Draft/Published/Archived publication state separate from Available/Reserved/Sold stock status | ✓ |
| One combined lifecycle | Single state sequence for draft, available, reserved, sold, archived | |

**User's choice:** Keep the controls separate. Draft is admin-only. Published Available/Reserved/Sold are public, with status badges for Reserved and Sold. Archived is admin-only and retains the historical record and permanent ID.
**Notes:** Archive is intended for withdrawn, duplicate, or obsolete listings.

## the agent's Discretion

- Technical field grouping, validation wording, admin list/search/filter layout, safe default visibility, slug generation, and implementation details that preserve the above decisions.
- Local work proceeds without external PostgreSQL, object storage, email, production hosting, or second-host services; external verification remains pending until available and approved.

## Deferred Ideas

- None. Phase 3/4/5 requirements stay in their roadmap phases.
