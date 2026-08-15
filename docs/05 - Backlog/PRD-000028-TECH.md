# PRD-000028-TECH

## Short Name

Preserve Untouched Markdown Source

## Goal

Make Render-pane edits preserve every byte outside the source range explicitly owned by the edited block.

## Context

`REV-001` found that the current whole-document block serialization can rewrite unsupported or nuanced Markdown when one block is edited. The existing source-preservation tests in `PRD-000002-TECH` define the regression contract but the production edit model remains unchanged.

## Scope

In:

- define a lossless source-backed edit strategy for owned ranges
- preserve unsupported Markdown and surrounding source exactly
- disable or constrain edits when lossless write-back cannot be guaranteed

Out:

- broad Markdown parser expansion unrelated to edit preservation
- visual redesign or unrelated controller decomposition

## Plan

During Plan, select the source-offset and stable-block identity model, identify supported editable cases, and map the existing source-preservation tests to the production seam.

## Acceptance Criteria

- AC-01: An approved edit changes only its owned source range and preserves all other source bytes, with unsupported cases remaining unchanged or explicitly non-editable.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Run the existing supported and unsupported source-preservation corpus against the production edit path and verify byte stability outside the owned range. | Not yet recorded. |

## Next Step

Promote to Plan and define the source ownership model and first implementation slice.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-001` in the PRD-000010-TECH code review. Existing regression contracts remain under PRD-000002-TECH; this item owns the production lossless-edit correction. |
