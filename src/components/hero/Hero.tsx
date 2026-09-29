'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { LegalMatrixCanvas } from '@/components/ui/LegalMatrixCanvas';
import { useGavelAudio } from '@/components/intro/useGavelAudio';
import type { GavelPhase } from '@/components/intro/GavelScene';
import { useI18n } from '@/i18n/I18nProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const GavelScene = dynamic(
  () => import('@/components/intro/GavelScene').then((m) => m.GavelScene),
  { ssr: false, loading: () => null },
);

/**
 * Hero, rebuilt.
 *
 * What changed and why:
 *
 * - Two columns instead of one. The old hero stacked everything left and left a
 *   third of the viewport empty; the gavel now occupies that space as a live,
 *   strikeable object rather than being locked inside the intro overlay a
 *   returning visitor never sees again.
 * - `min-h-[92vh]` is gone. A viewport-height opener pushed the actual content
 *   below the fold, so a thumbnail or a skim-read got nothing but a headline.
 *   The section is now sized to what it holds.
 * - Headline reads as one sentence with a single accented phrase, instead of
 *   two competing gold fragments. Three sizes of type, not five.
 * - The metric rail gained a fourth figure and moved below a hairline rule, so
 *   it reads as evidence supporting the claim rather than as decoration.
 * - Everything uses logical properties (ms-/me-, text-start) so the whole
 *   layout mirrors correctly under Arabic RTL.
 */
export function Hero() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const { strike, prime } = useGavelAudio();
  const [phase, setPhase] = useState<GavelPhase>('idle');

  const onStrike = useCallback(() => {
    if (phase !== 'idle') return;
    prime();
    setPhase('strike');
  }, [phase, prime]);

  const onImpact = useCallback(() => {
    strike(0.7);
    if (navigator.vibrate) navigator.vibrate(14);
    // Re-arm so the hero gavel can be struck again, unlike the one-shot intro.
    window.setTimeout(() => setPhase('idle'), 1400);
  }, [strike]);

  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-16 sm:px-10 sm:pt-24">
      <LegalMatrixCanvas className="opacity-60" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(65% 50% at 25% 35%, rgba(212,175,55,0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* --- Copy ---------------------------------------------------------- */}
        <div className="text-start">
          <motion.p
            className="eyebrow"
            initial={reduced ? undefined : { opacity: 0, y: 8 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('hero.eyebrow')}
          </motion.p>

          <motion.h1
            className="mt-5 max-w-[20ch] text-balance font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            initial={reduced ? undefined : { opacity: 0, y: 14 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('hero.title.a')}{' '}
            <span className="text-gold-500">{t('hero.title.accent')}</span>{' '}
            {t('hero.title.b')}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[58ch] text-base font-light leading-relaxed text-ink-300 sm:text-lg"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            {t('hero.lede')}
          </motion.p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/checkout/contract-writing"
              data-cursor="hover"
              className="rounded-full border border-gold-500/50 bg-gold-500/12 px-7 py-3.5 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
            >
              {t('hero.cta.primary')}
            </Link>
            <Link
              href="#bench"
              data-cursor="hover"
              className="text-xs uppercase tracking-[0.18em] text-ink-300 underline decoration-gold-500/40 decoration-1 underline-offset-8 transition-colors duration-300 hover:text-gold-400"
            >
              {t('hero.cta.secondary')}
            </Link>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.14em] text-ink-500">
            {t('hero.trust')}
          </p>
        </div>

        {/* --- Live gavel ---------------------------------------------------- */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full">
            {reduced ? (
              // Reduced motion: a still, tasteful stand-in rather than a
              // WebGL canvas nobody asked to have animating.
              <div
                aria-hidden
                className="absolute inset-0 rounded-glass"
                style={{
                  background:
                    'radial-gradient(50% 45% at 50% 55%, rgba(212,175,55,0.18), transparent 70%)',
                }}
              />
            ) : (
              <>
                <GavelScene phase={phase} onImpact={onImpact} />
                <button
                  type="button"
                  onClick={onStrike}
                  aria-label={t('hero.gavel.hint')}
                  className="absolute inset-0 h-full w-full focus-visible:rounded-glass"
                />
                <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[10px] uppercase tracking-[0.2em] text-ink-500">
                  {t('hero.gavel.hint')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Evidence rail --------------------------------------------------- */}
      <div className="relative mx-auto mt-16 max-w-6xl">
        <div className="rule-gold" />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-7 pt-8 sm:grid-cols-4">
          {(
            [
              // Each figure is a count of what the code actually does:
              // RULES in risk-engine, locales in i18n/config, ClauseId in
              // document-engine, and the institutional forums offered.
              ['12', 'hero.metric.rules'],
              ['3', 'hero.metric.turnaround'],
              ['16', 'hero.metric.sealing'],
              ['3', 'hero.metric.forum'],
            ] as const
          ).map(([value, key]) => (
            <div key={key}>
              <dt className="font-display text-2xl text-gold-500 sm:text-3xl">
                {value}
              </dt>
              <dd className="mt-1.5 text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink-500">
                {t(key)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
