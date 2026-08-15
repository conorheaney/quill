# PRD-000030-TECH

## Short Name

Harden Desktop Trust Boundary

## Goal

Reduce the filesystem and process risk exposed through Quill's desktop bridge while preserving supported file workflows.

## Context

`REV-005` found a null CSP and desktop commands that accept broad frontend-provided paths, infer image type from extensions, lack size limits, and compose Explorer arguments manually.

## Scope

In:

- define and apply a restrictive packaged-asset CSP
- canonicalize and constrain desktop paths and file operations
- validate image type and size, return structured errors, and use safe process arguments

Out:

- broad frontend injection remediation outside the desktop boundary
- unrelated UI redesign or persistence refactoring

## Plan

During Plan, inventory each desktop command, define allowed-path/file/error policies, and map negative cases to isolated Rust and packaged verification.

## Acceptance Criteria

- AC-01: Out-of-policy desktop operations are rejected with actionable structured errors while allowed Markdown and image workflows continue to pass under a non-null CSP.

## Verification

| Test Case | Criteria | Product Version | Status | Description | Evidence |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC-01 | pending | `planned` | Verify CSP, canonicalization, file-type/size restrictions, safe process arguments, negative command cases, and supported file workflows. | Not yet recorded. |

## Next Step

Promote to Plan and define the trust-boundary policy per desktop command.

## History

| Timestamp | Stage |
| --- | --- |
| 2026-08-15T16:59:35.8846236Z | Backlog |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| 2026-08-15T16:59:35.8846236Z | Requirement shaping | Created from `REV-005` in the PRD-000010-TECH code review. Current desktop command tests cover existing behavior only; future trust-boundary policy remains unimplemented. |
