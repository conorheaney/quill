# PRD-0005-CHANGE

## Short Name

Bump App Version

## Goal

Update the packaged app version for the next release using a semver-safe manifest value.

## Context

The requested release label is `1.02`, while `package.json` should retain valid semver formatting for Electron and npm tooling.

## Scope

In:

- update the app manifest version
- record the version bump in the repo workflow docs

Out:

- feature work
- installer branding changes
- release packaging changes beyond the manifest version

## Next Step

No further implementation work is required for this item.

## Status

Done

## Verification

- Confirmed [package.json](C:/Users/conor/Documents/Markdown%20Editor/package.json) reports version `1.0.2`.
- Confirmed this PRD now resides in `docs/04 - Release/`.

## History

| Timestamp | Stage |
| --- | --- |

## Audit

| Timestamp | Type | Detail |
| --- | --- | --- |
| Legacy | Backfill | Historical stage-transition timestamps were not captured before the audit structure was introduced. |
| 2026-07-12T00:00:00Z | Request | User-facing release label requested: `1.02`. |
| 2026-07-12T00:00:00Z | Evidence | Manifest version applied: `1.0.2`. |
