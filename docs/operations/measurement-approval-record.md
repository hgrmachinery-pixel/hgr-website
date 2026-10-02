# Measurement and privacy approval record

**Status:** Deployment items unresolved. Measurement remains disabled.
**Last updated:** 2026-10-02

This record contains non-secret approval status only. Do not put credentials, personal data, or private customer/business records here.

## Owner direction

- Keep all measurement disabled.
- Do not configure or activate GA4, GTM, analytics cookies, advertising tags, or remarketing until the production analytics account, consent behavior, privacy review, and tag configuration have all been approved.
- This record does not authorize production measurement configuration or external tag activation.

## Deployment gates

| Item | Status | Evidence required before activation |
|---|---|---|
| Production analytics account and authorized access | TO CONFIRM | Owner confirms the HGR-owned account/property/container and authorized maintainers. Never record credentials. |
| Consent behavior and separate analytics/advertising choices | TO CONFIRM | Owner and privacy reviewer approve the choices, defaults, withdrawal behavior, and handling of already-loaded tags. |
| Privacy review | TO CONFIRM | Named reviewer checks actual enquiry recipients, providers, hosting/storage/email logs, retention/deletion, privacy requests, cookies, and disclosures. |
| Tag configuration | TO CONFIRM | Review the production container for automatic collection, page/history/form/outbound events, URL/title/referrer/query leakage, category enforcement, duplicate lead events, and withdrawal behavior. Verify with browser network evidence before approval. |
| Enquiry success signal | TO CONFIRM | Confirm the approved single signal is real server-side email-adapter acceptance; local samples and contact intent are not leads. |
| Privacy/terms publication | TO CONFIRM | Use only verified operational facts and obtain explicit owner and privacy-reviewer approval. Drafts stay unpublished. |
| Isolated recovery target and operator | TO CONFIRM | Identify an already-existing disposable PostgreSQL and compatible object-storage target, named operator, isolation evidence, and exact approved checks. No resource provisioning or purchase is authorized. |

Until all applicable gates are resolved and separately approved, keep the runtime analytics provider disabled and do not add analytics cookies, GA4/GTM configuration, advertising tags, or remarketing. Local event tests do not prove vendor-container collection or deployed consent enforcement. No live account or infrastructure verification has been performed.
