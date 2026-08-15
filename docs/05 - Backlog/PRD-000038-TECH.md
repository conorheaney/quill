# PRD-000038-TECH

## Short Name

Make Recent-File Hydration Deterministic

## Goal

Prevent early recent-file activity from discarding persisted entries when hydration is still pending.

## Context

`REV-013` found that startup does not await recent-file hydration and that an early recorded entry can cause persisted entries to be silently discarded.

## Scope

In:

- define hydration and record ordering behavior
- await or deterministically merge persisted and in-memory entries
- preserve deduplication and the configured recent-file limit

Out:

- broader recent-files UI changes already addressed by other work
- unrelated storage-provider replacement

## Plan

During Plan, model hydrate-then-record and record-while-hydrating orderings, define precedence and deduplication, and identify the smallest controller seam.

## Acceptance Criteria

- AC-01: Hydration produces the same deduplicated, bounded recent-file list whether a record occurs before or after persisted entries resolve.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Exercise both hydration orderings with controlled storage promises and verify deterministic merged entries, precedence, and limit behavior. | Not yet recorded. |

## Next Step

Promote to Plan and define recent-file hydration state and merge precedence.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-013` in the PRD-000010-TECH code review. Scope is limited to deterministic hydration and record ordering, preserving existing recent-files product scope. |
