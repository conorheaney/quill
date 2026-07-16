# PRD-000007-TECH

## Short Name

Remove Electron Runtime

## Goal

Remove Electron from the codebase and project-managed filesystem footprint once the replacement runtime and launch flow are ready.

## Context

The current project still depends on Electron entrypoints and packaging. `package.json` uses Electron start and build scripts, and the app shell still relies on Electron main-process and preload wiring.

## Objective

Remove Electron without breaking Quill's existing document workflows, then replace it with a lighter Windows-portable desktop delivery path that still supports opening, saving, and reopening local Markdown files.

## Scope

In:

- remove Electron-specific runtime entrypoints and IPC wiring
- remove Electron packaging and dependency configuration
- remove project-managed Electron artifacts that are no longer needed after migration
- update docs and launch instructions to reflect the replacement runtime

Out:

- defining the replacement runtime architecture in detail
- unrelated editor feature work
- deleting user-machine artifacts outside the project-managed removal plan

## Repo Findings

### Current Electron Surface Area

| Surface | Current use | Why it matters |
| --- | --- | --- |
| `package.json` | `start` runs `electron .`; `build` runs `electron-builder --win`; `main` points at `code/main.js`; Electron packages sit in `devDependencies`. | Build, local launch, and packaging are still Electron-defined. |
| `code/main.js` | Creates the frameless/fullscreen `BrowserWindow` and handles file open/save IPC with Node `fs` and native dialogs. | This is the current desktop shell and native file bridge. |
| `code/preload.js` | Exposes `window.QuillDesktop.openMarkdownFile`, `reopenMarkdownFile`, and `saveMarkdownFile` over Electron IPC. | Renderer code depends on this contract when path-based desktop access is available. |
| `code/scripts/quill-app.js` | Uses `window.QuillDesktop` first, then falls back to `showOpenFilePicker` / `showSaveFilePicker`, then plain browser upload/download. | The migration can preserve the renderer contract or lean harder on the browser fallback. |
| `dist/` | Contains Electron builder output, including the unpacked Chromium/Electron payload and installer assets. | This is the main project-managed Electron footprint to retire once a replacement build exists. |

### What Already Helps The Migration

- The editor UI, markdown rendering, inline editing, autosave, and recent-files UI are already browser-first code.
- `handleLoadDocument` and `handleSaveDocument` in `code/scripts/quill-app.js` already support browser-native file pickers when `window.QuillDesktop` is absent.
- Recent files already support two models:
  - `path` entries for desktop runtimes that can reopen by absolute path
  - `handle` entries for browser-style File System Access handles stored via IndexedDB

### Break Risk To Preserve

- Electron currently allows path-based reopen of recent files without asking the user to re-pick the file. A replacement runtime must either keep a safe native reopen path or accept a product change toward handle-based/browser-style reopen.
- The current window shell is fullscreen, frameless, and icon-backed. Any replacement runtime needs an explicit decision on whether those shell behaviors remain required.
- The renderer currently assumes `window.QuillDesktop` is optional, not mandatory. That is good for migration, but implementation still needs deterministic environment detection and testing for each launch mode.

## Removal Workstreams

### 1. Replace the Desktop Bridge

- Keep the renderer-side API shape small: `openMarkdownFile`, `reopenMarkdownFile`, and `saveMarkdownFile`.
- Re-implement that bridge in the chosen runtime, or deliberately remove it and standardize on File System Access handles instead.
- Preserve the current return payload shape (`content`, `fileName`, `filePath`) unless the PRD explicitly accepts a renderer contract change.

### 2. Decouple The Shell From Electron

- Replace `code/main.js` with the equivalent native shell/bootstrap for the chosen runtime.
- Recreate only the window features that still matter after review:
  - app title
  - icon
  - initial size/fullscreen policy
  - frameless/custom chrome if still required
- Confirm whether the replacement shell loads `code/quill.html` directly, serves it locally, or bundles compiled frontend assets.

