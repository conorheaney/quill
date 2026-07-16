# PRD-000017-TECH

## Short Name

Centralize Product Version Source

## Goal

Establish one shared source of truth for Quill's product version so both the product UI and Tauri build-facing configuration consume the same value without manual duplication.

## Context

The current app already carries a product version through several repo surfaces, but the value is duplicated across build-facing files and is not yet surfaced in the Quill UI. The requirement is broader than a simple sidebar label: Quill should have one centralized version source, and both the product UI and the Tauri build path should pull from that shared value so the displayed version and shipped build references cannot drift.

Current version references identified during backlog shaping:

- `package.json` -> `"version": "1.0.3"`
- `src-tauri/tauri.conf.json` -> `"version": "1.0.3"`
- `src-tauri/Cargo.toml` -> `version = "1.0.3"`

Decision captured during requirement shaping:

- use the existing version number
- keep one source of truth for the product and build version
- treat the work primarily as a technical source-of-truth change rather than just a UI placement change

## Scope

In:

- define a centralized source-of-truth approach for Quill's product version
- make both the UI and Tauri build-facing configuration consume the same shared version value
- identify the repo references that currently carry the version used by the product and build configuration
- ensure the latest product version appears during install
- ensure the latest product version appears in the built app executable and installer executable properties
- keep the displayed version aligned with the shipped build version

Out:

- introducing a second marketing or product-only version number
- changing Quill's release versioning scheme
- broader in-app UI version-display work unrelated to install or packaged executable metadata
- showing the product version in the browser-only runtime
- unrelated packaging changes beyond version-source alignment

## Plan

- The plan must leave Quill with one human-edited product version source and no routine manual duplication across `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`.
- The chosen approach must ensure the same latest version value flows into installer-visible version surfaces and into the metadata exposed by the built app executable and installer executable.
- Preferred option: Option A.
- Canonical human-edited version source: `package.json`.
- Tauri config path: update `src-tauri/tauri.conf.json` so its `version` field is derived from `../package.json` instead of duplicating a literal version string.
- One-shot version bump path: add one repo-local Node script at `scripts/bump-version.mjs`, exposed through an npm command such as `npm run version:bump -- 1.0.4` or `npm run version:bump`.
- Script input contract: accept either one explicit target version argument or no argument. With an explicit argument, accept stable semver such as `1.0.4` and prerelease semver such as `1.0.4-qa.1` or `1.0.4-rc.1`. With no argument, increment the last numeric component of the current version once.
- Script update contract: update `package.json` `version`, update the root package version fields in `package-lock.json`, update `[package].version` in `src-tauri/Cargo.toml`, and fail if `src-tauri/tauri.conf.json` is not already configured to derive its `version` from `../package.json`.
- Script safety contract: print the target version and the files it intends to change before writing, make no other file edits, and exit non-zero if any target file is missing or cannot be updated cleanly.
- Cargo path: keep `src-tauri/Cargo.toml` as a synchronized downstream consumer updated by the one-shot version bump script rather than as a second manual edit point.
- UI display path: expose the visible product version in the Tauri desktop UI through the packaged app version API so the displayed value comes from the built desktop app metadata rather than from a separate frontend-maintained string.
- Browser-only runtime handling: do not add browser-only version-display plumbing. Browser-only version display is out of scope for this item, so the centralized version flow only needs to serve the Tauri desktop UI and Tauri-produced desktop artifacts.
- Rejected alternatives:
- Option B adds an extra repo-owned version artifact without reducing the real integration work in this repo because `package.json`, Tauri config, and Cargo metadata would still need downstream synchronization.
- Option C leaves a larger drift window because a release-only or build-only sync step would not fully align local desktop UI behavior with the packaged desktop metadata unless the step is treated as mandatory for every desktop run path.
- Desktop flow contract: any intentional product-version change for desktop artifacts must run through `npm run version:bump -- <semver>` before `npm run build` or `.\scripts\build-production.ps1 -Mode release` is used to produce installable artifacts.
- Release-flow contract: version bumps remain a separate explicit step from packaging. The version bump command updates source files first, the changed files are then reviewed and committed through the normal workflow, and only after that should release packaging run from the updated tree.
- Development-flow contract: ordinary `npm run tauri:dev` work does not require running the version bump command unless the developer is intentionally validating a new product version in the Tauri UI or preparing a release candidate build.
- Implementation planning for this phase is now specific enough that implementation work can wire the script, the Tauri config reference, and the Tauri UI version display without further architectural re-planning.

## Acceptance Criteria

- The product version must be visible in the Tauri desktop UI.
- The latest product version appears in the built app executable properties and installer executable properties.

## Verification

