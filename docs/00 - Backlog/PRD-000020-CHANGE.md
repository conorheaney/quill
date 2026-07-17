# PRD-000020-CHANGE

## Short Name

Remove Browser Mode Paths

## Goal

Remove Quill's broader browser-mode code paths so the product is shaped around the packaged desktop executable as the supported end-user runtime.

## Context

Quill now targets a packaged desktop executable for end users, but parts of the codebase still preserve browser-mode behavior and fallback logic. That extra runtime branch adds product ambiguity, increases maintenance surface area, and can distort decisions in nearby features even when browser mode is not part of the intended shipped experience.

## Scope

In:

- identify the current browser-mode-specific code paths, fallbacks, and UI behavior that are no longer part of the intended product runtime
- remove or simplify those browser-only paths while preserving the supported desktop workflow
- define the new runtime baseline clearly enough that nearby work no longer needs to carry browser-mode accommodation by default
- capture any product or developer-facing documentation updates needed to reflect the desktop-only direction

Out:

- changing supported desktop file workflows beyond what is needed to remove browser-mode branching cleanly
- broad architectural rewrites unrelated to runtime-mode simplification
- adding new browser-hosted deployment options

## Plan

- Confirm which runtime paths still exist specifically to support non-desktop browser use.
- Define the intended desktop-only baseline and the first removal slice that can be planned safely.
- Identify the highest-risk places where browser-mode branching currently affects startup, preview, file handling, or product messaging.

## Acceptance Criteria

- The PRD clearly identifies the browser-mode behaviors and fallback paths that are candidates for removal.
- The PRD defines the supported desktop runtime baseline that should remain after browser-mode paths are removed.
- The PRD separates the first safe removal slice from any broader follow-on cleanup.

## Verification

- Verify which current Quill behaviors exist only to support non-desktop browser mode.
- Verify the PRD names the desktop workflows that must remain intact.
- Verify the planned first slice is narrow enough to implement without broad product ambiguity.

## Next Step

Move this item to `01 - Plan` and define the browser-mode surfaces to remove, the desktop-only baseline to preserve, and the first safe implementation slice.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-16T23:32:16.5377845Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-16T23:32:16.5377845Z | Scope discovery | Added as a backlog item after deciding Quill should be treated as a packaged desktop app for end users and that the broader browser-mode code paths should be removed in a separate change. |
| 2026-07-16T23:32:16.5377845Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
