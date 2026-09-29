'use client';

import { GavelIntro } from '@/components/intro/GavelIntro';
import { Hero } from '@/components/hero/Hero';
import { Capabilities } from '@/components/home/Capabilities';
import { CategoryMarquee } from '@/components/home/CategoryMarquee';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ContractWizard } from '@/components/wizard/ContractWizard';
import { useT } from '@/i18n/I18nProvider';

/**
 * Landing page.
 *
 * Now a client component so every string on it can go through the dictionary.
 * That costs nothing for SEO: Next server-renders client components into the
 * initial HTML, so a crawler still receives the full copy.
 *
 * The existing sections are retained rather than replaced -- the risk bench and
 * its ContractWizard are the same components, driven by the same engine, and
 * the intro still runs once per session. Only the hero was rebuilt.
 */
export default function HomePage() {
  const t = useT();

  return (
    <>
      <GavelIntro />

      <main id="main">
        <Hero />

        <CategoryMarquee />

        <HowItWorks />

        <div className="rule-gold mx-auto max-w-6xl" />

        <Capabilities />

        <section id="bench" className="relative px-6 pb-24 pt-8 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow">{t('bench.eyebrow')}</p>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl leading-tight sm:text-4xl">
              {t('bench.heading')}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-300">
              {t('bench.lede')} {t('common.notLegalAdvice')}
            </p>
            <div className="mt-12">
              <ContractWizard />
            </div>
          </div>
        </section>

        <footer className="border-t border-ink-500/15 px-6 py-10 sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-ink-500">
            <p className="font-display tracking-[0.3em] text-gold-500/80">
              {t('brand.name')}
            </p>
            <p>{t('common.notLegalAdvice')}</p>
          </div>
        </footer>
      </main>
    </>
  );
}
