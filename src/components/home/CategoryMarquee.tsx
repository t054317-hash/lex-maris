'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/dictionaries';
import { BUILDER_TYPES } from '@/i18n/options';

/**
 * A slow, endless strip of every contract the builder drafts -- the
 * "opening credits" beat between the hero and the content. Two copies of the
 * list scroll as one loop; the second is hidden from assistive tech so a
 * screen reader hears the list once. Pauses on hover; frozen under
 * prefers-reduced-motion by the global motion opt-out.
 */
export function CategoryMarquee() {
  const { t, dir } = useI18n();
  const items = BUILDER_TYPES.map((type) => t(`opt.type.${type}` as TranslationKey));

  return (
    <section
      aria-label={t('marquee.label')}
      className="group relative overflow-hidden border-y border-gold-500/15 py-5"
      style={{
        maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
      }}
    >
      <div
        className={`flex w-max gap-10 group-hover:[animation-play-state:paused] ${
          dir === 'rtl' ? 'animate-marqueeRtl' : 'animate-marquee'
        }`}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-10">
            {items.map((label) => (
              <li
                key={label}
                className="flex items-center gap-10 whitespace-nowrap font-display text-lg text-ink-300 sm:text-xl"
              >
                {label}
                <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold-500/70" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
