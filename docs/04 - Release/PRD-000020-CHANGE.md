# PRD-000020-CHANGE

## Short Name

Remove Browser Mode Paths

## Goal

Remove Quill's broader browser-mode code paths so the product is shaped around the packaged desktop executable as the supported end-user runtime.

## Context

Quill now targets a packaged desktop executable for end users, but parts of the codebase still preserve browser-mode behavior and fallback logic. That extra runtime branch adds product ambiguity, increases maintenance surface area, and can distort decisions in nearby features even when browser mode is not part of the intended shipped experience.

## Scope

In:

- remove browser-only file paths while preserving desktop workflows
- make the desktop-only baseline explicit in code and docs
- keep a bridge-mocked browser test harness and WebView APIs used by desktop features

Out:

- changing desktop file behavior beyond this cleanup
- unrelated rewrites or a browser-hosted product
- removing WebView APIs still used by desktop features

## Plan

- Require `window.QuillDesktop`; disable file controls and show an error when it is incomplete.
- Route files, Recent, local images, and version lookup through the desktop bridge. Store Recent as `{ filePath, fileName, isAvailable }` and ignore legacy handle entries.
- Remove browser pickers, downloads, hidden file input, handle state, IndexedDB, and browser-specific messages while preserving cancellation, dirty-state, and error behavior.
- Replace `web:dev` with a bridge-mocked smoke command and update the built-in guide, `quill.md`, and Tauri docs.

## Acceptance Criteria

- **AC-01:** The packaged app starts normally with all file controls enabled.
- **AC-02:** Load opens the chosen file; cancelling leaves the document unchanged.
- **AC-03:** Save updates the current file, Save As creates a new one, and success clears the dirty marker; cancelling changes nothing.
- **AC-04:** Recent lists up to ten paths, reopens valid files, and reports unavailable files without disrupting the editor.
- **AC-05:** Images, New, themes, editing, preview, outline, confirmations, and version display still work.
- **AC-06:** Outside Tauri, file controls are disabled with a clear message and no browser fallback.

## Verification

- Search for removed browser APIs, handle storage, hidden file input, browser messages, and `web:dev`; expect no runtime matches.
- Run the mocked smoke harness with a complete, absent, and incomplete bridge; cover the acceptance criteria and confirm no fallback.
- Run `npm run build`.

Manual desktop cases:

| Test Case Number | Acceptance Criteria | Product Version | Test Case Description | Test Case Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | 1.0.4 | Run `npm run tauri:dev`; confirm Quill opens and Load, Save, Save As, and Recent are enabled. | complete | [PRD-000020-TC-01.md](../90%20-%20Evidence/PRD-000020-TC-01.md) |
| TC-02 | AC-02 | 1.0.4 | Load a Markdown file and confirm its content appears; cancel a second load and confirm the document is unchanged. | complete | [PRD-000020-TC-02.md](../90%20-%20Evidence/PRD-000020-TC-02.md) |
| TC-03 | AC-03 | 1.0.4 | Edit and save a loaded file; confirm the file contains the edit and Quill clears the dirty marker. | complete | [PRD-000020-TC-03.md](../90%20-%20Evidence/PRD-000020-TC-03.md) |
| TC-04 | AC-03 | 1.0.4 | Save an edit as a new file. Confirm the new file is saved and the new filename is shown in the main screen. Reopen the old file and verify it has not changed. | complete | [PRD-000020-TC-04.md](../90%20-%20Evidence/PRD-000020-TC-04.md) |
| TC-05 | AC-04 | 1.0.4 | Open more than ten files; confirm Recent keeps ten, reopens a valid file, and reports a missing file without changing the document. | complete | [PRD-000020-TC-05.md](../90%20-%20Evidence/PRD-000020-TC-05.md) |
| TC-06 | AC-05 | 1.0.4 | Confirm New, themes, editing, preview, outline, unsaved-change confirmation, version display, and inline images work. | complete | [PRD-000020-TC-06.md](../90%20-%20Evidence/PRD-000020-TC-06.md) |
| TC-07 | AC-05 | 1.0.4 | Open Markdown with a relative image beside the document and confirm the image renders. | complete | [PRD-000020-TC-07.md](../90%20-%20Evidence/PRD-000020-TC-07.md) |
| TC-08 | AC-06 | 1.0.4 | Open `code/quill.html` outside Tauri; confirm file controls are disabled, the runtime message appears, and no picker or download starts. | complete | [PRD-000020-TC-08.md](../90%20-%20Evidence/PRD-000020-TC-08.md) |

## Next Step

