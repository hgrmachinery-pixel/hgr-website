---
phase: "06"
slug: "accessible-design-and-inventory-seo"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-02"
register_authored_at_plan_time: true
---

# Phase 06 — Security

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Payload records to public routes | Only published, approved public projections may reach metadata, pages and crawler output. | Machine facts and approved public image derivatives. |
| Environment to canonical/index policy | Public origin and explicit indexing settings control canonical hosts and crawler destinations. | Non-secret deployment configuration. |
| Visitor input to enquiry handling | Form fields are untrusted and must be validated before adapter delivery. | Personal contact details and enquiry text. |
| Responsive image projection to browsers | Public routes may reference only validated approved derivatives. | Public image URLs, actual dimensions and reviewed alt text. |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 | Information Disclosure | Machine metadata and JSON-LD | high | mitigate | Published public queries, allowlisted projection and visible-fact metadata/schema. | closed |
| T-06-02 | Spoofing | Public-origin and indexing policy | medium | mitigate | Credential-free HTTP(S) origin validation; production and explicit opt-in required. | closed |
| T-06-03 | Tampering | Metadata and JSON-LD | medium | mitigate | Fixed canonical paths, no query reflection and HTML-safe JSON-LD serialization. | closed |
| T-06-04 | Information Disclosure | Homepage machine imagery | medium | mitigate | Public-media projection gates featured derivatives; card has a text fallback. | closed |
| T-06-05 | Denial of Service | Homepage hero and actions | low | mitigate | Static server-rendered content; no required motion; reduced-motion behavior retained. | closed |
| T-06-06 | Information Disclosure | Responsive images and gallery | high | mitigate | Only validated named derivatives are projected; private/master images are never fallback URLs. | closed |
| T-06-07 | Tampering | Enquiry validation | medium | mitigate | Server-side validation returns fixed field errors before delivery. | closed |
| T-06-08 | Information Disclosure | Sitemap | high | mitigate | Sitemap reads published public machines and emits fixed routes plus validated machine paths. | closed |
| T-06-09 | Spoofing | Robots and sitemap origin | medium | mitigate | Shared validated origin/indexing policy; crawler destinations are withheld when closed. | closed |
| T-06-10 | Tampering | Contrast and interactive boundaries | medium | mitigate | WCAG contrast matrix maps used pairs and selector-specific control borders, including focus states. | closed |
| T-06-SC | Tampering | Package installation | high | mitigate | No dependency manifests or lockfiles changed; no package installation occurred. | closed |

No accepted risks. No unregistered threat flags were found in the plan summaries.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-02 | 11 | 11 | 0 | gsd-security-auditor |

## Sign-Off

- [x] All threats have a disposition.
- [x] Accepted risks documented (none).
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-10-02

### Verification scope

The final audit verified the current source and 44 focused Phase 6/public inventory/supporting-page tests. Live PostgreSQL, GCS/media delivery, browser/device, deployment, Search Console and analytics verification remain deferred to the deployment/configuration work.
