# PRD-000019-CHANGE

## Short Name

Externalize Default Getting Started Guide

## Goal

Move Quill's default getting-started guide out of hard-coded script content and into a markdown document that ships with the app, while preserving a simple generated fallback for browser mode when direct startup-file loading is not available.

## Context

Quill currently maintains default getting-started content in script, even though the repo already includes a markdown guide document. That makes the startup guide harder to edit as content, harder to keep aligned across runtime modes, and less obviously part of the shipped product content. The desktop app should prefer a deployed markdown document for the startup guide, while browser mode should stay resilient by showing simple generated markdown content if direct startup-file loading is not practical there.

## Scope

In:

- define a deployed markdown document as the source of truth for the default getting-started guide in the desktop app
- update startup loading so the app reads that document instead of maintaining the guide directly in script
- keep a simple generated markdown fallback for browser mode when direct startup-file loading is not available
- clarify which startup-content behavior belongs to Tauri mode versus browser mode
- update docs if the default-guide source or loading behavior becomes part of the supported product baseline

Out:

- broad document-management features
- user-selectable startup documents
- redesigning the getting-started guide content itself beyond what is needed to externalize it cleanly
- removing the browser fallback entirely

## Plan

- Confirm the current startup-content flow across Tauri and browser modes, including where hard-coded guide content is still maintained.
- Define the deployed markdown document path, the desktop loading contract, and the simple browser fallback behavior.
- Plan the smallest implementation slice that switches desktop mode to the deployed document without breaking startup behavior in browser mode.

## Acceptance Criteria

- The desktop app no longer relies on directly maintained script content as the primary source of the default getting-started guide.
- A deployed markdown document is the defined startup-guide source for the desktop app.
- Browser mode still shows startup content when direct loading of the markdown document is unavailable.
- The browser fallback is intentionally simple and generated dynamically rather than pretending to be the same file-loading path as the desktop app.
- The PRD clearly separates current implementation scope from any future expansion of startup-content options.

## Verification

- Verify which file becomes the source of truth for the default startup guide in desktop mode.
- Verify the startup path in Tauri mode uses the deployed markdown document.
- Verify browser mode still renders fallback startup content when direct loading of the markdown document is unavailable.
- Verify docs and workflow artifacts describe the chosen baseline accurately if they are affected.

## Next Step

Move this item to `01 - Plan` and define the startup-guide source path, desktop loading behavior, browser fallback behavior, and first implementation slice.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-16T20:45:01.2625022Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-16T20:45:01.4039955Z | Scope discovery | Added as a backlog item to externalize the default getting-started guide into a deployed markdown document for the desktop app while keeping browser-mode startup content resilient. |
| 2026-07-16T20:45:01.4349938Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
