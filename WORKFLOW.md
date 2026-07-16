# Quill Workflow

## High-Level Description

Quill uses a single-file PRD workflow to move work from idea to shipped change with minimal overhead. Each work item is represented by one backlog row in `BACKLOG.md` and one same-named PRD file that moves through `docs/00 - Backlog/`, `docs/01 - Plan/`, `docs/02 - Implement/`, `docs/03 - Test/`, and `docs/04 - Release/`.

## Global Workflow Guardrails

- `WORKFLOW.md` is the canonical workflow definition.
- `BACKLOG.md` is the canonical source of truth for PRD items, their overall status, and their current workflow phase.
- Refuse to do work that does not conform to this workflow, and explain the reason clearly.
- Never promote a PRD automatically. Only promote a PRD when the user explicitly executes the repo-local `prd-promote` skill for that item.
- Refuse to implement any code change unless the PRD is currently in `Implement`.
- When adding a new requirement, use the repo-local [$grill-me](C:\Users\conor\Documents\Markdown Editor\.codex\skills\grill-me\SKILL.md) skill to flesh it out to a basic level before turning it into a PRD item.
- If the repo-local `grill-me` skill is missing or broken, refuse to create a new requirement and explain that the required workflow dependency is unavailable.
- Use PRD IDs in the format `PRD-NNNNNN-{CLASS}` where `{CLASS}` can be values such as `BUG`, `CHANGE`, `TECH`, or `UI`.
- Use one PRD file per item, named exactly after the PRD ID.
- Move the same PRD file forward as the item advances. Do not create replacement PRD files for later phases.
- Every item must pass through `Backlog`, `Plan`, `Implement`, `Test`, and `Release` before it is done.
- Never skip a stage in a PRD file's `History`. Every item must record `Backlog`, `Plan`, `Implement`, `Test`, and `Release` in order as it reaches them.
- If the backlog phase and folder location disagree, `BACKLOG.md` wins and the PRD file should be moved immediately.
- `Blocked` items stay in `In Progress` until they can move again.
- Every PRD file must include `Short Name`, `Goal`, `Context`, `Scope`, `Plan`, `Acceptance Criteria`, `Verification`, `Next Step`, `History`, and `Audit`.
- If any required PRD section is missing, the PRD is invalid and must not be promoted or used for code work until fixed.
- PRD sections must appear in the same canonical order across all work items. Optional sections are only included when relevant, but when present they must keep the same relative order.
- `History` and `Audit` must both be maintained as tables.
- Any timestamp field must be recorded in UTC using the canonical format `yyyy-MM-ddTHH:mm:ss.fffffffZ`.
- Do not mix timestamp precisions across workflow docs. `History` and `Audit` entries must use the same canonical timestamp format in every PRD and related workflow document.
- `History` and `Audit` entries must be recorded just in time, at the moment the event happens, not reconstructed later from memory.
- `History` is only for stage transitions and must record the UTC timestamp and the end stage only, for example `2026-07-12T08:10:00.0000000Z | Plan`.
- `Audit` is for other timestamped audit information such as decisions, evidence, risks, approvals, exceptions, and backfill notes.
- Creating the initial PRD file counts as the move into `Backlog` and must be recorded in `History`.
- `History` must remain chronologically true. If a missed stage transition is discovered later, do not insert a reconstructed `History` row. Record the gap, inferred sequence, and what is still unknown in `Audit` instead.
- Do not assign the same timestamp to multiple stage transitions or audit events unless they genuinely occurred at that exact time.
- `Legacy Notes` is required whenever a PRD contains any backfill, chronology gap, or other non-standard historical carryover that should not live in the timestamped `Audit` table.
- Ship releases from `main` by default and create a version tag for each shipped release, for example `v1.0.2`.
- Create a dedicated release branch only when an older release line needs parallel maintenance while `main` continues toward a newer version.

## Starter

1. Add the item to `BACKLOG.md`.
2. Create the matching PRD file in `docs/00 - Backlog/`.
3. Record the `Backlog` history entry when that file is created.
4. Keep the backlog row and PRD file aligned as the item moves forward.
5. Expand the PRD during `Plan` until `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` are present and strong enough to authorize implementation.
6. Move the same PRD file through `Implement`, `Test`, and `Release`.

