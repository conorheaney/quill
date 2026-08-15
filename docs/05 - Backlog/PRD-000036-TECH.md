# PRD-000036-TECH

## Short Name

Refresh Rendering After Save As

## Goal

Ensure Save As immediately updates path-dependent image resolution without changing document dirty state.

## Context

`REV-011` found that Save As changes the current path but does not rerender or rehydrate relative images until a later edit.

## Scope

In:

- treat the active file path as render context
- invalidate path-dependent image state after Save As
- rerender immediately without marking content dirty

Out:

- general image-cache policy, owned by PRD-000033-TECH
- unrelated Save As UX redesign

## Plan

During Plan, define path-context transitions and a deterministic two-directory relative-image scenario for the first implementation slice.

## Acceptance Criteria

- AC-01: Saving the same relative-image document into a new directory immediately resolves images against the new path without creating a false content-dirty state.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Verify immediate relative-image resolution after Save As across two directories and confirm dirty-state behavior. | Not yet recorded. |

## Next Step

Promote to Plan and define the path-context transition and first integration test.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-011` in the PRD-000010-TECH code review. Scope is limited to Save As path-context refresh and does not duplicate general cache lifecycle work. |
