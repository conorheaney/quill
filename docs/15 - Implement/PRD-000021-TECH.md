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
| `TC-01` | `AC-01`, `AC-02` | `pending` | `planned` | Run the frontend build and verify authored resources compile or copy into a reproducible `dist/` output. | Not yet recorded. |
| `TC-02` | `AC-03` | `pending` | `planned` | Run the preserved test, smoke, frontend-build, and packaged-build commands against the new layout. | Not yet recorded. |
| `TC-03` | `AC-04` | `pending` | `planned` | Verify startup, asset loading, bridge availability, Markdown behavior, and representative smoke behavior remain unchanged. | Not yet recorded. |
| `TC-04` | `AC-05` | `pending` | `planned` | Verify strict diagnostics apply to converted TypeScript while mixed JavaScript/TypeScript compilation remains available for later slices. | Not yet recorded. |

## Next Step

Review the Phase 1 verification results and, if accepted, promote this PRD to `Test` through the `prd-promote` workflow for formal candidate testing.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-17T18:28:11.8890877Z | Backlog |
| 2026-08-29T11:17:54.7440982Z | Plan |
| 2026-08-29T14:48:29.2009640Z | Implement |

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

