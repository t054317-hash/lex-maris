'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  DIRECTION,
  LOCALE_COOKIE,
  NUMBER_LOCALE,
  type Locale,
} from './config';
import { DICTIONARIES, type TranslationKey } from './dictionaries';

interface I18nValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  /** Translate. A key absent from the dictionary is a compile error. */
  t: (key: TranslationKey) => string;
  setLocale: (next: Locale) => void;
  /** Locale-correct number and currency formatting. */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatMoney: (minorUnits: number, currency: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Client-side locale state.
 *
 * The initial locale comes from the server (cookie -> <html lang/dir>), so the
 * first paint is already in the right language and direction and there is no
 * flash of LTR before hydration.
 *
 * Switching writes the cookie and mutates documentElement directly rather than
 * calling router.refresh(). The whole UI reads direction from CSS logical
 * properties, so flipping the attribute is enough and avoids a round trip.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);

    // One year, root path, Lax: this is a display preference, not a credential.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;

    const root = document.documentElement;
    root.lang = next;
    root.dir = DIRECTION[next];
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];

    return {
      locale,
      dir: DIRECTION[locale],
      t: (key) => dictionary[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key,
      setLocale,
      formatNumber: (v, options) =>
        new Intl.NumberFormat(NUMBER_LOCALE[locale], options).format(v),
      // Prices are stored in minor units (fils/cents) as integers.
      formatMoney: (minorUnits, currency) =>
        new Intl.NumberFormat(NUMBER_LOCALE[locale], {
          style: 'currency',
          currency,
          maximumFractionDigits: currency === 'KWD' ? 3 : 2,
        }).format(minorUnits / (currency === 'KWD' ? 1000 : 100)),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}

/** Shorthand for the common case. */
export function useT(): (key: TranslationKey) => string {
  return useI18n().t;
}
