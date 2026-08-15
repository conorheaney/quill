# PRD-000032-TECH

## Short Name

Bound Embedded Asset Persistence

## Goal

Prevent large embedded assets from exhausting synchronous draft storage or leaving users with misleading save feedback.

## Context

`REV-007` found that dropped and generated images become unbounded data URLs and that synchronous `localStorage` writes lack quota/error handling.

## Scope

In:

- define document and embedded-asset size limits
- handle storage quota and persistence failures
- provide actionable recovery feedback and preserve data where possible

Out:

- full file-backed asset architecture unless selected as the smallest approved solution
- unrelated draft-recovery ownership in PRD-000023-CHANGE

## Plan

During Plan, measure current asset growth and storage behavior, choose limits and fallback behavior, and define failure-state contracts.

## Acceptance Criteria

- AC-01: Oversized or quota-failing asset persistence is bounded or rejected without freezing, data loss, or false saved status, and the user receives actionable recovery feedback.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Exercise oversized assets, quota failures, and normal persistence with deterministic storage fakes and verify status/recovery behavior. | Not yet recorded. |

## Next Step

Promote to Plan and define asset limits and persistence failure behavior.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-007` in the PRD-000010-TECH code review. The scope isolates storage resilience from the separate draft-recovery and controller-decomposition items. |
