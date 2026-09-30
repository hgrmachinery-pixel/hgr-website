# HGR Legal Content Planning

## Purpose and status

This is a planning checklist, not legal advice, an approved policy or a statement that HGR complies with Malaysian law. Do not publish it as website legal text. Professional review should confirm applicable requirements before launch, using the actual business, data flows and selected providers.

Sources: [[03 - Content/Content Requirements]], [[03 - Content/Company Information]], [[02 - Website Specification/Contact]], [[02 - Website Specification/Admin System]] and [[00 - Project/Business Requirements]].

[TO CONFIRM] means a business fact or review outcome is missing. [DEFERRED] means an implementation decision remains open. Future features require a fresh review before activation.

## Privacy Policy requirements

Prepare a policy that accurately describes:

- The business responsible for the website and its privacy contact: registered identity, address and contact details [TO CONFIRM].
- Information collected through general, machine, rental, Machinery Services and lubricant enquiries; distinguish required and optional fields.
- Machine identity, source page, operational logs and advertising attribution collected in addition to customer-entered data.
- Purposes: responding to enquiries, identifying machines, administering the site and measuring marketing where enabled.
- Recipients and service providers, including enquiry email delivery, hosting, security, analytics, advertising and embeds.
- Where information is stored or processed, who can access it, retention and deletion practices, and any overseas processing [TO CONFIRM] after provider selection.
- How customers can raise privacy questions or requests and how HGR will handle them [TO CONFIRM].
- Applicable notice, permission, consent and other obligations to be confirmed by the reviewer; do not assume a particular legal basis or exemption.
- Effective date, responsible policy owner and process for updates [TO CONFIRM].

Do not promise that data is never shared, immediately deleted or stored only in Malaysia unless this has been verified. Do not invent retention periods.

## Enquiry forms and privacy wording

The general Contact form requires Name, Phone and Message. Company, Email and Machine / Subject of Enquiry are optional under the Contact specification. Rental and service forms have their own required project/machine location fields. Do not make email mandatory merely because enquiries are delivered by email.

Draft wording for review, not approved publication text:

> HGR will use the information you provide to respond to your enquiry. Please read our Privacy Policy for details about how we handle personal information.

Link the policy beside the form. Confirm whether further wording or a separate control is required before launch; this draft is not blanket marketing consent. Do not add customers to marketing lists automatically. Keep labels and error messages accessible.

The form should report success only after the defined successful submission state. Explain failures plainly and offer WhatsApp or phone. [DEFERRED] delivery provider and success/failure handling. [TO CONFIRM] receiving mailbox and authorised recipients.

Customer service-photo uploads are optional; WhatsApp is sufficient for V1 where appropriate. If uploads are added, review collection, access, file handling and retention before enabling them.

## Analytics, advertising and cookies

GA4, Google Tag Manager, Search Console and Google Ads measurement are established project requirements. Their configuration, account access, retention settings, event parameters and consent handling are [DEFERRED]; account ownership/access is [TO CONFIRM].

Before drafting disclosures, inventory the actual tags, cookies and other browser storage. Record provider, purpose, data, activation conditions, retention and applicable user controls. Distinguish site operation from analytics and advertising. A cookie banner or consent-management design must follow the reviewed requirements and actual configuration; do not claim that a banner is universally required or that a banner alone establishes compliance.

Review conversion tags, cross-domain data flows, advertising identifiers and any future remarketing. Remarketing and additional data-sharing features are not automatically authorised by the requirement to measure enquiries. Keep names, phone numbers, emails and free-text messages out of ordinary analytics events. A WhatsApp or phone click records an action, not proof of a completed conversation or sale.

## Third-party services and external links

| Service | Planning requirement |
|---|---|
| YouTube | Explain any video integration and resulting third-party processing; review click-to-load/privacy settings and loading behaviour. Do not claim a particular embed mode prevents all data transfer. |
| Google Maps | Use the verified yard location; review a link, preview or delayed embed and its privacy/performance implications. |
| GA4 / GTM / Google Ads | Disclosures must describe the tags actually deployed and reviewed controls. GTM is a tag-management mechanism, not itself a complete privacy configuration. |
| WhatsApp | Make clear the link opens an external service. Prefill only the intended enquiry context; do not insert customer personal data without a clear reason and review. |
| Other links/providers | Record the destination, purpose and relevant external terms/privacy information when selected. |

Do not promise control over third-party services or copy their policies into HGR's policy. Ensure essential HGR contact details remain available if an embed is not loaded.

## Website Terms requirements

The reviewer should consider business identification, permitted website use, enquiry-based transactions, content rights, external links, information corrections, complaint/contact procedures and appropriate limitations. Any governing-law, liability, warranty or dispute wording requires review; do not invent exclusions or guarantees.

V1 is lead generation. There is no online checkout, rental booking or binding automated quotation workflow. The confirmed model is enquiry followed by offline machinery sales, rental and service quotations/transactions; lubricant enquiries may also proceed offline in V1. The reviewer should distinguish website enquiries from separately agreed commercial terms. Specific terms remain [TO CONFIRM].

## Machinery, price and availability statements

Plan concise wording explaining that customers should confirm current details, availability and arrangements with HGR. This must support accurate records, not excuse misleading information.

- Display Available, Reserved or Sold correctly; sold pages remain accessible and clearly historical.
- Show an approved RM price or Contact for Price. Never imply a hidden price is zero.
- [TO CONFIRM] what displayed prices include, any applicable charges and quotation validity; do not invent tax, delivery or warranty terms.
- [TO CONFIRM] source and verification of year, hours, origin, condition and specifications.
- Do not imply every listed unit is at the Klang yard or is available for rental.
- Correct errors promptly across the visible page, metadata and any relevant marketing materials.
- Customer machinery viewing/inspection at the Klang yard is confirmed, preferably by appointment; use Arrange a Viewing and confirm machine location before the visit. This does not confirm a technical inspection service, certification, financing, transport, service coverage or lubricant compatibility.

The reviewer should approve the final disclaimers without obscuring known material machine information.

## Intellectual property and asset permissions

Record the owner/source, permission and permitted uses of logos, copy, photographs, videos, reviews, manufacturer documents and supplier materials. Obtain approval for identifiable owner/team imagery where appropriate. Do not presume possession of a photograph grants publication rights.

Actual listing photographs must show the actual machine. Preserve original photographs; any watermark goes on generated public versions. Manufacturer brand references and product documents must not imply authorised dealer/distributor status. Confirm permission and document versions before distributing brochures, Technical Data Sheets or Safety Data Sheets.

## Review and future updates

- [ ] Verify identity, contact details and business processes with HGR.
- [ ] Map form, email, logging, analytics and embed data flows.
- [ ] Confirm providers, recipients, retention, permissions and operational handling.
- [ ] Obtain appropriate legal/privacy review before publication.
- [ ] Approve final Privacy Policy, Website Terms and form/disclosure wording.
- [ ] Test that implemented behaviour matches disclosures and user controls.
- [ ] Link approved policies in the footer; utility URL slugs remain [DEFERRED].
- [ ] Remove draft markers and placeholders from public pages.
- [ ] Assign a policy owner and review date [TO CONFIRM].

Review again when providers, forms, tracking or business practices change. [FUTURE] CRM, customer accounts, payments, new languages and distributorships require renewed assessment. This document does not approve those features.
