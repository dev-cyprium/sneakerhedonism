# Re-enabling Dark Mode and Theme Toggle

Theme toggle is currently disabled and the app runs in permanent light mode. To re-enable dark mode and the theme selector:

## Steps

1. **Enable the feature flag**
   - Open `src/providers/Theme/shared.ts`
   - Change `themeToggleEnabled` from `false` to `true`:

   ```ts
   export const themeToggleEnabled = true
   ```

2. **Verify**
   - Restart the dev server (or let Next.js hot-reload)
   - The theme selector (Auto / Light / Dark) will reappear in the footer
   - Users can toggle between light and dark mode, and the preference will be stored in `localStorage` under the key `payload-theme`

## What the flag controls

- **`src/providers/Theme/shared.ts`** – `themeToggleEnabled` constant
- **`src/providers/Theme/index.tsx`** – when `false`, ignores localStorage and system preference, always uses light
- **`src/providers/Theme/InitTheme/index.tsx`** – when `false`, sets `data-theme="light"` immediately without checking preference
- **`src/components/Footer/index.tsx`** – when `false`, hides the ThemeSelector component

## Clearing stored preference

If users had previously chosen dark mode, their `localStorage` may still contain `payload-theme: dark`. After re-enabling, they will see their last choice. To force a default, clear `localStorage` in the browser or remove the `payload-theme` key.
