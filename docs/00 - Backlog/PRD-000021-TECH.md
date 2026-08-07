# PRD-000021-TECH

## Short Name

TypeScript Migration For Frontend Runtime

## Goal

Plan and carry out a staged TypeScript migration for Quill's frontend runtime and desktop bridge so the codebase gains stronger type safety, clearer module contracts, and lower-risk refactoring paths.

## Context

Quill's current frontend is already split into several focused files, but it still relies heavily on browser globals, loose object shapes, and a large shell coordinator. The current structure suggests that a TypeScript migration is feasible without a full rewrite, but the migration path matters: a low-risk compile-to-JavaScript pass would be materially easier than combining the change with a deeper ES module and bundler redesign.

The exploratory pass so far suggests:

- the codebase has real module boundaries in `markdown.js`, `preview-pane.js`, `markdown-pane.js`, `outline-pane.js`, `storage.js`, `desktop-bridge.js`, and `quill-app.js`
- the most coupled areas are the browser-global wiring, DOM-heavy shell orchestration, and shared block/state shapes that are currently implicit rather than typed
- the likely highest-value early wins are explicit types for markdown blocks, preview/editor state, recent-file entries, and Tauri bridge payloads
- the hardest migration surface is likely `quill-app.js` and `preview-pane.js`, where most state orchestration and UI coordination currently live

This makes the item a technical refactor change with an exploratory planning component rather than a simple syntax conversion task.

## Scope

In:

- define the intended TypeScript migration target for the Quill frontend runtime
- review the current JavaScript module seams, browser-global dependencies, and bridge contracts
- decide whether the first migration pass should preserve the current no-bundler runtime shape or introduce a stronger module build step
- identify the safest migration sequence across leaf modules, shared domain types, and the shell coordinator
- implement the agreed migration slices once the planning pass is strong enough
- update supporting scripts or docs if the build and runtime workflow changes

Out:

- unrelated feature work
- a speculative frontend framework rewrite
- merging a TypeScript migration with broader parser or product-scope changes unless they are explicitly approved later

## Plan

- Move this item to `01 - Plan` and define the migration target architecture, first-pass tooling choice, typed domain model, lowest-risk file migration order, and the first implementation slice.

## Acceptance Criteria

- `AC-01`: Define the migration scope, sequencing rules, and completion criteria during `01 - Plan`.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `pending` | `planned` | Define the migration verification approach, build checks, and regression evidence format during `01 - Plan`. | Not yet recorded. |

## Next Step

Move this item to `01 - Plan` and decide whether Quill should start with a minimal compile-to-JavaScript TypeScript pass or a deeper module-and-build-pipeline migration, then lock the first slice around shared types and one or two leaf modules.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-17T18:28:11.8890877Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-17T18:28:11.8890877Z | Requirement shaping | Added as a backlog item from a lightweight shaping pass around converting Quill to TypeScript as a technical refactor change. |
| 2026-07-17T18:28:11.8890877Z | Exploration | Initial exploration suggests the migration is moderate overall: feasible because the frontend is already file-split, but complicated by browser-global wiring, implicit shared object shapes, and the large shell coordinator. |
| 2026-07-17T18:28:11.8890877Z | First planning target | The first planning pass should decide between a low-risk compile-to-JavaScript migration and a deeper ES module plus bundler transition before implementation work starts. |
