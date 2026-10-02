# Phase 5: Enquiries and supporting pages — Context

**Gathered:** 2026-10-02
**Status:** Local implementation underway; recipient and legal draft scope supplied by Owner. SMTP provider settings and legal publication approval remain pending.

## Phase boundary

Complete the local enquiry journeys and supporting page routes using existing Payload content/contact fields. PostgreSQL, GCS, media delivery, browser verification, and deployment are deferred to the deployment verification milestone as directed. Do not begin Phase 6.

## Locked decisions

- Forms require the fields specified by LEAD-03 through LEAD-06; other listed fields remain optional.
- The server derives machine context from the published machine route. Do not accept client identity or private fields as authoritative.
- Show direct phone/WhatsApp actions only when explicitly configured. No number is approved; keep both actions hidden. WhatsApp machine messages include the public identity and canonical page URL when later configured.
- The enquiry recipient is `sales@hgrmachinery.com`; keep it in the `ENQUIRY_TO_EMAIL` environment setting and never hard-code it. Use portable SMTP settings from environment variables, disabled unless `ENQUIRY_EMAIL_ENABLED=true` and all validated SMTP/from/recipient settings are present. Do not claim success until the fixed configured recipient accepts delivery.
- Keep rental enquiry/quotation-based without guaranteed stock or booking. Do not invent service capabilities, lubricant products, company history, hours, address or per-machine locations.
- Reuse existing Pages title/slug/body and publication controls. Use fixed public slugs and published-only reads.
- Generate internal Privacy Policy and Website Terms drafts for HGR Equipment Resources and the specified Malaysian business/site scope. Mark both **Owner Review Required**; keep them unpublished and do not seed them into the CMS. Complete unknown operational/legal details as Owner To Confirm.
- No production, paid, database, storage, mail-provider or deployment resource may be created or contacted. Local tests use an injected fake mail transport only.

## Open owner inputs

SMTP host, port, credentials, sender name/address, and live service verification; phone/WhatsApp numbers; verified yard/per-machine locations; any public business claims; and Owner approval of exact legal drafts. These do not block local implementation. LEAD-07 live mailbox delivery and SITE-06 publication remain pending until configured/approved and verified.

---
*Phase: 05-enquiries-and-supporting-pages*
