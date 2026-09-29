/**
 * Day / night preference.
 *
 * A cookie rather than localStorage for the same reason as the locale: the
 * server reads it and renders <html data-theme> in the first byte, so there
 * is no flash of the wrong theme before hydration. Night is the default --
 * it is the brand's native look.
 */
export const THEME_COOKIE = 'lexmaris_theme';

export type ThemeMode = 'dark' | 'light';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light';
}
