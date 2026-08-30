# TC-02 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-02 |
| Product Version | 1.0.13 |
| Status | complete |
| Recorded | 2026-08-15T11:51:45.7153004Z |
| Test | Run the table-driven Markdown suites and verify parsing, rendering, URL sanitization, table handling, block conversion, and serialization results. |
| Result | PASS |

## Preconditions

- Use the repository state for product version `1.0.13`.
- Run from the repository root with Node.js and the project dependencies available.
- Ensure `QUILL_TEST_SEED_FAILURE` is unset.

## Steps to Reproduce

1. Confirm the checked-out commit is `af9df91f1de93a23523a460c3b87f5f665276d6e` and the product version is `1.0.13`.
2. Run `node --test tests/node/markdown-parsing.test.ts tests/node/markdown-rendering.test.ts tests/node/markdown-tables.test.ts tests/node/markdown-serialization.test.ts`.
3. Confirm the parsing cases cover headings, paragraphs, lists, blockquotes, fenced code, and table rows.
4. Confirm the rendering and sanitization cases cover block and inline Markdown, escaped HTML-like text, fenced code, safe HTTPS and anchor links, and rejected unsafe links.
5. Confirm the table cases cover outer-pipe trimming, escaped pipes, pipes inside code spans, and inline Markdown within rendered tables.
6. Confirm the conversion and serialization cases cover headings, code, ordered lists, tables, and canonical blank lines between blocks.
7. Record the command output, test counts, exit code, and any failed assertions under Evidence, then set the Test and Result fields to the observed `PASS` or `FAIL` outcome.

## Expected Results

All 20 table-driven Markdown cases pass with exit code `0`, and their actual parsing, rendering, sanitization, table, conversion, and serialization outputs exactly match the expected values encoded in the four test files.

## Evidence

- Candidate identity: product version `1.0.13`;; `QUILL_TEST_SEED_FAILURE` unset.
- Initial command: `node --test tests/node/markdown-parsing.test.ts tests/node/markdown-rendering.test.ts tests/node/markdown-tables.test.ts tests/node/markdown-serialization.test.ts`.
- Initial result: the managed sandbox denied Node worker creation with `spawn EPERM`; 0 assertions executed and the command exited `1`.
- Executed fallback: `node --test --test-isolation=none tests/node/markdown-parsing.test.ts tests/node/markdown-rendering.test.ts tests/node/markdown-tables.test.ts tests/node/markdown-serialization.test.ts`.
- Final result: 20 tests passed, 0 failed, 0 cancelled, 0 skipped, 0 todo; exit code `0`; duration `26.9153 ms`.

