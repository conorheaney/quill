# PRD-000039-CHANGE Current Functionality Analysis

| Field | Detail |
| --- | --- |
| PRD | [PRD-000039-CHANGE](../../docs/25%20-%20Closed/PRD-000039-CHANGE.md) |
| Analysis Type | Current functionality description |
| Recorded | 2026-08-16T13:48:17.3808296Z |
| Source | Static analysis of the current Markdown and Render pane implementation |

## Current Functionality

Quill synchronizes scrolling bidirectionally between the raw Markdown textarea and the rendered Markdown panel.

- Scrolling the Markdown panel invokes the shared synchronization function with the Render panel as the target.
- Scrolling the Render panel invokes the same function with the Markdown panel as the target.
- The source position is normalized as `scrollTop / max(scrollHeight - clientHeight, 1)`.
- The target receives that normalized value multiplied by its own available scroll range, `max(scrollHeight - clientHeight, 0)`.
- A shared `isSyncingScroll` guard prevents the target update from immediately creating a feedback loop. The guard is released on the next animation frame.
- Replacing the document content resets both panels to `scrollTop = 0` and temporarily uses the same guard while the reset completes.
- The Render panel separately tracks the active heading during scrolling by selecting the last heading whose top edge is within the panel's upper threshold.

## Current Limitation

The synchronization is based on proportional scroll range rather than a mapping between corresponding Markdown source blocks and rendered blocks. This works when both panels have similar vertical geometry, but it can place the panels at different logical content positions when rendered Markdown changes the document height or spacing. Headings, paragraphs, lists, tables, images, code blocks, inline editors, and other rendered structures can therefore cause visible drift between the raw source and rendered content.

The current implementation does not yet provide an explicit source-to-render anchor map, block-level correspondence model, or specialized handling for differing rendered heights. The observed limitation is the subject of PRD-000039-CHANGE; this record describes the baseline behavior and does not claim that the planned improvement has been implemented.

## Relevant Implementation Locations

- `code/scripts/quill-app.js`: shared scroll synchronization, reentrancy guard, and document scroll reset.
- `code/scripts/markdown-pane.js`: Markdown textarea scroll event registration and scroll-element exposure.
- `code/scripts/preview-pane.js`: Render panel scroll event registration and active-heading tracking.
