# Quill Product

## Summary

Quill is a local-first Markdown editor with side-by-side source and rendered views, inline editing in the preview, outline navigation, theming, and local draft persistence.

## Current State

- The app runs from the `code/` structure.
- The current baseline includes inline preview editing, outline navigation, theme cycling, load/save, and autosave.
- `code/main.js` passes a Node syntax check.

## Product Docs

- Backlog: [BACKLOG.md](C:/Users/conor/Documents/Markdown%20Editor/docs/BACKLOG.md)
- User guide: [README.md](C:/Users/conor/Documents/Markdown%20Editor/docs/README.md)
- Workflow folders: `docs/00 - Backlog/`, `docs/01 - Plan/`, `docs/02 - Implement/`, `docs/03 - Test/`, `docs/04 - Release/`

## Workflow

1. Record each item as a `PRD` entry in `docs/BACKLOG.md`.
2. Create a matching file in `docs/00 - Backlog/`.
3. Track the item's overall status in `docs/BACKLOG.md`.
4. Move the file through `01 - Plan`, `02 - Implement`, `03 - Test`, and `04 - Release`.

Rules:

- `docs/BACKLOG.md` is the source of truth for status.
- Use one file per item, named exactly after the PRD ID.
- Move the same file forward as the item advances.
- An item should pass through every stage before `Release`.
- `Blocked` items stay in `In Progress` until they can move again.
- If the backlog phase and folder location disagree, `docs/BACKLOG.md` wins and the file should be moved immediately.
- Every PRD file should include `Short Name`, `Goal`, `Context`, `Scope`, `Next Step`, and `Notes`.
