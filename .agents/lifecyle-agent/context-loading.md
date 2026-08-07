# Skill Context Loading

This guide defines the minimum context each local skill should load before acting. It is an optimization guide, not an additional workflow authority.

| Skill | Minimum context | Conditional context |
| --- | --- | --- |
| `prd-grill-me` | The skill itself and the user's stated project or requirement | Repository workflow files only when shaping a backlog item or PRD section |
| `prd-backlog` | `.agents/lifecyle-agent/lifecyle-agent.md`, `BACKLOG.md`, `AGENTS.md`, `prd-grill-me`, and the backlog templates | Target examples only when the template or current records are ambiguous |
| `prd-promote` | `.agents/lifecyle-agent/lifecyle-agent.md`, `BACKLOG.md`, `AGENTS.md`, and the target PRD | `prd-grill-me` only when a gate-critical section is weak; phase-specific evidence only for the requested transition |
| `prd-implement` | `.agents/lifecyle-agent/lifecyle-agent.md`, `BACKLOG.md`, `AGENTS.md`, and the target PRD | Relevant implementation files and test instructions only after readiness passes |
| `prd-patch` | `.agents/lifecyle-agent/lifecyle-agent.md`, `BACKLOG.md`, `AGENTS.md`, the target PRD, and version/build files | Additional build or product files only when the target PRD requires them |

All skills should run `npm run check:workflow` at the checkpoints defined by their own procedure. The checker is the shared structural validation layer; it does not replace reading the target PRD or the relevant skill procedure.
