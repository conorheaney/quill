# PRD-000026 Planning Evidence

## Purpose

Concise record of the planning rounds for `PRD-000026-CHANGE — Improve Recent Files Usability`.

## Planning Rounds

| Round | Focus | Decision |
| --- | --- | --- |
| 1 | Recent-file ordering | Keep most-recent-first ordering; use a subtle transition when an existing entry moves to the top. |
| 1 | Availability checks | Initially selected panel-open checks, then superseded this direction to avoid filesystem or network latency. |
| 1 | Row actions | Use persistent small icons or glyphs on the same line as each file, aligned right. |
| 1 | Action availability | Initially considered disabling Explorer for unavailable entries, then superseded this with action-time results because no proactive availability state will be maintained. |
| 1 | Action feedback | Use concise toast feedback for Copy Path and Open in Explorer success or failure. |
| 1 | Explorer behavior | Select/highlight the file in its containing folder. |
| 2 | Failed reopen | Attempt reopen only after selection. On failure, show a message and an explicit `Remove` / `Keep` confirmation dialog. |
| 2 | Keep behavior | `Keep` preserves the entry and leaves it visually unchanged; no failure marker is stored. |
| 2 | Copy Path | Use the WebView Clipboard API, with a failure toast if the operation is rejected. |
| 2 | Explorer implementation | Add a dedicated Tauri command that invokes Windows Explorer with the file selected. |
| 2 | Current-file removal | Keep the current file protected from Remove; retain its other row actions. |

## Final Planning Baseline

- Do not check file availability when the Recent Files panel opens.
- Attempt reopen only when the user selects a recent entry.
- If reopen fails, ask whether to remove the entry; `Keep` leaves it unchanged.
- Preserve most-recent-first ordering and soften existing-entry movement with a transition.
- Keep row actions visible as compact right-aligned glyphs.
- Use the WebView Clipboard API for Copy Path.
- Use a native Tauri command to select the file in Windows Explorer.
- Use concise toasts for action results.
- Protect the current entry from removal.
- Keep keyboard behavior out of scope.

## Source

The decisions above were made interactively with the user during the Plan phase and are reflected in [PRD-000026-CHANGE](../10%20-%20Plan/PRD-000026-CHANGE.md).

## Recorded

2026-08-08T13:39:36.4917469Z
