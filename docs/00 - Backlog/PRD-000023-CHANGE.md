# PRD-000023-CHANGE

## Short Name

Make AutoSave Persist Open Files

## Goal

Make AutoSave write changes to the current Markdown file and clearly communicate its state.

## Context

AutoSave currently writes to WebView storage after 220 ms, but the draft is never restored and does not update the open file. The control therefore suggests protection it does not provide.

## Scope

In:

- save changes to an established file path through the desktop bridge
- keep untitled documents unsaved until Save As establishes a path
- show clear saving, saved, and failure states
- tune the interval and retire misleading local-draft behavior

Out:

- automatic Save As prompts
- version history, cloud sync, or backup management

## Plan

- During Plan, define safe write timing, UI states, failure handling, and the replacement for current draft storage.

## Acceptance Criteria

- `AC-01`: AutoSave reliably updates an open file after a clear, usable delay.
- `AC-02`: Untitled documents wait for Save As.
- `AC-03`: Users can distinguish saving, saved, and failed states.
- `AC-04`: Failed saves preserve the dirty state and report the problem.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `pending` | `planned` | Define desktop tests for saved files, untitled documents, rapid edits, status feedback, and write failures during Plan. | Not yet recorded. |

## Next Step

Move to `01 - Plan` and choose the interval, state transitions, and failure behavior.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-25T23:01:39.5825409Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-25T23:01:39.6295209Z | Requirement shaping | Defined AutoSave as direct desktop-file persistence with visible status, tuned timing, and no automatic path choice for untitled documents. |
