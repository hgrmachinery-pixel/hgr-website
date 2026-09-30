---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-09-30T15:57:38.503Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | tests/foundation-config.test.mjs |  | Additional runtime configuration tests blocked by Windows Application Control rejecting the approved Sharp native module; integration remains pending. | open |  | 2026-09-30T15:57:38.503Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "tests/foundation-config.test.mjs",
    "line": null,
    "description": "Additional runtime configuration tests blocked by Windows Application Control rejecting the approved Sharp native module; integration remains pending.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-30T15:57:38.503Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
