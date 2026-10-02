# Phase 5 Plan 01 Task Status

**Overall:** Local Phase 5 implementation is complete. Legal drafts await Owner review; live mailbox delivery awaits SMTP configuration and external service verification. Phase 5 remains in progress; Phase 6 has not started.

| Task | Status | Notes |
| --- | --- | --- |
| 1. Machine-specific enquiry path | Complete | Machine context is re-resolved server-side. `sales@hgrmachinery.com` is configured locally via ignored `ENQUIRY_TO_EMAIL`; phone/WhatsApp links remain hidden. Portable SMTP uses opt-in validated environment settings and a fake transport in tests. |
| 2. Rental, service, lubricant and general forms | Complete | Form validation, field limits, spam trap, delivery-result states and viewing preference are implemented. Real sending remains disabled until SMTP settings are configured. |
| 3. Editable supporting routes, navigation and recovery | Complete | Routes are fixed allow-listed and published-only. Legal drafts live only in planning files and are not seeded or published. |
| 4. Owner reviews legal wording | Pending Owner review | Privacy Policy and Website Terms drafts are complete and marked Owner Review Required. SITE-06 publication remains pending; no auto-publish occurred. |

## Owner-Dependent Requirements

- **LEAD-01 / LEAD-02: Pending configuration.** Public phone and WhatsApp values were not approved, so direct actions are omitted.
- **LEAD-07: Implementation complete; live delivery pending.** Recipient comes from environment setting `ENQUIRY_TO_EMAIL` (local ignored value: `sales@hgrmachinery.com`). SMTP host/port/credentials and sender settings are absent. Sending is disabled unless complete settings and `ENQUIRY_EMAIL_ENABLED=true` are supplied. No real service was contacted.
- **LEAD-08 / LEAD-09: Pending full contact setup.** Form validation and viewing preference exist, but direct fallback numbers and verified location wording remain unset.
- **SITE-05: Pending verified facts.** No yard/location details were supplied for publication.
- **SITE-06: Drafts ready for Owner review.** Both internal drafts are marked Owner Review Required, contain Owner To Confirm fields, and remain unpublished/unseeded. Routes remain unavailable until the Owner reviews and explicitly publishes approved copy.
- Phone/WhatsApp numbers and verified public location details also remain unset, so their direct links and facts are omitted from public pages.

No Phase 6 work was started. No files were staged or committed; this shared checkout already contained uncommitted Phase 4 work and all changes remain reviewable.

## Verification

- 16 focused Phase 5 tests passed; TypeScript passed; production build passed with synthetic environment values; `git diff --check` passed.
- Sol security review: SECURED, all six registered threats closed. No SMTP service was contacted.
- One existing GSD consistency warning remains in Phase 3 plan metadata (`03-04-PLAN.md` missing `wave`); no Phase 5 plan errors.
