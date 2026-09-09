'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useT } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/dictionaries';

/**
 * Capability grid.
 *
 * A client component only so it can translate; Next still renders it into the
 * initial HTML, so the copy is present for crawlers exactly as before.
 *
 * The card keys are held as a tuple of dictionary key prefixes rather than as
 * literal English strings, which is what makes the Arabic pass complete instead
 * of translating the chrome and leaving the substance in English.
 */
const CARDS = [
  'automation',
  'analysis',
  'maritime',
  'execution',
  'realtime',
  'custody',
] as const;

export function Capabilities() {
  const t = useT();

  return (
    <section id="services" className="px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-balance font-display text-3xl leading-tight sm:text-4xl">
          {t('cap.heading')}
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((key) => (
            <GlassCard key={key} className="p-6">
              <p className="eyebrow">{t(`cap.${key}.eyebrow` as TranslationKey)}</p>
              <h3 className="mt-3 font-display text-lg leading-snug">
                {t(`cap.${key}.title` as TranslationKey)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {t(`cap.${key}.body` as TranslationKey)}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
