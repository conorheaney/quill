# PRD-000026-CHANGE

## Short Name

Improve Recent Files Usability

## Goal

Make the Recent Files list easier to scan and act on when files become unavailable, the current file changes, or the user needs to work with a file path outside Quill.

## Context

Recent Files currently stores up to 10 path-based entries and marks a file unavailable only after the user tries to reopen it. Successfully opened or saved files move to the top of the list, which can make the list shift unexpectedly while the user is working. The remove control sits outside the file row, and the list does not provide a direct way to copy a path or open its containing folder in Explorer.

These behaviors make stale entries harder to understand, make the current-file indicator feel unstable, and limit useful file-management actions from the Recent Files surface.

## Scope

In:

- handle missing or inaccessible recent files when the user selects them
- reduce or remove the jarring list reordering associated with the current file
- place the remove action as an overlaid control on the right side of the file item panel
- provide an action to copy a recent file's full path to the clipboard
- provide an action to open a recent file's containing folder in Windows Explorer
- use the defined toast feedback and action behavior for these operations

Out:

- changing the 10-entry limit or local persistence model
- redesigning the broader file-open, save, or autosave workflows
- adding file pinning, favorites, cloud sync, or full file-history management
- changing Recent Files behavior outside the acceptance criteria and verification cases

## Plan

Implement the Recent Files UI and state changes in `code/scripts/quill-app.js` and `code/styles/quill.css`, using the existing row and toast patterns. Do not perform proactive filesystem or network availability checks when the panel opens; attempt reopen only after the user selects an entry. If reopen fails, show a clear failure message and ask whether the user wants the entry removed using an explicit `Remove`/`Cancel` confirmation dialog. If `Cancel` is selected, leave the row visually unchanged and preserve it for later retry. Keep a persistent compact action cluster of small icons or glyphs on the same line as each file entry, aligned to the right; protect the current row from Remove while exposing Copy Path and Open in Explorer. Use the WebView Clipboard API for Copy Path. Add a dedicated Tauri command and bridge method for Open in Explorer that invokes Windows Explorer with the file selected, and report action success or failure through concise toasts. Preserve most-recent-first ordering and retain the existing 10-entry limit, persistence, duplicate handling, unsaved-change confirmation, and successful reopen flow.

## Acceptance Criteria

- AC-01: Recent Files does not perform proactive availability checks; when a user selects an entry that cannot be reopened, Quill shows a clear failure message and an explicit `Remove`/`Cancel` confirmation dialog, preserving the entry when `Cancel` is selected.
- AC-02: Recent Files retains most-recent-first ordering when an existing entry is opened, without creating duplicates or breaking the current-entry indication.
- AC-03: Each recent-file item presents a persistent compact action cluster of small icons or glyphs within the item and aligned to the right; the action line may occupy its own row area, removable items include a selectable overlaid Remove control within the file item panel that does not open the file, and the current file remains protected from removal.
- AC-04: A user can copy an available or unavailable recent file's full path to the clipboard and receives clear success or failure feedback.
- AC-05: A user can request that a recent file be selected/highlighted in its containing Windows Explorer folder; Quill attempts the request when invoked and uses concise toast feedback for success or failure.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `1.0.12` | `complete` | Select a missing or inaccessible entry, verify no proactive panel-open check occurs, confirm the failure message and `Remove`/`Cancel` dialog, and verify that `Cancel` preserves the entry while `Remove` deletes it. | [TC-01 evidence](../90%20-%20Evidence/PRD-000026-CHANGE-TC-01.md) |
| `TC-02` | `AC-02` | `1.0.12` | `complete` | Open, switch, and revisit files to verify most-recent-first ordering, duplicate handling, and the current-entry indication. | [TC-02 evidence](../90%20-%20Evidence/PRD-000026-CHANGE-TC-02.md) |
| `TC-03` | `AC-03` | `1.0.12` | `complete` | Verify the persistent compact action icons are visible within each file item and aligned to the right, removable items expose a selectable overlaid Remove control without triggering file opening, and the current row does not expose Remove. | [TC-03 evidence](../90%20-%20Evidence/PRD-000026-CHANGE-TC-03.md) |
| `TC-04` | `AC-04` | `1.0.12` | `complete` | Copy Path produced the success toast and the copied full path matched the selected recent file path in an external text editor. | [TC-04 evidence](../90%20-%20Evidence/PRD-000026-CHANGE-TC-04.md) |
| `TC-05` | `AC-05` | `1.0.12` | `complete` | Verify Open in Explorer uses the Tauri command to select the recent file in its containing folder and provides concise success or failure toast feedback. | [TC-05 evidence](../90%20-%20Evidence/PRD-000026-CHANGE-TC-05.md) |

