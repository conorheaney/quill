# PRD Structural Schema

This file defines the shared structural facts used by local workflow skills. It
does not define phase procedures; those belong to the relevant skill.

## Required headings

New and actively maintained PRDs use these headings in this order:

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

`Legacy Notes` may appear after the main workflow record when historical carryover needs to be preserved.

## Record shapes

- `History` is a Markdown table containing phase transitions.
- `Audit` is a Markdown table containing other timestamped operational records.
- `Verification` contains a Markdown test-case tracking table with the columns
  `Test Case`, `Criteria`, `Product Version`, `Status`, `Description`, and
  `Evidence`.
- Workflow timestamps use `yyyy-MM-ddTHH:mm:ss.fffffffZ` in UTC.

## Validation ownership

- `prd-backlog` validates the new-item shape it creates.
- `prd-promote` validates the target item's phase gate and alignment before moving it.
- `prd-implement` validates implementation readiness before code work.
- `scripts/check-workflow.ps1` performs read-only repository-wide structural checks.
