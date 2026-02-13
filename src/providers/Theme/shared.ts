import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

/**
 * When false, theme toggle is hidden and the app is permanently in light mode.
 * Set to true to re-enable dark mode and the theme selector.
 * @see DARK_INSTRUCTIONS.md for re-enabling steps
 */
export const themeToggleEnabled = false

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}
