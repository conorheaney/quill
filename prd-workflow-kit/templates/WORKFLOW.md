# Product Workflow

## High-Level Description

This project uses one backlog record and one PRD file per requirement. The same PRD moves through `Backlog`, `Plan`, `Implement`, `Test`, and `Release`.

## Global Guardrails

- This file defines the project workflow; `BACKLOG.md` is the canonical index of items, status, and phase.
- Refuse work that does not conform to these rules and explain why.
- Never skip a phase or promote automatically.
- Code changes are allowed only when the item is in `Implement`.
- Shape new requirements with the local `grill-me` skill before creating a PRD.
- Use six-digit IDs in the form `PRD-NNNNNN-{CLASS}`.
- Keep one PRD file per item and move it through the phase folders.
- Keep mandatory PRD sections in the order below.
- Keep `History` and `Audit` as separate tables, recording events just in time in UTC.
- Treat application code, runtime configuration, dependencies, build scripts, and packaged assets as product-affecting changes.
- Define project-specific versioning and release commands here before using the release gate.

## Starter

1. Add the item to `BACKLOG.md`.
2. Create the matching PRD file in `docs/00 - Backlog/` and record its `Backlog` history row.
3. Promote the same file through each phase when its gate is satisfied.
4. Keep the backlog row and PRD phase aligned.

## Mandatory PRD Section Order

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

## Phase Rules

### Backlog

Capture the requirement and its basic shape. It is not authorized for code changes.

### Plan

Make `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` detailed enough to guide implementation and testing.

### Implement

Implement only the approved scope. Record meaningful decisions and clarifications in `Audit`.

### Test

Verify against the acceptance criteria, record results and evidence, and return to `Implement` before making corrections. Test records should identify the exact product version tested and use the configured Evidence folder.

### Release

Confirm acceptance, complete applicable tests, record release information, and mark the backlog item done. Update links after the PRD moves, and tag only the exact approved version when the project uses Git releases.

## Tracking Requirements

- Backlog row, current status and phase, matching PRD location
- PRD file, mandatory sections, current `Next Step`, `History` table, `Audit` table
- History, UTC timestamp and end stage only
- Audit, UTC timestamp, type, and concise note for decisions, evidence, risks, approvals, exceptions, or backfills
- Test record, criterion, exact product version, result, status, UTC timestamp, and relative evidence link

## Test And Release Gate

Testing must be performed against the version actually being evaluated. If a product-affecting correction is required, return the item to `Implement`, update the version according to project rules, rebuild, supersede affected evidence, and repeat the affected verification before Release. Do not mark an item `Done` until applicable tests are complete or accepted exceptions are recorded in `Audit`.

## Timestamp Format

Use UTC timestamps in `yyyy-MM-ddTHH:mm:ss.fffffffZ` format.
