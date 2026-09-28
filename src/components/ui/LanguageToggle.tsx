'use client';

import { LOCALES, LOCALE_LABEL, LOCALE_SHORT } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Language switch.
 *
 * A segmented control rather than a dropdown: with three locales, a select
 * costs an extra interaction and hides the alternatives. Each language is
 * labelled in its own script, which is the convention that lets a reader find
 * their language without being able to read the other one.
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={`flex items-center gap-0.5 rounded-full border border-ink-500/25 bg-navy-800/50 p-0.5 ${className}`}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            data-cursor="hover"
            aria-pressed={active}
            title={LOCALE_LABEL[code]}
            onClick={() => setLocale(code)}
            className={`min-w-[2.25rem] rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300 ${
              active
                ? 'bg-gold-500/20 text-gold-400'
                : 'text-ink-500 hover:text-ink-100'
            }`}
          >
            {LOCALE_SHORT[code]}
            <span className="sr-only"> — {LOCALE_LABEL[code]}</span>
          </button>
        );
      })}
    </div>
  );
}
