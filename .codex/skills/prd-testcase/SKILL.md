---
name: prd-testcase
description: Generate a test-case evidence document from a requested test-case number using the active Test-phase PRD and canonical evidence template. Use for `$prd-testcase TC-NN` or equivalent requests.
---

# PRD Test Case

Create one PRD test-case evidence record and leave the PRD workflow unchanged.

## Resolve the target

- Require `TC-NN` or a bare two-digit number; normalize to `TC-NN`.
- Read `.agents/lifecyle-agent/lifecyle-agent.md`, `AGENTS.md`, and `BACKLOG.md`.
- Find the matching PRD in `docs/20 - Test/`. If there is not exactly one candidate, ask for the PRD ID.
- Confirm the PRD is in `Test` and its `Verification` table contains the requested test case.

## Generate the record

1. Read the matching Verification row, acceptance criteria, and relevant PRD context.
2. Copy `.agents/lifecyle-agent/prd-testcase.md` to `docs/90 - Evidence/PRD-NNNNNN-TC-NN.md` and fill its metadata, timestamp, test description, and result fields.
3. Set `Test` to start with `PASS/FAIL:`. Fill `Preconditions`, numbered `Steps to Reproduce`, `Expected Results`, and `Evidence` in that order. Derive content from the PRD; do not claim unprovided results or evidence.
4. Use `open` status unless the user supplied a result and evidence. Never guess the product version or Git commit; retain clear placeholders when they cannot be established.
5. Do not overwrite an existing record. Validate the new file's name, `PASS/FAIL:` prefix, and four required headings/order, then run `npm run check:workflow`.
6. Keep the language concise and human readable with specific technical information at the end of any paragraph or section.

Do not backfill or validate historical evidence records, promote the PRD, or edit `BACKLOG.md`.

## Output

After success, respond with exactly one short paragraph stating the test-case ID, target PRD, created file, readiness for test execution, and any unresolved placeholders. Use no heading or list.