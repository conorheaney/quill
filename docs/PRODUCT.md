# Quill Product

## Summary

Quill is a local-first Markdown editor with side-by-side source and rendered views, inline editing in the preview, outline navigation, theming, and local draft persistence.

## Current Product State

- The app is running from the reorganised `code/` structure.
- The refactored UI is split across `code/quill.html`, `code/styles/quill.css`, and `code/scripts/`.
- The current baseline includes inline preview editing, outline navigation, theme cycling, load/save flows, and autosave support.
- The current worktree still contains the refactor as active local work rather than a cleaned release milestone.

## Verified Working

- The default Getting Started document loads.
- Markdown renders correctly and outline headings populate.
- Read-only preview mode remains the default.
- `code/main.js` passes a Node syntax check.

## Product Docs

- Backlog: [BACKLOG.md](C:/Users/conor/Documents/Markdown%20Editor/docs/BACKLOG.md)
- User guide: [README.md](C:/Users/conor/Documents/Markdown%20Editor/docs/README.md)

## Lightweight Delivery Workflow

This product should use one lightweight workflow that is easy to maintain in Markdown and does not require a separate project tracker.

### Source Of Truth

- `docs/BACKLOG.md` is the single queue of active and future work.
- `docs/PRODUCT.md` defines how work moves.
- A backlog detail file such as `docs/BL-0001-TECH.md` is only needed when an item is planned, in progress, blocked, or done and needs notes worth preserving.

### Workflow Shape

Each backlog item moves through four delivery phases:

1. `Plan`
2. `Implement`
3. `Test`
4. `Release`

These phases answer different questions:

- `Plan`: is the change clear enough to start?
- `Implement`: is the change being built?
- `Test`: has the change been checked well enough for this product?
- `Release`: is the change accepted into the current baseline and reflected in docs if needed?

### How To Track Work

- Keep `Status` for queue state: `Proposed`, `Planned`, `In Progress`, `Blocked`, `Done`.
- Keep `Phase` for delivery progress: `Plan`, `Implement`, `Test`, `Release`.
- A new item normally starts as `Proposed` plus `Plan`.
- When work starts, move it to `In Progress` and update the phase as it advances.
- When testing is complete and the result is accepted into the current product baseline, mark it `Done` and `Release`.
- If work cannot continue, keep the current phase visible and set status to `Blocked`.

### Burden Control Rules

To keep this lightweight:

- Prefer only one `In Progress` item at a time.
- Prefer only one item in `Test` at a time.
- Do not create a detail file for every idea; keep small ideas in the backlog table until they are real work.
- Update the backlog only when phase, status, or the brief description actually changes.
- Use the detail file for acceptance criteria, verification notes, risks, and follow-on work instead of overloading the backlog table.

### Current Starting Point

The current backlog should be treated like this:

| ID | Why It Starts Here | Suggested Next Move |
| --- | --- | --- |
| `BL-0001-TECH` | Already defined in detail and ready for delivery planning. | Keep it in `Plan` until implementation begins. |
| `BL-0002-TECH` | Depends partly on stable module boundaries from the refactor work. | Keep it in `Plan` behind `BL-0001-TECH`. |
| `BL-0003-CHANGE` | Small cleanup, but timing depends on release approach. | Keep it in `Plan` until release flow is clearer. |
| `BL-0004-UI` | Valuable, but better after current structural work settles. | Keep it in `Plan` for a later usability pass. |

### Release Meaning For This Repo

For Quill, `Release` does not need a heavy ceremony. It means:

- the change is implemented,
- the intended checks were run,
- the product and backlog docs reflect the new truth when needed,
- and the item can be treated as part of the current baseline rather than active work.
