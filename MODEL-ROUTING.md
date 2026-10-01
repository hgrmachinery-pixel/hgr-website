# Model routing policy

## Purpose and priority

Use GPT-6 Luna as the default HGR lead and implementation model to reduce usage while preserving quality. Use GPT-6.1 Sol selectively for escalation, specialist judgment and important risk review. Quality, security and correctness take priority over credit savings.

Read this policy together with `AGENTS.md`, the approved project requirements and the applicable GSD plans. It controls model/task routing only: it does not change the approved architecture, scope, quality checks, workflow checkpoints or owner-approval rules. Current owner instructions and higher-priority runtime instructions take precedence.

## GPT-6 Luna — default lead and implementation model

Use Luna by default for:

- Reading and searching repository files; ordinary GSD execution; implementing approved plans; straightforward Next.js and Payload work where decisions are settled; CSS and responsive work from approved specifications; boilerplate and repetitive code; routine TypeScript, tests, lint and formatting; documentation; running commands and interpreting ordinary output; package operations already approved; ordinary debugging; permitted Git/GSD operations; progress reporting; and routine verification.

Routine reversible changes that follow approved requirements and pass the checks appropriate to the change may be completed by Luna without a separate Sol review. Sol does not review every Luna-produced change.

## GPT-6.1 Sol — escalation, specialist judgment and risk review

Invoke Sol for:

- New or consequential architecture; serious ambiguity or conflicting requirements; security/privacy architecture; authentication/authorization decisions; private JPJ/document protection; significant database/schema decisions with downstream consequences; production infrastructure/deployment and Exabytes compatibility; destructive/irreversible actions; material deviation from approved plans; difficult debugging after reasonable Luna attempts fail; owner-approval decisions; and important security/architecture-sensitive final review.

Task labels do not override actual risk: apparently routine work that touches these areas must be escalated.

## Delegation and credit discipline

When delegation is useful and supported, the Luna lead may assign bounded Luna subtasks within already authorized work. Do not start unrelated tasks, create separate user-owned chats, or expand project scope to apply this policy.

Before delegation, specify the decided design, exact responsibility/files, acceptance criteria, required checks and escalation boundaries. Give Luna only the context needed, excluding secrets and private business documents. When agents share a checkout, tell each worker that others may be editing it and that it must preserve their changes.

Prefer a small number of useful subtasks. Batch related mechanical work where safe; avoid delegating a trivial action when dispatch and repeated context reading would cost more than doing it directly. Do not split important decisions across cheaper agents merely to save credits.

## Escalation from Luna to Sol

Luna must stop the affected subtask and escalate to Sol if it encounters:

- Ambiguity or conflicting requirements.
- Architectural implications or cross-phase changes.
- Security or privacy issues.
- Unexpected failures or difficult debugging.
- Deployment or infrastructure uncertainty.
- Destructive or irreversible operations.
- Anything requiring owner approval.
- Any other high-risk or uncertain condition.

Report what was attempted, the affected files, the non-sensitive evidence/error, the unresolved decision and any existing changes. Preserve work for review; do not guess, broaden the task, keep retrying an uncertain operation or treat escalation as approval. The supervising lead invokes Sol for specialist judgment. Sol identifies any owner approval required before dependent work continues; model selection itself never grants approval.

## Owner approval and privacy boundaries

Sol and Luna both follow the existing approval rules. Model choice, delegation and Sol review do not grant permission for restricted actions.

- Exabytes remains read-only unless the owner explicitly approves the exact write/change test. No Exabytes production changes without explicit owner approval.
- No changes to the existing WordPress production environment without explicit owner approval for the specific change.
- No DNS changes without explicit owner approval.
- No paid or potentially chargeable resources, accounts, subscriptions, databases, storage, cloud services or hosting resources without explicit owner approval.
- No exposure of private information without explicit owner approval and compliance with the existing privacy rules. Private JPJ/ownership originals must never be public; only a separate redacted derivative may be displayed after explicit approval and human review. Never request or place secrets in tracked files or planning records.
- No irreversible infrastructure changes or deletion of production data without explicit owner approval.

