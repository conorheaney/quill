# PRD-0006-UI

## Short Name

Recent Files Picker

## Goal

Let users quickly reopen one of the 10 most recently opened files.

## Context

Opening the same working files repeatedly is a common local-first workflow, and the app does not currently offer a fast recent-files shortcut. A recent-files picker should reduce file-open friction without adding a heavy project-management layer.

## Scope

In:

- track the 10 most recently opened files
- present a quick selection UI for reopening them
- handle missing or no-longer-available files gracefully
- persist the recent-files list locally between app sessions

Out:

- full file history management
- pinning or favoriting files
- cloud sync or cross-device history

## Proposed Behavior

- Record a file in the recent-files list when it is opened successfully.
- Keep the most recent file first and remove duplicates by moving an already-listed file to the top.
- Limit the stored list to 10 entries.
- Store full file paths for reopen behavior.
- Show the filename prominently and the full path separately so similarly named files are still easy to distinguish.
- If the current document has unsaved changes, warn before reopening a recent file.
- If a file no longer exists or cannot be reopened, show a clear message and keep the entry marked as unavailable until it becomes valid again or is replaced.

## UI Considerations

- Place the recent-files picker in the main header near the existing file buttons.
- Keep the quick-open path fast enough that it does not feel slower than the current file picker for common repeat work.
- Avoid letting a long path list crowd the main editor controls.
- Make keyboard access part of the first implementation, not a later accessibility cleanup.

## Persistence Considerations

- Reuse existing local storage patterns if possible so recent-files behavior matches current draft and settings persistence.
- Store absolute file paths because reopen behavior should be path-based.
- Make sure recent-files loading fails safely if stored data is missing, malformed, or from an older schema.

## Potential Implementation Issues

- The current open/save flow may need adjustment if it does not already preserve a stable path for every successfully opened file.
- Two files with the same name may be hard to distinguish without showing path context.
- The app may need a clear rule for untitled documents, autosaved drafts, and files opened through drag-and-drop.
- Recent-file state can become stale if files are moved, renamed, or deleted outside the app.
- Unavailable entries need a small but clear visual treatment so users can tell the difference between a normal recent file and a stale one.

## Things To Watch Out For

- Do not create a recent-files UI that implies a file is safely writable if the app no longer has permission to save back to it.
- Avoid storing more file metadata than needed for reopening and display.
- Make sure a failed reopen does not overwrite the current unsaved editor state without warning.
- Keep the recent-files list independent from autosave content so reopening history does not accidentally restore the wrong document body.

## Resolved Decisions

- UI placement: main header, near the existing file buttons.
- Reopen mechanism: full file paths.
- Unsaved changes: warn before reopening a recent file.
- Duplicate names: show the full path, but make the filename visually prominent and separate it from the path.
- Failed reopen policy: keep the entry, but mark it unavailable until the next successful open.

## Acceptance Criteria

- The app keeps a locally persisted list of up to 10 recently opened files.
- Reopening a file from the recent-files picker loads that file the same way as the standard open flow.
- Reopening an already-listed file moves it to the top instead of duplicating it.
- Missing, moved, or inaccessible files are handled with clear feedback and an unavailable state.
- The UI makes similarly named files distinguishable.
- Unsaved changes trigger a warning before a recent file replaces the current document.

## Implementation Notes

- Start by tracing the existing open-file flow and the current local persistence utilities.
- Decide early whether the feature should be renderer-managed, main-process-assisted, or split across both.
- Use the unavailable state to avoid silently deleting entries that may recover later, such as files on a removable drive.

## Usability Changes Requested After Initial Implementation

- Thicken the Recent Files dialog border.
- Increase the dialog header font size and use the accent color for the header text.
- Constrain scrolling to the dialog content area only.
- Move the `Browser file access handle` text to the left.
- Visually differentiate the currently selected document inside the list.
- Add a remove action for any recent entry except the current document.
- Use a compact icon-style remove control and cap the filename column width so recent-file rows align more cleanly.

## Issues Discovered During Implementation

- Direct `quill.html` in Chrome does not provide reusable full file paths for opened files, so a path-only recent-files design does not work there.
- Chrome needs File System Access handles persisted for recent files; path-based reopen is only reliable in the Electron or desktop case.
- Recent-file handle persistence initially had a race condition: overlapping async writes could leave the UI list populated while only the newest handle remained reopenable.
- Renderer asset cache-busting mattered in practice. Updated JS and CSS changes did not always take effect until the versioned asset URLs in `code/quill.html` were bumped.
- The Recent Files popover styling conflicted with the app's translucent visual system, making the popup appear blended with the markdown behind it.
- Header background blur and stacking contexts in the content area likely contributed to visual bleed and confusing hit behavior for the popup.
- Decorative popup surface layers made hover and click hit targets less robust than they should have been.
- Toasts showed similar translucency symptoms, suggesting the issue was part of the broader overlay and surface styling approach rather than isolated to Recent Files.
- Browser fallback file-open flows are not equivalent: `showOpenFilePicker` can support reusable recents, while plain file input fallback cannot reliably do so.
- Unavailable recent entries need explicit state handling because file handles can lose permission and files can become inaccessible between sessions.

## Next Step

No further implementation work is required for this item.

## Status

Done

## Verification

- Confirmed the PRD now resides in `docs/04 - Release/`.
- Confirmed the backlog entry now records `PRD-0006-UI` as `Done` in phase `Release`.
- Confirmed the Recent Files implementation record includes Chrome-specific persistence behavior, reopen warnings, unavailable-entry handling, and the final popup usability refinements.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-12T00:00:00Z | Test |
| 2026-07-12T00:11:57Z | Release |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| Legacy | Backfill | Historical stage-transition timestamps were not captured before the audit structure was introduced. |
| 2026-07-12T00:00:00Z | Transition note | Promoted to `Test` after implementing the recent-files workflow and requested usability refinements. |
| 2026-07-12T00:00:00Z | Request | User request: quickly select from the 10 most recently opened files. |
| 2026-07-12T00:11:57Z | Transition note | Promoted to `Release` and marked `Done` after the user approved the work item promotion. |
