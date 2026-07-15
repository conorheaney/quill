# PRD-000015-CHANGE

## Short Name

Enable Tauri Window Chrome

## Goal

Enable standard window chrome in the Tauri desktop shell so the app uses the platform window frame instead of a frameless configuration.

## Context

The Tauri desktop shell was configured with `"decorations": false` in `src-tauri/tauri.conf.json`, which kept the app frameless. For the current product baseline, the simplest safe change is to restore the standard platform window frame now and defer any richer shell options until they are needed and separately scoped.

## Scope

In:

- enable window decorations in the Tauri window configuration
- verify the released desktop baseline now uses standard platform window chrome
- update docs that describe the desktop shell behavior
- record any future custom-shell options as deferred scope instead of mixing them into this change

Out:

- unrelated renderer UI redesign work
- broad Tauri runtime refactoring
- custom titlebar implementation beyond restoring standard window chrome
- fullscreen or branded shell experimentation beyond the simple config change

## Deferred Future Options

- custom titlebar or branded window controls
- revisiting frameless mode with a stronger product reason and explicit usability checks
- fullscreen-on-start or other shell-presence experiments that should be scoped separately from this baseline change

## Next Step

No further implementation work is required for this item.

## Status

Done

## Verification

- Verified `src-tauri/tauri.conf.json` now sets `"decorations": true` for the main Tauri window.
- Verified the Tauri setup guide now matches the shipped baseline by describing standard platform window chrome instead of the custom shell.
- Verified the backlog row and released PRD record both reflect this item as `Done` / `Release`.
- Verified in a live Tauri desktop launch on 2026-07-15 that Quill opens a real top-level window titled `Quill Markdown Editor` with Windows style bits `0x15CF0000`, including caption, system menu, minimize box, and maximize box.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-14T22:39:07.0836796Z | Backlog |
| 2026-07-14T22:57:50.4123287Z | Plan |
| 2026-07-14T22:57:50.5099037Z | Implement |
| 2026-07-14T22:57:50.5424740Z | Test |
| 2026-07-14T22:57:50.5760495Z | Release |
| 2026-07-14T23:54:28.5553999Z | Test |
| 2026-07-14T23:54:28.6568355Z | Release |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-14T22:39:07.0836796Z | Scope discovery | Added as a backlog item to track re-enabling standard window chrome in the Tauri configuration instead of keeping the shell frameless. |
| 2026-07-14T22:39:07.0836796Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
| 2026-07-14T22:57:50.4123287Z | Promotion | Promoted this item to `Plan`. The simple baseline change is now locked: enable standard Tauri window chrome immediately and keep richer shell options deferred in this PRD instead of expanding scope. |
| 2026-07-14T22:57:50.5099037Z | Promotion | Promoted this item to `Implement` because the implementation path is now explicit and small: change the Tauri window `decorations` setting and align the affected desktop-shell docs. |
| 2026-07-14T22:57:50.5099037Z | Implementation | Updated `src-tauri/tauri.conf.json` so the main Tauri window now uses `"decorations": true`, and updated `docs/TAURI-WINDOWS-SETUP.md` so the documented desktop baseline no longer claims a custom shell. |
| 2026-07-14T22:57:50.5424740Z | Verification | Confirmed in the repo state that the main Tauri window config now enables decorations and that the Tauri setup guide reflects the standard platform window chrome baseline. |
| 2026-07-14T22:57:50.5760495Z | Release | Promoted this item to `Release` after the config change, docs alignment, backlog row, and released PRD record were updated together. |
| 2026-07-14T23:54:28.5553999Z | Workflow correction | Re-entered `Test` after the release-review complaint identified that the earlier promotion relied only on repo-state checks and did not include a live desktop runtime verification pass. |
| 2026-07-14T23:54:28.5553999Z | Verification | Launched Quill through `npm run tauri:dev -- --no-watch` with the local Rust toolchain added explicitly to PATH for the spawned process, then inspected the live window on Windows. The app opened with title `Quill Markdown Editor` and style `0x15CF0000`, confirming caption, system menu, minimize box, and maximize box are present with standard window chrome enabled. |
| 2026-07-14T23:54:28.6879367Z | Environment note | The live verification showed the Rust toolchain is installed on this machine but not currently available in the default Codex PATH, so the Tauri launch needed an explicit PATH prefix during verification. |
| 2026-07-14T23:54:28.6568355Z | Release | Returned this item to `Release` after the live runtime check confirmed the Tauri window chrome change works in the desktop app, not just in config and docs. |
