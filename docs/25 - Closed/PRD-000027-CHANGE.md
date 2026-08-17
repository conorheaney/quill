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

Implement focus-return checking for the active document. Record the file's last-write timestamp, size, and a content identity captured after load and after each successful Quill save. When Quill regains focus, compare the current file metadata with the recorded baseline; use a timestamp difference as the inexpensive trigger, then verify the current size/content identity before treating the file as externally changed. A missing file, changed file identity, or replacement at the same path is also an external-change conflict.

If the file is unchanged, do nothing. If it changed and the in-memory document is clean, offer the same explicit conflict decision rather than silently replacing content. If it changed while Quill has unsaved edits, keep the in-memory content untouched and show a prompt with Reload External Version and Keep Quill Version actions; neither action occurs until the user chooses. Reload replaces the in-memory document with the verified on-disk version and refreshes the baseline. Keep preserves the Quill version and establishes the current on-disk state as the conflict baseline so the same change does not repeatedly prompt. A successful Quill save refreshes the baseline before the next focus check, preventing a Quill-originated write from producing a false conflict. Automatic merging, continuous background monitoring, and multi-file conflict handling remain out of scope.

## Acceptance Criteria

- AC-01: When the currently open file changes externally while Quill is unfocused, Quill detects the change after regaining focus and displays a prompt before silently reloading or overwriting either version.
- AC-02: The prompt offers clear actions to reload the on-disk version or keep the current Quill version, and no content is discarded before the user explicitly chooses.
- AC-03: Unsaved Quill edits remain intact while an external-change decision is pending.
- AC-04: Quill does not display an external-change prompt when the open file is unchanged or when the observed change is the result of Quill's own successful save.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --------- | -------- | --------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| TC-01 | AC-01 | 1.0.14 | `complete` | Modify the open file with another program while Quill is unfocused, return focus, and verify that Quill detects the change before replacing or saving content. | [PRD-000027-CHANGE-TC-01.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-01.md) |
| TC-02 | AC-02 | 1.0.14 | `complete` | Select Keep Quill Version after an external change and verify that the current Quill text and dirty state are preserved; reload coverage is recorded in TC-01. | [PRD-000027-CHANGE-TC-02.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-02.md) |
| TC-03 | AC-03 | 1.0.14 | `complete` | Open the longer [PRD-000027-CHANGE-TC-03-FIXTURE.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-03-FIXTURE.md), create distinctive unsaved Quill edits, and verify that the document value and dirty state remain unchanged while the external-change prompt is pending, before either action is selected. | [PRD-000027-CHANGE-TC-03.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-03.md) |
| TC-04 | AC-04 | 1.0.14 | `complete` | Regain focus with an unchanged file and after a Quill-originated save, verifying that neither path produces a false prompt. | [PRD-000027-CHANGE-TC-04.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-04.md) |

## Next Step

All planned verification is complete against candidate `1.0.14`; the next step is to close this PRD through explicit `prd-promote` validation.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-14T18:13:51.1894525Z | Backlog |
| 2026-08-15T22:54:35.7589717Z | Plan |
| 2026-08-15T23:06:06.7962308Z | Implement |
| 2026-08-15T23:34:12.3898872Z | Test |
| 2026-08-16T10:09:58.1030292Z | Closed |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-14T18:13:51.1894525Z | Requirement shaping | Created from the user's request to detect external modifications to the open file and prompt on focus return. The light shaping pass scoped the first version to the active document, explicit reload-or-keep choices, preservation of unsaved edits, and suppression of false prompts; automatic merge and continuous background watching remain out of scope. |
| 2026-08-15T22:54:35.7589717Z | Promotion | User confirmed promotion from Backlog to Plan after the PRD identity, structure, and workflow checks passed. |
| 2026-08-15T23:05:45.8933199Z | Plan decision | User selected timestamp-triggered verification with size/content confirmation before declaring a conflict; external deletion or replacement is treated as a conflict requiring an explicit reload-or-keep choice. |
| 2026-08-15T23:06:06.7962308Z | Promotion | User confirmed promotion after the Plan, acceptance criteria, verification, and next-step gate checks passed. |
| 2026-08-15T23:23:09.3997777Z | Implementation | Added desktop file-state inspection, focus-return conflict detection, explicit reload/keep handling, missing-file conflict representation, and automated Rust/Node coverage within the approved scope. |
| 2026-08-15T23:31:22.6693186Z | Candidate build | Created product candidate `1.0.14`, completed the Tauri release build and NSIS bundle, synchronized `quill.exe` with `src-tauri/target/release/quill-tauri.exe`, and verified matching SHA-256 `6FB7EB782DD2714D5D4A3AEE9B947B6F844D5D191E83619E2BCA436C3B7E1814`; JavaScript static checks passed. |
| 2026-08-15T23:34:12.3898872Z | Promotion | User confirmed promotion after the committed `1.0.14` candidate was verified on `main` and the Implement-to-Test gate passed. |
| 2026-08-15T23:42:22.3266434Z | Test execution | TC-01 marked `in progress` at the user's request. |
| 2026-08-15T23:52:09.0575668Z | Test evidence | TC-01 completed PASS against product version `1.0.14`; evidence recorded in [PRD-000027-CHANGE-TC-01.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-01.md). |
| 2026-08-16T03:59:27.4695612Z | Test evidence | TC-02 completed PASS against product version `1.0.14`; after selecting `KEEP QUILL VERSION`, the Quill-side text and dirty indicator remained present. Evidence recorded in [PRD-000027-CHANGE-TC-02.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-02.md). |
| 2026-08-16T04:09:18.4727238Z | Test fixture | Added [PRD-000027-CHANGE-TC-03-FIXTURE.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-03-FIXTURE.md), copied from the TC-02 fixture and extended with three Lorem Ipsum paragraphs after the heading, so TC-03 tests preservation of a longer visible document while the conflict prompt is pending. |
| 2026-08-16T04:14:02.7560991Z | Test evidence | TC-03 completed PASS against product version `1.0.14`; the external edit removed the on-disk content while Quill retained the longer document visibly unchanged beneath the pending conflict prompt. Evidence recorded in [PRD-000027-CHANGE-TC-03.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-03.md). |
| 2026-08-16T09:57:47.1312473Z | Test evidence | TC-04 completed PASS against product version `1.0.14`; supplied screenshots record Quill losing and regaining focus without displaying an external-change prompt. Evidence recorded in [PRD-000027-CHANGE-TC-04.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-04.md). |
| 2026-08-16T10:04:03.7562972Z | Test evidence | TC-04 Part 2 confirmed PASS against product version `1.0.14`; after modifying and saving content in Quill, focus was lost and regained without an external-change message. Additional screenshots recorded in [PRD-000027-CHANGE-TC-04.md](../../docs/90%20-%20Evidence/PRD-000027-CHANGE-TC-04.md). |
| 2026-08-16T10:09:58.1030292Z | Promotion | User confirmed promotion from Test to Closed after all four planned test cases completed against candidate `1.0.14` with evidence records containing exact product version and . |