### 3. Rework Recent-File Behavior

- Decide whether desktop recent files remain path-based, become handle-based, or support both.
- If path-based reopen stays, define the replacement runtime's permissions and error handling for missing paths.
- If the app standardizes on file handles instead, update product copy and release notes to reflect that recent-file reopen becomes browser-style and permission-mediated.

### 4. Replace Build And Release Packaging

- Remove Electron builder configuration from `package.json`.
- Introduce the new development and Windows packaging commands.
- Define the intended release artifact clearly:
  - single `.exe`
  - portable unpacked folder
  - installer plus portable build

### 5. Clean Up Project-Managed Electron Footprint

- Delete `code/preload.js` once the replacement bridge is live.
- Delete `code/main.js` once the replacement shell is live.
- Remove Electron and Electron Builder dependencies from `package.json` and lockfile.
- Remove stale `dist/` artifacts that exist only for the Electron packaging path, after replacement packaging has been verified.
- Update repo docs so local launch, packaging, and release instructions no longer mention Electron.

## Recommended Migration Sequence

1. Freeze the target runtime decision and packaging target.
2. Extract and document the renderer-side desktop bridge contract.
3. Implement the new shell/bridge without removing Electron yet.
4. Verify load, save, save as, recent reopen, autosave, and fullscreen/window behavior in the new runtime.
5. Switch package scripts and release docs to the new runtime.
6. Remove Electron entrypoints, dependencies, and obsolete `dist/` output.

This order keeps a working desktop path available until the replacement has proven parity on the document flows that matter.

## Runtime Alternatives For Windows Portable Delivery

### Option A: Tauri

Fit:

- Strong candidate if we want to keep the current HTML/CSS/JS frontend and replace only the desktop shell plus native bridge.
- Good match for a small native command surface because Quill only needs file dialogs, file read/write, and window setup.

Pros:

- Smaller packaged app footprint than Electron in most cases.
- Native commands can replace the current preload bridge cleanly.
- Current official docs still center Windows packaging around a native bundle flow, and Tauri documents the Windows WebView2 dependency/runtime model.

Risks:

- Windows delivery depends on WebView2. That is common on modern Windows, but truly self-contained portable delivery may require bundling or separately managing the WebView2 runtime.
- Frameless/custom window behavior needs explicit validation rather than assuming Electron parity.
- Adds a Rust toolchain to the repo.

Planning conclusion:

- Best default option if the priority is "keep the frontend, shrink the runtime, preserve a native desktop app."

### Option B: Wails

Fit:

- Good candidate if the team prefers Go over Rust for the native shell and file bridge.
- Also keeps the current web frontend model while exposing native methods to the renderer.

Pros:

- Official docs describe `wails build` producing a production binary, which aligns well with the single-executable goal.
- Native method binding is straightforward for file dialogs and file I/O.
- Go may be a friendlier native layer for this repo than Rust, depending on team comfort.

Risks:

- Still requires a runtime migration, not just a packaging swap.
- Window-behavior parity and recent-file bridge behavior would need the same validation work as Tauri.
- Smaller ecosystem mindshare than Electron and Tauri for frontend-first desktop migrations.

Planning conclusion:

- Viable if Go is strategically preferred, but it is not obviously lower-effort than Tauri for this repo.

### Option C: Neutralinojs

Fit:

- Attractive if the main goal is the lightest possible shell and direct native APIs for file dialogs and filesystem access.

Pros:

- Official docs expose native open/save dialogs and direct filesystem read/write APIs, which map closely to Quill's needs.
- Lightweight compared with Electron.
- Can support a more path-centric desktop model without keeping Chromium bundled in the repo.

Risks:

- More opinionated/limited ecosystem than Tauri or Electron.
- A less common choice, which raises maintenance and hiring familiarity risk.
- Portable packaging and long-term framework confidence need extra validation before committing.

Planning conclusion:

