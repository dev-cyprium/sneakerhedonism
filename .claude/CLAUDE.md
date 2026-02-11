# Project Rules

## Build & Verification
- **NEVER** run `rm -rf .next` — invalidates cache, slows development
- **NEVER** run `npm run build` to verify changes — too slow
- Use `npx tsc --noEmit` for type checking
- Use `npx payload generate:types` after changing Payload schemas

## Tailwind CSS
- This project uses **Tailwind CSS v4 with CSS-first configuration**
- There is **NO tailwind.config.mjs** — all config lives in `src/app/(app)/globals.css`
- Theme tokens, keyframes, animations, fonts, breakpoints are all in `@theme` blocks
- **NEVER** create a `tailwind.config.js/mjs/ts` file
- Colors must use theme tokens (e.g. `text-nav-text`, `bg-accent-brand`) — no hardcoded hex values

## Stack
- Next.js 15.4 + Payload CMS + PostgreSQL
- Tailwind CSS v4 (CSS-first)
- Radix UI components (Accordion, Sheet, etc.)
- lucide-react for icons
- TypeScript strict mode

## Fonts
- **Lato** (`--font-nav` / `font-nav`) for navigation
- **Geist Sans/Mono** for body text

## Key Patterns
- `getCachedGlobal('slug', depth)()` for fetching globals — use depth 2 for nested relationships
- `link()` field factory in `src/fields/link.ts`
- `CMSLink` component for rendering CMS links
- `useAuth()` from `src/providers/Auth` for user state
- Serbian language labels in mobile menu UI
