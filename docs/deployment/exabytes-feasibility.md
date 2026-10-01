# Exabytes feasibility: evidence and proposed test

**Recorded: 1 October 2026. Status: pending owner evidence and exact test approval.**

No hosting-plan evidence, runtime evidence, safe isolated test endpoint, PostgreSQL/storage test service, or account capability evidence was present in the project records at planning time. None has been provided for this record. Second-host availability is unknown. No account has been accessed or remote test performed. These gaps establish neither suitability nor unsuitability of the existing Exabytes account.

This is the read-only checklist and proposed synthetic test for Plan 01-04 Task 1. It does not grant permission to upload, deploy, start/restart a remote application, migrate a remote database or change any account. Task 2 is an owner-required `blocking-human` checkpoint; Task 3 has not started. PORT-04, PORT-05 and PORT-06 remain pending.

## Evidence to provide

The owner may provide **redacted screenshots or capability descriptions** from the existing plan and application settings. Remove account identifiers, personal details, passwords, connection strings, tokens, keys and secret values. No credentials or service-account files should be sent or placed in Git/planning records. The owner need not run commands or change settings; the maintainer assesses supplied evidence and performs any subsequently authorized technical work.

Every row below is currently **not provided / pending**. For each future fact record its evidence reference, capture date, exact observed value and whether it is a documented allowance or a measured result. Mark a limitation unsupported only when evidence shows it; never replace missing evidence with a guess or general provider advertising.

| Capability | Exact read-only evidence needed | Current evidence |
|---|---|---|
| Product and plan | Existing hosting product/plan name; whether it includes a Node application facility and an isolated test slot | Not provided |
| Runtime and build | Available Node/npm versions, OS/architecture, install/build support; project requires Node 24.x | Not provided |
| Process/start/port mapping | Allowed start command, long-running Node process support, assigned listening port and HTTPS/reverse-proxy mapping | Not provided |
| Restart behavior | Process supervision, manual/automatic restart rules, idle/sleep behavior and what survives an application restart | Not provided |
| Persistent and temporary disk | Writable temp/build/cache paths, capacity/quotas, persistence across restart/redeploy, cleanup policies | Not provided |
| CPU and memory | CPU and RAM allowance; build/runtime/image-processing ceilings and enforcement | Not provided |
| Process and background jobs | Concurrent process limits, child-process support, execution duration and background-job restrictions | Not provided |
| Request/upload size | Proxy and application request-body/upload limits; whether the 5 MiB foundation cap fits within them | Not provided |
| Request time | Proxy/request/processing timeouts and any rate/concurrency restriction relevant to the test | Not provided |
| PostgreSQL connectivity | Outbound TCP/TLS access to independently managed PostgreSQL; allowed ports and supported TLS requirements | Not provided |
| GCS connectivity | Outbound HTTPS/TLS access to existing GCS or a confirmed compatible test endpoint; authentication support without sharing secrets | Not provided |
| Network allowlists | Outbound restrictions and stable egress/allowlist requirements for database and storage; no rule changes under this review | Not provided |
| Sharp/native processing | Supported native modules/platform, Sharp loading/image transformation support and writable temp space | Not provided |
| Environment configuration | Protected environment injection during build/migration/start and existing secure authentication/credential mounting support | Not provided |
| Isolation | Already available test app slot, separate disposable database/schema, existing isolated bucket/prefix and permitted test HTTPS route; separation from WordPress/production | Not provided |
| Existing resources and charges | Which app/database/storage test resources already exist and are non-chargeable for this workload; any quota, usage or upgrade charges | Not provided |
| Second host | Whether an already available compatible test host exists, its same capabilities/isolation and authorized services; answer yes, no or unknown | Not provided; availability unknown |

The [portable redeployment procedure](portable-redeploy.md) defines the required Node application, PostgreSQL and external object-storage capabilities. The existing Exabytes MariaDB is never a PostgreSQL substitute. Missing services or unsafe isolation leave the test pending; no purchase, account creation, upgrade, subscription or potentially chargeable provisioning is part of this proposal.

## Exact proposed synthetic workload

This proposal uses the same generated image and record assertions as [the local smoke entry point](../../scripts/smoke-foundation.mjs) and [its integration coordinator](../../scripts/foundation-smoke.ts). It uses no customers, machinery records, real photographs, JPJ documents or other sensitive business data. A single small image proves only this foundation workload, not production photography capacity.

**Execution prerequisites:** specific owner approval for the named destination and operations below; evidenced safe existing test isolation; already available non-chargeable PostgreSQL and GCS-compatible endpoints; confirmed permissions; and a reviewed destination-specific execution wrapper. Record actual target facts first so the owner can approve a concrete test. General autonomous-development approval does not authorize a remote write test.

`npm run smoke:foundation` and [smoke-environment.mjs](../../scripts/smoke-environment.mjs) intentionally accept only disposable loopback services. They are not remote deployment tools. Do not weaken their guards, point them at remote targets or copy their local emulator bucket-creation behavior into a remote test. Before execution, the maintainer must prepare and audit a separate destination wrapper with exact app/database/storage destination checks, bounded timings, safe redirect handling, protected authentication, a unique fixture marker and exact cleanup. That wrapper is not created or authorized by this document. If it or any prerequisite is missing, the remote workload remains pending.

Once all prerequisites and exact operations are approved:

