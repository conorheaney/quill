# PRD-000029-TECH

## Short Name

Make Saves Revision-Aware

## Goal

Ensure asynchronous saves cannot report newer in-memory content as clean when only an older snapshot has reached disk.

## Context

`REV-002` found that save completion clears dirty state unconditionally after an awaited write. PRD-000002-TECH now contains deterministic delayed and out-of-order save contracts, but production persistence does not yet enforce them.

## Scope

In:

- track document revisions across edits and save snapshots
- retain dirty state when a stale save completes
- handle overlapping, failed, cancelled, path-change, and document-change outcomes consistently

Out:

- draft recovery policy owned by PRD-000023-CHANGE
- unrelated persistence-store replacement

## Plan

During Plan, define the revision and save identity state machine, including the behavior of overlapping writes and active document/path changes.

## Acceptance Criteria

- AC-01: Dirty state is cleared only when the completed write corresponds to the current document revision and active path, while stale or failed completions leave an actionable unsaved state.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Run the existing latest-edit-wins persistence contract with controlled delayed and out-of-order writes against production persistence. | Not yet recorded. |

## Next Step

Promote to Plan and define the revision-aware persistence state machine and first implementation slice.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-002` in the PRD-000010-TECH code review. Existing persistence regression contracts remain under PRD-000002-TECH; this item owns the production revision and dirty-state correction. |
