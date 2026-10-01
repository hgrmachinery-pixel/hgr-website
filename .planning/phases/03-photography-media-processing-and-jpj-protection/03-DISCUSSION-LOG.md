# Phase 3: Photography, media processing and JPJ protection - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log records the autonomous planning defaults and review.

**Date:** 2026-10-01  
**Phase:** 3 — Photography, media processing and JPJ protection  
**Areas:** photo storage and processing; document privacy and approval; serial-photo review; unresolved operational settings

---

## Autonomous planning defaults

The owner instructed the work to continue autonomously. The saved state contained no Phase 3 checkpoint, discussion log or context file. Conservative defaults aligned with AGENTS.md and REQUIREMENTS.md were recorded in `03-CONTEXT.md`; no external services were provisioned and no real private documents were used.

| Area | Selected default | Still needs owner confirmation |
|---|---|---|
| Photo storage | Staff-only unwatermarked originals, separate approved public derivative records, direct-request authorization | Watermark artwork/defaults, upload limits, real batch performance, retention/regeneration policy |
| JPJ documents | Private original and pending copy; human review plus explicit owner approval for each public copy; disabled by default | Who may approve, permitted document formats and operational review procedure |
| Serial plates | Human review across every category; invalidate review after relevant change | Final serial-plate review procedure |
| External services | Synthetic local validation only, existing portability boundary | Approved disposable PostgreSQL and storage availability; any service setup/charges need separate approval |

## Sol privacy review

Sol reviewed the current Payload media boundary. Key finding: making a record with an unwatermarked master publicly readable may expose that original alongside generated sizes. Keep masters staff-only and publish separate derivative records with server-side machine publication checks. Sol also recommended revision-bound document approval, no-store handling for private files, and direct URL/API/cache checks. Operational settings remain confirmation items.

No owner decision was requested or represented as approved in this log.

## Owner-approved policy recorded on 2026-10-01

The owner explicitly approved and asked to implement the following Phase 3 policy. These decisions supersede the remaining TO CONFIRM wording about who approves public documents:

- Permission name: `Approve Public Documents`; initially only the Owner role receives it. Permissions must be checked by permission value rather than hard-coded role, so later roles can receive the permission without database-schema/business-logic changes.
- Administrators may upload, redact, save drafts and submit for Owner review, but cannot publish public documents.
- A permitted Owner uses one `Publish` action, which records approval and publication together. There is no separate approval button. Keep `approved_by`, `approved_at`, `published_by` and `published_at` distinct. Provide Owner-only `Preview as Public` for the exact redacted version before publishing.
- Every machine photo starts `Needs Review`. Human review covers serial/chassis/VIN/engine/registration identifiers, QR codes, barcodes, customer labels, delivery and personal information, and any other sensitive identifier. Sensitive areas must be blurred/cropped and reviewed again before publication; uncertainty goes to the Owner.
- AI may highlight possible sensitive areas but never replaces human review or holds final responsibility.
- Preserve the named upload/redaction/approval/publication/last-modified audit data and never overwrite history. Use immutable audit events.

These are owner-approved policy decisions, not defaults. They authorize local implementation only; they do not authorize real JPJ documents, service provisioning, paid resources or public/production publication.
