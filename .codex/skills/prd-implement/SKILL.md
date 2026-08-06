---
name: prd-implement
description: Implement the code changes described by an existing Quill PRD only when the repo workflow already authorizes code work. Use when the user wants to execute a planned PRD, check whether a PRD is genuinely implementation-ready, surface implementation blockers, or carry the approved item through scoped code changes without bypassing the local workflow rules.
---

# PRD Implement

## Before work

- Always ask for the PRD number if the user did not already specify it clearly.
- Once the target PRD is identified, give the user a concise 3 to 4 line summary of the PRD covering the goal, scope, key implementation shape, and planned verification.
- Ask the user if they want to continue before starting validation or implementation work.
- Use this skill to carry out implementation work only after the repository workflow has opened the implementation gate.
- Keep it lightweight. Inspect the target PRD, apply the implementation readiness checks below, and stop before code changes when the gate is not satisfied.

## Guardrail

- Use `WORKFLOW.md` as the lifecycle authority, `BACKLOG.md` as the item-state authority, and `.agents/local-agent.md` as the local safety contract.
- Validate the target PRD against those sources instead of re-stating their general rules here.
- Refuse to use a PRD for code work if its planning sections are still too weak to guide implementation and verification safely.
- Do not silently broaden scope. If the requested work goes beyond the approved PRD, stop and explain the mismatch.

## Read First

1. `WORKFLOW.md`
2. `BACKLOG.md`
3. `.agents/local-agent.md`
4. the target PRD file

Use the live repo text if it disagrees with this skill. For implementation gating, use the `Plan`, `Implement`, and `Test` phase contracts and the PRD structure defined by `WORKFLOW.md`.

## Implementation Readiness Review

Before touching code, verify that the target PRD satisfies the live workflow rules. Focus especially on whether the planning sections are genuinely strong enough to authorize implementation:

- `Plan` should name the intended behavior, affected surfaces, and main execution approach clearly enough to build from.
- `Acceptance Criteria` should be concrete enough to tell whether the work is actually done.
- `Verification` should describe how the change will be checked, not just that it should be tested later.
- `Next Step` should point at real implementation work, not a planning task or workflow move.

Run `npm run check:workflow` before touching code. Treat checker errors involving the target PRD, its backlog row, or workflow controls as implementation blockers. Legacy Release warnings may remain non-blocking when they do not involve the target item.

Treat presence alone as insufficient. If any section still reads like a template, a placeholder, or a vague note that could fit multiple implementations, the implementation gate is not satisfied.

## If The Gate Fails

- Stop before making code changes.
- Explain the blocker clearly and tie it to the workflow source that blocks implementation.
- Name the exact missing or weak section or workflow mismatch.
- Suggest the smallest next action that would unblock the item, such as strengthening `Plan`, sharpening `Verification`, or promoting the PRD properly.
- Do not repair the workflow state by improvising implementation. The PRD must become ready first.

## Implementation Flow

1. Read the target PRD and restate the approved scope in working terms before changing code.
2. Limit the implementation to behavior that fits the current `Scope`, `Plan`, `Acceptance Criteria`, and `Verification`.
3. If the user asks for something outside that boundary, pause and call out the scope change instead of absorbing it silently.
4. Record meaningful implementation decisions, discovered constraints, risks, exceptions, or within-scope clarifications in the PRD `Audit` table as they happen.
5. Keep `Next Step` current as the work evolves so the PRD remains a live record.
6. Verify the implemented work against the PRD before treating the item as ready to leave `Implement`.
7. Run `npm run check:workflow` during the implementation handoff and resolve target-specific errors before considering the PRD ready for promotion.

## Scope Discipline

- Minor clarifications that stay inside the approved intent may be recorded in the current PRD `Audit`.
- New work that materially changes behavior, expands surfaces, or changes acceptance expectations must become a separate backlog item instead of being folded into the current implementation.
- If testing or implementation reveals that the plan is incomplete or wrong, stop and update the workflow state honestly before continuing.

## Workflow record during execution

- Use `WORKFLOW.md` for `Audit`, `History`, timestamp, and phase-transition rules.
- Keep implementation decisions, exceptions, and the current `Next Step` current while the work proceeds.
- If the workflow state should change, stop and apply only the transition allowed by `WORKFLOW.md` and `prd-promote`.

## Expected Result

- Implement only workflow-authorized PRD work
- Surface blockers clearly when the implementation gate is not satisfied
- Keep code changes scoped to the approved PRD
- Keep `Audit`, `Next Step`, and any genuine workflow-state changes current while the work proceeds
- Leave the repo with a clearer implementation record, not just changed code
