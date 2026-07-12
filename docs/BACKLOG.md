# Quill Backlog

## Rules

- Refuse to implement any code change unless it is tied to a backlogged PRD entry and the relevant detailed item plan is already in place.
- Use IDs in the format `PRD-NNNNNN-{CLASS}` where `{CLASS}` can be values such as `BUG`, `CHANGE`, `TECH`, or `UI`.
- Record every item here first.
- Create a matching file in `docs/00 - Backlog/`.
- Creating the PRD file counts as the move into `Backlog` and should be recorded in `History`.
- Track overall status here.
- Move the matching file through `01 - Plan`, `02 - Implement`, `03 - Test`, and `04 - Release`.
- Never skip a stage in the PRD file's `History`. Every item must record `Backlog`, `Plan`, `Implement`, `Test`, and `Release` in order as it reaches them.
- `Blocked` items stay in `In Progress` until they can move again.
- If the backlog phase and folder location disagree, this file wins and the PRD file should be moved immediately.
- Every PRD file should include `Short Name`, `Goal`, `Context`, `Scope`, `Next Step`, `History`, and `Audit`.
- `History` and `Audit` should both be maintained as tables.
- Any timestamp fields should be recorded in UTC format.
- `History` and `Audit` entries should be recorded just in time, at the moment the event happens, not reconstructed later from memory.
- `History` is only for stage transitions and should store the UTC timestamp plus the end stage only.
- `Audit` is for other timestamped audit information such as decisions, evidence, risks, approvals, and exceptions.
- If a stage transition was missed, add the missing `History` row as soon as the gap is discovered using the current UTC time, then record in `Audit` that the timestamp is a backfill and that the original transition time is unknown.
- When backfilling multiple missed stage transitions, record a fresh UTC timestamp for each inserted `History` row.
- Do not assign the same timestamp to multiple stage transitions or audit events unless they genuinely occurred at that exact time.

## Status

- `Proposed`
- `Planned`
- `In Progress`
- `Blocked`
- `Done`

## Backlogged

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-000002-TECH | TECH | Add Core Tests | Proposed | Backlog | Add automated coverage for Markdown parsing, block conversion, and persistence behaviour. |
| PRD-000003-CHANGE | CHANGE | Remove Cache Busting | Proposed | Backlog | Remove static asset query-string cache busting once the app's loading and release approach is settled. |
| PRD-000004-UI | UI | Accessibility Pass | Proposed | Backlog | Review keyboard behaviour, focus handling, labels, and error feedback across the editor and preview flows. |
| PRD-000007-TECH | TECH | Remove Electron Runtime | Proposed | Backlog | Remove Electron-specific app code, packaging, and leftover filesystem artifacts after the replacement runtime and launch path are defined. |
| PRD-000008-TECH | TECH | Refactor Stylesheet Structure | Proposed | Backlog | Reshape the CSS into clearer sections and ownership boundaries so shell, panes, dialogs, and theme tokens are easier to maintain. |
| PRD-000009-UI | UI | Predefined Theme Picker | Proposed | Backlog | Let users choose from a set of predefined themes instead of only cycling between the current built-in options. |
| PRD-000010-TECH | TECH | Critical Codebase Review And Refactor | Proposed | Backlog | Review the current codebase critically, document the highest-value structural issues, and carry out follow-on refactoring to improve maintainability. |

## In Progress

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |

## Done

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-000001-TECH | TECH | Split UI Controller | Done | Release | Reshape the app around a Shell plus Outline Pane, Markdown Pane, and Preview Pane components, including HTML and code naming cleanup. |
| PRD-000005-CHANGE | CHANGE | Bump App Version | Done | Release | Update the packaged app version to the semver-safe equivalent of release label `1.02`. |
| PRD-000006-UI | UI | Recent Files Picker | Done | Release | Let users quickly reopen one of the 10 most recently opened files. |
| PRD-000011-BUG | BUG | Fix Fenced Markdown Load State | Done | Release | Prevent fenced code blocks from breaking preview and outline updates during file open, leaving Quill in a half-loaded state. |
