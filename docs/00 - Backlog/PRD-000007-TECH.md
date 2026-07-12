# PRD-000007-TECH

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
| 2026-07-12T13:09:13.6398072Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T13:09:24.2378048Z | Backfill | Replaced the placeholder `Backlog` timestamp during the consistency sweep and preserved the original item intent: track full Electron removal from both code and project-managed filesystem surfaces. The original PRD creation time was not captured; the item remains in `Backlog` and is waiting to move into `01 - Plan`. |
