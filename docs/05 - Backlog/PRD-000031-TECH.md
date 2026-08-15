# PRD-000031-TECH

## Short Name

Decompose Application Controller

## Goal

Separate document-session, persistence, rendering, desktop, and code-image responsibilities so changes can be made and tested without a monolithic controller.

## Context

`REV-006` found that `quill-app.js` owns bootstrap, state, persistence, rendering, dialogs, recent files, and pane coordination through ordered globals. This coupling makes unrelated changes risky and complicates focused testing.

## Scope

In:

- define explicit service and document-session boundaries
- extract behavior-preserving coordinators from bootstrap composition
- replace implicit ordered global coupling where included in the approved slice

Out:

- TypeScript migration, which remains owned by PRD-000021-TECH
- visual redesign or behavior changes not required by the decomposition

## Plan

During Plan, map current controller responsibilities and choose the smallest seam-first extraction sequence supported by existing tests.

## Acceptance Criteria

- AC-01: The approved controller slice exposes explicit ownership and dependency boundaries, with covered open/edit/save/recovery transitions testable without constructing the full application DOM.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Verify extracted seams with controller workflow tests and confirm the application bootstrap still wires the supported flows. | Not yet recorded. |

## Next Step

Promote to Plan and inventory controller responsibilities before selecting the first extraction slice.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-006` in the PRD-000010-TECH code review. The item is constrained to behavior-preserving ownership and testability improvements; TypeScript migration remains separate. |
