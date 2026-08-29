# PRD-000021-TECH

## Short Name

TypeScript Migration For Frontend Runtime

## Goal

Plan and carry out a staged TypeScript migration for Quill's frontend runtime and desktop bridge so the codebase gains stronger type safety, clearer module contracts, and lower-risk refactoring paths.

## Context

Quill's current frontend is already split into several focused files, but it still relies heavily on browser globals, loose object shapes, and a large shell coordinator. The current structure suggests that a TypeScript migration is feasible without a full rewrite, but the migration path matters: a low-risk compile-to-JavaScript pass would be materially easier than combining the change with a deeper ES module and bundler redesign.

The exploratory pass so far suggests:

- the codebase has real module boundaries in `markdown.js`, `preview-pane.js`, `markdown-pane.js`, `outline-pane.js`, `storage.js`, `desktop-bridge.js`, and `quill-app.js`
- the most coupled areas are the browser-global wiring, DOM-heavy shell orchestration, and shared block/state shapes that are currently implicit rather than typed
- the likely highest-value early wins are explicit types for markdown blocks, preview/editor state, recent-file entries, and Tauri bridge payloads
- the hardest migration surface is likely `quill-app.js` and `preview-pane.js`, where most state orchestration and UI coordination currently live

This makes the item a technical refactor change with an exploratory planning component rather than a simple syntax conversion task.

## Scope

In:

- define the intended TypeScript migration target for the Quill frontend runtime
- review the current JavaScript module seams, browser-global dependencies, and bridge contracts
- decide whether the first migration pass should preserve the current no-bundler runtime shape or introduce a stronger module build step
- identify the safest migration sequence across leaf modules, shared domain types, and the shell coordinator
- implement the agreed migration slices once the planning pass is strong enough
- update supporting scripts or docs if the build and runtime workflow changes

Out:

- unrelated feature work
- a speculative frontend framework rewrite
- merging a TypeScript migration with broader parser or product-scope changes unless they are explicitly approved later

## Plan

- Follow the detailed staged strategy in [PRD-000021-TECH-PLANNING](../../docs/90%20-%20Evidence/PRD-000021-TECH-PLANNING.md). The authorized first implementation slice is Phase 1: establish the esbuild and TypeScript build foundation, move authored frontend resources to `frontend/`, generate Tauri output under `dist/`, preserve the existing command contract, and prove behavior is unchanged. Later phases remain in this PRD but require their own scoped implementation decisions and verification updates before work begins.

## Acceptance Criteria

