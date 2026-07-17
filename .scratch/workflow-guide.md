# Workflow Guide

## Status

Draft in progress. This document is being built incrementally from the live workflow rules in `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md`.

## Audience

This guide is for software development contributors across product ownership, project management, development, and QA.

## Source Of Truth

- `WORKFLOW.md`
- `BACKLOG.md`
- `.agents/local-agent.md`

## Workflow Overview

This workflow gives each work item one backlog entry, one requirement record, and one visible lifecycle state. Work only becomes real when it is captured in both the backlog and the requirement record, then moved through the same fixed sequence:

`Backlog -> Plan -> Implement -> Test -> Release`

The goal is to keep the process lightweight while preventing the most common delivery failures: vague requests, hidden scope growth, informal status changes, weak verification, and reconstructed audit history. The same requirement record moves through every stage and is never replaced with a later-phase copy.

![Workflow lifecycle](./assets/workflow-lifecycle.png)

This visual shows the normal left-to-right path through the workflow. The most important exception is the return path from `Test` back to `Implement`, which is required whenever testing reveals more code work.

## Roles And Responsibilities

![Workflow roles](./assets/workflow-roles.png)

This visual shows the four main human roles around the workflow with only the lightest responsibility cues: Product Owner shapes scope, Project Manager maintains flow, Developer builds, and QA verifies.

### Product Owners

Product owners are responsible for making sure new work starts as a real requirement rather than an informal idea. They should focus on whether the problem is worth solving, whether the goal is clear, and whether the scope is appropriately bounded.

Typical responsibilities:

- sponsor or request a new backlog item
- help shape the initial requirement
- confirm the intended outcome
- clarify what is in scope and out of scope
- support the decision to move from `Backlog` to `Plan`

### Project Managers

Project managers use the workflow as the operational control surface. Their main concern is whether the recorded state of work matches reality.

Typical responsibilities:

- monitor the live backlog as the status view
- confirm that phase transitions are explicit
- watch for blocked or drifting items
- verify that backlog state and requirement record stay aligned
- help keep the team honest about where work really sits

### Developers

Developers use the workflow as the gate for authorized implementation. Their key concern is whether planning is good enough to support safe code changes.

Typical responsibilities:

- refuse code work unless the PRD is in `Implement`
- use the PRD as the working source for scope, plan, and verification
- record meaningful decisions and discoveries in `Audit`
- avoid silent scope growth
- create a new backlog item if a materially new requirement emerges

### QA

QA uses the workflow to make verification explicit. Their concern is whether the item was truly tested against its stated intent before being treated as done.

Typical responsibilities:

- use the `Verification` section as the test anchor
- record important evidence and outcomes
- send items back to `Implement` when more code changes are required
- help determine whether an item is genuinely ready for `Release`

## Core Workflow Objects

![Core workflow objects](./assets/workflow-core-objects.png)

### `BACKLOG.md`

`BACKLOG.md` is the canonical source of truth for PRD items, their overall status, and their current workflow phase.

It tells the team:

- which items exist
- which items are backlogged
- which items are in progress
- which items are done
- the current status and phase for each item

If the backlog disagrees with the requirement's current stage location, the backlog wins and the requirement should be moved to match it.

### The Requirement Record

The requirement record is the detailed record for one work item. It explains what the item is, why it exists, how it should be approached, how it will be verified, and what happened during the workflow.

Each PRD uses the naming format:

`PRD-NNNNNN-{CLASS}`

Examples of `{CLASS}` include:

- `BUG`
- `CHANGE`
- `TECH`
- `UI`

### The Phase Folders

The phase folders are not copies or archives. They represent the current position of the live requirement record.

- the backlog folder means the item has been captured but not yet actively planned for implementation
- the plan folder means the item is being prepared into an implementation-ready package
- the implement folder means code work is currently authorized and under way
- the test folder means implementation is complete enough to verify
- the release folder means the item has been accepted and closed out

![Workflow tracking model](./assets/workflow-tracking-model.png)

This visual shows the four workflow surfaces that must remain aligned. The backlog expresses the official state, the requirement record holds the detailed working record, `History` captures phase movement, and `Audit` captures the supporting operational trail.

## Lifecycle Walkthrough

### 00 - Backlog

![Backlog phase visual](./assets/lifecycle/backlog.png)

This is the capture phase. Work becomes real here.

To enter `Backlog`, the item must have:

- a backlog entry
- a matching requirement record in the backlog folder

The creation of the requirement record counts as the transition into `Backlog` and must be recorded in the `History` table.

What this phase is for:

- capturing a real requirement
- assigning a durable ID
- giving the team something trackable and discussable

What this phase is not for:

- coding
- implicit planning by chat alone
- vague idea parking without a PRD record

### 01 - Plan

![Plan phase visual](./assets/lifecycle/plan.png)

This is the preparation phase. The purpose is to turn a backlog item into a buildable, verifiable work package.

When an item enters `Plan`:

- the requirement moves into the plan folder
- the corresponding backlog entry is updated
- a `Plan` row is added to `History`

This phase should answer:

- what exactly is being changed
- what is deliberately not being changed
- how the work should be carried out
- how success will be tested

The workflow explicitly blocks promotion into `Implement` unless the PRD includes:

- `Plan`
- `Acceptance Criteria`
- `Verification`
- `Next Step`

### 02 - Implement

![Implement phase visual](./assets/lifecycle/implement.png)

This is the execution phase. It is the only phase in which code changes are authorized.

When an item enters `Implement`:

- the requirement moves into the implement folder
- the backlog entry moves to `In Progress`
- an `Implement` row is added to `History`

Developers should treat the requirement record as the approved work boundary. The workflow allows normal implementation learning, but it does not allow silent scope expansion.

