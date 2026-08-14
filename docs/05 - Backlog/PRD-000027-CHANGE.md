# PRD-000027-CHANGE

## Short Name

Detect External File Changes

## Goal

Protect Quill users from continuing to edit or overwrite stale content by detecting when the currently open file has changed outside Quill and prompting them when Quill regains focus.

## Context

An open file can be modified by another editor, formatter, synchronization tool, or other external program while Quill is not focused. Quill currently needs a defined way to recognize that conflict before the user resumes editing or saves over the newer on-disk content.

## Scope

In:

- Detect an external change to the currently open file when Quill regains focus.
- Prompt the user before replacing either the in-memory document or the externally modified on-disk content.
- Provide explicit choices to reload the on-disk version or keep the current Quill version.
- Preserve unsaved Quill edits until the user makes an explicit choice.
- Avoid prompting for an unchanged file or for changes caused by Quill's own successful save.

Out:

- Automatic merging of Quill and external edits.
- Continuous background monitoring while Quill remains focused.
- Conflict handling for files other than the currently open document.
- Changes to AutoSave behavior beyond its interaction with an unresolved external-change prompt.

## Plan

During Plan, inspect Quill's window-focus, open-file, dirty-state, and save flows; select a reliable on-disk change signal; define the prompt states and actions, including external deletion or replacement; and map verification coverage before implementation is authorized.

## Acceptance Criteria

- AC-01: When the currently open file changes externally while Quill is unfocused, Quill detects the change after regaining focus and displays a prompt before silently reloading or overwriting either version.
- AC-02: The prompt offers clear actions to reload the on-disk version or keep the current Quill version, and no content is discarded before the user explicitly chooses.
- AC-03: Unsaved Quill edits remain intact while an external-change decision is pending.
- AC-04: Quill does not display an external-change prompt when the open file is unchanged or when the observed change is the result of Quill's own successful save.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Modify the open file with another program while Quill is unfocused, return focus, and verify that Quill detects the change before replacing or saving content. | Not yet recorded. |
| TC-02 | AC-02 | pending | `planned` | Exercise each prompt action and verify that reload uses the external version while keep preserves the current Quill version. | Not yet recorded. |
| TC-03 | AC-03 | pending | `planned` | Create unsaved Quill edits before an external change and verify that they remain intact until an explicit decision is made. | Not yet recorded. |
| TC-04 | AC-04 | pending | `planned` | Regain focus with an unchanged file and after a Quill-originated save, verifying that neither path produces a false prompt. | Not yet recorded. |

## Next Step

Promote the item to Plan and define the file-change signal, focus lifecycle, conflict states, and prompt behavior in implementation-ready detail.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-14T18:13:51.1894525Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-14T18:13:51.1894525Z | Requirement shaping | Created from the user's request to detect external modifications to the open file and prompt on focus return. The light shaping pass scoped the first version to the active document, explicit reload-or-keep choices, preservation of unsaved edits, and suppression of false prompts; automatic merge and continuous background watching remain out of scope. |
