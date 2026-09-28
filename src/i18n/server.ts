import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config';
import { translate, type TranslationKey, type TranslationVars } from './dictionaries';

/**
 * Locale for Server Components and route handlers, read from the same cookie
 * the root layout uses for <html lang dir>. The value is validated against
 * the locale list, so a tampered cookie falls back to the default rather than
 * reaching anything that trusts it.
 */
export function getServerLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getServerT(): {
  locale: Locale;
  t: (key: TranslationKey, vars?: TranslationVars) => string;
} {
  const locale = getServerLocale();
  return { locale, t: (key, vars) => translate(locale, key, vars) };
}
