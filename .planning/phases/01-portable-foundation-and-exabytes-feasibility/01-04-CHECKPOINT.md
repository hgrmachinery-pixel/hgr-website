---
phase: 01-portable-foundation-and-exabytes-feasibility
plan: "04"
status: checkpoint
checkpoint_type: human-action
gate: blocking-human
tasks_completed: 1
tasks_total: 3
task_commit: d3962ccda607807a750a12b7692c128b0cdf144e
requirements-completed: []
requirements-pending: [PORT-04, PORT-05, PORT-06]
recorded: 2026-10-01
---

# Plan 01-04 owner checkpoint

Task 1 is complete: the dated [Exabytes evidence checklist and proposed synthetic test](../../../docs/deployment/exabytes-feasibility.md) is committed as `d3962cc` (`docs(01-04): prepare hosting evidence and synthetic test protocol`). Whitespace, local documentation links and bounded checklist-completeness review passed. No application changes or external operations occurred. Local build/type checks and 11 configuration/safety tests are prior local results; full local integration and actual destination proof remain pending.

Task 2's owner response is now received. Owner supplied hosting evidence: Exabytes Business Hosting eBiz 12 Plus; Node support; Node 22.23.3; npm; production mode; `/httpdocs`; configurable startup file; custom environment variables; File Manager. Record it in `docs/deployment/exabytes-feasibility.md` as owner-reported, not independently inspected. Official Next.js, Payload and Sharp requirements and the locked engine ranges support Node 22.23.3; the project engine now permits this line alongside Node 24. The project was not built/run under Node 22, and target OS/architecture remain unverified for Sharp. Owner explicitly approved one minimal fake-data write/upload test subject to stated constraints, but confirms no PostgreSQL or object-storage test services exist. No service may be provisioned; therefore the remote test remains pending prerequisites, with no account change or write performed. Other unreported capabilities may remain `unverified`. Owner confirms no second compatible host exists. The local smoke command stopped safely at its disposable-service guard; local integration remains pending because endpoints are unavailable.

No additional approval is being requested now. The approved synthetic test cannot run unless safe existing PostgreSQL and object-storage services become available; do not create or pay for them. Do not change Exabytes settings or use its `/httpdocs` production-mode app for a test until a separate isolated slot/route is confirmed. Second-host proof is unavailable and remains pending under the owner's decision. Never request credentials, tokens, keys, connection strings or service-account files. Keep WordPress, production, DNS, account settings and chargeable provisioning untouched.

Continuation: record the resolved human response, update package/runtime documentation based on official requirements, and execute only safe local/read-only Task 3 steps. Keep PORT-05 pending because required database/storage test services do not exist; keep PORT-04 pending because no second host exists. Do not create services, weaken local smoke guards, target remote endpoints or begin Phase 2.

This checkpoint artifact is deliberately not `01-04-SUMMARY.md`: the plan is incomplete. Do not advance completion counts, mark PORT-04/05/06 complete, or create a complete summary from Task 1 alone. STATE retains three completed plan summaries and zero complete phases. The normal complete-summary/actuals/state/roadmap close-out follows only after the remaining permitted tasks and verifications are handled.

Self-check: Task 1 document exists, commit `d3962cc` exists, and no tracked deletions were included.
