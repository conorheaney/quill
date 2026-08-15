# PRD-000037-TECH

## Short Name

Add Bootstrap Failure Boundary

## Goal

Give users a clear, recoverable in-app state when packaged startup fragments or initialization fail.

## Context

`REV-012` found that the bootstrap async IIFE has no terminal failure boundary, so a missing or corrupt runtime fragment can leave a partially initialized shell with only a console rejection.

## Scope

In:

- catch initialization failures at the application boundary
- record the failing stage sufficiently for diagnosis
- render a minimal accessible fatal-startup view with recovery guidance

Out:

- broad build-time template composition unless required by the selected fix
- unrelated bootstrap or visual redesign

## Plan

During Plan, enumerate bootstrap stages and define the fatal view, error reporting, and deterministic fragment-failure verification scenario.

## Acceptance Criteria

- AC-01: A failed initialization stage produces a readable, accessible fatal-startup state rather than an unhandled rejection or silently partial shell.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Intentionally reject a startup fragment or initialization stage and verify the fatal state, stage signal, and recovery guidance. | Not yet recorded. |

## Next Step

Promote to Plan and define the bootstrap stages and fatal-startup contract.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-012` in the PRD-000010-TECH code review. The item isolates startup failure handling from unrelated template and UI redesign decisions. |