Use fake, disposable data for representative tests. Keep the permanent application foundation and approved PostgreSQL/external-storage architecture intact. All other `AGENTS.md` safety rules remain in force.

## Technical support and enforcement limits

Where the active runtime supports explicit model selection for a delegated task, use the actual model ID `gpt-6-luna` for routine work and `gpt-6.1-sol` for escalation. Check the available tool/configuration contract before dispatch; a role name or prompt alone does not change the model. Pass model overrides using the supported mechanism and confirm the selected model where the runtime exposes it. Never claim a model switch or credit saving that has not been established.

For the current native collaboration tool, explicit model overrides require a fresh or partial context fork (`fork_turns: "none"` or a supported positive turn count); a full-history fork inherits the parent model. Supply the necessary repository instructions and task context explicitly when using a fresh fork. Recheck this constraint in future sessions because tool capabilities can change.

This Markdown policy is instructional. It does not install an automatic classifier, switch the active chat model, enforce a budget, restrict an agent's tools or create a technical approval/review gate. Explicit dispatch/configuration can select a model; task-risk classification, escalation and Sol review require the supervising agent to follow this policy unless separate enforcement is implemented.

`.planning/config.json` retains the approved GSD workflow settings. Model selection for the lead and agents is configured through supported Codex project and agent configuration, not by modifying GSD core or weakening its workflow gates.

## Configured implementation routing

Repository `.codex/config.toml` sets the lead/default model to `gpt-6-luna` at low reasoning effort and sets Luna/low as the default for spawned agents. It keeps existing hooks, enables agents and allows a depth of two. The `gsd-executor` explicitly uses Luna/low and the `gsd-code-reviewer` uses Luna/medium; other ordinary GSD agents inherit the Luna/low default. The `gsd-security-auditor` explicitly uses Sol/high. GSD review, verification, security and other workflow gates remain enabled; their presence does not mean Sol must review routine work. `.planning/config.json`, finalized plans and GSD core/runtime files are not changed for model routing.

The project custom agent `.codex/agents/worker.toml` defines the `worker` role as `gpt-6-luna` with `low` reasoning effort and bounded-task/escalation instructions. Use it for appropriate routine subtasks, not for work that needs Sol's judgment.

During `$gsd-execute-phase 1`, Luna performs ordinary plan implementation, commands, relevant checks and routine close-out work. It must preserve plan scope, GSD isolation and checkpoints. Escalate a consequential decision or high-risk finding to Sol; resume only when that judgment is resolved.

For native collaboration tasks, explicitly request Luna (`agent_type: "worker"`, `model: "gpt-6-luna"`, `reasoning_effort: "medium"`, `fork_turns: "none"`) for suitable bounded subtasks. To escalate, spawn or dispatch a fresh/partial-context Sol task using `model: "gpt-6.1-sol"` and the supported reasoning effort, with the relevant evidence and exact decision/review question. Supply necessary repository context when the fork does not inherit it. If the runtime cannot honor the requested model, report that limitation.

This is configured default routing plus lead judgment, not an automatic risk classifier. Delegation permission, model selection and successful checks do not replace owner approval or a GSD blocking-human checkpoint.

Project configuration applies only when the repository is trusted and loaded. Live model selections or higher-priority runtime overrides may supersede defaults. A file edit cannot change the model of an already-running chat: start a new chat with Luna selected, or switch the active chat to Luna where supported, for Luna-led implementation. Unavailable models, role reloads, depth limits or runtime restrictions must be reported rather than disguised as successful routing.

Official configuration references: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) and [project configuration](https://learn.chatgpt.com/docs/config-file/config-basic). Configuration does not grant approval for installation, Phase 1 implementation, Exabytes writes or any other pending checkpoint.

If the requested model or delegation is unavailable, report that limitation. Routine safe work may proceed with the available model when permitted; work requiring Sol's judgment must wait until Sol is available. Preserve owner-approval and GSD checkpoints in every case.
