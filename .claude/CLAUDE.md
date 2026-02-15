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

## Payload: DB Migrations (predictable workflow)
- **Prefer migrations over dev push** for any schema change that should be tracked or deployed.
- Create migrations with: `npx payload migrate:create` (generates a new migration from current schema diff).
- Run migrations with: `npx payload migrate` (answer `y` if prompted about dev mode).
- **Never rely only on dev push** for production: dev push is not recorded in `payload-migrations`; running `migrate` later will try to re-apply full migrations and can fail (e.g. "object already exists").
- If the DB was created with dev push and you need to sync: run `pnpm run mark-migrations-run` once, then `npx payload migrate` will succeed. New migrations go in `src/migrations/` and must be registered in `src/migrations/index.ts`.
- Keep migrations **incremental**: each migration should only add/change what’s new (Payload’s migrate:create does this). Avoid hand-written "full schema" migrations that create everything from scratch.

## Payload: Hooks and Local API access
- In **collection/global hooks** (e.g. `afterChange`, `beforeChange`) that run during API requests, the incoming `req` may have **no user** (e.g. guest checkout, webhooks).
- Any `payload.findByID`, `payload.find`, `payload.findGlobal`, or `payload.update` inside such a hook that **must** succeed for the hook to work (e.g. loading related data for emails, updating the same document) must use **`overrideAccess: true`** so it is not blocked by access control.
- Use **`overrideAccess: false`** only when intentionally enforcing the request user’s permissions (e.g. API handlers acting on behalf of a user).
- **Rule**: In server-side hooks that resolve related data or update documents regardless of user, pass `overrideAccess: true` so guest/unauthenticated requests don’t cause 404s or permission errors.