If additional work is discovered:

- keep it in the current requirement only if it remains within scope
- create a separate backlog item if the discovery materially changes the original ask

### 03 - Test

![Test phase visual](./assets/lifecycle/test.png)

This is the verification phase.

When an item enters `Test`:

- the requirement moves into the test folder
- the backlog entry remains `In Progress`
- a `Test` row is added to `History`

This phase exists to prove that implementation actually meets the planned intent.

If testing uncovers more implementation work:

- move the requirement back to `Implement`
- update the backlog entry
- record the return transition in `History`
- only then resume code changes

The workflow deliberately separates testing from coding so that quality gates remain visible.

### 04 - Release

![Release phase visual](./assets/lifecycle/release.png)

This is the closeout phase.

When an item enters `Release`:

- the requirement moves into the release folder
- the backlog entry moves to `Done`
- a `Release` row is added to `History`

At this point the item is treated as shipped, accepted, or otherwise complete enough to close.

The released requirement record remains the durable final record for that item.

## PRD Structure

Every requirement record must include the following mandatory sections in this exact order:

1. `Short Name`
2. `Goal`
3. `Context`
4. `Scope`
5. `Plan`
6. `Acceptance Criteria`
7. `Verification`
8. `Next Step`
9. `History`
10. `Audit`

If any required section is missing, the requirement record is invalid. It must not be promoted and it must not be used to authorize code changes.

## History And Audit

This workflow separates lifecycle movement from supporting evidence. `History` records only stage transitions, while `Audit` records other timestamped events such as decisions, evidence, approvals, risks, clarifications, exceptions, and backfill notes.

![History and audit](./assets/workflow-history-audit.png)

All workflow timestamps must be recorded in UTC using `yyyy-MM-ddTHH:mm:ss.fffffffZ`, and both `History` and `Audit` should be updated when the event happens. `History` must remain chronologically true, so if a transition was missed it should not be reconstructed there later; instead, explain the gap in `Audit`, and use `Legacy Notes` when older non-standard carryover also needs to be preserved.

## Global Guardrails

These are the key rules that govern day-to-day use of the workflow:

- `WORKFLOW.md` is the canonical workflow definition
- `BACKLOG.md` is the canonical item-state definition
- refuse work that does not conform to the workflow
- never promote a requirement automatically
- new requirements must be shaped with the repo-local `grill-me` skill before they become PRD items
- if the repo-local `grill-me` skill is unavailable, new requirements should not be created
- every item must pass through `Backlog`, `Plan`, `Implement`, `Test`, and `Release`
- code changes are only allowed when the requirement is in `Implement`
- the backlog entry and requirement record must move together
- blocked items remain in `In Progress` until they can move again

## Relevant Skills

The workflow also depends on a small set of Codex skills that help enforce or support the process.

![Workflow skills](./assets/workflow-skills.png)

### `grill-me`

The repo-local `grill-me` skill is used when shaping a new requirement before it becomes a tracked requirement item. Its role is to turn a loose request into a minimally grounded backlog item without adding heavy ceremony.

Use it for:

- clarifying the real problem
- identifying scope boundaries
- surfacing the first sensible planning step

### `prd-backlog`

The repo-local `prd-backlog` skill is used when creating a new backlog item. It is a lightweight helper that reads the live workflow rules, runs a short shaping pass, and then creates the backlog entry plus matching requirement record in the approved format.

Use it for:

- adding a new requirement item to the backlog
- creating the matching requirement record in the backlog stage
- keeping the new item aligned with the live workflow rules

### `prd-promote`

The repo-local `prd-promote` skill is used when moving a requirement to its next workflow phase. It validates the current item against the live repo rules and performs the paired backlog, stage, history, and audit updates needed for a valid promotion.

Use it for:

- promoting an item from `Backlog` to `Plan`
- promoting an item from `Plan` onward once its gate is satisfied
- repairing thin mandatory sections before promotion when needed

### `prd-implement`

The repo-local `prd-implement` skill is relevant once a requirement has legitimately reached `Implement`. It is the workflow-aware implementation helper for carrying out scoped code changes without bypassing the current repo rules.

Use it for:

- checking whether a requirement is really implementation-ready
- carrying out code changes tied to an implementation-authorized requirement
- surfacing workflow blockers before code work starts

### `imagegen`

The `imagegen` skill is not part of the core delivery workflow, but it is useful for supporting materials such as this guide. It can generate clean visual aids, diagrams, and documentation graphics when the workflow needs explanatory assets.

Use it for:

- workflow diagrams
- role visuals
- phase visuals
- other documentation graphics

## How A New Item Starts

The normal flow for a new work item is:

1. Shape the requirement to a basic level using the repo-local `grill-me` skill.
2. Add a backlog entry.
3. Create the matching requirement record in the backlog folder.
4. Record the `Backlog` entry in `History` when the file is created.
5. Keep the backlog entry and requirement record aligned from that point onward.

This prevents work from becoming real in only one place.

## Handling Exceptions

This section exists for the moments when work does not move neatly from one stage to the next. The rule of thumb is simple: do not hide the problem inside informal chat, undocumented changes, or silent state drift. Put the requirement back into the right stage, update the record, and make the situation explicit.

If a requirement is still vague, shape it before treating it as real work. If planning is incomplete, keep it out of implementation. If testing finds more code work, move it back to `Implement` before coding resumes. If implementation uncovers materially new scope, create a new backlog item instead of stretching the current one beyond its approved intent. If the backlog entry, stage location, and `History` disagree, treat that as a workflow defect and correct it immediately.

## Notes On Usage

This guide is intentionally explanatory rather than normative. If anything in this guide ever conflicts with the repo rules, follow `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md`.