1. Record the source Git commit, destination alias, observed runtime/limits and redacted evidence references. Rebuild that same committed source/lockfile in the **existing isolated test app slot**, following the portable procedure. Use destination environment settings without rewriting the application. Apply only the committed schema migration to the explicitly approved disposable PostgreSQL target; no production database migrations. Start only that test application through its existing process management.
2. Generate the same deterministic **960 × 600 RGB PNG** used by the local coordinator. Use one UUID marker `foundation-smoke-<uuid>`, title `SYNTHETIC TEST ONLY — <marker>`, and filename `<marker>.png`. Record actual original byte length; it must be below the foundation's **5 MiB** upload cap. Do not claim a measured size before execution.
3. Through Payload's authenticated/authorized maintainer procedure, create only that one `foundation-fixtures` record and upload the PNG into the existing isolated external storage. Read the record back from PostgreSQL and match its title/identity. Verify the external original equals the generated bytes and the `card` derivative is **640 × 400**, nonempty and smaller than the PNG. Record original/processed byte counts and processing elapsed time. Include multipart overhead in the measured request-body bytes where an HTTP upload is used; a Payload Local API upload has no HTTP body-size result, so label it accordingly rather than inventing one.
4. Request the approved public test route `/` and processed file route, verifying the synthetic title, processed image URL, HTTP success and expected bytes. Check `/admin` responds through safe same-origin redirects; this proves the authentication surface only, not a staff login workflow. Read the synthetic fixture through the public API. Check an anonymous PATCH to this exact fixture is rejected with 401/403 and leaves its title unchanged; this attempted API operation is part of the exact approval scope. Verify no secrets/database configuration/private endpoint details appear publicly. Record route statuses and elapsed request times.
5. Stop/restart **only the isolated test application**, retaining its external database and objects. Re-read the record, original and derivative and repeat public delivery checks after restart. Record observed persistence and startup time; distinguish this restart test from any untested redeploy/disk-persistence behavior. Record explicit process/storage limits from account evidence separately from measured timings and failures.
6. Remove only the fixture whose UUID/title/ID match this run and its exact generated original/derivative objects. Verify their absence and stop only the process owned by this test. If an upload fails midway, use the same marker to find only this run's record/objects; a mismatch, ambiguity or cleanup error stops deletion and is reported. Never delete a database, bucket, shared volume, account, application foundation or unrelated record/object. No broad prefix purge or production cleanup is allowed.

No changes to WordPress, production hosting, DNS, shared account settings, firewall/allowlists or OS policy are covered. Any such requirement stops this protocol for separate review and specific approval. If evidence later shows Exabytes cannot support the workload, report the exact incompatibility and retain the approved portable architecture (D-12/D-13).

For a second host, first obtain confirmed availability and authorization for that existing isolated resource and its same operations. Rebuild the **same source revision** with that destination's environment values and repeat this workload/evidence capture. No available resource means a documented procedure with pending deployment proof; no host or account is provisioned under this record.

## Results kept separate

| Destination/check | Status on 1 October 2026 | Evidence and precise gap |
|---|---|---|
| Local production build/type checks and 11 configuration/safety tests | Pass, local only | Prior [Plan 01-03 summary](../../.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-03-SUMMARY.md) and [STATE](../../.planning/STATE.md); not rerun for this documentation task |
| Local full migration/PostgreSQL/GCS/upload/public/API/Admin/restart integration | Pending | Disposable loopback PostgreSQL and compatible object endpoint not demonstrated; generated migration unapplied; no integrated timing/persistence result |
| Actual Exabytes capabilities | Pending | Every checklist row above not provided; account not reviewed |
| Actual Exabytes synthetic workload (PORT-05) | Pending | Exact approval not provided; isolated slot, existing non-chargeable database/storage endpoints and audited destination wrapper not confirmed |
| Second-host rebuild/workload (PORT-04) | Pending | Availability unknown; evidence, authorization and safe existing destinations not confirmed |
| Actual host findings (PORT-06) | Pending | Checklist/protocol prepared; actual capability/workload evidence still absent |

No host-specific pass or failure is recorded. A declined test and unavailable evidence are possible owner responses, **not responses already received**. Approval status is currently **not provided**.

For each eventual destination run record: source commit; evidence references/dates; Node/npm/OS versions; explicit process, CPU/RAM, disk, request size/time and network limits; actual original/request/processed bytes; build/start/upload/public/API/Admin timings and statuses; restart persistence; exact cleanup outcome; error stage and redacted error description; and remaining unknowns. Use **pass** only for an observed completed check, **fail/unsupported** only with actual evidence, and **pending** for absent prerequisites or unrun checks. Local results never establish an Exabytes or second-host result.

## Owner checkpoint response

Provide the redacted descriptions/screenshots for the checklist, and answer:

- Exact isolated Exabytes synthetic test: **approve / decline / unavailable**. Approval must identify the existing isolated slot and non-chargeable test services after their facts and destination wrapper are confirmed; approval without safe targets leaves execution pending.
- Already available compatible second-host resource: **yes / no / unknown**, with redacted capability/isolation descriptions if yes. Availability alone does not grant test writes.

No passwords, tokens, keys, connection strings or service-account files are requested. The maintainer handles technical execution after the required evidence and exact approval, preserving decisions D-01–D-04, D-06, D-08–D-09 and D-12–D-13 in the [Phase 1 context](../../.planning/phases/01-portable-foundation-and-exabytes-feasibility/01-CONTEXT.md).
