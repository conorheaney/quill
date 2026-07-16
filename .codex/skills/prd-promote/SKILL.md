---
name: prd-promote
description: Validate and promote an existing Quill PRD to its next allowed workflow phase while conforming to the live repo rules. Use when the user wants to promote a PRD, check whether a PRD is ready for its next phase, repair promotion blockers, or carry out the paired backlog-plus-file move for `Backlog`, `Plan`, `Implement`, `Test`, or `Release`.
---

# PRD Promote

Use this skill to promote an existing Quill PRD by following the repo workflow rules explicitly.

Keep it lightweight. Read the repo rules, inspect the target PRD, and use the repo-local [$grill-me](C:\Users\conor\Documents\Markdown Editor\.codex\skills\grill-me\SKILL.md) skill to strengthen any mandatory section that is missing or too thin before promotion.

## Guardrail

- Always conform to the live rules in `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md`.
- If the requested promotion would violate the workflow, stop and explain why.
- Never skip phases.
- Never implement code work from this skill unless the repo workflow separately authorizes it.
- Treat `BACKLOG.md` as the source of truth for the PRD's current overall status and phase.

## Read First

1. `WORKFLOW.md`
2. `BACKLOG.md`
3. `.agents/local-agent.md`
4. `.codex/skills/grill-me/SKILL.md`
5. the target PRD file

Use the live repo text if it disagrees with this skill.

## Starter

- Always ask for the PRD number if the user did not specify it clearly.
- Before doing any promotion work, give the user a concise 3 to 4 line summary of the PRD.
- After that short summary, ask the user if they want to continue.
- Do not mutate workflow files until the user confirms they want to continue.

## Promotion Flow

1. Identify the target PRD number. If the user did not provide it clearly, ask for it first.
2. Find the target PRD row in `BACKLOG.md`.
3. Find the matching PRD file.
4. Give the user a concise 3 to 4 line summary of the PRD and ask whether they want to continue.
5. Only after the user confirms, determine the current phase and the next allowed phase by following `WORKFLOW.md` and the current `BACKLOG.md` row explicitly.
6. Validate the PRD against the repo workflow rules instead of re-stating those rules here.
7. If any mandatory PRD section is missing or too light on information for the next workflow gate, use the repo-local `grill-me` skill to fill it in before promotion.
8. Only after the PRD satisfies the workflow rules, carry out the promotion steps required by the repo workflow.

## How To Use `grill-me`

Use [$grill-me](C:\Users\conor\Documents\Markdown Editor\.codex\skills\grill-me\SKILL.md) to strengthen mandatory PRD sections when they are absent, vague, or still written like placeholders.

Focus the questioning on the specific weak section, such as:

- the real goal
- missing context
- scope boundaries
- implementation plan shape
- acceptance criteria
- verification approach
- next concrete step

Keep the `grill-me` pass brief and targeted. Ask only enough to turn the weak section into a valid workflow-ready section.

## Expected Result

- follow the live workflow rules in `WORKFLOW.md`
- use `BACKLOG.md` as the source of truth for current state
- use `grill-me` to repair missing or thin mandatory sections before promotion
- promote the PRD only after it satisfies the repo workflow requirements
- make whatever paired backlog, PRD move, `History`, and `Audit` updates the workflow explicitly requires

## Notes

- Do not duplicate the workflow in this skill. The workflow files are the canonical source.
- Prefer the smallest targeted `grill-me` pass that unblocks a valid promotion.