- Verify the chosen source-of-truth design by tracing the planned value flow from the canonical source into both Tauri-facing files and the resulting packaged artifacts.
- Verify that the planned approach removes routine manual duplication rather than merely documenting multiple edit points.
- Verify that the PRD names the files and execution step clearly enough that an implementation pass can build the change without re-planning the architecture.
- Verify that browser-only version display remains explicitly out of scope so the implementation does not add a second browser-facing version artifact unnecessarily.
- Verify the version bump command rejects invalid input, increments the last numeric component correctly when called without an argument, and only updates the declared files.
- During implementation and test, expected evidence should include a repo check showing `package.json`, `package-lock.json`, Tauri config, and `Cargo.toml` aligned after one run of the version bump script, a desktop UI check confirming the Tauri runtime shows the packaged app version, and artifact checks confirming the built app executable and installer executable properties show the latest version.
- Manual verification checklist:
- Run `npm run version:bump -- 1.0.4-qa.1`, then confirm `package.json`, `package-lock.json`, and `src-tauri/Cargo.toml` all report `1.0.4-qa.1` while `src-tauri/tauri.conf.json` still derives its version from `../package.json`.
- Run `npm run version:bump`, then confirm the version advances to `1.0.4-qa.2` across the same files.
- Run `npm run version:bump -- 1.0.4`, then confirm the version advances to the final release value across the same files.
- Run failure checks such as `npm run version:bump -- 1.0` and confirm the command rejects invalid input without changing any files.
- Run `npm run tauri:dev`, open the Tauri desktop app, and confirm the sidebar version label matches the current product version.
- Close any running Quill desktop processes, run `npm run build`, then confirm the built app executable and NSIS installer executable properties both show the same current product version.
- If `npm run build` fails because `src-tauri/target/release/quill-tauri.exe` is locked, clear the running process first and rerun the build before treating artifact verification as incomplete.

## Test Cases

### Test Case 1

| Field | Detail |
| --- | --- |
| Number | `PRD-000017-TECH-TC-01` |
| Title | `Built Quill app shows product version in the desktop UI` |
| Acceptance Criterion | `The product version must be visible in the Tauri desktop UI.` |
| Preconditions | A built Quill desktop executable is available. |
| Expected Result | A version label is visible in the Tauri desktop UI; the label is displayed in the sidebar product area; the label shows a valid product version string. |
| Date | `2026-07-16T15:51:36.9914018Z` |
| Note | Screenshot captured from the built Quill Tauri desktop app with the sidebar version label highlighted. The visible label shows `Version 1.0.4` in the product area beside the Quill branding. |
| Evidence | [prd-000017-version-ui-test-evidence.png](C:/Users/conor/Documents/Markdown%20Editor/docs/evidence/prd-000017-version-ui-test-evidence.png) |

Steps:
- Launch the built Quill desktop application.
- Wait for the main editor window to finish loading.
- Look at the sidebar product area near the Quill branding.
- Find the visible version label.
- Note the exact version shown in the UI.

### Test Case 2

| Field | Detail |
| --- | --- |
| Number | `PRD-000017-TECH-TC-02` |
| Title | `Built executable and installer show the same product version in file properties` |
| Acceptance Criterion | `The latest product version appears in the built app executable properties and installer executable properties.` |
| Preconditions | A built Quill desktop executable and built Quill installer are available. |
| Expected Result | The built app executable shows the expected current product version in its properties; the installer executable shows the same expected current product version in its properties; the version values match between the two built artifacts. |
| Date | `2026-07-16T15:51:36.9914018Z` |
| Note | Screenshot captured from the built `quill-tauri.exe` file properties `Details` tab. The visible metadata shows `File version 1.0.4` and `Product version 1.0.4`, confirming the built desktop executable carries the expected current product version. |
| Evidence | [prd-000017-exe-version-test-evidence.png](C:/Users/conor/Documents/Markdown%20Editor/docs/evidence/prd-000017-exe-version-test-evidence.png) |

Steps:
- In Windows File Explorer, locate the built Quill desktop executable.
- Right-click the executable and select `Properties`.
- Open the `Details` tab.
- Record the values shown for `File version` and `Product version`.
- In Windows File Explorer, locate the built Quill installer executable.
- Right-click the installer and select `Properties`.
- Open the `Details` tab.
- Record the values shown for `File version` and `Product version`.
- Compare the version values from the built app executable and the installer executable.

## Next Step

