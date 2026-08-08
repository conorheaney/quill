# Product Lifecycle Workflow

This file defines the repository workflow contract. Detailed creation, promotion, implementation, testing, and candidate-build procedures belong to the relevant local skills.

## Authority

- `lifecyle-agent.md` is the lifecycle authority.
- `BACKLOG.md` is the source of truth for each item's status and current phase.
- The PRD is the durable record of scope, plan, acceptance, verification, history, and audit information.
- The reusable test-case evidence template is maintained at `.agents/lifecyle-agent/prd-testcase.md`.
- If the backlog and PRD location disagree, the backlog phase is authoritative and the PRD must be brought back into alignment.

## Context loading

Each skill owns its detailed context requirements. Before acting, load this lifecycle contract, `AGENTS.md`, `BACKLOG.md` for PRD operations, the target PRD, and the relevant skill procedure. Load phase-specific evidence and implementation files only when the operation requires them.

## Lifecycle

Every item uses one PRD file and moves through these phases in order:

`Backlog -> Plan -> Implement -> Test -> Closed`

Testing may return an item to `Implement` when additional code work is required. No other phase may be skipped. `Closed` closes the PRD; it is not automatically a product release.

Each item must have:

- one row in `BACKLOG.md`
- one PRD named `PRD-NNNNNN-{CLASS}`
- one current phase folder under `docs/`
- a `History` table containing its phase transitions
- an `Audit` table containing other timestamped operational records

## Safety invariants

- Do not perform work that violates this contract.
- Do not promote an item automatically; promotion requires explicit user intent through the local `prd-promote` skill.
- Code changes are authorized only while the target PRD is in `Implement`.
- The backlog row and PRD file must be updated as one workflow transition.
- Material scope expansion becomes a separate backlog item.
- Blocked items remain in `In Progress` until their phase can continue.
- Preserve unrelated user changes.

## PRD identity and structure

PRD IDs use `PRD-NNNNNN-{CLASS}`, with classes such as `BUG`, `CHANGE`, `TECH`, and `UI`. The same PRD file moves through:

- `docs/05 - Backlog/`
- `docs/10 - Plan/`
- `docs/15 - Implement/`
- `docs/20 - Test/`
- `docs/25 - Closed/`

New and actively maintained PRDs must use the required structure defined in
`.agents/lifecyle-agent/prd-schema.md`.

`History` and `Audit` are Markdown tables. `Legacy Notes` is used after the main record when a PRD contains backfill, chronology gaps, or other non-standard historical carryover.

## Records and time

- `History` records phase transitions only, with the end phase and its actual UTC timestamp.
- `Audit` records decisions, evidence, risks, approvals, exceptions, clarifications, and backfill notes.
- Record both at the moment the event occurs; do not reconstruct history later.
- Use UTC timestamps in the canonical format `yyyy-MM-ddTHH:mm:ss.fffffffZ`.
- Do not assign one timestamp to separate events unless they genuinely occurred at the same time.

## Phase contract

### Backlog

The item is captured as `Proposed / Backlog` with a matching PRD in `docs/05 - Backlog/`. Creating the PRD records the `Backlog` history entry. Backlog items do not authorize code changes.

### Plan

The item is `Planned / Plan` with its PRD in `docs/10 - Plan/`. Before it can enter `Implement`, `Plan`, `Acceptance Criteria`, `Verification`, and `Next Step` must be present and detailed enough to guide execution and verification. Acceptance criteria use `AC-{NN}` identifiers and planned test cases use `TC-{NN}` identifiers.

### Implement

The item is `In Progress / Implement` with its PRD in `docs/15 - Implement/`. Implementation stays within the approved scope and keeps meaningful decisions, clarifications, risks, and exceptions in `Audit`.

### Test

The item is `In Progress / Test` with its PRD in `docs/20 - Test/`. Testing uses the committed packaged candidate from `main`. Each test case records its acceptance criterion, exact product version, Git commit, description, status, UTC timestamp, preconditions, reproducible steps, expected results, and evidence. Completed records use `docs/90 - Evidence/PRD-NNNNNN-TC-NN.md` and link back to the PRD.

The PRD's `Verification` section must contain a Markdown tracking table with one row per planned test case and these columns: `Test Case`, `Criteria`, `Product Version`, `Status`, `Description`, and `Evidence`. Keep the row current while testing; the `Evidence` cell links to the corresponding record in `docs/90 - Evidence/` when evidence has been recorded. The exact Git commit belongs in the linked evidence record.

Use `planned`, `open`, `in progress`, `complete`, `blocked`, or `exception` for the tracking-table `Status`. To generate a test evidence record, copy `.agents/lifecyle-agent/prd-testcase.md` to `docs/90 - Evidence/PRD-NNNNNN-TC-NN.md`, fill in the exact product version, Git commit, UTC timestamp, test, result, preconditions, numbered steps to reproduce, expected results, and supporting evidence, then link that file from the matching tracking-table row. Keep the `Preconditions`, `Steps to Reproduce`, and `Expected Results` sections between the metadata table and `Evidence` section in every new record.

If testing finds code work, return the PRD to `Implement`, update the backlog, record the transition, and only then resume implementation. Product-affecting corrections require a new patch candidate and repeat testing of affected coverage.

### Closed

The item is `Done / Closed` with its PRD in `docs/25 - Closed/`. Applicable test cases must be complete or have accepted exceptions recorded in `Audit`. Update test record links after the PRD moves. PRD closure does not by itself require a version bump, product tag, or release branch.

## Product candidate rules

Product-affecting changes include application code, Tauri configuration, runtime dependencies, build scripts, and packaged assets.

- Product versioning is independent of PRD closure.
- A new product cycle increases the minor version and resets the patch to zero.
- Before a product-affecting PRD enters `Test`, create the next patch candidate, commit the product change and synchronized version files to `main`,  rebuild, and overwrite the root executable as required by the repository.
- Documentation-only, evidence-only, and phase-transition commits do not require a product version bump unless they change packaged content.
- Product tags are created only through the separate approved product-release process after the exact version has passed formal testing.

## Requirement shaping

New requirements must be shaped with the repo-local [prd-grill-me](../../.codex/skills/prd-grill-me/SKILL.md) skill before becoming PRD items. If that skill is unavailable or broken, do not create the requirement.
