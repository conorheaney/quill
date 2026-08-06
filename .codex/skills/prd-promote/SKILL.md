---
name: prd-promote
description: Validate and promote an existing Quill PRD to its next allowed workflow phase while conforming to the live repo rules. Use when the user wants to promote a PRD, check whether a PRD is ready for its next phase, repair promotion blockers, or carry out the paired backlog-plus-file move for `Backlog`, `Plan`, `Implement`, `Test`, or `Release`.
---

# PRD Promote

Use this skill to validate and promote an existing Quill PRD. This skill owns promotion-time identity checks, phase-gate validation, paired backlog/PRD updates, and the user-facing blocker report. `WORKFLOW.md` remains the lifecycle contract. Keep it lightweight. Read the repo rules, inspect the target PRD, surface blockers first, and make workflow edits only after the promotion is valid.

## Guardrail

- Use `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md` as the workflow and safety authorities.
- If the requested promotion would violate the workflow, stop and explain why.
- Never skip phases.
- Never implement code work from this skill unless the repo workflow separately authorizes it.
- Treat `BACKLOG.md` as the source of truth for the PRD's current overall status and phase.

## Read First

1. `WORKFLOW.md`
2. `BACKLOG.md`
3. `.agents/local-agent.md`
4. the target PRD file

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
6. Validate the PRD using the checks and phase gates below, applying `WORKFLOW.md` as the authority for any conflict.

- For an `Implement` to `Test` promotion of a product-affecting item, verify that the candidate patch-version bump and product change are committed to `main` before moving the PRD.
- For a `Test` to `Release` promotion, verify that each complete test record identifies both the exact product version and Git commit, and treat `Release` as PRD closure rather than an automatic product release.

7. If any mandatory PRD section is missing or too light on information for the next workflow gate, use the repo-local `grill-me` skill to fill it in before promotion.
8. Run `npm run check:workflow` before mutation. Treat checker errors as promotion blockers; legacy Release warnings remain non-blocking.
9. Only after the PRD satisfies the workflow rules, carry out the promotion steps required by the repo workflow.

## Required checks

Run these checks before every promotion attempt.

### Identity and state

- A backlog row exists for the target PRD.
- Exactly one matching PRD file exists in the phase folders.
- The PRD ID, filename, and backlog ID match exactly.
- The backlog phase is one of `Backlog`, `Plan`, `Implement`, `Test`, or `Release`.
- The backlog status/phase pairing is valid: `Proposed / Backlog`, `Planned / Plan`, `In Progress / Implement`, `In Progress / Test`, `Blocked / Implement`, `Blocked / Test`, or `Done / Release`.
- The backlog phase, PRD folder, and latest `History` stage agree before promotion.
- A mismatch is a blocker; repair alignment before evaluating the next gate.

### Required structure

- The PRD satisfies the required structure in `.codex/workflow/prd-schema.md`.
- `History` and `Audit` are Markdown tables.
- `Legacy Notes`, when present, remains after the main workflow record.
- Required sections are materially filled and are not placeholders for a later phase.

### Content and record checks

Flag a blocker when a required section is empty, `Next Step` points to the current phase instead of the next real action, `History` skips or contradicts a transition, a timestamp is not in `yyyy-MM-ddTHH:mm:ss.fffffffZ` UTC form, or the backlog, folder, and PRD tell conflicting stories. Treat phrases such as `TBD`, `to be decided`, `define this during`, `later`, or `move this item to` as blockers when they leave a gate-critical section unresolved.

## Phase gates

### Backlog -> Plan

Allow only when the baseline PRD is valid, the backlog row says `Proposed / Backlog`, the file is in `docs/00 - Backlog/`, and `History` contains the `Backlog` entry. On success, change the row to `Planned / Plan`, move the PRD to `docs/01 - Plan/`, and append `Plan` to `History`.

### Plan -> Implement

Allow only when `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` are concrete enough to guide implementation and verification, the backlog row says `Planned / Plan`, and the PRD is in `docs/01 - Plan/`. On success, change the row to `In Progress / Implement`, move the PRD to `docs/02 - Implement/`, and append `Implement` to `History`.

### Implement -> Test

Allow only when implementation is complete enough to verify, `Verification` describes a real test approach, `Next Step` points to verification or acceptance, the backlog row says `In Progress / Implement` or `Blocked / Implement`, and the PRD is in `docs/02 - Implement/`. For product-affecting work, also verify the committed patch candidate and product change required by `WORKFLOW.md`. On success, change the row to `In Progress / Test`, move the PRD to `docs/03 - Test/`, and append `Test` to `History`.

### Test -> Release

Allow only when planned verification is complete enough to support acceptance, the PRD records outcomes and evidence, no unresolved implementation or retest signal remains, the backlog row says `In Progress / Test` or `Blocked / Test`, and the PRD is in `docs/03 - Test/`. Verify that each complete test record identifies the exact product version and Git commit. On success, change the row to `Done / Release`, move the PRD to `docs/04 - Release/`, and append `Release` to `History`.

### Test -> Implement return

When testing finds code work, do not continue testing or editing in place. Move the PRD back to `docs/02 - Implement/`, change the backlog row to `In Progress / Implement`, append the return stage to `History`, and record the reason in `Audit` before implementation resumes.

## Promotion mutation contract

Only after validation succeeds and the user has confirmed continuation:

1. Update the matching backlog row.
2. Move the existing PRD file to the next phase folder.
3. Append the new phase to `History` with the actual UTC timestamp.
4. Add an `Audit` note when the promotion needs context.
5. Re-run the identity and alignment checks.
6. Run `npm run check:workflow` again and report any post-promotion errors before treating the move as complete.

The backlog update and PRD move are one logical operation. Do not create replacement PRDs, skip phases, or mutate files when blockers remain.

## How To Use `grill-me`

Use [$grill-me](../grill-me/SKILL.md) to strengthen mandatory PRD sections when they are absent, vague, or still written like placeholders.

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
- use `grill-me` only when a gate-critical section needs targeted strengthening
- promote the PRD only after it satisfies the repo workflow requirements
- make whatever paired backlog, PRD move, `History`, and `Audit` updates the workflow explicitly requires

## Notes

- Do not duplicate the workflow in this skill. The workflow files are the canonical source.
- Prefer the smallest targeted `grill-me` pass that unblocks a valid promotion.
- Report results in this order: current state, requested next phase, blockers, exact edits if valid, and result after the move.