## PRD Section Order

Use this section order for the mandatory PRD sections.

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

## Phase 00: Backlog

### Intent

Capture a real item with enough shape to be tracked, prioritized, and promoted later without turning the backlog into a vague idea list.

### Rules

- Record every new item in `BACKLOG.md` first.
- Create the matching PRD file in `docs/00 - Backlog/`.
- The backlog row and PRD file must be created together.
- The initial PRD file creation must add a `Backlog` row to `History`.
- New requirements must be shaped with the repo-local `grill-me` skill before they become PRD items.
- Backlog items are not authorized for code changes.

### Tracking

- `BACKLOG.md` row, `Status = Proposed`, `Phase = Backlog`
- PRD file location, `docs/00 - Backlog/`
- Required PRD baseline, `Short Name`, `Goal`, `Context`, `Scope`, `Plan`, `Acceptance Criteria`, `Verification`, `Next Step`, `History`, `Audit`

## Phase 01: Plan

### Intent

Turn a backlog item into an implementation-ready work package with enough detail to build and verify it safely.

### Rules

- Move the existing PRD file into `docs/01 - Plan/` when active planning starts.
- Update the matching backlog row to show the active planning state at the same time.
- Add a `Plan` row to `History` at the moment the phase starts.
- Build the detailed item plan in the PRD before any code implementation is allowed.
- Keep planning decisions, constraints, evidence, risks, and clarifications in `Audit`.
- Do not move to `Implement` until `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` are present.
- Do not move to `Implement` until the PRD is detailed enough to guide execution and verification.

### Tracking

- `BACKLOG.md` row, `Status = Planned`, `Phase = Plan`
- PRD file location, `docs/01 - Plan/`
- Implementation gate, `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` must be present before promotion to `Implement`

## Phase 02: Implement

### Intent

Carry out the approved plan while keeping the PRD as the live record of what was built, changed, and learned.

### Rules

- Move the existing PRD file into `docs/02 - Implement/` when code work starts.
- Update the matching backlog row at the same time.
- Add an `Implement` row to `History` at the moment implementation starts.
- Only implement work that fits the approved PRD scope and approved planning sections.
- Record meaningful implementation decisions, scope clarifications, risks, and discovered exceptions in `Audit`.
- If new work is discovered during implementation, capture it in the current PRD only if it stays within scope. If it changes scope materially, create a separate backlog item instead of silently expanding the current one.

### Tracking

- `BACKLOG.md` row, `Status = In Progress`, `Phase = Implement`
- PRD file location, `docs/02 - Implement/`
- PRD maintenance, keep `Next Step`, plan details, and audit trail current as the work evolves

## Phase 03: Test

### Intent

Verify the implemented work explicitly before it is treated as release-ready.

### Rules

- Move the existing PRD file into `docs/03 - Test/` when implementation is ready for verification.
- Update the matching backlog row at the same time.
- Add a `Test` row to `History` at the moment the phase starts.
- Record the verification approach, evidence, failures, and outcomes in the PRD.
- If testing reveals more implementation work, move the PRD back to `Implement`, update the backlog row, record the new stage transition in `History`, and only then resume code changes.
- Do not move to `Release` until the planned verification is complete enough to support acceptance.

### Tracking

- `BACKLOG.md` row, `Status = In Progress`, `Phase = Test`
- PRD file location, `docs/03 - Test/`
- PRD maintenance, keep verification notes, evidence, and audit events current

## Phase 04: Release

### Intent

Close the item as shipped, accepted work with the final workflow record preserved.

### Rules

- Move the existing PRD file into `docs/04 - Release/` only after the item is accepted.
- Update the matching backlog row to its final state at the same time.
- Add a `Release` row to `History` at the moment the phase starts.
- Mark the backlog item `Done` only when the release state is real.
- Record final release notes, exceptions, tagging notes, and closing evidence in `Audit`.
- Release execution should follow the repo release guardrails in this document.

### Tracking

- `BACKLOG.md` row, `Status = Done`, `Phase = Release`
- PRD file location, `docs/04 - Release/`
- Final record, the released PRD remains the durable audit trail for the completed item
