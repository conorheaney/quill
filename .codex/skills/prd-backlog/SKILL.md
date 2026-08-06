---
name: prd-backlog
description: Create a new Quill backlog item with a light prd-grill-me pass, while conforming to the current repo workflow. Use this skill when the user wants to add a new work item to Quill's backlog.
---

# PRD Backlog

This skill owns backlog-item creation: the light shaping pass, the initial PRD structure, the backlog-row shape, and creation-time validation. `WORKFLOW.md` continues to own the lifecycle invariants that this operation must obey.

## Guardrail

- Use `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md` as the workflow and safety authorities.
- If the requested item would not conform to the current workflow, stop and explain why.
- Do not create code-authorizing state. A new item remains `Proposed / Backlog`.
- Use the templates in this skill instead of inventing a new PRD or backlog-row shape.

## Context Loading

Load only `WORKFLOW.md`, `BACKLOG.md`, `.agents/local-agent.md`, the local `prd-grill-me` skill, and the templates in this skill before creating an item. Load existing PRD examples only if the current template or records are ambiguous.

## How To Use It

1. Read the current workflow contract, backlog, local agent contract, and `.codex/skills/prd-grill-me/SKILL.md`.
2. Run a light repo-local `prd-grill-me` pass to surface the basics of the item.
3. Allocate the next unused PRD ID and choose its class.
4. Add one row to the appropriate `BACKLOG.md` table using `templates/BACKLOG-row.md`.
5. Create the matching file in `docs/00 - Backlog/` from `templates/PRD-backlog.md`.
6. Run the creation checklist below before reporting completion.
7. Fill the shaped requirement into the template without adding implementation authorization or silently broadening scope.
8. Run `npm run check:workflow` after both files are created. Treat errors involving the new item as blockers; legacy Release warnings may remain non-blocking.

## Lightweight Grill-Me Pass

Use `prd-grill-me` briefly to surface the minimum useful shape for the item:

- the problem or opportunity
- who or what it affects
- what should be in scope
- what should stay out of scope
- what the likely first planning step is

Do not over-interrogate. Ask only enough to create a valid, grounded backlog item.

## Creation contract

The operation must create exactly one backlog row and one same-named PRD file:

- backlog row: `Status = Proposed`, `Phase = Backlog`
- PRD location: `docs/00 - Backlog/PRD-NNNNNN-{CLASS}.md`
- PRD title and filename: exact PRD ID match
- initial `History` row: `Backlog` with the actual UTC creation timestamp
- initial `Audit` row: explains the shaped requirement and its source

The new PRD must contain these headings in this order:

1. `Short Name`
2. `Goal`
3. `Context`
4. `Scope`
5. `Plan`
6. `Acceptance Criteria`
7. `Verification`
8. `Next Step`
9. `History`
10. `Audit`

Backlog entries may describe intended planning work, but must not authorize code changes. `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` should be useful enough to promote later without pretending that implementation decisions have already been made.

## Creation checklist

Before reporting success, verify:

- the PRD ID is unused and matches its class and filename
- exactly one matching PRD exists in `docs/00 - Backlog/`
- the new backlog row appears once and says `Proposed / Backlog`
- the required headings are present and in canonical order
- `History` and `Audit` are Markdown tables
- the initial `History` entry is `Backlog`
- all new timestamps use `yyyy-MM-ddTHH:mm:ss.fffffffZ` UTC format
- no code, phase promotion, or unrelated backlog edits were made

## Expected Result

Create the new item in the repo's normal workflow shape:

- add the backlog row in `BACKLOG.md`
- create the matching PRD file in `docs/00 - Backlog/`
- use the templates and creation contract in this skill
- keep status, phase, timestamps, and history/audit records aligned with `WORKFLOW.md`

## Notes

- Treat `BACKLOG.md` as the source of truth for IDs and item state.
- Use the lightest wording that still produces a clear, useful backlog item.
- If historical workflow examples differ from the templates, follow this skill's current template and the live invariants in `WORKFLOW.md`.
