# PRD-000039-CHANGE

## Short Name

Synchronize Markdown And Render Scrolling

## Goal

When a user edits one pane, keep that active pane's native scroll position and automatically reposition only the inactive counterpart to the corresponding content.

## Context

Quill currently synchronizes scrolling between the Markdown and Render panels using the proportional scroll range of each panel. This is not accurate because rendered Markdown is typically considerably taller than the raw source. During editing, the active pane can be scrolled by the user's caret or inline editor while the proportional synchronization also moves it indirectly, making the experience feel unstable and leaving the paired pane at the wrong logical position.

## Scope

In:

- Synchronize the inactive counterpart when the raw Markdown pane is being edited.
- Synchronize the inactive counterpart when the Render pane is being edited.
- Map the edited source or rendered block to its corresponding block in the inactive pane where feasible.
- Keep the actively edited pane under native user control.
- Prevent proportional scroll mirroring and reciprocal scroll feedback in the first pass.

Out:

- Continuous bidirectional scroll mirroring while the user is merely browsing.
- Perfect source-to-render mapping for every Markdown construct in the first pass.
- Redesigning the Markdown or Render pane layout.
- Changing Markdown parsing or rendering semantics.
- Synchronizing unrelated panes or external editor windows.

## Plan

Implement the first pass around edit-driven one-way synchronization. Identify the active edit pathway in each pane, retain its native scroll position, and reposition only the inactive pane using the edited block or the nearest reliable logical anchor. Remove proportional scroll-range mirroring from the edit flow and guard the counterpart update against reciprocal scroll events. Use proportional or broader fallback mapping only if a reliable block correspondence is unavailable, and refine support for complex constructs during later planning.

## Acceptance Criteria

- AC-01: While editing raw Markdown, the raw Markdown pane keeps its native user-controlled scroll position and only the Render pane is automatically repositioned.
- AC-02: While editing the Render pane, the Render pane keeps its native user-controlled scroll position and only the raw Markdown pane is automatically repositioned.
- AC-03: Edit-driven counterpart synchronization does not use proportional full-range mirroring, create reciprocal scroll feedback, or visibly fight the active editor.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01, AC-02, AC-03 | pending | `planned` | Edit distinctive content in the raw Markdown and Render panes using documents where rendered content is substantially taller than source, verifying that only the inactive counterpart moves and that the active pane does not jump or enter a feedback loop. | Not yet recorded. |

## Next Step

Run the packaged-candidate verification for TC-01 using a document with substantial source-to-render height differences, then record the result and evidence.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-16T13:09:34.1201183Z | Backlog |
| 2026-08-16T13:49:43.5505913Z | Plan |
| 2026-08-16T14:03:24.5629410Z | Implement |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-16T13:09:34.1201183Z | Requirement shaping | Created from the user's report that Markdown-to-Render scrolling is not reliably synchronized because rendered Markdown does not occupy the same vertical positions as the raw source. The initial scope focuses on bidirectional logical-position alignment and stable behavior; pane redesign and rendering semantics remain out of scope. |
| 2026-08-16T13:49:43.5505913Z | Promotion | User confirmed promotion from Backlog to Plan after the PRD identity, structure, scope, acceptance criteria, verification approach, and next-step gate checks passed. |
| 2026-08-16T14:01:47.9384204Z | Requirement clarification | User selected the first-pass behavior: break proportional scrolling during edits, keep the active pane's native scroll position, and automatically reposition only the inactive counterpart. Block-perfect mapping for every Markdown construct and continuous browsing synchronization remain deferred. |
| 2026-08-16T14:03:24.5629410Z | Promotion | User confirmed promotion from Plan to Implement after the Plan, acceptance criteria, verification approach, and next-step gate checks passed. |
| 2026-08-16T14:12:42.1036579Z | Implementation | Removed proportional scroll-event mirroring. Added edit-driven one-way synchronization using source block ranges for raw Markdown edits and rendered block indexes for Render edits; the active pane retains native scrolling while only the inactive counterpart is repositioned. Added parser range coverage and retained the existing scroll reset behavior for document replacement. |
