# Quill Backlog

## Classification Guide

- `NEW`: net-new feature ideas not yet present in the product.
- `CHANGE`: changes to existing behaviour or product flows.
- `UI`: interface and interaction improvements.
- `TECH`: technical debt, architecture, testing, and maintainability work.

## Status Guide

- `Proposed`: identified and ready for refinement or prioritisation.
- `Planned`: approved for implementation but not yet started.
- `In Progress`: actively being worked on.
- `Blocked`: cannot currently move forward due to an open dependency or decision.
- `Done`: completed and no longer an active backlog item.

## Phase Guide

- `Plan`: shape the change, confirm scope, and define enough verification to start.
- `Implement`: build the change.
- `Test`: run the checks needed for confidence in the change.
- `Release`: accept the result into the current product baseline and update docs if needed.

## Item Format

Each backlog item should:

- Begin with an ID in the format `BL-NNNN-{CLASS}`.
- Include a short name.
- Include a brief description.
- Include a status.
- Include a phase.
- Store detailed notes in a separate file named exactly after the backlog ID.

## Backlog

| ID | Class | Short Name | Status | Phase | Brief Description |
| --- | --- | --- | --- | --- | --- |
| BL-0001-TECH | TECH | Split UI Controller | Done | Release | Reshape the app around a Shell plus Outline Pane, Markdown Pane, and Preview Pane components, including HTML and code naming cleanup. |
| BL-0002-TECH | TECH | Add Core Tests | Proposed | Plan | Add automated coverage for Markdown parsing, block conversion, and persistence behaviour. |
| BL-0003-CHANGE | CHANGE | Remove Cache Busting | Proposed | Plan | Remove static asset query-string cache busting once the app's loading and release approach is settled. |
| BL-0004-UI | UI | Accessibility Pass | Proposed | Plan | Review keyboard behaviour, focus handling, labels, and error feedback across the editor and preview flows. |