- `AC-01`: The repository has a reproducible esbuild-based frontend build that compiles the initial mixed JavaScript/TypeScript surface and emits the runnable frontend to `dist/`.
- `AC-02`: Authored frontend HTML, CSS, images, and other static resources are owned under `frontend/`, and Tauri packages `dist/` without requiring hand-edited generated JavaScript.
- `AC-03`: `npm run build:frontend`, `npm test`, `npm run build`, and `npm run smoke:dev` retain their required command names and execute successfully against the new layout.
- `AC-04`: Phase 1 preserves existing startup, asset loading, Tauri bridge availability, Markdown behavior, and representative smoke behavior; no substantive product behavior change is included in this slice.
- `AC-05`: The migration foundation enables strict TypeScript diagnostics for newly converted files while allowing the remaining authored JavaScript to be migrated in later phases.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01`, `AC-02` | `1.1.0` | `complete` | Run the frontend build and verify authored resources compile or copy into a reproducible `dist/` output. | [TC-01 evidence](../../docs/90%20-%20Evidence/PRD-000021-TECH-TC-01.md) |
| `TC-02` | `AC-03` | `1.1.0` | `complete` | Run the preserved test, smoke, frontend-build, and packaged-build commands against the new layout. | [TC-02 evidence](../../docs/90%20-%20Evidence/PRD-000021-TECH-TC-02.md) |
| `TC-03` | `AC-04` | `1.1.0` | `complete` | Automate generated-app startup serving, asset loading, bundle availability, bridge-adapter presence, and representative Markdown/runtime assertions. | [TC-03 evidence](../../docs/90%20-%20Evidence/PRD-000021-TECH-TC-03.md) |
| `TC-04` | `AC-05` | `1.1.0` | `complete` | Verify strict diagnostics apply to converted TypeScript while mixed JavaScript/TypeScript compilation remains available for later slices. | [TC-04 evidence](../../docs/90%20-%20Evidence/PRD-000021-TECH-TC-04.md) |
| `TC-05` | `AC-04` | `1.1.0` | `complete` | Manually smoke-check the packaged desktop behaviors in scope: startup, editing, rendering, save/load, Recent Files, themes, and maximize/restore controls. | [TC-05 evidence](../../docs/90%20-%20Evidence/PRD-000021-TECH-TC-05.md) |

## Next Step

No further workflow action is required; the PRD is closed with all planned verification complete.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-17T18:28:11.8890877Z | Backlog |
| 2026-08-29T11:17:54.7440982Z | Plan |
| 2026-08-29T14:48:29.2009640Z | Implement |
| 2026-08-29T15:19:22.4257122Z | Test |
| 2026-08-29T16:05:06.2918424Z | Closed |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-17T18:28:11.8890877Z | Requirement shaping | Added as a backlog item from a lightweight shaping pass around converting Quill to TypeScript as a technical refactor change. |
| 2026-07-17T18:28:11.8890877Z | Exploration | Initial exploration suggests the migration is moderate overall: feasible because the frontend is already file-split, but complicated by browser-global wiring, implicit shared object shapes, and the large shell coordinator. |
| 2026-07-17T18:28:11.8890877Z | First planning target | The first planning pass should decide between a low-risk compile-to-JavaScript migration and a deeper ES module plus bundler transition before implementation work starts. |
| 2026-08-29T11:17:54.7440982Z | Promotion | Promoted from Backlog to Plan after identity, alignment, structure, and workflow validation passed. |
| 2026-08-29T14:44:26.1392155Z | Planning decision | Confirmed the hybrid staged migration: esbuild, ESM imports/exports, `frontend/` authored source, `dist/` generated output, separate TypeScript tests/helpers, typed Rust bridge contracts, preserved command names, and Rust/Cargo retained. |
| 2026-08-29T14:44:26.1392155Z | Planning evidence | Added [PRD-000021-TECH-PLANNING](../../docs/90%20-%20Evidence/PRD-000021-TECH-PLANNING.md) with the phase sequence, verification gates, risks, and completion definition. |
| 2026-08-29T14:47:55.7639519Z | Acceptance refinement | Replaced planning placeholders with concrete Phase 1 implementation criteria and four planned verification cases covering the esbuild foundation, static layout, preserved commands, behavior preservation, and strict TypeScript diagnostics. |
| 2026-08-29T14:48:29.2009640Z | Promotion | Promoted from Plan to Implement after the Phase 1 scope, acceptance criteria, verification cases, and next implementation step were validated. |
| 2026-08-29T14:49:01.8087342Z | Alignment repair | Moved the In Progress backlog row into the repository's required `In Progress` section after post-promotion validation identified the section-state invariant. |
| 2026-08-29T14:57:46.1743960Z | Implementation decision | Established the Phase 1 mixed JS/TypeScript foundation with a TypeScript entry point that preserves the existing browser-global initialization order; authored resources now live under `frontend/`, and esbuild generates the runtime bundle under ignored `dist/`. |
| 2026-08-29T14:57:46.1743960Z | Verification | `npm run typecheck`, `npm run build:frontend`, `npm test` (47 Node tests and 8 Rust tests), `npm run build` (Tauri executable and NSIS installer), stale-path audit, and `npm run check:workflow` completed successfully. |
| 2026-08-29T15:02:32.0000000Z | Candidate preparation | Created product candidate `1.1.0`; the release Tauri build and NSIS bundle succeeded, root `quill.exe` was synchronized with the release executable, and both SHA-256 hashes match: `592BF27813B3D8100C576A72513711A5CB553C3FD7952034AA1FE7F945661CF8`. TypeScript diagnostics and diff checks passed. |
| 2026-08-29T15:19:22.4257122Z | Promotion | Promoted from `Implement` to `Test` after confirming the committed and pushed `1.1.0` candidate, synchronized executable hash, and passing workflow validation. |
| 2026-08-29T15:32:33.7787363Z | Verification refinement | Split the original behavior-preservation coverage: TC-03 now records automatable generated-app/runtime checks, while TC-05 holds the manual packaged-desktop smoke checks. TC-01 through TC-04 completed with PASS evidence at product version `1.1.0`; TC-05 remains open for manual execution. |
| 2026-08-29T16:05:06.2918424Z | Closure | Promoted from `Test` to `Closed` after all five planned test cases completed with PASS evidence for product version `1.1.0`, including the manual TC-05 smoke record and supporting screenshots. |
| 2026-08-29T16:03:14.8684428Z | Verification scope clarification | Removed Tauri bridge actions and the close-control action from TC-05 at the user's direction. The remaining manually verified startup, editing, rendering, save/reload, Recent Files, theme, and maximize/restore coverage is complete. |

