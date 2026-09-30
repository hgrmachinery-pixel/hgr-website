# Phase 1: Portable foundation and Exabytes feasibility - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-30
**Phase:** 1-Portable foundation and Exabytes feasibility
**Areas discussed:** Exabytes testing boundary, representative application test, deployment portability, project handoff

---

## Exabytes testing boundary

**User's choice:** Start with read-only account review. Do not change the existing Exabytes environment or WordPress site without explicit approval. If evidence is missing, identify it exactly and ask the owner; do not guess. Host-independent local work may continue while Exabytes-specific conclusions stay pending. Any write/change test needs specific approval. No unapproved purchases, upgrades, subscriptions, chargeable resources, or sharing credentials.

## Representative application test

**User's choice:** Build a minimal end-to-end slice using clearly fake, disposable data and images. The conceptual path includes Next.js, Payload CMS, PostgreSQL, external object/media storage, and public application output. Retain the application foundation as the starter for later phases; test data is disposable.

## Deployment portability

**User's choice:** Document repeatable rebuild and redeployment from the same GitHub source with environment configuration, without source rewrite or material redesign. Use a second compatible host only if already available. Ask before creating accounts or any paid/potentially chargeable infrastructure. If a second host is unavailable, document assumptions/process and leave the deployment verification pending. Use fake, disposable test data.

## Project handoff and scope

**User's choice:** Keep the foundation understandable to future Codex/GSD sessions or another developer. The owner must not need developer tools for routine inventory/content work in later phases. Technical deployment remains developer/agent work. Preserve the existing Phase 1 and V1 scope; do not bring later-phase features forward.

## the agent's Discretion

- Select the simplest maintainable local/test implementation consistent with the approved architecture and cost boundary.
- Define exact test implementation and deployment steps during research and planning.

## Deferred Ideas

- No new ideas raised; later-phase capabilities remain assigned by `.planning/ROADMAP.md`.
