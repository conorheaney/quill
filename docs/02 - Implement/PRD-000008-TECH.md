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
- Verify the refactor against the existing desktop layout at the configured minimum and default window sizes, light and dark themes, pane combinations, dialogs, editor states, and recent-files UI before implementation is considered complete.

## Acceptance Criteria

- `AC-01`: Structural/component rules and theme rules have clear ownership, with light and dark themes represented by separate named stylesheets covering colors, fonts, and rendering styles.
- `AC-02`: Switching between the named themes preserves the existing supported visual states and does not change editor, pane, dialog, or recent-files behavior.
- `AC-03`: The refactored stylesheets pass the agreed desktop layout and visual regression checks without an unintended product redesign.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `TBD` | `open` | Inspect the final stylesheet set and confirm the agreed structural/component ownership boundaries, separate named theme files, shared theme contract, and absence of duplicated theme definitions in structural sections. | `TBD` |
| `TC-02` | `AC-01`, `AC-03` | `TBD` | `open` | Run the desktop app in each named theme and check the default and minimum window sizes, two-column and Render-only layouts, dialogs, editor states, and recent-files UI against the pre-refactor baseline. | `TBD` |
| `TC-03` | `AC-02`, `AC-03` | `TBD` | `open` | Switch between the named themes and confirm theme switching remains functional, supported visual states are preserved, and any intentional visual differences are documented as in scope. | `TBD` |

## Next Step

Promote this PRD to `Test` for formal desktop verification against the committed `1.0.6` candidate.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-12T13:09:14.6398072Z | Backlog |
| 2026-08-05T22:15:07.8033594Z | Plan |
| 2026-08-05T22:55:59.1427488Z | Implement |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T13:09:25.2378048Z | Backfill | Replaced the placeholder `Backlog` timestamp during the consistency sweep and preserved the original item intent: track technical CSS refactoring separately from UI redesign or accessibility work. The original PRD creation time was not captured; the item remains in `Backlog` and is waiting to move into `01 - Plan`. |
| 2026-08-05T22:15:07.8033594Z | Promotion | Promoted to `Plan` after user confirmation. Planning was narrowed to stylesheet ownership, separate named light and dark theme stylesheets, a shared theme contract covering colors, fonts, and rendering styles, and minimum visual regression checks. |
| 2026-08-05T22:55:59.1427488Z | Promotion | Promoted to `Implement` after user confirmation. The PRD has passed the planning gate with a defined implementation plan, minimum acceptance criteria, and table-formatted verification cases. |
| 2026-08-05T23:04:25.0581606Z | Implementation | Added separate `quill-theme-light.css` and `quill-theme-dark.css` files under `code/styles/themes/`, moved the color/font/theme rendering tokens out of `quill.css`, and added named stylesheet activation so exactly one theme stylesheet is enabled at a time. Structural CSS now consumes shared theme variables for theme transitions, surfaces, control radii, and overlay shadows. |
| 2026-08-05T23:04:39.7247694Z | Verification | `node --check` passed for the modified application scripts. `npm run build` completed successfully and produced the Tauri release executable and NSIS installer. The root `quill.exe` was synchronized with the release executable and their SHA-256 hashes match. Formal visual verification remains for `Test`. |
| 2026-08-05T23:17:56.1438235Z | Test candidate | Bumped the synchronized product version from `1.0.5` to `1.0.6`, built the Tauri release executable and NSIS installer, synchronized the root `quill.exe`, and confirmed matching SHA-256 hashes. JavaScript syntax checks passed. The candidate is ready for commit and explicit `prd-promote` validation; formal visual verification remains for `Test`. |

## Legacy Notes

- This PRD includes a repaired `Backlog` capture from an earlier consistency sweep, so the original creation event was not recorded just in time.
