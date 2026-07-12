# Quill Backlog

## Rules

- Refuse to implement any code change unless it is tied to a backlogged PRD entry and the relevant detailed item plan is already in place.
- Use IDs in the format `PRD-NNNN-{CLASS}`.
- Record every item here first.
- Create a matching file in `docs/00 - Backlog/`.
- Creating the PRD file counts as the move into `Backlog` and should be recorded in `History`.
- Track overall status here.
- Move the matching file through `01 - Plan`, `02 - Implement`, `03 - Test`, and `04 - Release`.
- `Blocked` items stay in `In Progress` until they can move again.
- If the backlog phase and folder location disagree, this file wins and the PRD file should be moved immediately.
- Every PRD file should include `Short Name`, `Goal`, `Context`, `Scope`, `Next Step`, `History`, and `Audit`.
- `History` and `Audit` should both be maintained as tables.
- Any timestamp fields should be recorded in UTC format.
- `History` is only for stage transitions and should store the UTC timestamp plus the end stage only.
- `Audit` is for other timestamped audit information such as decisions, evidence, risks, approvals, and exceptions.
- Do not invent old timestamps when backfilling legacy PRD files. Leave `History` empty if needed and explain the gap in `Audit`.

## Status

- `Proposed`
- `Planned`
- `In Progress`
- `Blocked`
- `Done`

## Backlogged

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-0002-TECH | TECH | Add Core Tests | Proposed | Backlog | Add automated coverage for Markdown parsing, block conversion, and persistence behaviour. |
| PRD-0003-CHANGE | CHANGE | Remove Cache Busting | Proposed | Backlog | Remove static asset query-string cache busting once the app's loading and release approach is settled. |
| PRD-0004-UI | UI | Accessibility Pass | Proposed | Backlog | Review keyboard behaviour, focus handling, labels, and error feedback across the editor and preview flows. |
| PRD-0007-TECH | TECH | Remove Electron Runtime | Proposed | Backlog | Remove Electron-specific app code, packaging, and leftover filesystem artifacts after the replacement runtime and launch path are defined. |
| PRD-0008-TECH | TECH | Refactor Stylesheet Structure | Proposed | Backlog | Reshape the CSS into clearer sections and ownership boundaries so shell, panes, dialogs, and theme tokens are easier to maintain. |
| PRD-0009-UI | UI | Predefined Theme Picker | Proposed | Backlog | Let users choose from a set of predefined themes instead of only cycling between the current built-in options. |
| PRD-0010-TECH | TECH | Critical Codebase Review And Refactor | Proposed | Backlog | Review the current codebase critically, document the highest-value structural issues, and carry out follow-on refactoring to improve maintainability. |

## In Progress

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |

## Done

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-0001-TECH | TECH | Split UI Controller | Done | Release | Reshape the app around a Shell plus Outline Pane, Markdown Pane, and Preview Pane components, including HTML and code naming cleanup. |
| PRD-0005-CHANGE | CHANGE | Bump App Version | Done | Release | Update the packaged app version to the semver-safe equivalent of release label `1.02`. |
| PRD-0006-UI | UI | Recent Files Picker | Done | Release | Let users quickly reopen one of the 10 most recently opened files. |