- Worth shortlisting, but it feels higher-risk as the mainline replacement unless minimal footprint outranks ecosystem maturity.

### Option D: Custom Windows Host Over WebView2

Fit:

- Build a very small native host in C# or Rust that loads Quill in WebView2 and exposes only the three file operations plus window controls.

Pros:

- Maximum control over shell behavior and portable packaging.
- No framework lock-in beyond WebView2 itself.
- The current repo's narrow native needs make this technically plausible.

Risks:

- Highest implementation and maintenance cost.
- We would own the native bridge, packaging, and lifecycle details ourselves.
- Not a good first choice unless the framework options fail a hard requirement.

Planning conclusion:

- Keep as a fallback path, not the leading plan.

## Decision

Tauri is the approved replacement runtime for this item.

Quill's Electron dependence is narrow, the renderer already degrades gracefully toward browser-native file APIs, and the remaining native contract is small enough to port cleanly into Tauri commands and plugins.

## Resolved Implementation Decisions

- Runtime: Tauri 2.x.
- Native bridge approach: keep a small renderer-facing bridge with the same three operations Quill already uses:
  - `openMarkdownFile`
  - `reopenMarkdownFile`
  - `saveMarkdownFile`
- Recent-file behavior: preserve path-based reopen for the desktop app so the current Recent Files experience does not regress.
- Browser fallback behavior: keep the existing File System Access and download fallbacks so Quill still works outside Tauri when opened as plain web content.
- Windows packaging target for this migration:
  - primary release artifact: NSIS installer bundle from Tauri
  - portable/internal smoke artifact: unpacked executable folder produced during Tauri build output verification
- Windows runtime assumption: WebView2 is acceptable as a prerequisite for Windows use. Manual setup instructions must cover installing WebView2 when it is missing.
- Window behavior target: preserve the current branded app title, icon, minimum size, and frameless custom shell intent; start fullscreen only if Tauri implementation proves stable enough to keep it without regressions.
- Cleanup boundary: remove Electron only after the Tauri shell and native file flows pass the defined smoke checks.

## Plan

- Choose the replacement runtime, define the desktop bridge and packaging path, migrate the shell and native file flows, then remove the remaining Electron-specific repo surfaces.

## Tauri Implementation Workflow

### Phase 1. Prepare The Repo For Dual Runtime Work

- Keep the current renderer files in `code/` as the source of truth during migration.
- Add the Tauri app scaffold alongside the existing app instead of deleting Electron first.
- Keep the Electron path runnable until the Tauri shell can open, save, save as, and reopen recent files successfully.

### Phase 2. Stand Up The Tauri Shell

- Create the Tauri application structure and config.
- Point Tauri at the existing Quill frontend entrypoint so the same UI loads inside the new shell.
- Recreate the basic window contract:
  - app title
  - icon
  - minimum size
  - resizable/maximizable behavior
  - frameless shell if feasible
- Treat initial fullscreen as a late validation step, not a first-pass requirement.

### Phase 3. Port The Native File Bridge

- Replace the Electron preload/main-process bridge with Tauri-native commands and plugins.
- Use Tauri command invocation for operations that need direct Rust-side file I/O or path access.
- Use Tauri dialog capabilities for open/save path selection.
- Preserve the current payload shape returned to the renderer:
  - `content`
  - `fileName`
  - `filePath`

### Phase 4. Stabilize Recent Files

- Keep storing path-based recent-file entries for the desktop runtime.
- Preserve current unavailable-file behavior and warning toasts.
- Confirm that Tauri reopen behavior matches the current Electron branch closely enough that no product copy changes are needed.

### Phase 5. Switch Dev And Build Flows

- Replace `electron .` with the Tauri development command.
- Replace `electron-builder --win` with the Tauri Windows build command.
- Update the release docs and local-run instructions to make Tauri the default path.

### Phase 6. Remove Electron

