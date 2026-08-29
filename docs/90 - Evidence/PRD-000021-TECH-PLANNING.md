# PRD-000021-TECH Planning Evidence

**Recorded:** 2026-08-29T14:44:26.1392155Z  
**Purpose:** Define the staged path for converting Quill's authored JavaScript surface to TypeScript.

## Target outcome

Convert all authored JavaScript and `.mjs` source to strict TypeScript while preserving Quill's behavior, native desktop boundary, command contract, and offline packaged workflow.

Rust and Cargo remain the Tauri implementation and packaging layer. TypeScript owns the frontend, bridge adapter, tests, helpers, and Node-based scripts.

## Architecture decisions

| Area | Decision |
| --- | --- |
| Build | Use `esbuild` for frontend and Node-tooling compilation. |
| Modules | Use standard TypeScript `import`/`export` modules and a bundled frontend entry point. |
| Authored frontend | Move HTML, CSS, images, and TypeScript source to `frontend/`. |
| Generated frontend | Emit Tauri-consumable output to `dist/`; do not hand-edit generated JavaScript. |
| Tests | Keep all tests and helpers under `tests/`; migrate them alongside the covered production slice. |
| Tooling | Keep authored build and release tooling under `scripts/`. |
| Tauri global | Keep `window.__TAURI__` behind a typed adapter initially; later switch to direct `@tauri-apps/api` imports and remove `withGlobalTauri`. |
| Native layer | Retain Rust/Cargo. Define and test TypeScript interfaces against existing Rust command signatures. |
| Compatibility | Preserve `npm test`, `npm run build`, and `npm run smoke:dev`; add `npm run build:frontend`. |
| Versioning | Keep the migration within this PRD; use the established product-cycle and candidate rules for product changes. |

## Migration phases

### Phase 0 — Baseline

- Confirm the existing Node, Rust, smoke, and packaged-build contracts.
- Record the current script dependency order, browser globals, asset paths, and Tauri commands.
- Establish a clean regression baseline before layout or language changes.

Exit gate: existing verification commands and representative smoke behavior are documented and reproducible.

### Phase 1 — Build foundation and static move

- Add TypeScript, `esbuild`, type declarations, and build scripts.
- Move authored frontend resources from `code/` to `frontend/`.
- Generate `dist/` and point Tauri `frontendDist` at it.
- Support mixed JavaScript/TypeScript compilation during migration.
- Keep the application behaviorally unchanged.

Exit gate: `npm run build:frontend`, `npm test`, `npm run smoke:dev`, and the packaged build use the new layout successfully.

### Phase 2 — Shared contracts

- Define strict shared types for Markdown blocks, tokens, document/session state, recent files, persistence results, and pane/controller callbacks.
- Define typed desktop bridge inputs, outputs, errors, and capabilities from the Rust command signatures.
- Keep adapters at runtime boundaries so remaining JavaScript can consume the contracts safely.

Exit gate: contract tests cover the TypeScript/Rust bridge surface and no new untyped boundary is introduced.

### Phase 3 — Leaf modules

Convert one module at a time, including focused tests and helpers:

1. `app-config`
2. `markdown` and its Markdown tests
3. `storage`
4. `outline-pane`
5. `markdown-pane`

Exit gate: each module has strict TypeScript diagnostics, focused tests, and unchanged public behavior.

### Phase 4 — Stateful and native-boundary modules

- Convert `desktop-bridge` behind the temporary typed global adapter.
- Convert `recent-files`, `document-controller`, and related persistence/controller tests.
- Preserve cancellation, failure, latest-edit-wins, and recent-file behavior.

Exit gate: persistence, controller, desktop-command, and bridge contract tests remain green.

### Phase 5 — UI coordination

- Convert `preview-pane`.
- Convert `quill-app` last because it coordinates DOM state, pane callbacks, persistence, rendering, and startup.
- Replace global initialization assumptions with explicit imports and the bundled entry point.

Exit gate: smoke and manual UI coverage confirm startup, editing, rendering, save/load, recent files, themes, and window controls.

### Phase 6 — Tests and scripts

- Convert all remaining tests and helpers under `tests/`.
- Convert all authored JavaScript/MJS build and release scripts under `scripts/`.
- Compile Node tooling with `esbuild` while preserving existing command names and observable failures.

Exit gate: no authored JavaScript remains outside generated output, and the full test/build command contract is intact.

### Phase 7 — Enforcement and cleanup

- Remove compatibility shims, temporary global declarations, and obsolete script loading.
- Remove `withGlobalTauri` after direct API imports are verified.
- Enable strict checks across the complete authored TypeScript tree.
- Confirm `dist/` is reproducible from authored sources and contains the only generated JavaScript.

Exit gate: clean checkout build, full tests, smoke verification, packaged build, and repository search confirm the completion definition.

## Verification gates

- Every phase runs focused tests and TypeScript/build diagnostics.
- Every phase boundary runs the complete `npm test` command.
- Frontend phases run the smoke check.
- Packaging-affecting phases run `npm run build` before Test promotion.
- A phase cannot advance with behavior regressions or unresolved untyped boundary escapes.

## Main risks and controls

| Risk | Control |
| --- | --- |
| Import conversion changes initialization order | Convert leaf modules first; use one explicit entry point and smoke checks. |
| Static move breaks relative assets | Perform the move in Phase 1 and verify generated paths before code conversion. |
| Rust/TypeScript bridge drift | Keep Rust signatures authoritative and add bridge contract tests. |
| Strict typing expands scope unexpectedly | Type shared contracts first; allow mixed JS/TS only during the transition. |
| `quill-app` refactor becomes a rewrite | Preserve callbacks and behavior; convert orchestration after dependencies are typed. |
| Generated output hides source mistakes | Build from a clean checkout and keep `dist/` reproducible. |

## Completion definition

The migration is complete when all authored frontend, tests, helpers, and Node scripts are TypeScript; all authored modules use explicit imports/exports; strict checks pass; the Tauri bridge is typed and verified; generated output is reproducible under `dist/`; existing command contracts remain stable; and full tests, smoke verification, and packaged-build checks succeed.

## Next three actions

1. Record this strategy in the PRD and approve the detailed Phase 0/1 implementation slice.
2. Inventory current script dependencies, asset paths, test loading, and Rust bridge commands.
3. Implement the build foundation and static move without converting production behavior.
