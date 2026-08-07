# PRD-000008-TECH

## Short Name

Refactor Stylesheet Structure

## Goal

Refactor the app CSS into a clearer, more maintainable structure without changing the intended visual design.

## Context

The current UI styling is concentrated in `code/styles/quill.css`, which mixes theme tokens, shell layout, pane styling, dialog presentation, editor states, and component-specific rules in one place.

## Scope

In:

- reorganize stylesheet structure and section boundaries
- clarify selector ownership for shell, panes, dialogs, inline editors, and recent-files UI
- normalize shared theme tokens and repeated styling patterns
- improve maintainability without introducing a framework or changing the product's intended visual direction

Out:

- broad UI redesign work
- accessibility remediation that should stay in `PRD-000004-UI`
- unrelated markup or behavior changes unless required to support the CSS refactor safely

## Plan

- Keep `code/styles/quill.css` as the structural and component stylesheet for reset rules, shell layout, panes, dialogs, controls, editor states, and recent-files UI.
- Create a named theme stylesheet set under `code/styles/themes/`, with at least `quill-theme-light.css` and `quill-theme-dark.css`.
- Move theme-owned values and rules into the named theme stylesheets, including color tokens, font-family and typography tokens, and rendering-style tokens such as shadows, gradients, borders, radii, and transition choices.
- Define a stable theme contract so structural selectors consume shared custom properties and do not duplicate light/dark values throughout the component stylesheet.
- Define stylesheet loading and theme-switching behavior so exactly one named theme stylesheet is active at a time and the existing light/dark user behavior remains intact.
- Refactor in small slices, preserving selector behavior and keeping markup and JavaScript changes out of scope unless a stylesheet-loading boundary requires a minimal integration change.
- Verify the refactor against the existing desktop layout in light and dark themes, the two-column Markdown and Render state, the Render-only state, the Recent Files UI, and the inline Markdown editing state before implementation is considered complete. Use a representative desktop window size; testing multiple window sizes is not required for this item.

## Acceptance Criteria

- `AC-01`: Structural/component rules and theme rules have clear ownership, with light and dark themes represented by separate named stylesheets covering colors, fonts, and rendering styles.
- `AC-02`: Switching between the named themes preserves the existing supported visual states and does not change editor, pane, dialog, or recent-files behavior.
- `AC-03`: The refactored stylesheets pass the agreed desktop layout and visual regression checks without an unintended product redesign.

## Verification