- Delete `code/main.js` after Tauri owns the native shell.
- Delete `code/preload.js` after the renderer uses the Tauri bridge instead.
- Remove Electron dependencies and builder config from `package.json`.
- Remove obsolete Electron-generated `dist/` artifacts once Tauri packaging has been verified.

## Manual Setup Requirements

These are required operator steps for Windows development and packaging and should be treated as part of the implementation workflow, not optional notes.

### Windows Machine Prerequisites

- Install Microsoft C++ Build Tools with the `Desktop development with C++` workload.
- Install Rust with the MSVC toolchain.
- Install WebView2 if it is not already present. Current Tauri docs note that WebView2 is already installed on Windows 10 version 1803 and later, but older or stripped-down systems may still need the Evergreen Bootstrapper.
- Keep Node available for any frontend-side Tauri CLI or package workflow used in this repo.

### One-Time Repo Bootstrap

- Add the Tauri dependencies and scaffold the Tauri app structure.
- Generate the Tauri icon set from the existing Quill branding asset if needed.
- Configure the Tauri capability/permission surface for:
  - dialog open
  - dialog save
  - any file access required by the chosen command/plugin mix

## Tauri-Specific Implementation Notes

- Tauri's frontend-to-Rust command model maps cleanly to Quill's current three-call desktop bridge.
- Tauri dialog APIs cover the save/open picker layer, but file content and path-preserving reopen behavior should stay in a Rust-backed command layer so Quill can keep its current path-based recent-file UX.
- Tauri permissions/capabilities need to be configured deliberately; this migration should not assume Electron-style unrestricted desktop access.
- The app should preserve the renderer's existing environment checks so browser-only use still works without the Tauri host.

## Suggested Command Flow

The exact command names should be finalized during implementation setup, but the workflow should follow this shape:

1. Scaffold the Tauri app into the repo.
2. Run the Tauri development shell locally.
3. Build the Windows bundle through Tauri.
4. Verify both installer and unpacked outputs.

## Manual Smoke Checklist

- Launch Quill inside Tauri.
- Confirm the window title, icon, and basic shell chrome are correct.
- Load a Markdown file from disk.
- Save back to the same file.
- Save As to a new file.
- Reopen a recent file by path without being forced through a picker again.
- Confirm unsaved-change warnings still protect the current document.
- Confirm autosave, theme persistence, and recent-file unavailable-state handling still work.
- Confirm a browser-opened copy of `code/quill.html` still uses the existing fallback behavior.

## Promotion Rationale

The exit criteria for leaving `Plan` are now satisfied:

- Replacement runtime selected: Tauri.
- Desktop bridge contract documented: keep the existing three-call contract and payload shape.
- Packaging target decided: Tauri NSIS installer as the primary release artifact, with unpacked output verified for portable internal smoke usage.
- Recent-file behavior decision recorded: preserve path-based desktop reopen.
- Cleanup boundary defined: Electron remains until Tauri passes the smoke checklist, then the Electron shell, dependencies, and generated artifacts are removed.

## Implementation Gate Questions

- Which specific Tauri scaffolding approach should the repo adopt: attach Tauri directly to the current static frontend, or introduce a lightweight frontend dev server around `code/` during migration?
- Can fullscreen startup remain deferred until the shell is stable, with minimum size and frameless branding preserved first?

## Exit Criteria For Leaving Plan

- Replacement runtime selected.
- Desktop bridge contract documented.
- Packaging target decided for Windows release.
- Recent-file behavior decision recorded.
- Cleanup boundary defined for Electron entrypoints, dependencies, and generated artifacts.

## Acceptance Criteria

- Electron runtime entrypoints and packaging are removed from the repo.
- The replacement desktop runtime preserves Quill's required file workflows.
- The Windows desktop build and installer path are verified end to end.

## Verification

- Use the active implementation notes and smoke workflow in this PRD to verify the replacement runtime, packaging output, and direct desktop launch behavior before release.

