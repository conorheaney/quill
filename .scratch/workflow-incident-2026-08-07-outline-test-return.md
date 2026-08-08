# Workflow Incident: Outline TC-01 Correction Sequencing

**Date:** 2026-08-07

**PRD:** `PRD-000024-UI`

**Area:** Test failure return to Implement

## Incident

During the visual smoke-test follow-up for `TC-01`, a CSS correction was applied before the PRD had been returned from `Test` to `Implement`. The PRD was subsequently moved back to `Implement`, but the required transition should have happened before any product-code edit.

The correction addressed Outline item padding and border visibility after the `1.0.8` visual check. The implementation was in scope, but the operation order violated the repository guardrail that product code may only be changed while the target PRD is in `Implement`.

## Correct sequence

1. Record the failed test and supporting evidence.
2. Update `BACKLOG.md` from `In Progress / Test` to `In Progress / Implement`.
3. Move the PRD from `docs/20 - Test/` to `docs/15 - Implement/`.
4. Append the `Implement` History and Audit records.
5. Revalidate the workflow state against `BACKLOG.md` and the PRD location.
6. Only then edit product code.

## Prevention decision

The workflow state is the authority; a lock file must not become an independent source of truth. Any future code-change authorization gate should validate the requested edit against both `BACKLOG.md` and the PRD's current folder/latest phase immediately before editing.

A useful future safeguard is a state-aware pre-edit check that refuses product-file edits unless:

- the target PRD is `In Progress / Implement` in `BACKLOG.md`;
- the matching PRD is in `docs/15 - Implement/`; and
- the requested file is within the approved PRD scope.

Pre-commit or CI checks can provide a second layer, but they do not replace the pre-edit check because they catch the sequencing error only after the working tree has already changed.
