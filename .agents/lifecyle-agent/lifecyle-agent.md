# Product Lifecycle Workflow

This file defines the repository workflow contract. Detailed creation, promotion, implementation, testing, and candidate-build procedures belong to the relevant local skills.

## Authority

- `lifecyle-agent.md` is the lifecycle authority.
- `BACKLOG.md` indexes items currently in the Backlog phase; the PRD's folder is authoritative for its normal lifecycle phase.
- The PRD is the durable record of scope, plan, acceptance, verification, history, and audit information.
- The reusable test-case evidence template is maintained at `.codex/skills/prd-testcase/references/TPL-TESTCASE.md`.
- A PRD in `docs/06 - Blocked/` is a blocked holding state and has no `BACKLOG.md` row; its last active lifecycle phase remains recorded in `History` and its blocked state is recorded in `Audit`.
- All user actions and important agent actions on behalf of the user must be audited with a clear concise description.

## Context loading

Each skill owns its detailed context requirements. Before acting, load this lifecycle contract, `AGENTS.md`, the target PRD, and the relevant skill procedure. Load `BACKLOG.md` when the operation concerns Backlog membership or a new item. Load phase-specific evidence and implementation files only when the operation requires them.

## Lifecycle

Every item uses one PRD file and moves through these phases in order:

`Backlog -> Plan -> Implement -> Test -> Closed`

Testing may return an item to `Implement` when additional code work is required. No other phase may be skipped. `Closed` closes the PRD; it is not automatically a product release.

Status and phase are separate dimensions. The canonical active status/phase combinations are defined in `.agents/lifecyle-agent/status-phase-map.json`; skills and validators must use that file rather than maintaining parallel mappings.

`Blocked` is a holding state represented by the `docs/06 - Blocked/` folder. The PRD retains its last active phase in `History` and must not advance while blocked.

Each item must have:

- one PRD named `PRD-NNNNNN-{CLASS}`
- one current phase folder under `docs/`
- a `History` table containing its phase transitions
- an `Audit` table containing other timestamped operational records

Items in the Backlog phase also have one row in `BACKLOG.md`; items in other phases do not.

## Safety invariants

- Do not perform work that violates this contract.
- Refuse work that violates the workflow contract and explain the blocking rule. Do not make code changes unless the target PRD is in `Implement`, and do not promote workflow items without explicit user intent through `prd-promote`. Preserve unrelated user changes and keep the PRD folder, History, and any applicable backlog row aligned.
- Do not promote an item automatically; promotion requires explicit user intent through the local `prd-promote` skill.
- Product code changes are authorized only while the target PRD is in `Implement`.
- Explicitly approved workflow-tooling changes may be made outside a product PRD when they are limited to lifecycle contracts, agent instructions, workflow skills, templates, status maps, validators, or related process documentation; they must not change Quill product behavior, must preserve unrelated changes, and must be recorded durably in Git through the commit message and diff.
- Backlog membership and the PRD file must be updated as one workflow transition when an item enters or leaves `docs/05 - Backlog/`.
- Material scope expansion becomes a separate backlog item.
- Blocked items move to `docs/06 - Blocked/`, have no `BACKLOG.md` row, and retain their last active phase in `History` until they return to that phase folder.
- Preserve unrelated user changes.
- Evidence naming guardrail: every evidence artifact filename must begin with the uppercase `PRD-` identifier prefix. When an evidence file is renamed, update every repository reference to the exact same capitalized path; do not create or leave `prd-`-prefixed evidence filenames or links.

## PRD identity and structure

PRD IDs use `PRD-NNNNNN-{CLASS}`, with classes such as `BUG`, `CHANGE`, `TECH`, and `UI`. The same PRD file moves through:

- `docs/05 - Backlog/`
- `docs/06 - Blocked/`
- `docs/10 - Plan/`
- `docs/15 - Implement/`
- `docs/20 - Test/`
- `docs/25 - Closed/`

New and actively maintained PRDs must use the required structure defined in
the `PRD structural schema` section below.

`History` and `Audit` are Markdown tables. `Legacy Notes` is used after the main record when a PRD contains backfill, chronology gaps, or other non-standard historical carryover.

### PRD structural schema