## Next Step

The committed `1.0.12` candidate is ready for explicit `prd-promote` validation to `Test`; execute the planned verification cases against the packaged candidate.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-08T13:18:28.5678558Z | Backlog |
| 2026-08-08T13:21:49.9697415Z | Plan |
| 2026-08-08T13:44:54.5301814Z | Implement |
| 2026-08-08T16:52:16.6452121Z | Test |
| 2026-08-08T18:54:13.8927344Z | Closed |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-08T13:18:28.5678558Z | Requirement shaping | Created from the user's Recent Files usability concerns and a light `prd-grill-me` pass. Captured four requested changes: proactively surface stale entries, reduce jarring current-file reordering, overlay the remove control on the row, and add copy-path and open-in-Explorer actions. Deferred stale-detection timing and detailed interaction/error-state decisions to Plan at the user's request. |
| 2026-08-08T13:21:49.9697415Z | Promotion | Promoted from `Backlog` to `Plan` after user confirmation. Planning must resolve stale-file detection timing, the stable ordering rule, row-action interaction details, and clipboard/Explorer bridge feedback before implementation. |
| 2026-08-08T13:25:37.6221775Z | Decision | Selected recency ordering with a subtle transition when an existing recent entry moves to the top after opening. This preserves the most-recent-first model while reducing the jarring effect of the reorder. |
| 2026-08-08T13:26:17.2700211Z | Decision | Selected availability refresh on Recent Files panel open. Quill will check every stored entry at that point and update unavailable states before the user selects a file. |
| 2026-08-08T13:28:37.0004683Z | Decision | Selected a persistent compact action cluster for each row: small icons or glyphs remain on the same line as the file entry and align to the right, including the overlaid remove action and the new path actions. |
| 2026-08-08T13:29:40.2260961Z | Decision | Selected differentiated action availability: Copy Path remains enabled for unavailable entries, while Open in Explorer is disabled until the entry is confirmed available. |
| 2026-08-08T13:30:23.7186875Z | Decision | Selected concise toast feedback for Copy Path and Open in Explorer success or failure, using Quill's existing feedback pattern. |
| 2026-08-08T13:31:17.2190306Z | Decision | Selected Open in Explorer behavior that opens the containing folder and selects/highlights the available recent file. |
| 2026-08-08T13:34:38.5459853Z | Decision | Superseded the proactive availability-check decisions. Recent Files will not check entries on panel open, avoiding network or filesystem latency. Reopen is attempted only after selection; failure produces a message and a prompt asking whether to remove the entry. Copy Path and Open in Explorer will report their own invocation results instead of relying on precomputed availability. |
| 2026-08-08T13:35:35.3863737Z | Decision | Selected an explicit confirmation dialog after failed reopen, with `Remove` and `Keep` actions. `Keep` preserves the recent entry for a later retry; no persistent availability state is required by this revised approach. |
| 2026-08-08T13:36:40.4933068Z | Decision | Selected a dedicated Tauri command for Open in Explorer. The command will invoke Windows Explorer and request that it select/highlight the target file, with frontend success or failure reported through a toast. |
| 2026-08-08T13:37:10.8026718Z | Decision | Selected the existing safety rule that the current file cannot be removed from Recent Files. The current row will still expose Copy Path and Open in Explorer. |
| 2026-08-08T13:38:03.0998330Z | Decision | Selected no persistent or transient failure marker after a failed reopen is kept. The failure message and explicit `Remove`/`Keep` dialog provide the immediate feedback, while `Keep` leaves the row visually unchanged for later retry. |
| 2026-08-08T13:39:36.4917469Z | Evidence | Recorded the planning rounds and final decision baseline in [PRD-000026 Planning](../90%20-%20Evidence/PRD-000026%20Planning.md). |
| 2026-08-08T18:18:58.5377404Z | Clarification | Adjusted AC-03 and TC-03 to reflect the observed implementation: the compact action line is within the file item and aligned right but is not on the same line as the file entry. The behavior is functionally acceptable, so no implementation change is required at this point. |
| 2026-08-08T13:44:54.5301814Z | Promotion | Promoted from `Plan` to `Implement` after user confirmation. The approved scope now authorizes implementation of the Recent Files frontend, stylesheet, Tauri bridge, and verification changes defined by the acceptance criteria. |
| 2026-08-08T13:50:26.6269605Z | Clarification | Reconciled the Implement record with the final Plan decisions: missing-file handling occurs on selection rather than proactively, and the requested extraction of Recent Files into dedicated HTML, CSS, and JavaScript surfaces is an in-scope structural implementation detail that preserves the approved behavior. |
| 2026-08-08T14:00:06.7150621Z | Implementation | Extracted the Recent Files panel markup, styling, and controller into dedicated HTML, CSS, and JavaScript files. Added action-time failed-reopen confirmation, Copy Path, Explorer reveal support, recency movement animation, and Tauri bridge coverage while preserving the existing document-flow callbacks. Updated the smoke fixture's versioned bootstrap injection so the desktop scenario exercises the current app scripts. |
| 2026-08-08T16:20:12.4733769Z | Clarification | Reset the Recent Files list scroll position whenever the panel opens so the most recent entry is always visible first. Quoted the Explorer `/select` target path before launching `explorer.exe` to prevent valid paths from falling back to the default My Documents location. |
| 2026-08-08T16:30:09.7008036Z | Correction | Corrected the Explorer launch argument construction to use the Windows raw command-line form `/select,"path"`, avoiding Rust's automatic quoting of the complete switch and preserving paths containing spaces. |
| 2026-08-08T16:36:01.8772995Z | Evidence | Recorded the concise implementation summary in [PRD-000026 Implementation](../90%20-%20Evidence/PRD-000026%20Implementation.md). |
| 2026-08-08T16:41:57.8272789Z | Candidate | Created product candidate `1.0.12`. The Tauri release build and NSIS bundle succeeded, the root `quill.exe` was synchronized from `src-tauri/target/release/quill-tauri.exe`, SHA-256 hashes matched (`2CD14E9A616AB36FDEF807DA6214E578E0A2FD952ACEDB84BF36F53C58F4D83D`), and modified JavaScript files passed `node --check`. |
| 2026-08-08T16:52:16.6452121Z | Promotion | Promoted from `Implement` to `Test` after the committed `1.0.12` candidate and packaged artifacts passed the promotion gate. Formal verification must use the packaged candidate on `main`. |
| 2026-08-08T17:04:58.0155984Z | Clarification | Updated the user-facing failed-reopen choice from `Keep` to `Cancel`. `Cancel` is the preserve-entry action shown by the packaged UI and used by TC-01 evidence. |
| 2026-08-08T18:09:00.9415710Z | Clarification | Removed the non-observable transition requirement from the active Plan, `AC-02`, and `TC-02` wording. Verification now covers observable most-recent-first ordering, duplicate handling, and current-entry indication; historical decision entries remain unchanged. |
| 2026-08-08T18:51:35.9527620Z | Test evidence | Recorded `TC-01` / `AC-01` as complete for candidate `1.0.12` at commit `0756c43`; evidence confirms failed-reopen messaging and the `Remove`/`Cancel` preservation flow. |
| 2026-08-08T18:51:35.9825173Z | Test evidence | Recorded `TC-02` / `AC-02` as complete for candidate `1.0.12` at commit `0756c43`; evidence confirms most-recent-first ordering, duplicate handling, and current-entry indication. |
| 2026-08-08T18:51:36.0001660Z | Test evidence | Recorded `TC-03` / `AC-03` as complete for candidate `1.0.12` at commit `0756c43`; evidence confirms right-aligned actions, Remove behavior, and current-file protection, with the accepted action-line layout clarification. |
| 2026-08-08T18:51:36.0166172Z | Test evidence | Recorded `TC-04` / `AC-04` as complete for candidate `1.0.12` at commit `0756c43`; evidence confirms the copied full path and success toast. |
| 2026-08-08T18:51:36.0323710Z | Test evidence | Recorded `TC-05` / `AC-05` as complete for candidate `1.0.12` at commit `0756c439061ab51e4cd5ede9f544e363007e3150`; evidence confirms Explorer selection for an existing file and records the renamed-file fallback observation. |
| 2026-08-08T18:54:13.8927344Z | Promotion | Promoted from `Test` to `Closed` after all five active test cases completed against candidate `1.0.12` with linked evidence and recorded test-case audit entries. |
