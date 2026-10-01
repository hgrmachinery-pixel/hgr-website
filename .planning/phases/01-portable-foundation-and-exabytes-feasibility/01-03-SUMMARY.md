---
phase: 01-portable-foundation-and-exabytes-feasibility
plan: "03"
subsystem: infra
tags: [documentation, nextjs, payload, postgres, gcs, portability]
requires:
  - phase: 01-01
    provides: Locked reviewed package set and environment configuration
  - phase: 01-02
    provides: Generated migration, local guarded smoke runner and retained public/Admin routes
provides:
  - Repeatable local setup, migration and smoke instructions
  - Host-neutral same-source rebuild and redeployment procedure
affects: [01-04, deployment, future-maintenance]
actuals:
  tokens: 5039
  tasks: 2
  commits: 2
plan_head_before: 009c0f01bc4f399d3c2a90fb28e2fa904b319844
plan_head_after: e8acc17a6c39a7bff4a87e71ab458de2214c3c97
tech-stack:
  added: []
  patterns: [Protected environment injection, Same-source destination rebuild, Separate integration evidence]
key-files:
  created: [README.md, docs/deployment/portable-redeploy.md]
  modified: []
key-decisions:
  - Keep local smoke loopback-only and require a separately approved remote test procedure.
  - Treat SMTP names as reserved because no mail adapter is configured.
  - Load local smoke environment directly into Node; Node --run does not propagate --env-file values.
patterns-established:
  - Distinguish documented portability from local integration and actual destination proof.
requirements-completed: [PORT-07]
requirements-pending: [PORT-02, PORT-04]
coverage:
  - id: D1
    description: Local setup and guarded migration/smoke commands documented against retained source
    verification:
      - kind: other
        ref: git diff --check -- README.md; source/script/official-documentation review
        status: pass
    human_judgment: false
  - id: D2
    description: Same-source host-neutral redeployment procedure with permission and evidence boundaries
    requirement: PORT-07
    verification:
      - kind: other
        ref: git diff --check -- README.md docs/deployment/portable-redeploy.md; command/environment/link review
        status: pass
    human_judgment: false
duration: 6min
completed: 2026-10-01
status: complete
---

# Phase 1 Plan 3: Portable setup and redeployment Summary

**Local disposable setup and a same-source Node 24/PostgreSQL/GCS rebuild procedure, with actual host verification explicitly pending.**

## Performance

- **Duration:** approximately 6 minutes
- **Completed:** 2026-10-01
- **Tasks:** 2
- **Files created:** 2
- **Actuals:** 20,155 realized diff characters / 4, rounded up to 5,039 estimated tokens; two task commits measured from the persisted plan ledger before metadata commits.

## Accomplishments

- README covers ignored local values, every environment-example name, maintainer-reviewed emulator prerequisite, guarded migration, explicitly loaded smoke settings, app development/build/start and failure diagnosis.
- Deployment guide keeps application, PostgreSQL and external objects separate; uses the same GitHub-backed source and lockfile and supplies destination settings before build, migrations and start.
- Both documents preserve fake-data scope, staff CMS autonomy, exact destination approval requirements and the difference between documented and tested portability. No service or infrastructure was changed.

## Task Commits

1. **Document repeatable local setup and smoke commands** — `6deab5d` (docs).
2. **Document host-neutral rebuild and redeploy procedure** — `e8acc17` (docs).

## Files Created

- `README.md` — local foundation setup and verification instructions.
- `docs/deployment/portable-redeploy.md` — compatible-host capabilities, environment injection, migration/start sequence and evidence rules.

## Verification and Review

- Both plan `git diff --check` commands passed; newly created content also passed no-index checks and staged checks before commits. No tracked files were deleted; only the two intended docs were staged.
- Commands, environment coverage and local links reviewed against `package.json`, `.env.example`, `compose.yaml`, Payload configuration and actual smoke scripts. `.env` is ignored; the committed example remains names-only. No real credential values were added.
- Sol reviewed scope, deployment/security meaning and changed files. Bounded Luna read-only audits checked script/environment/link consistency and Next start flags; Sol corrected the initial Node `--run` assumption against official documentation before acceptance.
- Official Payload installation/deployment/migration/GCS guidance, Next self-hosting, Google authentication and Node 24 CLI checked on 1 October 2026; links are embedded in the docs. Context7 MCP and CLI were unavailable; no package was installed for lookup.
- No application files changed, so no additional full build/test run was needed. Prior approved local production build, type check and all 11 configuration/safety tests passed. These are earlier evidence, not a deployment test by this plan.

## Decisions Made

- Local commands explicitly load `.env` into the smoke entry point; equivalent npm scripts require shell-exported values. Official Node docs state `--env-file` values do not propagate into a `--run` child command.
- SMTP variables remain reserved, rather than implying mail delivery is implemented.
- Remote tests require their own approved fake-data procedure; loopback-only local smoke cannot be pointed at Exabytes.

## Deviations from Plan

No scope deviations. Commands were adapted to the implemented guarded local runner and names-only configuration. The requested direct migration forms are documented separately with their lack of a target guard and exact approval boundary.

## Issues Encountered

No execution blocker for documentation. Full local integration remains unproven without disposable PostgreSQL and a compatible GCS emulator; no emulator image tag/digest is selected or tested. Generated schema migration is still unapplied. Exabytes and real second-host deployment proof remain pending.

## Requirements and Next Readiness

- **PORT-07:** tracked application source, deployment docs, secret exclusions and names-only environment example now exist in the GitHub-backed repository. This does not claim the new commits were pushed.
- **PORT-02 and PORT-04:** documentation/configuration supports these requirements, but they remain unchecked pending their runtime/destination proof.
- Plan 01-04 can collect account evidence within its safety boundaries. No Phase 2 work is authorized. A destination test or chargeable resource creation still requires its own approval.

## Known Stubs and Threat Review

No code/UI stubs, skipped tests or unrun plan verification commands were introduced. Documentation discloses reserved SMTP capability and existing integration gaps. No new endpoints, authentication paths, schema or file-access implementation was introduced; the plan's documentation-to-action threat boundary was reviewed for secret injection and destination approvals.

## Self-Check: PASSED

Both created files exist; commits `6deab5d` and `e8acc17` exist on the Phase 1 branch. The plan ledger records two committed documentation tasks, with no outstanding application changes.
