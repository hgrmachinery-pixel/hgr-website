---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 1
total_count: 3
last_updated: 2026-10-01T00:03:29.640Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | tests/foundation-config.test.mjs |  | Additional runtime configuration tests blocked by Windows Application Control rejecting the approved Sharp native module; integration remains pending. | fixed |  | 2026-09-30T15:57:38.503Z | 2026-10-01T00:03:29.640Z |
| 2 | 01 | unrun-verify | scripts/smoke-foundation.mjs |  | End-to-end PostgreSQL/object-storage/public/Admin/restart smoke pending: disposable loopback PostgreSQL and compatible GCS endpoint are unavailable. | open |  | 2026-10-01T00:01:23.573Z |  |
| 3 | 01 | unrun-verify | src/migrations/20260930_235704_foundation.ts |  | Generated foundation migration has not been applied: no confirmed disposable loopback PostgreSQL service. | open |  | 2026-10-01T00:01:24.304Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "tests/foundation-config.test.mjs",
    "line": null,
    "description": "Additional runtime configuration tests blocked by Windows Application Control rejecting the approved Sharp native module; integration remains pending.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-30T15:57:38.503Z",
    "resolved_at": "2026-10-01T00:03:29.640Z",
    "milestone": null
  },
  {
    "id": 2,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "scripts/smoke-foundation.mjs",
    "line": null,
    "description": "End-to-end PostgreSQL/object-storage/public/Admin/restart smoke pending: disposable loopback PostgreSQL and compatible GCS endpoint are unavailable.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T00:01:23.573Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "src/migrations/20260930_235704_foundation.ts",
    "line": null,
    "description": "Generated foundation migration has not been applied: no confirmed disposable loopback PostgreSQL service.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T00:01:24.304Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
