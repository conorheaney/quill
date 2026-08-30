# PRD-000045-CHANGE

## Short Name

Remove AutoSave Features

## Goal

Remove Quill's automatic-saving feature and its dependent code so the application saves only when the user explicitly chooses Save or Save As, without weakening those manual workflows.

## Context

AutoSave currently presents a separate automatic-save behavior and supporting draft/persistence plumbing. The requested product direction is to remove that behavior rather than expand it into reliable open-file persistence as proposed by PRD-000023-CHANGE. This item should supersede the AutoSave-persistence proposal while preserving explicit manual Save, Save As, document loading, and intentional recovery behavior that is not dedicated to AutoSave.

## Scope

In:

- remove the AutoSave preference, toggle, status treatment, timers, callbacks, and user-facing controls
- remove AutoSave-specific draft scheduling, draft-recovery paths, persistence adapters, tests, fixtures, and documentation when they have no remaining consumer
- remove dependencies and dead code made unnecessary by the AutoSave removal
- preserve and regression-test explicit manual Save, Save As, load, dirty-state, and failure/cancellation behavior
- update the relevant PRD-000023-CHANGE disposition during planning so the two items cannot be executed as conflicting directions

Out:

- manual Save or Save As behavior and their native desktop commands
- intentional user-triggered document recovery or persistence that remains required by another feature
- unrelated persistence, recent-file, rendering, or desktop-boundary changes
- implementation work before this item is promoted through Plan and the implementation gate is opened

## Plan

During Plan, inventory every AutoSave UI, event, timer, persistence, draft-recovery, test, fixture, documentation, and dependency reference; classify each reference as removable or shared with manual Save/Save As; and define explicit regression checks for the retained manual workflows.

## Acceptance Criteria

- AC-01: AutoSave controls, settings, status indicators, scheduling, and automatic-write behavior are absent from the supported application flow.
- AC-02: Manual Save and Save As remain available and preserve their current success, cancellation, failure, dirty-state, and path-update behavior.
- AC-03: AutoSave-only timers, draft-recovery plumbing, tests, fixtures, documentation, and dependencies are removed when no retained feature consumes them.
- AC-04: Strict checks, focused regression tests, the complete test suite, frontend build, smoke verification, and packaged checks pass with no stale AutoSave references in the supported source tree.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Inventory the supported UI and runtime source to verify that AutoSave controls, settings, timers, and automatic writes are removed. | Not yet recorded. |
| TC-02 | AC-02 | pending | `planned` | Exercise manual Save and Save As success, cancellation, failure, dirty-state, and path-update workflows after the removal. | Not yet recorded. |
| TC-03 | AC-03 | pending | `planned` | Search for and test removal of AutoSave-only draft, persistence, fixture, documentation, and dependency paths without removing shared manual-save behavior. | Not yet recorded. |
| TC-04 | AC-04 | pending | `planned` | Run strict diagnostics, focused regressions, full tests, frontend build, smoke verification, packaged checks, and stale-reference searches. | Not yet recorded. |

## Next Step

Promote this item to `Plan` and resolve the relationship with PRD-000023-CHANGE before implementation planning begins.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-30T22:00:48.1207875Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-30T22:00:48.1207875Z | Requirement shaping | Created from the user's decision to remove only automatic saving. Manual Save and Save As remain in scope for preservation; AutoSave UI, scheduling, draft-recovery, dedicated persistence, tests, documentation, and unused dependencies are candidates for removal. The item explicitly supersedes the conflicting AutoSave-persistence direction in PRD-000023-CHANGE and leaves implementation for a later authorized phase. |
