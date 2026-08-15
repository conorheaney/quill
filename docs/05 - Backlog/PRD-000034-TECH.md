# PRD-000034-TECH

## Short Name

Schedule Large-Document Rendering

## Goal

Keep typing responsive on large documents by coalescing render work without dropping the latest edit.

## Context

`REV-009` found that every input synchronously reparses Markdown, replaces the preview DOM, rebuilds the outline, and starts image hydration.

## Scope

In:

- schedule or coalesce render work
- separate or avoid unchanged parse/render/outline/image work where practical
- define representative large-document responsiveness measures

Out:

- speculative incremental rendering beyond measured need
- image-cache lifecycle, owned by PRD-000033-TECH

## Plan

During Plan, create representative large-document fixtures, measure the current pipeline, and choose a scheduling boundary that preserves latest-edit behavior.

## Acceptance Criteria

- AC-01: Defined large-document fixtures meet an agreed responsiveness budget without dropping, reordering, or rendering stale edits.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Measure large prose, table, and image-heavy fixtures before and after scheduling changes, including rapid successive edits. | Not yet recorded. |

## Next Step

Promote to Plan and establish baseline fixtures and a measurable responsiveness target.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-009` in the PRD-000010-TECH code review. Scope focuses on scheduling and measurable responsiveness, not an unbounded rendering rewrite. |
