# PRD Workflow Kit Setup

This folder is a portable starter package for a lightweight PRD workflow. It does not modify the source project that produced it.

## Install In A Project

1. Copy the kit into the target repository, or copy its contents into a shared local plugin location.
2. From the target repository, run `scripts/initialize-project.ps1`.
3. Review the generated `WORKFLOW.md`, `BACKLOG.md`, and `.agents/local-agent.md`.
4. Replace the product name and any project-specific build, test, release, and evidence rules.
5. Confirm that the required phase folders exist under `docs`.
6. Add the generated project files to version control.

Example:

```powershell
& .\prd-workflow-kit\scripts\initialize-project.ps1 -ProjectRoot .
```

The initializer does not overwrite existing files unless `-Force` is supplied.

## Resulting Project Shape

```text
WORKFLOW.md
BACKLOG.md
.agents/local-agent.md
.codex/skills/
docs/
├── 00 - Backlog/
├── 01 - Plan/
├── 02 - Implement/
├── 03 - Test/
├── 04 - Release/
└── 90 - Evidence/
```

## Operating Model

Create each requirement as a backlog row and matching PRD file. Move that same file through Backlog, Plan, Implement, Test, and Release. The backlog is the canonical item and status index; the PRD is the detailed record.

Code changes are authorized only while the item is in Implement. Promotions must be explicit, phases cannot be skipped, and new requirements receive a short `grill-me` pass before becoming backlog items.

Maintain `History` as a stage-transition table and `Audit` as a decision, evidence, risk, exception, and approval table. Record both just in time, using UTC timestamps in the format defined by `WORKFLOW.md`.

## Customization Checklist

- Set the product name and repository terminology.
- Choose the supported PRD classes.
- Confirm the six-digit PRD identifier format.
- Confirm the mandatory PRD section order.
- Add project-specific versioning and release rules only if needed.
- Set the build and test commands.
- Confirm the evidence folder and link style.
- Decide whether the project wants automated validation in addition to the local agent guardrails.

## Updating The Kit

Treat this package as a versioned baseline. Update the kit first, then apply deliberate changes to consuming projects. Do not overwrite a project’s canonical workflow without reviewing its existing rules and backlog.