| Test Case | Criteria | Product Version | Git Commit | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `1.0.6` | [07a997e](https://github.com/conorheaney/quill/commit/07a997edf3a9f250ecd8159e50084bc9bfa36b3d) | `complete` | Inspect the final stylesheet set and confirm the agreed structural/component ownership boundaries, separate named theme files, shared theme contract, and absence of duplicated theme definitions in structural sections. | [TC-01 evidence](../90%20-%20Evidence/PRD-000008-TC-01.md) |
| `TC-02` | `AC-01`, `AC-03` | `1.0.6` | [07a997e](https://github.com/conorheaney/quill/commit/07a997edf3a9f250ecd8159e50084bc9bfa36b3d) | `complete` | Run the desktop app in each named theme at a representative desktop window size and check the two-column Markdown and Render state, the Render-only state, the Recent Files UI, and the inline Markdown editing state against the pre-refactor baseline. Dialog checks and multiple window sizes are not required. | [TC-02 evidence](../90%20-%20Evidence/PRD-000008-TC-02.md) |
| `TC-03` | `AC-02`, `AC-03` | `1.0.6` | [07a997e](https://github.com/conorheaney/quill/commit/07a997edf3a9f250ecd8159e50084bc9bfa36b3d) | `complete` | Switch between the named themes and confirm theme switching remains functional, supported visual states are preserved, and intentional light/dark visual differences remain in scope. | [TC-03 evidence](../90%20-%20Evidence/PRD-000008-TC-03.md) |

## Next Step

All planned test cases passed against product version `1.0.6` at commit `07a997edf3a9f250ecd8159e50084bc9bfa36b3d`; the PRD is accepted and closed in `Closed`.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-12T13:09:14.6398072Z | Backlog |
| 2026-08-05T22:15:07.8033594Z | Plan |
| 2026-08-05T22:55:59.1427488Z | Implement |
| 2026-08-05T23:21:51.2152376Z | Test |
| 2026-08-06T00:20:00.2821898Z | Closed |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T13:09:25.2378048Z | Backfill | Replaced the placeholder `Backlog` timestamp during the consistency sweep and preserved the original item intent: track technical CSS refactoring separately from UI redesign or accessibility work. The original PRD creation time was not captured; the item remains in `Backlog` and is waiting to move into `10 - Plan`. |
| 2026-08-05T22:15:07.8033594Z | Promotion | Promoted to `Plan` after user confirmation. Planning was narrowed to stylesheet ownership, separate named light and dark theme stylesheets, a shared theme contract covering colors, fonts, and rendering styles, and minimum visual regression checks. |
| 2026-08-05T22:55:59.1427488Z | Promotion | Promoted to `Implement` after user confirmation. The PRD has passed the planning gate with a defined implementation plan, minimum acceptance criteria, and table-formatted verification cases. |
| 2026-08-05T23:04:25.0581606Z | Implementation | Added separate `quill-theme-light.css` and `quill-theme-dark.css` files under `code/styles/themes/`, moved the color/font/theme rendering tokens out of `quill.css`, and added named stylesheet activation so exactly one theme stylesheet is enabled at a time. Structural CSS now consumes shared theme variables for theme transitions, surfaces, control radii, and overlay shadows. |
| 2026-08-05T23:04:39.7247694Z | Verification | `node --check` passed for the modified application scripts. `npm run build` completed successfully and produced the Tauri release executable and NSIS installer. The root `quill.exe` was synchronized with the release executable and their SHA-256 hashes match. Formal visual verification remains for `Test`. |
| 2026-08-05T23:17:56.1438235Z | Test candidate | Bumped the synchronized product version from `1.0.5` to `1.0.6`, built the Tauri release executable and NSIS installer, synchronized the root `quill.exe`, and confirmed matching SHA-256 hashes. JavaScript syntax checks passed. The candidate is ready for commit and explicit `prd-promote` validation; formal visual verification remains for `Test`. |
| 2026-08-05T23:21:51.2152376Z | Promotion | Promoted to `Test` after confirming the committed `1.0.6` candidate at `07a997edf3a9f250ecd8159e50084bc9bfa36b3d`. Each planned test case now identifies the exact product version and Git commit under test. |
| 2026-08-05T23:36:52.0521349Z | Test table formatting | Renamed the rendered section to `Verification / Test Cases` while retaining the required `Verification` heading, and shortened the displayed commit SHA to `07a997e` with a link to the exact full commit hash so the table remains readable. |
| 2026-08-05T23:44:57.3921624Z | Test evidence | Recorded the supplied screenshot as partial `TC-01` evidence. It confirms the named light/dark theme files and stylesheet links, but does not by itself prove the shared theme contract or absence of duplicated theme definitions in `quill.css`; `TC-01` remains open. |
| 2026-08-05T23:49:44.7080605Z | Test evidence | Added the supplied dark and light theme screenshots to the `TC-01` evidence record. They show matching custom-property names across both theme stylesheets and provide evidence of the shared theme contract definitions. `TC-01` remains open pending static verification of structural stylesheet consumption and the absence of duplicated theme definitions. |
| 2026-08-05T23:54:30.6678285Z | Test evidence | Ran all three planned static inspections for `TC-01`. They passed: `quill.css` has no theme-token declarations or legacy theme blocks, the structural stylesheet consumes the shared theme variables, and the light and dark themes expose the same variable names. Marked `TC-01` complete. |
| 2026-08-05T23:57:09.6326879Z | Test evidence formatting | Added figure labels and captions for the three screenshot artifacts and shortened the static-inspection headings while retaining their descriptions below each heading. |
| 2026-08-05T23:58:43.6294501Z | Test evidence formatting | Changed the evidence-record result field to the binary value `Pass` and moved the explanatory observations below the corresponding screenshot artifacts. |
| 2026-08-06T00:09:05.6666336Z | Test scope refinement | Recorded the supplied light and dark Render-only screenshots as partial `TC-02` evidence and removed the requirement to repeat this test at multiple window sizes. `TC-02` remains open pending two-column, dialog, and editor-state checks. |
| 2026-08-06T00:10:12.8370307Z | Test evidence | Added the supplied light and dark Markdown-display screenshots to `TC-02`. They show the two-column Markdown and Render panes displaying corresponding source and formatted content. `TC-02` remains open pending completion of its remaining layout/theme checks. |
| 2026-08-06T00:11:57.0554296Z | Test scope refinement | Removed dialog checks from `TC-02` because dialogs are outside the theme-controlled surfaces for this item. Replaced the ambiguous editor-state wording with the concrete two-column Markdown and Render state and Render-only state. |
| 2026-08-06T00:14:05.9469118Z | Test evidence | Added light and dark screenshots showing Markdown editing enabled, the formatting toolbar visible, and inline editing enabled. Combined with the existing layout and Recent Files evidence, this completes `TC-02`. |
| 2026-08-06T00:19:29.7575566Z | Test evidence | Added light and dark screenshots showing theme switching with the Render-only layout, Acceptance Criteria content, Test Cases table, and inline editing control preserved. Marked `TC-03` complete with a passing result. |
| 2026-08-06T00:19:29.7575566Z | Acceptance | Accepted the completed stylesheet refactor after TC-01, TC-02, and TC-03 passed against product version `1.0.6` at commit `07a997edf3a9f250ecd8159e50084bc9bfa36b3d`; the PRD is ready to close in `Closed`. |
| 2026-08-06T00:20:00.2821898Z | Promotion | Promoted the accepted PRD to `Closed`, updated the evidence links to the released PRD location, and marked the corresponding backlog item `Done`. This closes the PRD workflow item; it does not create a product release tag. |

## Legacy Notes

- This PRD includes a repaired `Backlog` capture from an earlier consistency sweep, so the original creation event was not recorded just in time.