## Next Step

No further implementation work is required for this item.

## Status

Done

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-12T13:09:13.6398072Z | Backlog |
| 2026-07-14T08:55:39.0213870Z | Plan |
| 2026-07-14T19:39:19.1700461Z | Implement |
| 2026-07-14T21:57:18.6079417Z | Test |
| 2026-07-14T21:57:18.7142589Z | Release |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T13:09:24.2378048Z | Backfill | Replaced the placeholder `Backlog` timestamp during the consistency sweep and preserved the original item intent: track full Electron removal from both code and project-managed filesystem surfaces. The original PRD creation time was not captured; the item remains in `Backlog` and is waiting to move into `01 - Plan`. |
| 2026-07-14T08:55:39.0531359Z | Promotion | Promoted this item to `Plan`. The PRD is now the active planning record for defining the replacement runtime, the migration order, and the project-managed cleanup boundary before any Electron removal work begins. |
| 2026-07-14T19:27:26.6414154Z | Analysis | Expanded the plan using the current repo state. Verified that Electron is currently concentrated in `package.json`, `code/main.js`, `code/preload.js`, and the desktop file-open/save branches inside `code/scripts/quill-app.js`, while the renderer already has browser File System Access and download fallbacks that can anchor a migration. |
| 2026-07-14T19:38:23.3212871Z | Decision | Locked the replacement runtime to Tauri and recorded the implementation workflow, packaging target, and manual setup requirements needed to begin implementation safely. |
| 2026-07-14T19:39:19.1700461Z | Promotion | Promoted this item to `Implement` because the implementation gate is now satisfied: the runtime choice, desktop bridge contract, Windows packaging target, recent-file behavior, cleanup boundary, and manual setup workflow are all documented. |
| 2026-07-14T20:45:13.7053925Z | Implementation | Replaced the repo's Electron entrypoints with a Tauri scaffold: `src-tauri/` now owns the desktop shell and file commands, `code/scripts/desktop-bridge.js` preserves the existing `window.QuillDesktop` contract for the renderer, `package.json` now targets Tauri scripts, and the local Node bootstrap now includes `@tauri-apps/cli`. Verified the static dev server and Tauri CLI install locally; `tauri info` confirmed WebView2 is present but also confirmed that `rustc`, `cargo`, and Visual Studio Build Tools with MSVC are still missing on this machine. |
| 2026-07-14T20:52:39.7066938Z | Implementation | Tightened the scaffold to match a fresh Tauri 2 template more closely: generated `src-tauri/icons/` from the Quill icon, added a Windows prereq check script and setup guide, switched the config schema to the local CLI schema, added explicit bundle icon entries, added the standard Windows release subsystem flag in `src-tauri/src/main.rs`, and installed `@tauri-apps/api` plus `@tauri-apps/plugin-dialog` so `tauri info` now reports the JS packages cleanly. The only remaining verified blockers for a live desktop run on this machine are the missing Rust and MSVC build prerequisites. |
| 2026-07-14T21:57:18.6079417Z | Verification | Installed Rust and Visual Studio Build Tools on the Windows machine, then verified the Tauri path end-to-end: `npm run tauri:info` reported all native prerequisites available, `npm run tauri:dev -- --no-watch` compiled and launched `target\\debug\\quill-tauri.exe`, the built debug executable stayed running during a direct launch check, `npm run build` produced `src-tauri\\target\\release\\bundle\\nsis\\Quill_1.0.2_x64-setup.exe`, and the release executable also stayed running during a direct launch check. |
| 2026-07-14T21:57:18.7142589Z | Cleanup | Removed the obsolete Electron runtime entrypoints, removed the old Electron `dist/` build output after Tauri packaging succeeded, and left the repo targeting Tauri-only desktop scripts and artifacts. |

## Legacy Notes

- This PRD includes a repaired `Backlog` capture from an earlier consistency sweep, so the original creation event was not recorded just in time.
