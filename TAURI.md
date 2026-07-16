# Tauri Windows Setup

This repo now uses Tauri for the Quill desktop shell.

## Required Prerequisites

Install these before the first desktop run:

1. Node.js
2. Rust with the MSVC toolchain from [rustup.rs](https://rustup.rs/)
3. Visual Studio Build Tools with:
   - `Desktop development with C++`
   - Windows SDK
   - MSVC build tools
4. Microsoft Edge WebView2 runtime

## Quick Check

Run this from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-tauri-prereqs.ps1
```

That script runs `npm exec tauri info` and prints the current environment state.

## First Desktop Run

```powershell
npm install
npm run tauri:dev
```

If you only want the browser shell during development, run `npm run web:dev` and open the local URL it prints.

Expected development behavior:

- Tauri serves the static `code/` frontend directly in development.
- The Quill window opens with the standard platform window chrome enabled.
- `LOAD`, `SAVE`, `SAVE AS`, and Recent-file reopen should work through the Tauri desktop bridge.

## First Windows Build

```powershell
npm run build
```

Expected build behavior:

- Tauri compiles the Rust shell.
- Tauri bundles the Windows NSIS installer.
- Build artifacts land under the Tauri target output, not the old Electron output.

## Manual Smoke Checklist

Run these after `npm run tauri:dev` succeeds:

1. Open Quill.
2. Load a Markdown file from disk.
3. Save back to the same file.
4. Save As to a second file.
5. Reopen the first file from Recent.
6. Confirm unsaved-change warnings still appear.
7. Confirm theme state and autosave still persist.

## Current Machine Verification Snapshot

The current Codex machine verified these facts on 2026-07-15:

- WebView2 is present.
- Node and npm are present.
- `@tauri-apps/cli` is installed in the repo.
- Rust, Cargo, and the MSVC toolchain are installed.
- `npm run tauri:dev -- --no-watch` successfully launched Quill.

One environment quirk remains:

- the Rust toolchain is not currently present in the default Codex PATH, so ad hoc launches may need an explicit PATH prefix until the shell environment is refreshed or updated.

If your local run still fails, capture the full `npm exec tauri info` output and the exact `npm run tauri:dev` error.
