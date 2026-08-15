# PRD-000035-TECH

## Short Name

Consolidate Markdown Runtime Paths

## Goal

Remove duplicated or unused Markdown runtime paths so each supported behavior has one clear owner.

## Context

`REV-010` found duplicate rendering routes, language normalization, storage constants, and an unused renderer export, increasing drift and maintenance risk.

## Scope

In:

- establish the canonical parsing/rendering path
- centralize duplicated helpers and constants
- remove unused exports after behavior is covered
- document the supported Markdown contract where needed

Out:

- new Markdown feature support unrelated to consolidation
- lossless inline-edit implementation, owned by PRD-000028-TECH

## Plan

During Plan, trace callers and tests for each duplicate path, decide the canonical owner, and sequence safe removals behind coverage.

## Acceptance Criteria

- AC-01: Each retained Markdown behavior has one owning implementation, with no duplicate live constants or unused renderer export in the approved scope.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Run the full Markdown suite and repository search after consolidation to confirm behavior and ownership remain intact. | Not yet recorded. |

## Next Step

Promote to Plan and inventory callers, tests, and ownership for each duplicated path.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-010` in the PRD-000010-TECH code review. The item is constrained to consolidation after coverage, without expanding the supported Markdown feature set. |
