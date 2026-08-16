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
- Provide anchor-based synchronization when the user manually scrolls either pane.
- Show the current corresponding block in both panes with a restrained visual position indicator.

Out:

- Pixel-perfect continuous mirroring for every scroll position and Markdown construct.
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
- AC-04: Manually scrolling either pane uses the nearest corresponding block as an anchor to reposition the other pane without scroll oscillation.
- AC-05: The current corresponding block is visibly identified in both panes during editing and manual scrolling.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01, AC-02, AC-03, AC-04, AC-05 | pending | `planned` | Edit distinctive content in the raw Markdown and Render panes, then manually scroll each pane using a document where rendered content is substantially taller than source; verify one-way edit synchronization, anchored manual synchronization, stable behavior, and current-block indicators. | Not yet recorded. |

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
| 2026-08-16T14:24:09.1675499Z | Scope clarification | User approved adding anchor-based synchronization for manual scrolling and a current-block indicator/highlight in both panes as part of this implementation. Pixel-perfect mirroring remains out of scope. |
| 2026-08-16T14:24:09.1675499Z | Implementation | Added nearest-block manual scroll synchronization with a reentrancy guard, Render block highlighting, and a Markdown source-block position indicator. |
| 2026-08-16T14:33:49.5718214Z | UX refinement | Replaced the text position indicator with narrow 4px gutters: the Markdown gutter is on the left edge and the Render gutter is on the right edge. Each gutter shows a colored marker for the synchronized current block. |
| 2026-08-16T14:40:49.0000000Z | UX refinement | Raw Markdown edits now keep the gutter marker tied to the edited source block and position the corresponding rendered block at the same vertical target in the Render pane. |
| 2026-08-16T14:45:10.4320605Z | UX refinement | Raw Markdown focus and caret movement now take precedence over manual block tracking: the caret remains visibly styled, the marker follows its line, and the corresponding Render block aligns to that line. |
| 2026-08-16T14:50:41.0000000Z | UX refinement | Hardened raw caret tracking with document selection-change handling and immediate marker movement so the Markdown gutter follows the cursor without animation lag. |
| 2026-08-16T14:53:11.0000000Z | UX refinement | Replaced newline-only marker positioning with a hidden textarea-style measurement pass so wrapped Markdown lines position the gutter marker at the caret's actual visual line. |
| 2026-08-16T14:54:53.9056596Z | UX refinement | Sized the raw caret marker to the Markdown line height while it tracks the cursor, keeping the colored gutter segment aligned to one visual text line. |
| 2026-08-16T14:56:00.0000000Z | UX refinement | Raw marker measurement now follows the active caret endpoint for forward and backward text selections instead of always using selectionStart. |
| 2026-08-16T15:00:33.3834636Z | Runtime verification | Launched the fresh debug build and verified by controlled desktop interaction that clicking a raw Markdown heading places the blue left gutter marker on the same visible text row as the caret. |
| 2026-08-16T16:49:04.4164697Z | Bug fix | Corrected the hidden caret probe from an inline-block to an inline client-rectangle measurement, removing the one-line-below offset reported during runtime testing. |
| 2026-08-16T16:57:00.4519990Z | Bug fix | Replaced synthetic caret markers with a collapsed DOM Range at the exact caret offset, stabilizing marker placement for cursor positions within a line as well as at line ends. |
| 2026-08-16T17:04:59.9537665Z | Bug fix | At line starts, the marker now measures the first character's range on that line to avoid the browser resolving a collapsed boundary to the preceding line. |
| 2026-08-16T17:09:53.5737508Z | Runtime verification | Reproduced a soft-wrapped continuation line with deterministic mouse and Home-key placement; the caret and blue gutter marker appeared on the same visual row. |
| 2026-08-16T17:17:37.5459216Z | Bug fix | Added keyboard caret affinity so End and Left resolve shared visual-line boundaries to the preceding row, while Home and Right resolve them to the following row. |
