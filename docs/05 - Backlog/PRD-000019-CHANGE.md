# PRD-000019-CHANGE

## Short Name

Externalize Default Getting Started Guide

## Goal

Load Quill's default guide from a shipped Markdown file instead of script content.

## Context

The guide exists in both script and Markdown. Under `PRD-000020-CHANGE`, the Markdown file becomes the sole desktop source with no browser fallback.

## Scope

In:

- make the deployed Markdown file the sole guide source
- load it through Tauri with clear failure behavior
- update affected docs

Out:

- document-management features or guide redesign
- user-selectable startup documents
- browser fallback behavior

## Plan

- Define the deployed path, Tauri loading contract, and failure behavior.
- Remove the duplicate script source and update docs.

## Acceptance Criteria

- `AC-01`: The packaged app loads the shipped Markdown guide.
- `AC-02`: No duplicate script or browser fallback content remains.
- `AC-03`: A missing guide produces the defined desktop error.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| `TC-01` | `AC-01` | `pending` | `planned` | Verify normal startup loads the packaged Markdown guide. | Not yet recorded. |
| `TC-02` | `AC-02` | `pending` | `planned` | Search for duplicate script or browser fallback content. | Not yet recorded. |
| `TC-03` | `AC-03` | `pending` | `planned` | Verify missing-guide startup produces the defined desktop error and review affected documentation. | Not yet recorded. |

## Next Step

After `PRD-000020-CHANGE`, move this item to `10 - Plan` and define the path and loading contract.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-07-16T20:45:01.2625022Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-07-16T20:45:01.4039955Z | Scope discovery | Added as a backlog item to externalize the default getting-started guide into a deployed markdown document for the desktop app while keeping browser-mode startup content resilient. |
| 2026-07-16T20:45:01.4349938Z | State | Current state: backlogged and waiting to move into `10 - Plan`. |
| 2026-07-24T23:40:21.5074095Z | Scope alignment | Aligned with the desktop-only runtime: use Tauri loading with no browser fallback. |

