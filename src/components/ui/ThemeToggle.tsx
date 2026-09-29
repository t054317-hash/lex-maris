'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/i18n/I18nProvider';
import { THEME_COOKIE, type ThemeMode } from '@/lib/theme-mode';

/**
 * Sun / moon switch. Flips `data-theme` on <html>, which swaps the colour
 * variables in globals.css; every component follows without re-rendering.
 */
export function ThemeToggle() {
  const t = useT();
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    setMode(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    document.documentElement.dataset.theme = next;
    // One year, root path, Lax: a display preference, not a credential.
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, [mode]);

  const label = mode === 'dark' ? t('theme.toLight') : t('theme.toDark');

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor="hover"
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-500/30 text-ink-300 transition-colors duration-300 hover:border-gold-500/60 hover:text-gold-400"
    >
      {mode === 'dark' ? (
        // Sun: switch to day
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
        </svg>
      ) : (
        // Moon: switch to night
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
      )}
    </button>
  );
}