This section defines the shared structural facts used by local workflow skills. It does not define phase procedures; those belong to the relevant skill.

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

`History` is a Markdown table containing phase transitions. `Audit` is a Markdown table containing other timestamped operational records. `Verification` contains a Markdown test-case tracking table with the columns `Test Case`, `Criteria`, `Product Version`, `Status`, `Description`, and `Evidence`.

New evidence records copied from `.codex/skills/prd-testcase/references/TPL-TESTCASE.md` contain `Preconditions`, `Steps to Reproduce`, and `Expected Results` in that order between the metadata table and the `Evidence` section. Evidence metadata keeps `Test` as the description only, without pass/fail wording, and `Result` as exactly `PASS` or `FAIL`. Workflow timestamps use `yyyy-MM-ddTHH:mm:ss.fffffffZ` in UTC.

Validation ownership is divided as follows:

- `prd-backlog` validates the new-item shape it creates.
- `prd-promote` validates the target item's phase gate and alignment before moving it.
- `prd-implement` validates implementation readiness before code work.
- `.agents/lifecyle-agent/check-workflow.ps1` performs read-only repository-wide structural checks.

## Records and time

- `History` records phase transitions only, with the end phase and its actual UTC timestamp.
- `Audit` records decisions, evidence, risks, approvals, exceptions, clarifications, and backfill notes.
- Keep each `Audit` detail short, concise, and non-technical; record implementation-level technical detail in the appropriate PRD section, code change, or evidence record.
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

The item is `In Progress / Test` with its PRD in `docs/20 - Test/`. Testing uses the committed packaged candidate from `main`. Each test case records its acceptance criterion, exact product version, description, status, UTC timestamp, preconditions, reproducible steps, expected results, and evidence. Completed records use `docs/90 - Evidence/PRD-NNNNNN-{CLASS}-TC-NN.md` and link back to the PRD.

The PRD's `Verification` section must contain a Markdown tracking table with one row per planned test case and these columns: `Test Case`, `Criteria`, `Product Version`, `Status`, `Description`, and `Evidence`. Keep the row current while testing; the `Evidence` cell links to the corresponding record in `docs/90 - Evidence/` when evidence has been recorded.

Use `planned`, `open`, `in progress`, `complete`, `blocked`, or `exception` for the tracking-table `Status`. To generate a test evidence record, copy `.codex/skills/prd-testcase/references/TPL-TESTCASE.md` to `docs/90 - Evidence/PRD-NNNNNN-{CLASS}-TC-NN.md`, fill in the exact product version, UTC timestamp, concise test description, result as exactly `PASS` or `FAIL`, preconditions, numbered steps to reproduce, expected results, and supporting evidence, then link that file from the matching tracking-table row. The `Test` field contains only the description and must not contain the words `pass` or `fail`; the `Result` field contains no explanatory text. Keep the `Preconditions`, `Steps to Reproduce`, and `Expected Results` sections between the metadata table and `Evidence` section in every new record.

If testing finds code work, return the PRD to `Implement`, update the backlog, record the transition, and only then resume implementation. Product-affecting corrections require a new patch candidate and repeat testing of affected coverage.

### Closed

The item is `Done / Closed` with its PRD in `docs/25 - Closed/`. Applicable test cases must be complete or have accepted exceptions recorded in `Audit`. Update test record links after the PRD moves. PRD closure does not by itself require a version bump, product tag, or release branch.

## Product candidate rules

Product-affecting changes include application code, Tauri configuration, runtime dependencies, build scripts, and packaged assets.

- Product versioning is independent of PRD closure.
- A new product cycle increases the minor version and resets the patch to zero.
- Before a product-affecting PRD enters `Test`, create the next patch candidate, commit the product change and synchronized version files to `main`, rebuild, and overwrite the root executable as required by the repository.
- Documentation-only, evidence-only, and phase-transition commits do not require a product version bump unless they change packaged content.
- Product tags are created only through the separate approved product-release process after the exact version has passed formal testing.

## Requirement shaping

New requirements must be shaped with the repo-local [prd-grill-me](../../.codex/skills/prd-grill-me/SKILL.md) skill before becoming PRD items. If that skill is unavailable or broken, do not create the requirement.


