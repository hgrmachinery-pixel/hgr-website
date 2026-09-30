# Model routing policy

## Purpose and priority

Reduce unnecessary model and credit usage while preserving quality. Quality, security and correctness take priority over credit savings.

Read this policy together with `AGENTS.md`, the approved project requirements and the applicable GSD plans. It controls model/task routing only: it does not change the approved architecture, scope, quality checks, workflow checkpoints or owner-approval rules. Current owner instructions and higher-priority runtime instructions take precedence.

## GPT-6.1 Sol — decisions, supervision and important review

Use GPT-6.1 Sol for:

- Architecture and technical decisions.
- GSD planning and interpretation.
- Database and schema decisions.
- Payload CMS architecture.
- Security, authentication and authorization.
- Private JPJ and document handling.
- Infrastructure and deployment.
- Exabytes decisions.
- PostgreSQL and storage decisions.
- Dependency and framework decisions.
- Difficult debugging.
- Ambiguous requirements or conflicting instructions.
- Changes affecting more than one roadmap phase.
- Destructive or irreversible operations, subject to owner approval.
- Final review of important implementation.
- Anything high-risk or uncertain.

Sol supervises important work and reviews important Luna-produced changes before they are accepted. Sol's review must check the approved requirements, changed files, relevant test results, security/privacy implications and scope. Passing automated checks alone does not replace this review.

## GPT-6 Luna — bounded, straightforward work

Use GPT-6 Luna for:

- Repository searches and reading straightforward files.
- Summarizing logs.
- Repetitive or mechanical edits and formatting.
- Boilerplate and simple documentation.
- Simple CSS changes.
- Straightforward TypeScript cleanup.
- Repetitive test creation from already decided acceptance criteria.
- Lint cleanup.
- Checking files and outputs.
- Gathering information for Sol.
- Implementation whose design and requirements have already been explicitly decided.

These tasks qualify for Luna only while their scope is clear and their risk is low. A task's label does not override its actual implications: boilerplate for authentication, document access or deployment still requires Sol's decisions and supervision. Gathering public documentation or non-sensitive repository facts for Sol may remain a bounded Luna task.

## Delegation and credit discipline

When delegation is permitted and supported, Sol may assign bounded Luna subtasks within already authorized work. Do not start unrelated tasks, create separate user-owned chats, or expand project scope to apply this policy.

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

Report what was attempted, the affected files, the non-sensitive evidence/error, the unresolved decision and any existing changes. Preserve work for review; do not guess, broaden the task, keep retrying an uncertain operation or treat escalation as approval. Sol resolves the technical issue and requests the owner's approval where required before dependent work continues.

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

Where the active runtime supports explicit model selection for a delegated task, request the actual model ID: `gpt-6.1-sol` or `gpt-6-luna`. Check the available tool/configuration contract before dispatch; a role name or a prompt saying "act as Luna" does not change the model. Pass model overrides using the supported mechanism and confirm the selected model where the runtime exposes that information. Never claim a model switch or credit saving that has not been established.

For the current native collaboration tool, explicit model overrides require a fresh or partial context fork (`fork_turns: "none"` or a supported positive turn count); a full-history fork inherits the parent model. Supply the necessary repository instructions and task context explicitly when using a fresh fork. Recheck this constraint in future sessions because tool capabilities can change.

This Markdown policy is instructional. It does not install an automatic classifier, switch the active chat model, enforce a budget, restrict an agent's tools or create a technical approval/review gate. Explicit dispatch/configuration can select a model; task-risk classification, escalation and Sol review require the supervising agent to follow this policy unless separate enforcement is implemented.

At adoption on 30 September 2026, `.planning/config.json` uses `model_profile: "inherit"`, `resolve_model_ids: "omit"` and `parallelization: false`, with no per-agent model overrides. The installed GSD resolver therefore does not select different models for executor/planner tasks by default. Sequential execution does not itself prevent a supported explicit model selection, but this policy alone does not configure one. Do not map every GSD executor task to Luna: an executor role can include high-risk work.

## Configured implementation routing

Repository `.codex/config.toml` sets the lead/default model and default subagent model to `gpt-6.1-sol`. It keeps the existing hooks, enables agents, and allows a depth of two: lead Sol → Sol GSD executor → bounded Luna worker. Existing GSD roles continue to inherit Sol; `.planning/config.json`, finalized plans and GSD core/runtime files are unchanged by this setup.

The officially supported project custom agent `.codex/agents/worker.toml` defines the `worker` role as `gpt-6-luna` with `medium` reasoning effort and bounded-task/escalation instructions. It takes precedence over the built-in worker when project custom agents are loaded. Use this role only for suitable routine subtasks. Reading/log inspection can be assigned to the same worker with explicit read-only instructions; it does not require another agent definition.

During `$gsd-execute-phase 1`, Sol interprets the plans, makes all important decisions and retains responsibility for verification and close-out. Sol chooses useful bounded subtasks, supplies the decided design and file ownership, waits for their results, checks relevant outputs/tests and reviews important changes before acceptance. If a Sol GSD executor cannot spawn a nested worker in the active session, it returns the bounded assignment to the lead Sol for direct dispatch; do not bypass GSD's isolation or checkpoint rules. Tiny tasks may stay with Sol.

For the current callable native tool, dispatch a bounded worker with `agent_type: "worker"`, `model: "gpt-6-luna"`, `reasoning_effort: "medium"` and `fork_turns: "none"`, plus its task message and required repository reading. Explicit model/effort arguments make the current-session dispatch independent of whether the newly written custom role/defaults have been reloaded. Fresh forks must be given the worker boundaries from this file if the custom worker definition is not yet active. GSD planning/execution/verification agents remain Sol; do not replace a GSD role with a routine worker.

This is agent-decided routing using a real per-subtask model selection, not an automatic risk classifier. Owner authorization to delegate suitable routine implementation subtasks is already provided for Phase 1; no repeat delegation permission is needed within that scope. New decisions and restricted operations still require the normal escalation and approval process.

Project configuration applies only when the repository is trusted and loaded. Live model selections or higher-priority runtime overrides may supersede defaults. A file edit cannot change the model of an already-running lead chat; keep that chat on GPT-6.1 Sol. The owner does not need to switch to Luna for workers. Unavailable models, role reloads, depth limits or runtime restrictions must be reported rather than disguised as successful routing.

Official configuration references: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) and [project configuration](https://learn.chatgpt.com/docs/config-file/config-basic). Configuration does not grant approval for installation, Phase 1 implementation, Exabytes writes or any other pending checkpoint.

If the requested model or delegation is unavailable, report that limitation. Routine safe work may be completed with the available Sol model when permitted; work requiring Sol must wait for Sol supervision/review if only Luna is available. Preserve owner-approval and GSD checkpoints in every case.
