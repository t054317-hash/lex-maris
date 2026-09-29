'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useT } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/dictionaries';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const STEPS = [1, 2, 3] as const;

/**
 * Three-step explainer for visitors who are not lawyers. Plain words, one
 * idea per card, and the honest caveat (have a lawyer review it) stated where
 * it cannot be missed rather than in a footer.
 */
export function HowItWorks() {
  const t = useT();
  const reduced = useReducedMotion();

  return (
    <section className="relative px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">{t('how.eyebrow')}</p>
        <h2 className="mt-4 max-w-3xl text-balance font-display text-3xl leading-tight sm:text-4xl">
          {t('how.heading')}
        </h2>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((n, i) => (
            <motion.li
              key={n}
              className="glass relative overflow-hidden p-7"
              initial={reduced ? undefined : { opacity: 0, y: 28, filter: 'blur(6px)' }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Oversized numeral behind the copy -- the cinematic cue. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -end-2 -top-6 font-display text-[7rem] leading-none text-gold-500/10"
              >
                {n}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/50 font-display text-sm text-gold-400">
                {n}
              </span>
              <h3 className="mt-5 font-display text-xl">{t(`how.${n}.title` as TranslationKey)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {t(`how.${n}.body` as TranslationKey)}
              </p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-xs leading-relaxed text-ink-500">{t('how.note')}</p>
          <Link
            href="#bench"
            data-cursor="hover"
            className="rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-3 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
          >
            {t('how.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