Release record complete; commit and ship from `main` under the repository release guardrails.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-16T23:32:16.5377845Z | Backlog |
| 2026-07-24T23:29:36.9155757Z | Plan |
| 2026-07-24T23:50:43.3501394Z | Implement |
| 2026-07-25T14:50:23.3962029Z | Test |
| 2026-07-25T23:19:49.0509438Z | Release |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-16T23:32:16.5377845Z | Scope discovery | Added as a backlog item after deciding Quill should be treated as a packaged desktop app for end users and that the broader browser-mode code paths should be removed in a separate change. |
| 2026-07-16T23:32:16.5377845Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
| 2026-07-24T23:29:36.9444991Z | Promotion | Promoted to `Plan` with user approval. |
| 2026-07-24T23:34:11.2705724Z | Planning | Defined bridge-only files, path-only Recent, mocked smoke testing, and verification. |
| 2026-07-24T23:40:21.4110181Z | Decision | Keep no production browser file workflow; retain mocked browser tests and desktop-useful WebView APIs. |
| 2026-07-24T23:42:55.8225955Z | Acceptance refinement | Made acceptance end-user testable; kept technical checks in `Verification`. |
| 2026-07-24T23:50:43.3951012Z | Promotion | Promoted to `Implement` with user approval. |
| 2026-07-25T14:38:27.4439496Z | Implementation | Added the bridge guard and path-only Recent model; removed browser file paths; updated the smoke harness and docs. |
| 2026-07-25T14:38:27.5627691Z | Verification | Syntax and static checks passed. Complete, absent, and incomplete bridge smoke checks passed with no fallback. The isolated production build and NSIS bundle succeeded; manual desktop acceptance remains for `Test`. |
| 2026-07-25T14:50:23.4444840Z | Promotion | Promoted to `Test` with user approval. |
| 2026-07-25T15:23:33.7069450Z | Test planning | Added concise manual cases for every acceptance criterion. |
| 2026-07-25T15:46:28.0871389Z | Test evidence | Marked `TC-01` complete with a screenshot showing Quill open and its desktop file controls enabled. |
| 2026-07-25T16:16:25.6889074Z | Test evidence | Recorded passing load evidence for `TC-02`; cancellation remains open. |
| 2026-07-25T16:19:29.8555999Z | Test evidence | Marked `TC-02` complete after cancellation left the loaded file and content unchanged. |
| 2026-07-25T16:27:21.2493878Z | Test evidence | Marked `TC-03` complete after Save retained the edit and cleared the dirty indicators. |
| 2026-07-25T16:43:57.2707610Z | Test evidence | Marked `TC-04` complete after Save As preserved the edit in the copy and left the original unchanged. |
| 2026-07-25T22:19:03.3110614Z | Test evidence | Recorded the ten-file Recent limit for `TC-05`; reopen and missing-file checks remain open. |
| 2026-07-25T22:20:47.9990843Z | Test evidence | Recorded valid Recent reopening for `TC-05`; missing-file handling remains open. |
| 2026-07-25T22:27:36.6488922Z | Test evidence | Marked `TC-05` complete after a renamed file became unavailable without disrupting the current document. |
| 2026-07-25T22:33:00.5828441Z | Test evidence | Marked `TC-07` complete after relative images rendered inline in Quill. |
| 2026-07-25T22:37:40.9458018Z | Test evidence | Marked `TC-08` complete after non-Tauri controls and messaging matched the no-fallback smoke result. |
| 2026-07-25T22:42:12.0486773Z | Acceptance refinement | Removed the end-user documentation check and `TC-09`; packaged-app users do not exercise that path. |
| 2026-07-25T22:48:45.7714549Z | Test evidence | Recorded the New action for `TC-06`; remaining regression checks stay open. |
| 2026-07-25T23:01:39.6632517Z | Acceptance refinement | Removed AutoSave from `AC-05` and `TC-06`; its replacement behavior is tracked in `PRD-000023-CHANGE`. |
| 2026-07-25T23:04:02.2862661Z | Test evidence | Recorded dark and light theme cycling for `TC-06`; remaining regression checks stay open. |
| 2026-07-25T23:09:57.1325300Z | Test evidence | Recorded preview, outline, version display, and inline image rendering for `TC-06`; editing and confirmation remain open. |
| 2026-07-25T23:13:10.1366285Z | Test evidence | Recorded inline editing and dirty-state behavior for `TC-06`; unsaved-change confirmation remains open. |
| 2026-07-25T23:18:13.2663330Z | Test evidence | Marked `TC-06` complete after the Recent-file unsaved-change confirmation flow passed. |
| 2026-07-25T20:53:18.8487993Z | Test metadata backfill | Added product version `1.0.4` to every planned test case and completed evidence record so the version under test is explicit. |
| 2026-07-25T23:19:49.1009149Z | Promotion | Promoted to `Release` with user approval after all eight test cases completed. |

## Legacy Notes

- Product version `1.0.4` was added retrospectively to the existing test cases and evidence records on 2026-07-25. Original test timestamps and outcomes were not changed.
