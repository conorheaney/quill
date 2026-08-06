---
name: prd-patch
description: Prepare a Quill product-affecting PRD for Test by creating the required committed patch-version candidate, rebuilding the desktop artifacts, synchronizing the root executable, and stopping before PRD promotion.
---

# PRD Patch

Prepare the committed product candidate required before an Implement-phase Quill PRD can enter Test. This skill performs candidate preparation only; it must never move the PRD to `Test` or any later phase.

## Read First

Read these files before changing anything:

1. `WORKFLOW.md`
2. `BACKLOG.md`
3. `.agents/local-agent.md`
4. the target PRD in `docs/02 - Implement/`
5. `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`

Use the live repository files as authoritative if they differ from this skill.

## Preconditions

- Identify the PRD number. Ask for it if the user did not specify it clearly.
- Confirm the backlog row says `In Progress` / `Implement` and the matching PRD is in `docs/02 - Implement/`.
- Confirm the PRD contains the required sections and has a concrete `Next Step` for Test-candidate preparation.
- Confirm the item is product-affecting under `WORKFLOW.md`; this skill is intended for code, runtime, build, dependency, configuration, or packaged-asset changes.
- Inspect `git status` before changing anything. Preserve unrelated user changes and never stage them.
- Give the user a concise summary of the candidate work and ask whether to continue before mutating files.
- Ask for a separate confirmation immediately before the version bump.
- Ask for a separate confirmation immediately before the build and executable synchronization.
- Ask for a separate confirmation after the staged scope and commit message are shown, immediately before committing.
- Ask for a separate confirmation immediately before pushing the approved commit to its configured remote branch.

## Candidate Version

- Read the current version from `package.json` and confirm it matches `package-lock.json` and `src-tauri/Cargo.toml`.
- Unless the user specifies another valid version, propose the next patch version and wait for confirmation before running `npm run version:bump`.
- For a specified target, run `npm run version:bump -- <target-version>`.
- Do not change the minor version in this skill. A new release cycle must use the separately documented minor-version process.
- Confirm `src-tauri/tauri.conf.json` still derives its version from `../package.json`.

## Build And Synchronize

1. After confirmation, run the repository's version-bump command.
2. Show the resulting version-file diff and ask for confirmation before building.
3. After confirmation, run `npm run build` and require a successful Tauri release build and NSIS bundle where the repository configuration produces them.
4. Copy `src-tauri/target/release/quill-tauri.exe` to the repository-root `quill.exe`, because `WORKFLOW.md` requires the root executable to be overwritten after builds.
5. Compare SHA-256 hashes of the root executable and the release executable; they must match.
6. Run the relevant static checks, including `node --check` for modified JavaScript files.
7. Do not claim formal visual acceptance. That belongs to the Test phase.

## PRD Record

- Keep the PRD in `Implement`; do not add a `Test` row to `History` and do not move the file.
- Update `Next Step` to say that the committed candidate is ready for explicit `prd-promote` validation.
- Record the candidate version, build result, executable synchronization, and any exceptions in the PRD `Audit` table using a fresh UTC timestamp.
- If the candidate build exposes an implementation problem, stop and keep the PRD in `Implement`; record the blocker instead of promoting or silently expanding scope.

## Commit And Push Checkpoints

- Review the complete diff after candidate preparation.
- Stage only the target PRD, the approved product implementation, synchronized version files, generated root `quill.exe`, and any other files explicitly required by the target PRD.
- Never stage unrelated user changes, especially changes belonging to another PRD.
- The candidate and product changes must be committed to `main` before `prd-promote` can move the PRD to `Test`.
- Show the complete candidate diff, exact staged paths, notable binary artifacts, and proposed commit message. Ask for explicit confirmation before staging and committing. Follow the `git-verified-commit` scope and approval rules.
- After the commit succeeds, report the exact commit hash and candidate version, then ask whether to push it.
- Before pushing, confirm the intended remote and branch from Git configuration and show the exact commit that will be pushed. Ask for explicit confirmation.
- Push only the approved commit to the configured remote branch with a normal `git push`; never force-push, amend, or push tags from this skill.
- After the push succeeds, verify that the local branch and remote-tracking branch point at the same commit and report the remote/branch.

## Stop Condition

Stop after the candidate commit is successfully pushed or the user declines the push. Do not edit `BACKLOG.md` to change the phase, do not move the PRD into `docs/03 - Test/`, and do not add a `Test` history entry. The next action is a separate explicit invocation of `prd-promote`.

## Failure Handling

- If the PRD is not in `Implement`, refuse and identify the workflow mismatch.
- If versions are inconsistent before the bump, stop before changing files and report the mismatch.
- If the build, hash comparison, static check, scope review, or commit verification fails, stop and report the exact failure.
- If unrelated changes are present, preserve them and identify them in the handoff; do not reset, stash, discard, or overwrite them.
- If the user declines any checkpoint, stop without performing that step and report the remaining next action.
- If push fails, leave the local commit intact, report the exact remote error, and do not retry without confirmation.
