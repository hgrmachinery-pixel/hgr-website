---
phase: 01-portable-foundation-and-exabytes-feasibility
plan: 01
subsystem: infra
tags: [nextjs, payload, postgres, gcs, typescript]
requires: []
provides:
  - Approved exact dependency tuple and reproducible lockfile
  - Server-configured PostgreSQL and GCS Payload foundation
  - Synthetic upload collection and names-only environment example
affects: [01-02, 01-03, 01-04]
tech-stack:
  added: [Next.js 16.3.7, React 19.3.0, Payload 3.90.2, Sharp 0.35.5, TypeScript 5.9.3]
  patterns: [server-only environment settings, authenticated writes, external private objects]
key-files:
  created: [package.json, package-lock.json, tsconfig.json, next.config.mjs, src/payload.config.ts, src/collections/FoundationFixture.ts, .env.example, tests/foundation-config.test.mjs, docs/development/dependency-review.md]
  modified: []
key-decisions:
  - Use codex/phase-01-foundation for safe focused commits rather than committing on main.
  - Retain approved PostgreSQL helper versions with compatible npm overrides; accept deduplicated approved-version copies.
  - Keep GCS objects private and expose only the synthetic collection through Payload access controls.
requirements-completed: []
requirements-addressed: [PORT-01, PORT-02]
requirements-pending: [PORT-01, PORT-02]
actuals:
  tokens: 62062
  tasks: 3
  commits: 2
plan_head_before: ef7ebd42b82ac108057ecafebe9c7229ea104c68
plan_head_after: 64938da2bd92c70c9845c536ed8b1fa529f2d901
duration: 13min
completed: 2026-09-30
status: complete
coverage:
  - id: D1
    description: Approved dependency set installs from the lockfile on Windows x64.
    verification:
      - kind: other
        ref: npm ci --no-audit --no-fund --foreground-scripts
        status: pass
    human_judgment: false
  - id: D2
    description: Portable configuration type-checks and environment example contains names only.
    verification:
      - kind: other
        ref: npx --no-install tsc --noEmit
        status: pass
      - kind: other
        ref: Names-only environment and git-ignore checks
        status: pass
    human_judgment: false
  - id: D3
    description: Runtime configuration, access rules and native image processing await a compatible local runtime.
    verification:
      - kind: unit
        ref: node --test tests/foundation-config.test.mjs
        status: fail
    human_judgment: false
---

# Phase 1 Plan 01: Portable foundation Summary

**Next.js/Payload exact dependencies install reproducibly; PostgreSQL/GCS configuration and a synthetic upload collection type-check, with native image runtime verification blocked by Windows policy.**

## Performance

- Implementation started: 2026-09-30T15:45:41Z (first application file creation; preparatory reading excluded).
- Completed: 2026-09-30T15:58:38Z.
- Implementation duration: approximately 13 minutes.
- Tasks: 3, including the previously cleared human package checkpoint.
- Task files: 10, including dependency evidence and deferred verification notes.
- Actual tokens use realized task diff characters divided by four (248245 / 4, rounded up), not harness usage. Commit count was measured from the persisted plan ledger before metadata commits.

## Accomplishments

- Nine runtime and four development direct packages match the owner's exact approved set. Clean installation succeeded with 376 approved Windows package instances after deduplication; `npm ls --depth=0` confirmed all 13 direct versions.
- Payload uses only the official PostgreSQL and GCS adapters. Required server settings fail closed without defaults or secret-value output. No database, cloud resource, hosting service or production system was provisioned or contacted by configuration tests.
- The explicitly synthetic collection permits public read, requires authentication for ordinary writes, restricts uploads to raster images, disables remote URL upload and local storage, and defines a 640px derivative. GCS object ACL remains private; Payload supplies access-controlled delivery.
- `.env.example` contains 13 names with empty values. Existing ignore rules protect local environment files and credentials. SMTP names are documentation for future mail configuration, not implemented mail delivery.

## Task Commits

1. Task 1, package checkpoint: cleared by the owner's explicit `approved` response before this continuation; no implementation commit for the review-only task.
2. Task 2, verified dependencies: `d961a31` — `chore(01-01): lock the approved application dependency set`.
3. Task 3, portable configuration: `64938da` — `feat(01-01): configure the portable Payload foundation`.

## Files Created

