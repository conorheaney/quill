# PRD-000016-CHANGE

## Short Name

Limit Recent Files To Tauri

## Goal

Restrict the Recent Files option to the Tauri desktop runtime so the feature only appears where its reopen behavior is supported cleanly.

## Context

The released Recent Files work had to account for browser and desktop differences, and the browser-side path introduces extra complexity around file handles and reopen behavior. Limiting the option to Tauri would narrow the feature to the runtime the repo now ships for desktop use.

## Scope

In:

- limit Recent Files availability to the Tauri runtime
- keep the Recent Files popup entry point visible while changing its internal content by runtime
- define the expected user-facing behavior when Recent Files is unavailable outside Tauri

Out:

- redesign of the Recent Files interaction within Tauri
- broader file-open workflow changes unrelated to runtime gating
- reintroducing Electron-specific behavior

## Plan

- Keep the Recent Files entry point visible across runtimes, but gate the popup content by runtime.
- In the Tauri desktop runtime, preserve the current Recent Files behavior.
- In a standard web-browser path, keep the popup shell but replace the internal Recent Files content with a clear unavailable message: `Recent Files is unavailable in a standard web browser.`
- Use the existing `window.QuillDesktop` availability check as the runtime seam because the Tauri bridge only exists when the desktop file operations are supported.
- Implement the first slice in the existing Recent Files UI surfaces:
  - `code/quill.html` for the popup shell
  - `code/scripts/quill-app.js` for Recent Files panel rendering
  - `code/scripts/desktop-bridge.js` as the existing source of the Tauri-only desktop bridge
- In the browser path, do not render the interactive recent-file list, reopen controls, unavailable per-file rows, or stored path text inside the popup.

## Acceptance Criteria

- In Tauri, opening the Recent Files popup still shows the current Recent Files content and behavior.
- In a standard web browser, opening the same popup shows `Recent Files is unavailable in a standard web browser.`
- The browser-path unavailable state does not expose broken reopen controls or misleading file-path content.
- The change does not redesign the existing Tauri Recent Files interaction.

## Verification

- Verify in Tauri that the Recent Files popup still renders the current feature content.
- Verify in a standard web-browser path that the popup opens and shows `Recent Files is unavailable in a standard web browser.` instead of Recent Files content.
- Verify that the browser path no longer presents interactive Recent Files content that implies the feature should work there.
- Verify that the runtime branch is driven by whether `window.QuillDesktop` is available.
- Manual verification is reported complete in both a standard web-browser path and a built Tauri binary, with the expected runtime-specific Recent Files behavior observed in each environment.

## Next Step

No further implementation work is required for this item.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-16T00:33:57.1411699Z | Backlog |
| 2026-07-16T00:50:24.5978020Z | Plan |
| 2026-07-16T00:55:27.4402153Z | Implement |
| 2026-07-16T10:11:52.0000000Z | Test |
| 2026-07-16T11:26:36.3958778Z | Release |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-16T00:33:58.1411699Z | Requirement shaping | Added from a lightweight `grill-me` pass based on the request to make Recent Files Tauri-only. Assumption: this is best framed as a runtime-scoping change rather than a bug fix or UI redesign. |
| 2026-07-16T00:50:24.5978020Z | Promotion | Promoted this item to `Plan`. The next step is to define the runtime-gating approach, affected UI surfaces, and the expected non-Tauri fallback behavior before any implementation starts. |
| 2026-07-16T00:53:43.5006347Z | Decision | Planning decision: keep the Recent Files popup entry point visible outside Tauri, but replace its internal content in a standard web-browser path with a message that the feature is unavailable there. |
| 2026-07-16T00:54:57.0551746Z | Decision | Locked the browser-path message to `Recent Files is unavailable in a standard web browser.` and anchored the runtime branch to `window.QuillDesktop`, which is already supplied only by the Tauri desktop bridge. |
| 2026-07-16T00:55:27.4402153Z | Promotion | Promoted this item to `Implement` because the planning gate is now satisfied: the user-facing browser message, runtime branch, affected UI surfaces, acceptance criteria, and verification approach are all defined clearly enough to execute. |
| 2026-07-16T09:47:00.0000000Z | Implementation | Updated the Recent Files popup renderer to short-circuit on `window.QuillDesktop`: Tauri keeps the existing recent-file list, while the standard browser path now shows the planned unavailable message and hides the interactive recent-file content. |
| 2026-07-16T10:11:52.0000000Z | Verification | User reported manual checks in both a standard web-browser path and a built Tauri binary. Reported result: the browser path shows the planned unavailable state, while the built Tauri binary preserves the expected Recent Files behavior. |
| 2026-07-16T10:11:52.0000000Z | Promotion | Promoted this item to `Test` after the reported manual verification covered the planned browser-path and Tauri-path checks. |
| 2026-07-16T11:26:50.0096292Z | Release | Promoted this item to `Release` after the recorded manual verification results were reviewed and accepted as sufficient to support the runtime-gating change. |
