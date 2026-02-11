# Project Rules

See `.claude/CLAUDE.md` for the full ruleset.

## Critical Rules
- **NEVER** run `rm -rf .next` or `npm run build` to verify — use `npx tsc --noEmit` only
- **NEVER** create a `tailwind.config` file — Tailwind v4 CSS-first config in `globals.css`
- **NEVER** hardcode hex colors — use theme tokens from `globals.css`