- `package.json`, `package-lock.json`: exact dependencies, approved overrides, Node 24 and dev/build/start/typecheck scripts.
- `docs/development/dependency-review.md`: approval provenance, indirect-version comparison, deduplication and inspected installation hooks.
- `tsconfig.json`, `next.config.mjs`: strict TypeScript and official Payload Next plugin.
- `src/payload.config.ts`: environment-driven PostgreSQL/GCS configuration, required setting validation and upload limit.
- `src/collections/FoundationFixture.ts`: one synthetic upload collection, short title and generated size.
- `.env.example`: names only; no credentials or account endpoints.
- `tests/foundation-config.test.mjs`: maintainable fake-data checks for missing/invalid settings, collection access and image processing; currently blocked before configuration loads.
- `deferred-items.md`: exact runtime restriction and next-plan prerequisites.

## Validation

Passed: approved-version comparison after clean installation (376 instances, zero unapproved pairs); `npm ci` (exit 0, inspected esbuild hooks); `npm ls --depth=0`; `npm run typecheck`; `npx --no-install tsc --noEmit`; Prettier check of application/test files; JavaScript syntax checks; `git diff --check`; names-only environment check; ignored `.env`, `.env.local` and service-account filename checks. `.env.example` is eligible for tracking. No real secret or private business data was added.

Additional runtime suite did **not** pass. Restricted execution first failed at tsx's `os.userInfo` with `uv_os_get_passwd` / `ENOMEM`. Approved local escalation then reached the actual OS block: `ERR_DLOPEN_FAILED: An Application Control policy has blocked this file.` The affected file is `node_modules/@img/sharp-win32-x64/lib/sharp-win32-x64-0.35.5.node`. Two test groups failed before environment assertions; the last group timed out before access/image assertions could complete. This is not evidence that runtime config, authentication or processing works. No security policy or trust setting was modified.

Production build, browser/responsive/Admin checks and actual database/media tests belong to Plan 01-02, which adds application routes. No UI exists in this plan. A dedicated ESLint dependency was not added beyond the approved package set; formatting, syntax and TypeScript checks are the applicable current static checks.

## Decisions Made

- The execution branch preserves main and all history. No remote operation occurred.
- Compatible overrides pin `pg-protocol` 1.16.0, `pg-connection-string` 2.14.0 and `pg-cloudflare` 1.4.0. Deduplication uses already approved get-tsconfig 4.14.2 and range-parser 1.2.1 rather than duplicate newer copies.
- Standard Payload's authenticated user collection is retained; no HGR account/role system was added. Normal synthetic writes require authentication; the later smoke can explicitly use Local API override as planned.

## Deviations from Plan

1. **[Rule 3 - Blocking] Protected branch safety:** `branching_strategy: none` would leave HEAD on main. Lead approved `codex/phase-01-foundation`; no configuration/core change was made.
2. **[Rule 1 - Dependency drift] Newly resolved PostgreSQL helper patches differed from approval:** compatible overrides restore the reviewed versions. The final installation contains only approved name/version pairs. Committed in `d961a31`.
3. **[Rule 2 - Critical validation] Added missing-setting/weak-secret/incorrect-database checks, raster upload restrictions and a 5MB limit:** required for safe foundation configuration; tests/evidence added without another dependency. Committed in `64938da`.

## Deferred Issues and Next Plan Readiness

Windows must permit the approved Sharp native binary in an authorized compatible runtime before the upload tracer can pass. The additional runtime tests remain unverified and are recorded as an open entry in `.planning/WINDOWS.md`; see `deferred-items.md`. Disposable PostgreSQL and an external GCS-compatible endpoint are also required; Docker was absent from PATH in planning. No service was provisioned to hide those gaps.

PORT-01/PORT-02 are addressed by static foundation artifacts, but remain pending at requirement level until subsequent runtime/deployment verification. PORT-03 and all Exabytes/second-host results remain pending. This summary completes Plan 01-01's required install/type-check/configuration scope only; it does not complete Phase 1 or any integration requirement.

No UI-facing stubs or new HTTP endpoints were introduced. The deliberate fake fixture/test environment is required phase test data, not a public HGR claim.

## Threat Flags

| Flag | File | Description |
| --- | --- | --- |
| threat_flag: upload-access | src/collections/FoundationFixture.ts | Future API routes will expose public synthetic read and authenticated image writes. Public/private fixture access and upload processing need actual runtime verification in Plan 01-02. |

## Self-Check: PASSED

All ten task files exist and both task commits resolve. No tracked file deletion occurred. The package checkpoint's earlier review-only task requires no implementation commit.
