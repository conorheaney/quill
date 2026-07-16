---
name: prd-backlog
description: Create a new Quill backlog item with a light grill-me pass, while conforming to the current repo workflow.
---

# PRD Backlog

Use this skill when the user wants to add a new work item to Quill's backlog.

Keep it lightweight. This skill is meant to help shape a valid backlog item, not replace the repo workflow documents.

## Guardrail

- Always conform to the current repo workflow in `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md`.
- If the requested item would not conform to the current workflow, stop and explain why.
- For backlog-item creation in particular, use the live rules in these `WORKFLOW.md` sections:
  - `Starter`
  - `PRD Section Order`
  - `Phase 00: Backlog`

## How To Use It

1. Read the current workflow sources:
   - `WORKFLOW.md`
   - `BACKLOG.md`
   - `.agents/local-agent.md`
   - `.codex/skills/grill-me/SKILL.md`
2. Run a light repo-local `grill-me` pass to surface the basics of the item.
3. Turn that shaped requirement into a valid new backlog item that matches the live workflow.

## Lightweight Grill-Me Pass

Use `grill-me` briefly to surface the minimum useful shape for the item:

- the problem or opportunity
- who or what it affects
- what should be in scope
- what should stay out of scope
- what the likely first planning step is

Do not over-interrogate. Ask only enough to create a valid, grounded backlog item.

## Expected Result

Create the new item in the repo's normal workflow shape:

- add the backlog row in `BACKLOG.md`
- create the matching PRD file in `docs/00 - Backlog/`
- keep the PRD structure, section order, status, phase, timestamps, and history/audit format aligned with the current workflow rules
- specifically check the `Starter`, `PRD Section Order`, and `Phase 00: Backlog` sections in `WORKFLOW.md` before creating the item

## Notes

- Treat `BACKLOG.md` as the source of truth for IDs and item state.
- Use the lightest wording that still produces a clear, useful backlog item.
- If the workflow examples in the repo have evolved, follow the live repo examples rather than this skill text.
