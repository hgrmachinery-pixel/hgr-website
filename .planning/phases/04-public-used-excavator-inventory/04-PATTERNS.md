# Phase 4: Public used-excavator inventory — Pattern Map

**Mapped:** 2026-10-02

| New/changed file group | Closest analog | Pattern to preserve |
|---|---|---|
| `src/lib/machines/publicInventory.ts` | `publicProjection.ts`, `identity.ts` | Pure allow-list/search/sort/pagination helpers with no Payload dependency |
| `src/app/(site)/page.tsx` | existing placeholder homepage | Dynamic server page; remove fixture use; query only public machines |
| `src/app/(site)/used-excavators/page.tsx` | site route and Payload page queries | Public query with normal access, validated projection, crawlable pagination |
| `src/app/(site)/machines/[slug]/page.tsx` | `src/app/api/preview/route.ts` | Resolve stable identity; public access only; historical slug redirect remains same-record only |
| `src/components/site/*` | `src/components/payload/MachinePhotoUploader.tsx` | Keep interactive controls isolated as client components; semantic accessible controls |
| `src/components/payload/CopyMachineLink.tsx` | existing payload edit controls/import map | Small browser clipboard action; derive route from stable document slug and configured public URL |
| `tests/public-inventory.test.mjs` | machine model/media tests | Node `node:test`, import pure TS helpers directly, use synthetic documents |

## Query and projection rules

- Call Payload `find` with `overrideAccess: false`, `_status=published`, `archived != true`, bounded `limit` and deterministic sort. Preserve the collection's access rule.
- Project into a new public type; add optional keys only when validated values exist. Do not include raw media record IDs, master filenames, private audit/review fields, staff fields, previous slugs, or role information in public HTML/metadata.
- Public prices must obey `priceMode`; serial follows the independent public visibility check. A server-side projection check is useful defense-in-depth but does not replace Payload access.
- Public media file handlers remain default-denied. If Payload query returns a media record without an accessible derivative URL, return an empty gallery and placeholder, never an underlying master URL.
- Payload relationship population uses an anonymous collection list query, while `MachineMedia` deliberately denies public list reads. After the delivery gate only, resolve each bounded machine relation ID with anonymous `findByID` (`overrideAccess:false`) so the existing exact-record access check runs. Keep list access denied.
- Resolve slug with current slug first. Historical slug lookup is scoped to public documents and must be unique; return a permanent redirect to that same record. Unknown/ambiguous slug returns not found.
- `previousSlugs` is intentionally field-private and stored as JSONB. Use an exact, parameterized JSONB containment query selecting only IDs with published/non-archived predicates and `LIMIT 2`; then re-fetch the single result by ID with ordinary Payload public access before projection. Never expose the history array.
- Listing query filters use short documented values, normalize case/whitespace, clamp page numbers, and never return an unbounded result set. Invalid values fall back to safe defaults.

## Deferred boundaries

- No design-system redesign, hero animation, SEO sitemap/canonical/metadata rollout (Phase 6).
- No WhatsApp, phone, enquiry forms or email delivery (Phase 5).
- The video URL is an optional machine field. Register its generated migration in the established registry, keep it unapplied without an approved disposable database, and make its down migration refuse to drop entered video URL values.
- No real GCS or PostgreSQL service check, storage ACL change, public delivery gate change, production access, or data migration.

---
*Phase: 04-public-used-excavator-inventory*
