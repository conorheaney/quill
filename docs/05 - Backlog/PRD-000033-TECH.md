# PRD-000033-TECH

## Short Name

Bound Preview Image Cache

## Goal

Keep preview image memory bounded and ensure changed files or document transitions do not display stale cached content.

## Context

`REV-008` found that the desktop bridge retains base64 image promises for the process lifetime without eviction or invalidation.

## Scope

In:

- bound image-cache size and lifetime
- invalidate entries when files or document/path context changes
- release document-scoped resources where appropriate

Out:

- general render scheduling, owned by PRD-000034-TECH
- unrelated desktop trust-boundary policy, owned by PRD-000030-TECH

## Plan

During Plan, define cache keys, metadata/invalidation sources, memory limits, and the smallest testable cache seam.

## Acceptance Criteria

- AC-01: Cache growth is bounded, changed image files refresh, and switching documents or paths releases entries no longer needed.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Verify cache eviction, file-change refresh, and document/path invalidation with deterministic bridge and filesystem fakes. | Not yet recorded. |

## Next Step

Promote to Plan and define cache ownership, keys, invalidation, and limits.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-008` in the PRD-000010-TECH code review. Scope is limited to image-cache lifecycle and does not absorb render scheduling or desktop policy work. |
