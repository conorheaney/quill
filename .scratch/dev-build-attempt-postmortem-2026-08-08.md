# Quill Development Build Attempt Postmortem

## Purpose

This document records the development-build attempt for Quill on 2026-08-08. It explains the commands considered, each execution attempt, the failures encountered, the successful fallback build, the resulting artifact, and recommended ways to make future development builds more predictable.

## Requested Outcome

Build the development version of the Tauri desktop application without making source changes as part of the build request.

The repository exposes these relevant paths:

- `npm run tauri:dev` — starts the Tauri development workflow.
- `npm run tauri:dev -- --no-watch` — the documented development workflow with file watching disabled.
- `npm run tauri:build` — creates a production-style bundled build.
- `cargo build --manifest-path src-tauri/Cargo.toml` — compiles the Rust application in Cargo's default `dev` profile and produces the debug executable.

## Step-by-Step Record

### 1. Inspect the repository build configuration

The package scripts and repository documentation were inspected before running a build. The package configuration confirmed that the project is Tauri-based and provides `tauri:dev` and `tauri:build` scripts. The repository's historical verification notes identify `npm run tauri:dev -- --no-watch` as the development path that compiles and launches `target\\debug\\quill-tauri.exe`.

This established the intended first approach: use the Tauri development command with `--no-watch`, while running it in the background so the build result could be observed without blocking the task.

### 2. First background launcher attempt

The first attempt used PowerShell `Start-Process` to launch `npm.cmd run tauri:dev -- --no-watch` in a hidden process. Standard output and standard error were both redirected to the same log file so the command could be monitored in one place.

The command failed before launching npm. PowerShell reported:

> This command cannot be run because `RedirectStandardOutput` and `RedirectStandardError` are same.

No Tauri build was performed by this attempt.

An important diagnostic complication was that `src-tauri\\target\\debug\\quill-tauri.exe` already existed from an earlier build. A simple existence check therefore could not be used to claim that this attempt had rebuilt the executable.

### 3. Second background launcher attempt

The second attempt corrected the first mistake by using separate files for standard output and standard error. It also recorded the start time and required the debug executable's modification time to be newer than the start time before reporting success.

This attempt also failed before npm or Tauri started. PowerShell's `Start-Process` reported:

> Item has already been added. Key in dictionary: `Path` Key being added: `PATH`

The failure came from the managed Windows process-launch environment while `Start-Process` was constructing the child process environment. It was not a Rust compilation error, a Tauri configuration error, or an application-code error.

The existing debug executable remained unchanged after this attempt. Its timestamp was still the earlier artifact timestamp, so the fresh-build guard correctly reported that no new debug binary had been produced.

The temporary stdout and stderr log files created for this attempt were removed after diagnosis. They were only launcher diagnostics and were not part of the source change set.

### 4. Direct Cargo development build

Because both failures occurred in PowerShell's background launcher setup, the build was narrowed to the underlying Rust development build:

```powershell
cargo build --manifest-path src-tauri/Cargo.toml
```

This command completed successfully:

```text
Compiling quill-tauri v1.0.11
Finished `dev` profile [unoptimized + debuginfo]
```

The build took approximately 63 seconds, including dependency and application compilation.

## Resulting Artifact

The fresh development executable was produced at:

`C:\Projects\Tools\quill\src-tauri\target\debug\quill-tauri.exe`

Recorded artifact details:

| Property | Value |
| --- | --- |
| Build profile | `dev` |
| Debug information | Included by the `dev` profile |
| File size | 14,401,024 bytes |
| Last-write time | `2026-08-08T17:08:43.5242756+01:00` |
| Source command | `cargo build --manifest-path src-tauri/Cargo.toml` |

## What Was Verified

The successful Cargo build proves that the Rust/Tauri application compiled successfully in the development profile and that the current native source and dependencies were accepted by the compiler.

It does not, by itself, prove all behavior associated with `npm run tauri:dev`, because the Tauri development command also manages the frontend development URL/server and application launch lifecycle. The successful build therefore confirms the debug executable, but it is not a substitute for launching the application and checking live frontend integration.

## Root Causes

### Failure 1: Shared output and error redirection

PowerShell does not allow `Start-Process` to use the same path for `RedirectStandardOutput` and `RedirectStandardError`. The launcher failed during process setup, before npm ran.

### Failure 2: Child-process environment collision

With separate log files, `Start-Process` reached a different PowerShell limitation in the managed environment. The environment dictionary contained a duplicated `PATH` key while constructing the child process. This appears to be a process-launch/environment interaction rather than a Quill or Tauri build problem.

### Diagnostic risk: stale artifact detection

The debug executable already existed before the first two attempts. Checking only whether the file exists would have produced a false positive. Comparing the artifact modification time with the build start time avoided that mistake.

## Recommended Future Plan

### Short term

- Use `cargo build --manifest-path src-tauri/Cargo.toml` when the immediate requirement is only a fresh debug executable.
- Always record the build start time and verify the output timestamp after the command completes.
- Keep launcher stdout and stderr in separate files when using PowerShell `Start-Process`.
- Do not use an existing artifact's presence as proof that a new build succeeded.

### Medium term

Add a repository-level development-build script that performs these checks consistently. A robust wrapper should:

1. Resolve the workspace and expected artifact path explicitly.
2. Capture a start timestamp.
3. Run the chosen Tauri or Cargo command directly when possible.
4. Use distinct output and error logs if background execution is required.
5. Check the command exit code.
6. Check that the expected executable was created or updated after the start timestamp.
7. Print the absolute artifact path and build profile.
8. Remove only its own temporary logs after a successful run, or retain them with a clear failure message for diagnosis.

### Long term

Provide two clearly named commands so the distinction is explicit:

- A non-launching debug compile command for producing `target/debug/quill-tauri.exe`.
- A Tauri development-run command for starting the frontend development server and launching the desktop window.

The development-run command should be tested in the managed Windows environment without relying on `Start-Process` to rebuild the child environment manually. If background execution is necessary, the wrapper should launch through a process mechanism that does not duplicate inherited environment keys, or construct a sanitized environment with a single canonical `PATH` entry.

## Final State

- The requested development executable was built successfully.
- No source changes were made by the build request.
- Temporary launcher logs were removed.
- The existing working-tree source changes from the separate Recent Files implementation task were preserved.

## Recorded

2026-08-08
