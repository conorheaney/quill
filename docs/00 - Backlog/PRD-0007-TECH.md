# PRD-0007-TECH

## Short Name

Remove Electron Runtime

## Goal

Remove Electron from the codebase and project-managed filesystem footprint once the replacement runtime and launch flow are ready.

## Context

The current project still depends on Electron entrypoints and packaging. `package.json` uses Electron start and build scripts, and the app shell still relies on Electron main-process and preload wiring.

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

## Next Step

Move this item to `01 - Plan` once the replacement runtime, migration sequence, and cleanup boundary are agreed.

## History

| Timestamp | Stage |
| --- | --- |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T00:00:00Z | Scope discovery | Added as a backlog item to track full Electron removal from both code and project-managed filesystem surfaces. |
| 2026-07-12T00:00:00Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
