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
- rebase relative image references so the saved copy continues to point to the same assets

Out:

- general image-cache policy, owned by PRD-000033-TECH
- unrelated Save As UX redesign

## Plan

1. Treat the active file path and its parent directory as render context. After a successful Save As, update that context before requesting the preview refresh.
2. Invalidate path-dependent image state and rerender immediately so relative images resolve against the new parent directory. Do not alter content-dirty state as part of this refresh.
3. During Save As, rebase relative image references from the original document directory to the selected destination before writing. Use a relative path when both locations share a volume; use an absolute path when they do not. Leave external, absolute, and URL references unchanged.
4. After a successful write, adopt the returned file identity and saved content, then rerender against the new path. Keep unavailable assets as missing-image indicators without blocking or undoing the successful document save.
5. If the source contains relative images, warn before writing that the copied references may not resolve correctly in the new location. Continue performs the copy and Cancel leaves the source document unchanged.
6. Verify with a deterministic two-directory fixture containing a relative image, confirm the copied Markdown contains the rebased reference and reloads with the image available, and cover the warning Continue/Cancel paths plus genuinely unavailable assets.

## Acceptance Criteria

- AC-01: Saving a relative-image document into a new directory rebases its relative image references so the saved copy continues to resolve the same assets without creating a false content-dirty state.
- AC-02: After a successful Save As, Quill adopts and renders the saved content; genuinely unavailable assets show missing-image indicators, while cancelling the native Save As picker leaves the current path and preview unchanged.
- AC-03: Save As warns when the source contains relative images; Continue performs the copy and Cancel prevents it without changing the current document.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Save the evidence document to a second directory, verify the copied Markdown contains a rebased image reference, reload it, and confirm the image remains available and the document is clean. | Not yet recorded. |
| TC-02 | AC-02 | pending | `planned` | Verify the saved content is adopted and rendered, genuinely unavailable assets show indicators, and native Save As cancellation preserves the current document state. | Not yet recorded. |
| TC-03 | AC-03 | pending | `planned` | Verify the relative-image warning appears before Save As writes, Continue saves, and Cancel prevents the copy. | Not yet recorded. |

## Next Step

Candidate `1.1.4` is prepared; run explicit `prd-promote` validation before entering Test for the relative-image refresh and unavailable-asset verification scenarios.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |
| 2026-09-01T19:16:28.9994248Z | Plan |
| 2026-09-01T19:25:59.7739025Z | Implement |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-011` in the PRD-000010-TECH code review. Scope is limited to Save As path-context refresh and does not duplicate general cache lifecycle work. |
| 2026-09-01T19:16:28.9994248Z | Promotion | Promoted from Backlog to Plan after the workflow checks passed. |
| 2026-09-01T19:25:30.3995922Z | Clarification | Confirmed full refresh behavior and warning, Continue, and Cancel outcomes for relative images on a different network drive. |
| 2026-09-01T19:34:12.5419060Z | Implementation | Added Save As path-context refresh, network-location warning, and automated Continue/Cancel coverage within the approved scope. |
| 2026-09-02T20:45:48.6586883Z | Requirement revision | Replaced the unreliable network-drive warning with post-save resolution and explicit missing-image indicators based on actual asset availability. |
| 2026-09-02T20:56:25.9058350Z | Requirement revision | Added Save As rebasing so copied Markdown preserves relative image assets and reload behavior. |
| 2026-09-02T20:59:52.7218923Z | Build correction | Configured packaged debug and release builds to regenerate the frontend bundle before packaging. |
| 2026-09-02T21:04:45.5686352Z | Requirement clarification | Added a general Save As warning for documents containing relative images, with explicit Continue and Cancel actions. |
| 2026-09-04T22:14:28.8952299Z | Candidate preparation | Prepared product candidate `1.1.4`; release build and NSIS bundle succeeded, the root executable matches the release executable at SHA-256 `E4518CE2D68BBB965B62C35616CFA38BA897921F8F098457CC159481EC0054D3`, and typecheck, tests, static checks, and workflow validation passed. |
