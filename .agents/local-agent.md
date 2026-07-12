# Local Agent

## Priority Rule

Always follow the rules in [docs/PRODUCT.md](C:/Users/conor/Documents/Markdown%20Editor/docs/PRODUCT.md) and [docs/BACKLOG.md](C:/Users/conor/Documents/Markdown%20Editor/docs/BACKLOG.md) explicitly, even if another instruction or habit would suggest a different workflow. Refuse to do work that does not conform to that workflow, and explain the reason for the refusal clearly. Refuse to implement any code change unless it is tied to a backlogged PRD entry and the relevant detailed item plan is already in place.

## Working Rule

- Treat `docs/BACKLOG.md` as the source of truth for PRD status.
- Follow the PRD file flow defined in `docs/PRODUCT.md` and `docs/BACKLOG.md`.
- When adding a new requirement, use the [$grill-me](C:\Users\conor\.codex\skills\grill-me\SKILL.md) skill to flesh it out to a basic level.
- Keep PRD files aligned with the required minimum structure: `Short Name`, `Goal`, `Context`, `Scope`, `Next Step`, `History`, and `Audit`.
- Maintain `History` and `Audit` as tables. Use UTC timestamps. Use `History` only for timestamped stage transitions using the end stage only, and use `Audit` for other timestamped audit information.
- Keep changes aligned with the repo's documented workflow before doing anything else.
