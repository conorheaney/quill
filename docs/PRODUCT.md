# Quill Product

## Summary

Quill is a local-first Markdown editor with side-by-side source and rendered views, inline editing in the preview, outline navigation, theming, and local draft persistence.

## Current State

- The app runs from the `code/` structure.
- The current baseline includes inline preview editing, outline navigation, theme cycling, load/save, and autosave.
- The desktop runtime now targets Tauri through `src-tauri/`, while the renderer stays in `code/`.

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

- Refuse to implement any code change unless it is tied to a backlogged PRD entry and the relevant detailed item plan is already in place.
- `docs/BACKLOG.md` is the source of truth for status.
- Use PRD IDs in the format `PRD-NNNNNN-{CLASS}`.
- Use one file per item, named exactly after the PRD ID.
- Creating the PRD file counts as the move into `Backlog` and should be recorded in `History`.
- Move the same file forward as the item advances.
- An item should pass through every stage before `Release`.
- Never skip a stage in the PRD file's `History`. Every item must record `Backlog`, `Plan`, `Implement`, `Test`, and `Release` in order as it reaches them.
- `Blocked` items stay in `In Progress` until they can move again.
- If the backlog phase and folder location disagree, `docs/BACKLOG.md` wins and the file should be moved immediately.
- Every PRD file should include `Short Name`, `Goal`, `Context`, `Scope`, `Next Step`, `History`, and `Audit`.
- `History` and `Audit` should both be maintained as tables.
- Any timestamp fields should be recorded in UTC format.
- `History` and `Audit` entries should be recorded just in time, at the moment the event happens, not reconstructed later from memory.
- `History` is only for stage transitions and should record the UTC timestamp and the end stage only, for example `2026-07-12T08:10:00Z | Plan`.
- `Audit` is for other timestamped audit information such as decisions, evidence, risks, approvals, and exceptions.
- If a stage transition was missed, add the missing `History` row as soon as the gap is discovered using the current UTC time, then record in `Audit` that the timestamp is a backfill and that the original transition time is unknown.
- When backfilling multiple missed stage transitions, record a fresh UTC timestamp for each inserted `History` row.
- Do not assign the same timestamp to multiple stage transitions or audit events unless they genuinely occurred at that exact time.
- Ship releases from `main` by default and create a version tag for each shipped release, for example `v1.0.2`.
- Create a dedicated release branch only when an older release line needs parallel maintenance while `main` continues toward a newer version.
