# PRD-0008-TECH

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
- accessibility remediation that should stay in `PRD-0004-UI`
- unrelated markup or behavior changes unless required to support the CSS refactor safely

## Next Step

Move this item to `01 - Plan` and define the target stylesheet organization, naming rules, and regression-check approach.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-12T00:00:00Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-12T00:00:00Z | Scope discovery | Added as a backlog item to track technical CSS refactoring separately from UI redesign or accessibility work. |
| 2026-07-12T00:00:00Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
