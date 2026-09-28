/**
 * Localisation configuration.
 *
 * Three locales, and the direction is a property of the locale rather than a
 * separate setting -- keeping them together is what stops `lang="ar"` and
 * `dir="ltr"` from ever disagreeing.
 */

export const LOCALES = ['en', 'ar', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
  fr: 'ltr',
};

/** Endonyms — a language picker should name each language in its own script. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
};

/** Short form for the header toggle, where space is tight. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  ar: 'ع',
  fr: 'FR',
};

/** Cookie, not localStorage: the server needs it to render the right dir. */
export const LOCALE_COOKIE = 'lexmaris_locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Arabic-Indic digits are conventional in Gulf legal documents, but Latin
 * digits are conventional for money and reference numbers even in Arabic
 * contracts. We therefore keep `latn` for numerals everywhere and let the
 * locale drive only language and direction.
 */
export const NUMBER_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  ar: 'ar-KW-u-nu-latn',
  fr: 'fr-FR',
};
