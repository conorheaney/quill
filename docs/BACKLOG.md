# Quill Backlog

## Rules

- Refuse to implement any code change unless it is tied to a backlogged PRD entry and the relevant detailed item plan is already in place.
- Use IDs in the format `PRD-NNNN-{CLASS}`.
- Record every item here first.
- Create a matching file in `docs/00 - Backlog/`.
- Track overall status here.
- Move the matching file through `01 - Plan`, `02 - Implement`, `03 - Test`, and `04 - Release`.
- `Blocked` items stay in `In Progress` until they can move again.
- If the backlog phase and folder location disagree, this file wins and the PRD file should be moved immediately.
- Every PRD file should include `Short Name`, `Goal`, `Context`, `Scope`, `Next Step`, and `Notes`.

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

## In Progress

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |

## Done

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| PRD-0001-TECH | TECH | Split UI Controller | Done | Release | Reshape the app around a Shell plus Outline Pane, Markdown Pane, and Preview Pane components, including HTML and code naming cleanup. |
