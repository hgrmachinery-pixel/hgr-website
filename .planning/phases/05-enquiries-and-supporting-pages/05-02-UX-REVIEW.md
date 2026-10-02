# Customer-facing enquiry UX review

**Status:** Complete
**Scope:** Machine Enquiry, General Contact, Rental, Machinery Service and Lubricants forms.

## Review findings

- The forms already shared one submission and server-validation path, but their fields did not cover the approved information needed for each lead type.
- Phone validation only required a digit and did not normalize Malaysian mobile numbers.
- Contact preference, General Contact subject, and the approved success message were absent.
- The submission envelope had no consistent place for future lead attribution details.

## Changes

- Extended the shared form and validator for the five approved enquiry types. Added the requested type-specific questions and conditional trade-in details.
- Displayed the machine name and HGR reference as read-only values from the current published machine; the server still derives the trusted identity from that machine route.
- Added a fixed Malaysia `+60` phone prefix, common-format cleanup, server-side Malaysian mobile validation and canonical E.164 normalization.
- Trimmed and title-cased names, trimmed and lowercased email, and defaulted preferred contact to WhatsApp. Email becomes required when selected as the preferred contact method.
- Kept server validation and the existing honeypot, and retained accessible field errors and summaries.
- Added a typed metadata envelope for lead source, referrer, UTM values, browser and server timestamp. Referrer query strings are removed before notification; no Payload collection or database schema changed.
- Updated accepted-delivery copy to the approved customer message.

## Architecture boundaries

No Payload collections, routes, authentication, permissions, database architecture or deployment design changed. The CRM metadata remains a typed submission context passed to the existing email adapter; no CRM or enquiry database storage was added.

## Checks

- `npm run typecheck` — passed.
- Focused enquiry, supporting-page, accessibility and brand tests — 27 passed.
- Synthetic-environment `npm run build` — passed.
- Full existing suite — 115 passed; 3 foundation-config subprocess checks could not start because the sandbox's Node child processes failed with `uv_os_get_passwd returned ENOMEM`.
- `git diff --check` — passed.
