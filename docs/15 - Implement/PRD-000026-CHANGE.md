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

- surface missing or inaccessible recent files before the user selects them
- reduce or remove the jarring list reordering associated with the current file
- place the remove action as an overlaid control on the right side of the file item panel
- provide an action to copy a recent file's full path to the clipboard
- provide an action to open a recent file's containing folder in Windows Explorer
- use the defined toast feedback and action behavior for these operations

Out:

- changing the 10-entry limit or local persistence model
- redesigning the broader file-open, save, or autosave workflows
- adding file pinning, favorites, cloud sync, or full file-history management
- authorizing implementation before this PRD reaches `Implement`

## Plan

Implement the Recent Files UI and state changes in `code/scripts/quill-app.js` and `code/styles/quill.css`, using the existing row and toast patterns. Do not perform proactive filesystem or network availability checks when the panel opens; attempt reopen only after the user selects an entry. If reopen fails, show a clear failure message and ask whether the user wants the entry removed using an explicit `Remove`/`Keep` confirmation dialog. If `Keep` is selected, leave the row visually unchanged and preserve it for later retry. Keep a persistent compact action cluster of small icons or glyphs on the same line as each file entry, aligned to the right; protect the current row from Remove while exposing Copy Path and Open in Explorer. Use the WebView Clipboard API for Copy Path. Add a dedicated Tauri command and bridge method for Open in Explorer that invokes Windows Explorer with the file selected, and report action success or failure through concise toasts. Preserve most-recent-first ordering, using a subtle transition when an existing entry moves to the top, and retain the existing 10-entry limit, persistence, duplicate handling, unsaved-change confirmation, and successful reopen flow.

## Acceptance Criteria

- AC-01: Recent Files does not perform proactive availability checks; when a user selects an entry that cannot be reopened, Quill shows a clear failure message and an explicit `Remove`/`Keep` confirmation dialog, preserving the entry when `Keep` is selected.
- AC-02: Recent Files retains most-recent-first ordering, and when an existing entry moves to the top after opening, the movement uses a subtle transition that makes the reorder understandable rather than jarring.
- AC-03: Each recent-file row presents a persistent compact action cluster of small icons or glyphs on the same line as the file entry, aligned to the right; removable rows include an overlaid Remove control within the file item panel that does not prevent the file row from being selected, while the current file remains protected from removal.
- AC-04: A user can copy an available or unavailable recent file's full path to the clipboard and receives clear success or failure feedback.
- AC-05: A user can request that a recent file be selected/highlighted in its containing Windows Explorer folder; Quill attempts the request when invoked and uses concise toast feedback for success or failure.
- AC-06: Existing Recent Files behavior remains intact for the 10-entry limit, persistence, duplicate handling, unsaved-change confirmation, and successful reopen flow.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `pending` | `planned` | Select a missing or inaccessible entry, verify no proactive panel-open check occurs, confirm the failure message and `Remove`/`Keep` dialog, and verify that `Keep` preserves the entry while `Remove` deletes it. | Not yet recorded. |
| `TC-02` | `AC-02` | `pending` | `planned` | Open, switch, and revisit files to verify most-recent-first ordering and the subtle transition when an existing entry moves to the top. | Not yet recorded. |
| `TC-03` | `AC-03` | `pending` | `planned` | Verify the persistent compact action icons are visible and aligned on the file row, removable rows expose a selectable overlaid Remove control without triggering file opening, and the current row does not expose Remove. | Not yet recorded. |
| `TC-04` | `AC-04` | `pending` | `planned` | Verify Copy Path uses the WebView Clipboard API for a recent file and provides concise success or failure toast feedback. | Not yet recorded. |
| `TC-05` | `AC-05` | `pending` | `planned` | Verify Open in Explorer uses the Tauri command to select the recent file in its containing folder and provides concise success or failure toast feedback. | Not yet recorded. |
| `TC-06` | `AC-06` | `pending` | `planned` | Verify the existing 10-entry limit, local persistence, duplicate handling, unsaved-change confirmation, and successful reopen flow remain intact. | Not yet recorded. |

## Next Step

Review the consolidated acceptance criteria and verification cases, then promote this item to `Implement` when explicitly approved. Implementation must remain within the defined frontend, stylesheet, Tauri bridge, and smoke-test scope.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-08T13:18:28.5678558Z | Backlog |
| 2026-08-08T13:21:49.9697415Z | Plan |
| 2026-08-08T13:44:54.5301814Z | Implement |

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
| 2026-08-08T13:44:54.5301814Z | Promotion | Promoted from `Plan` to `Implement` after user confirmation. The approved scope now authorizes implementation of the Recent Files frontend, stylesheet, Tauri bridge, and verification changes defined by the acceptance criteria. |
