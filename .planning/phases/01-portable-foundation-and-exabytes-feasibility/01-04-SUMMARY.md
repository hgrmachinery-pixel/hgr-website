---
phase: 01-portable-foundation-and-exabytes-feasibility
plan: "04"
subsystem: infra
tags: [exabytes, node, portability, postgres, gcs, deployment]

requires:
  - phase: 01-02
    provides: Next.js/Payload foundation and guarded synthetic local smoke
  - phase: 01-03
    provides: Portable rebuild and redeployment procedure
provides:
  - Owner-reported Exabytes account facts and evidence-based compatibility assessment
  - Documented Node 22.23.3 compatibility for the locked framework/runtime requirements
  - Exact approved synthetic test scope and explicit pending prerequisites
affects: [phase-1-closeout, future-deployment-planning]

actuals:
  tokens: 3300
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - Record supplied hosting facts as owner-reported; do not infer unseen platform details.
    - A remote-test approval does not authorize missing service provisioning.

key-files:
  created: []
  modified:
    - docs/deployment/exabytes-feasibility.md
    - package.json
    - package-lock.json
    - docs/deployment/portable-redeploy.md

key-decisions:
  - "Official Next.js, Payload and Sharp requirements and audited package engines accept Node 22.23.3; Node 24 is not intrinsically required by this selected stack."
  - "Permit Node >=22.23.3 <23 or >=24 <25 while retaining Node 24 as the locally built/tested runtime."
  - "The approved Exabytes synthetic write/upload test remains pending because no PostgreSQL or object-storage test services exist; do not provision services."
  - "No second compatible host is available; leave that deployment proof pending."

patterns-established:
  - "Separate owner approval, service availability, and actual workload evidence in deployment status reporting."

requirements-completed: []
coverage:
  - id: D1
    description: Owner-reported Exabytes plan/runtime facts and compatibility findings recorded with evidence limits.
    verification:
      - kind: other
        ref: docs/deployment/exabytes-feasibility.md
        status: pass
    human_judgment: true
    rationale: Owner evidence is not an independent Plesk inspection; isolation and platform details remain unknown.
  - id: D2
    description: Locked package metadata permits the reported Node 22.23.3 runtime in addition to the locally tested Node 24 line.
    verification:
      - kind: other
        ref: Official Next.js/Payload/Sharp requirements and 482-entry package-lock engine audit
        status: pass
    human_judgment: false
  - id: D3
    description: Exabytes and second-host synthetic deployment results remain explicitly pending when safe existing services/resources are absent.
    verification:
      - kind: other
        ref: npm run smoke:foundation (local guard reports disposable services unavailable); owner confirms no Exabytes PostgreSQL/storage services or second host
        status: unknown
    human_judgment: true
    rationale: No Exabytes write/upload, real-host runtime verification, or second-host deployment was performed.

duration: 14min
completed: 2026-10-01
status: complete
---

# Phase 01 Plan 04: Exabytes evidence and conditional feasibility

The owner's reported Node 22.23.3 runtime meets the documented framework and selected package engine requirements, but the approved representative write/upload workload cannot run without existing isolated PostgreSQL and object-storage test services.

## Accomplishments

- Recorded the owner's report of Exabytes Business Hosting eBiz 12 Plus, Node.js 22.23.3, npm, production mode, `/httpdocs`, configurable startup file, custom environment variables and File Manager. Marked it owner-reported, not independently inspected.
- Checked official Next.js, Payload and Sharp requirements and audited Node engine ranges in all 482 lockfile package entries. Node 22.23.3 is accepted except an optional Windows x86 Sharp binary; target OS/architecture is unverified.
- Updated project engine metadata and setup/deployment docs to permit Node 22.23.3 and Node 24. Node 22 build/runtime is not yet tested; no package dependency versions changed.
- Recorded owner's approval for the exact fake-data test, while preserving the no-provisioning boundary. Owner confirms there are no existing PostgreSQL or object-storage test services and no second compatible host.
- Attempted `npm run smoke:foundation`; the local guard exited before connecting because disposable local services were unavailable and `HGR_SMOKE_DISPOSABLE` was unset. No migration, write or upload ran.

## Task commits

- Task 1 evidence protocol: `d3962cc` (completed before this resumed execution).
- Resumed evidence/runtime update: `1bcc1b2`.
- Plan summary metadata: recorded in its own close-out commit.

## Changed files

- `package.json`, `package-lock.json` — declared supported Node runtime lines.
- `README.md`, `docs/deployment/portable-redeploy.md`, `docs/development/dependency-review.md` — updated runtime guidance and evidence.
- `docs/deployment/exabytes-feasibility.md` — owner evidence, compatibility conclusions, test approval and pending prerequisites.
- `.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-04-PLAN.md`, `01-04-CHECKPOINT.md` — aligned the checkpoint and plan with supplied facts and decisions.

## Pending verification and requirements

- The actual Exabytes build/start, target OS/architecture and Sharp binary compatibility remain untested/unverified.
- The approved Exabytes workload is pending because PostgreSQL and object-storage test services do not exist. Creating/provisioning them is not authorized.
- No isolated Exabytes application slot/route or protected handling of environment values was confirmed.
- Local end-to-end PostgreSQL/GCS integration remains pending; the attempted smoke stopped at its guard.
- No second compatible host exists. PORT-04 and PORT-05 remain pending; PORT-06 retains only partial capability evidence. No PORT requirement is newly marked complete by this plan.

Phase 1 remains incomplete because local integration and required destination proof have not passed. Phase 2 has not started.

---
*Plan: 01-portable-foundation-and-exabytes-feasibility/04*
*Completed: 2026-10-01*
