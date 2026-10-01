---
phase: 01-portable-foundation-and-exabytes-feasibility
plan: 02
subsystem: infra
tags: [nextjs, payload, postgres, gcs, synthetic-smoke]
requires:
  - phase: 01-01
    provides: Approved locked dependencies and synthetic Payload collection
provides:
  - Guarded disposable integration runner and loopback Compose configuration
  - Public synthetic record page, standard Payload API and Admin routes
  - Officially generated initial schema migration and Admin import map
affects: [01-03, 01-04]
tech-stack:
  added: []
  patterns: [separate root layouts, explicit migrations, isolated child environment, exact synthetic cleanup]
key-files:
  created: [compose.yaml, scripts/smoke-environment.mjs, scripts/smoke-foundation.mjs, scripts/foundation-smoke.ts, tests/smoke-environment.test.mjs, src/app/(site)/page.tsx, src/app/(site)/layout.tsx, src/app/(site)/error.tsx, src/app/(payload)/layout.tsx, src/app/(payload)/admin/[[...segments]]/page.tsx, src/app/(payload)/admin/importMap.js, src/app/(payload)/api/[...slug]/route.ts, src/migrations/20260930_235704_foundation.ts, src/migrations/20260930_235704_foundation.json, src/migrations/index.ts, next-env.d.ts]
  modified: [.env.example, .gitignore, package.json, src/payload.config.ts, tsconfig.json]
key-decisions:
  - Require separate SMOKE variables, explicit disposable acknowledgement and literal loopback database/storage endpoints; never inherit cloud credentials or proxies.
  - Disable automatic schema push and retain the official generated initial migration; application remains pending until disposable PostgreSQL is available.
  - Preserve Payload's independent RootLayout and generated import map with standard authentication, without later-phase CMS customizations.
requirements-completed: []
requirements-addressed: [PORT-01, PORT-03]
requirements-pending: [PORT-01, PORT-03]
actuals:
  tokens: 19082
  tasks: 2
  commits: 3
plan_head_before: 1ca879007f99cf73f23b8bc714355184eb4e893d
plan_head_after: 88795697d5c70e2c49470a2ce4186cae6528d10b
duration: 18min
completed: 2026-10-01
status: complete
execution-status: permitted-implementation-complete-with-pending-integration
coverage:
  - id: D1
    description: Separate public/Payload layouts, API and standard Admin integration compile for production.
    verification:
      - kind: other
        ref: Isolated next build with approved local escalation
        status: pass
      - kind: other
        ref: npm run typecheck
        status: pass
    human_judgment: false
  - id: D2
    description: Smoke environment rejects unsafe targets and excludes inherited credentials, proxies and runtime overrides.
    verification:
      - kind: unit
        ref: node --test tests/smoke-environment.test.mjs
        status: pass
    human_judgment: false
  - id: D3
    description: PostgreSQL migration, external-object upload/processing, public/Admin responses and restart persistence require local services.
    verification:
      - kind: integration
        ref: npm run smoke:foundation
        status: unknown
      - kind: integration
        ref: npm run migrate:local
        status: unknown
    human_judgment: false
---

# Phase 1 Plan 02: Synthetic application path Summary

**Production-buildable public/Payload routes, officially generated migration/import map, and a guarded fake-data tracer; database/media integration remains unproven without disposable services.**

## Accomplishments

- Preserved the interrupted executor's unfinished implementation, then completed the permitted source work without changing dependency versions or provisioning services.
- Public Next.js and Payload route groups own independent document layouts. The public fixture page has semantic content, a responsive processed-image element, empty/missing-image states and a safe retry boundary. Both roots remain separate; there is no shared outer document layout.
- Mounted Payload's standard REST handlers and Admin RootPage/RootLayout with required server-function wiring. The official generator produced the real importMap.js; no runtime import map was hand-written. Default Payload authentication and the existing authenticated write rules remain in place.
- Smoke uses only the named loopback database/bucket, generated image pixels, a random run marker and ephemeral secret. Fresh child environments exclude inherited cloud credentials, proxies and runtime overrides. It applies reviewed migrations, verifies original/processed external bytes and public content, builds/starts/restarts the app, checks anonymous writes, then attempts exact-marker record/object cleanup and connection/process shutdown. No disk/cloud fallback or production connection is accepted.
- Generated the initial fixture, default authentication and Payload system schema through official `payload migrate:create foundation`. The retained migration is preparation, not proof that a database has this schema.

## Task Commits and Disposition

1. `127563d` — `feat(01-02): add isolated synthetic foundation tracer`. Tracer implementation retained; its end-to-end verification is pending. No expansion of HGR product behavior followed the unavailable tracer.
2. `f617e48` — `feat(01-02): retain generated foundation schema migration`. Required migration application remains pending: no confirmed disposable PostgreSQL endpoint exists. This commit contains generated preparatory artifacts, not a completed database operation.
3. `8879569` — `feat(01-02): mount standard Payload Admin routes`. Standard Admin source and production compilation complete; live login/access verification remains pending with the database.

