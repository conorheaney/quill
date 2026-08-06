# Local Agent Contract

## Precedence and safety

- Treat [WORKFLOW.md](../WORKFLOW.md) as the lifecycle authority and
  [BACKLOG.md](../BACKLOG.md) as the item-state authority.
- Follow the relevant local skill for the requested operation; it owns the
  operation's detailed procedure and templates.
- Refuse work that violates the workflow contract and explain the blocking rule.
- Do not make code changes unless the target PRD is in `Implement`.
- Do not promote workflow items without explicit user intent through `prd-promote`.
- Preserve unrelated user changes and keep the backlog row and PRD aligned.
