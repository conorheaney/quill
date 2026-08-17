# TC-06 Evidence

| Field | Detail |
| --- | --- |
| PRD | [PRD-000002-TECH](../../docs/25%20-%20Closed/PRD-000002-TECH.md) |
| Acceptance Criteria | AC-06 |
| Product Version | 1.0.13 |
| Status | complete |
| Recorded | 2026-08-15T12:15:45.0752884Z |
| Test | PASS: Verify the human UI regression checklist defines reproducible preconditions, steps, and expected results for the critical application workflows while remaining outside `npm test` and explicitly deferring automated UI testing. |
| Result | The checklist contains global preconditions, an execution-record scaffold, and eight scenarios covering packaged startup, Load, Save, Save As, dirty-document prompts, Render-pane inline editing, byte-exact source preservation, and missing desktop-bridge behavior. Every scenario defines numbered steps and observable expected results; `tests/README.md` and `package.json` confirm the manual suite is outside `npm test`; and the checklist explicitly defers automated browser, packaged-Tauri UI, and visual-regression testing. |

## Preconditions

- Inspect the committed repository atfor product version `1.0.13`.
- Use `AC-06` as the verification boundary: the regression checklist must be complete and reproducible, while executing its UI scenarios and adding automated UI coverage are not required.
- Review `tests/manual/PRD-000002-TECH-UI-REGRESSION-CHECKLIST.md`, `tests/README.md`, and the root `package.json`.

## Steps to Reproduce

1. Confirm the checklist defines global preconditions and an execution-record scaffold for future human runs.
2. Confirm the scenario summary and detailed sections cover `UI-01` packaged startup, `UI-02` Load, `UI-03` Save, `UI-04` Save As, `UI-05` dirty-document prompts, `UI-06` Render-pane inline editing, `UI-07` byte-exact source preservation, and `UI-08` missing desktop bridge.
3. Confirm each of the eight scenario sections includes numbered steps and observable expected results, with additional scenario-specific preconditions where required.
4. Confirm the checklist provides concrete fixtures, paths, edit values, controls, status messages, and a SHA-256 comparison so a tester can reproduce the checks without inventing procedure.
5. Confirm the checklist states that it is outside the automated `npm test` command and explicitly defers automated browser testing, packaged-Tauri UI automation, and visual regression.
6. Confirm `tests/README.md` identifies manual checklists as undiscovered by `npm test` and the root `package.json` test script runs only the Node and Rust layers.

## Expected Results

The manual regression suite is complete enough for repeatable future execution: it defines the required preconditions, steps, and expected results for all critical workflows in `AC-06`; it remains separate from `npm test`; and it clearly identifies automated browser and packaged-Tauri UI testing as deferred. No claim is made that the eight UI scenarios were executed during this verification.

## Evidence

- [Manual UI regression checklist](../../tests/manual/PRD-000002-TECH-UI-REGRESSION-CHECKLIST.md): global preconditions, execution-record fields, eight-scenario summary, detailed steps, expected results, and completion rule are present.
- [Test suite documentation](../../tests/README.md): manual checklists are explicitly excluded from `npm test` discovery and execution.
- `package.json`: `npm test` invokes only `npm run test:node` and `npm run test:rust`; it does not invoke the manual checklist.
- Static structure review found eight `UI-NN` scenario sections, eight `Steps` sections, eight `Expected results` sections, and the additional `UI-07` scenario preconditions.