Two source tasks are implemented; the third planned task (migration application) is prepared but not completed. The owner authorized continuing independent Phase 1 work despite unavailable runtime services. `status: complete` records close-out of permitted implementation, not satisfaction of the unproven plan truths or PORT-01/PORT-03. No Phase 2 work was performed.

## Validation

Passed: production `next build` in an isolated synthetic environment outside the sandbox; routes `/`, `/admin/[[...segments]]` and `/api/[...slug]` compile. Final TypeScript, eight smoke-boundary tests, three existing foundation configuration/access/Sharp tests, application formatting, JavaScript syntax, names-only environment example, secret/ignore review and source diff checks pass. No standalone lint command/framework is configured, and no dependency was added for linting. Generated import map is preserved unchanged; initial generated SQL received whitespace normalization only.

Official import-map and migration generation first failed inside the restricted sandbox because Node `os.userInfo` returned `uv_os_get_passwd`/ENOMEM. The same guarded commands succeeded through approved local escalation. This did not modify OS security policy or install alternative native binaries. An initial build found missing not-yet-generated imports and a `.js` import targeting a TypeScript source file; the generated map and extensionless source import resolved those errors, and the subsequent production build passed.

Pending: `npm run smoke:foundation` and `npm run migrate:local` both returned nonzero with the exact controlled message that disposable loopback PostgreSQL is unavailable. Docker and psql are absent from PATH. No compatible GCS emulator has been demonstrated; no image dimensions/byte counts, live public/Admin response, anonymous-write result, restart persistence, or database migration result is claimed. Responsive/browser verification is also pending until these local services are available; source accessibility was reviewed.

The original foundation runtime suite ran once outside the sandbox: all three tests passed, zero failures/skips, in approximately 200 seconds. Earlier Sharp-loading failures did not recur in this resumed approved runtime. PORT-01 and PORT-03 remain unchecked. Local compilation is not Exabytes or second-host evidence.

## Deviations from Plan

- **[Rule 2 — correctness/safety]** Added explicit migration directory/schema-push disabling, separate guarded smoke variables, names-only local service settings and isolation tests to prevent migration or cleanup against inherited application/cloud settings. Commit: `127563d`.
- **[Rule 1 — bug]** Enforced written IPv4 loopback spelling and distinct service ports, safe invalid SERVER_URL errors, bounded owned child handling, safe Admin redirects, and exact-marker cleanup even when an upload fails before returning an ID. Commit: `127563d`.
- **[Rule 3 — blocking]** Generated the initial migration rather than treating a migration command with no migration files as schema proof. Corrected the source import for Turbopack. Commits: `127563d`, `f617e48`.
- **Owner-authorized environmental limitation:** The plan expressly permits unavailable PostgreSQL/emulator results to stay pending. Completed host-independent Admin/source work and recorded pending live integration rather than provisioning or substituting services.
- **[Rule 3 — generated output]** Ignored local `.gsd/` dispatch metadata. Committed intended generated framework/import-map/schema artifacts. Commit: `127563d`.

## Decisions Made

Local storage is never used as PORT-03 evidence. Compose binds services only to loopback; credentials/ports and the maintainer-reviewed emulator image are supplied locally. Production GCS uses the existing private-object adapter; synthetic objects are served through Payload's public collection access path. Schema migrations remain explicit and host-independent. The default Admin user collection remains standard; HGR roles/accounts belong to later phases.

## Known Stubs

None. The fake record and generated pixels are the intentional Phase 1 test domain. Empty and failure UI states are real states, not unwired mock data. No generated runtime import-map placeholder remains.

## Deferred Issues

- Apply the generated migration and run full smoke on confirmed disposable local PostgreSQL and compatible GCS services.
- Verify responsive public/empty/error states, Admin authentication and anonymous write rejection in the running application.
- Preserve earlier native-runtime observations as historical evidence; resumed generators and build now pass, but integration/image processing is still unproven.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: authentication | src/app/(payload)/admin/[[...segments]]/page.tsx | Standard Payload default users/login/first-user initialization mounted as planned. Production initial-account/staging protection requires later operational verification before any public exposure. |

## Metrics

Measured task diff: 76,326 characters / 4, rounded up = 19,082 estimate-scale tokens. Three task commits measured from the persisted plan ledger; two implementation tasks completed and migration application pending. Task files: 21. Resume implementation took approximately 18 minutes; prior interrupted work is included in the realized diff, not falsely assigned a known duration.

## Self-Check: PASSED

All 21 task files exist and commits `127563d`, `f617e48`, `8879569` resolve. This checks retained implementation and evidence integrity; pending integration is not counted as passing.
