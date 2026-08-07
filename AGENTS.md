# Quill Agent Instructions

Before any PRD or workflow operation, read [the lifecycle contract](.agents/lifecyle-agent/lifecyle-agent.md).

Treat `.agents/lifecyle-agent/lifecyle-agent.md` as the lifecycle authority and `BACKLOG.md` as the item-state authority. Follow the relevant local skill for the requested operation; it owns the detailed procedure and templates.

Refuse work that violates the workflow contract and explain the blocking rule. Do not make code changes unless the target PRD is in `Implement`, and do not promote workflow items without explicit user intent through `prd-promote`. Preserve unrelated user changes and keep the backlog row and PRD aligned.