Treat the shared Quill versioning flow as the released baseline and use the manual verification checklist in this PRD as the reference for future versioning changes or regressions.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-16T11:08:00.0625655Z | Backlog |
| 2026-07-16T11:38:05.2277604Z | Plan |
| 2026-07-16T12:11:59.7383815Z | Implement |
| 2026-07-16T15:03:07.2629744Z | Test |
| 2026-07-16T15:51:37.0274104Z | Release |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-16T11:08:01.2257499Z | Requirement shaping | Added from a lightweight `grill-me` pass based on the request to show the current product number near the sidebar header. Decision: use the existing version number as the single source of truth instead of creating a separate product-number concept. |
| 2026-07-16T11:08:01.2257499Z | Reference note | Current version references identified during backlog shaping: `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`. |
| 2026-07-16T11:08:01.2257499Z | State | Current state: backlogged and waiting to move into `01 - Plan`. |
| 2026-07-16T11:10:05.9339623Z | Scope refinement | Reframed this item from a UI-first version-display change into a technical source-of-truth change. The central requirement is now to make both the Quill UI and the Tauri build-facing configuration consume one shared version value, with the sidebar display treated as one consumer of that shared source. |
| 2026-07-16T11:38:05.2733574Z | Promotion | Promoted from `Backlog` to `Plan` and expanded the planning sections with concrete source-of-truth options covering a `package.json`-first path, a dedicated version-file path, and a derived shared-artifact path. |
| 2026-07-16T11:38:05.3075940Z | Planning note | Current recommendation is to evaluate `package.json` as the likely canonical source first because it already carries the shipped product version in the repo's existing Node workflow, while confirming that Tauri-facing config can be generated or synchronized from it cleanly. |
| 2026-07-16T11:43:45.7504426Z | Acceptance refinement | Simplified the planned acceptance target to two artifact-facing outcomes: the latest product version should appear during install, and it should appear in the built app executable and installer executable properties. |
| 2026-07-16T11:55:26.5779369Z | Decision | Chose Option A for this repo. `package.json` is the canonical human-edited version source, Tauri desktop UI version display is in scope, browser-only version display is out of scope, and the remaining implementation detail is the repo-local sync or verification path for `src-tauri/Cargo.toml`. |
| 2026-07-16T12:03:53.3194184Z | Planning refinement | Refined the preferred Option A into a one-shot repo-local version bump script approach: the script should update `package.json`, `package-lock.json`, and `src-tauri/Cargo.toml`, while `src-tauri/tauri.conf.json` follows `package.json` through its version-path configuration. |
| 2026-07-16T12:07:45.4210880Z | Planning refinement | Defined the exact planning contract for the one-shot version bump flow: proposed `scripts/bump-version.mjs` interface, semver input rule, owned file updates, failure behavior, and the desktop build and release entry points that must run after the version bump step. |
| 2026-07-16T12:11:59.7383815Z | Promotion | Promoted from `Plan` to `Implement` after validating that the PRD now defines a specific version-bump script contract, Tauri config source path, desktop UI version-display path, and verification expectations that are concrete enough to guide scoped implementation. |
| 2026-07-16T12:20:16.3948916Z | Implementation | Implemented the approved desktop version-source flow across the repo: added `scripts/bump-version.mjs` plus the `npm run version:bump -- <semver>` entry point, switched `src-tauri/tauri.conf.json` to derive its version from `../package.json`, extended the desktop bridge with a Tauri app-version reader, and added a Tauri-only sidebar version label in the Quill UI. |
| 2026-07-16T12:20:16.4345493Z | Verification | Verified the version-bump command rejects missing and invalid input, verified it no-ops cleanly when asked to keep `1.0.3`, and confirmed the existing release executable and NSIS installer both report product version `1.0.3`. A fresh `npm run build` attempt on 2026-07-16 failed because `src-tauri/target/release/quill-tauri.exe` was locked by a running process, so the packaged-artifact rebuild and live desktop UI check remain blocked on local machine state rather than source wiring. |
| 2026-07-16T14:30:34.1856565Z | Implementation refinement | Extended the version-bump flow to support release-cycle increments without a second maintained number: explicit calls may now use stable or prerelease semver such as `1.0.4`, `1.0.4-qa.1`, or `1.0.4-rc.1`, while a no-argument call increments the trailing numeric component of the current version once, for example `1.0.3 -> 1.0.4` or `1.0.4-qa.1 -> 1.0.4-qa.2`. |
| 2026-07-16T14:38:54.5148850Z | Verification refinement | Added a concrete manual verification checklist covering explicit and no-argument version bumps, invalid-input rejection, Tauri desktop UI version display, and built-artifact property checks, including the known local lock caveat for `src-tauri/target/release/quill-tauri.exe`. |
| 2026-07-16T15:03:07.2629744Z | Promotion | Promoted from `Implement` to `Test` after rebuilding Quill successfully at product version `1.0.4` and confirming the rebuilt release executable and NSIS installer both report product version `1.0.4`. The remaining verification focus is the live Tauri desktop UI check for the sidebar version label. |
| 2026-07-16T15:51:36.9914018Z | Verification | Verified the remaining live Tauri desktop UI check with screenshot evidence in `docs/evidence/prd-000017-version-ui-test-evidence.png`, showing the sidebar label renders `VERSION 1.0.4` in the running Quill desktop app. Paired artifact evidence in `docs/evidence/prd-000017-exe-version-test-evidence.png` shows the rebuilt `quill-tauri.exe` properties report file version and product version `1.0.4`. |
| 2026-07-16T15:51:37.0274104Z | Promotion | Promoted from `Test` to `Release` after the live Tauri UI version-label check and executable-property evidence closed the remaining verification gap for `1.0.4`. |
| 2026-07-16T15:56:08.6664436Z | Documentation refinement | Updated the release PRD test case formatting so each case now uses a separate title row, `{PRD}-{TC}` numbering, and canonical UTC timestamp formatting in the `Date` field. |
