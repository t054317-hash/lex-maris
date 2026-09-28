'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';

export type StageState = 'done' | 'active' | 'pending' | 'blocked';

export interface TimelineStage {
  id: string;
  label: string;
  /** Human-readable timestamp or ETA. */
  meta: string;
  state: StageState;
  /** Actor responsible, shown as a secondary line. */
  actor?: string;
}

/**
 * Matter progress rail, modelled on parcel tracking: the client should be able
 * to answer "where is my contract" in one glance, without reading an email.
 *
 * In production the `stages` prop is fed by the WebSocket matter channel (see
 * docs/ARCHITECTURE.md, Real-time), so a status change from the fee earner
 * lands here without a refresh. The component itself stays presentational.
 */
export function ContractTimeline({
  stages,
  reference,
}: {
  stages: readonly TimelineStage[];
  reference: string;
}) {
  const { t, formatNumber } = useI18n();
  const completed = stages.filter((s) => s.state === 'done').length;
  const progress = (completed / Math.max(stages.length - 1, 1)) * 100;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="eyebrow">{t('timeline.title')}</p>
          <p className="mt-1 font-mono text-sm text-ink-300">{reference}</p>
        </div>
        <p className="text-xs text-ink-500">
          {t('timeline.complete', {
            done: formatNumber(completed),
            total: formatNumber(stages.length),
          })}
        </p>
      </div>

      <ol className="relative">
        {/* Rail: a dim track with a gold fill that animates to `progress`. */}
        <span
          aria-hidden
          className="absolute start-[7px] top-2 bottom-2 w-px bg-ink-500/25"
        />
        <motion.span
          aria-hidden
          className="absolute start-[7px] top-2 w-px origin-top bg-gold-500"
          style={{ bottom: 8, boxShadow: '0 0 10px rgba(212,175,55,0.6)' }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: progress / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />

        {stages.map((s, i) => (
          <motion.li
            key={s.id}
            className="relative flex gap-4 pb-7 ps-0 last:pb-0"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <span className="relative z-10 mt-1.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center">
              <Dot state={s.state} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  s.state === 'pending' ? 'text-ink-500' : 'text-ink-100'
                }`}
              >
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                {s.meta}
                {s.actor && (
                  <>
                    <span className="mx-1.5 opacity-40">·</span>
                    {s.actor}
                  </>
                )}
              </p>
            </div>
            {s.state === 'blocked' && (
              <span className="mt-1 rounded-full border border-status-risk/40 bg-status-risk/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-status-risk">
                {t('timeline.action')}
              </span>
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Dot({ state }: { state: StageState }) {
  if (state === 'done') {
    return (
      <span className="h-[9px] w-[9px] rounded-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
    );
  }
  if (state === 'active') {
    return (
      <span className="relative flex h-[9px] w-[9px]">
        {/* Pulsing halo marks the one stage currently in progress. */}
        <motion.span
          className="absolute inset-0 rounded-full bg-gold-400"
          animate={{ scale: [1, 2.6, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="relative h-[9px] w-[9px] rounded-full bg-gold-400" />
      </span>
    );
  }
  if (state === 'blocked') {
    return <span className="h-[9px] w-[9px] rounded-full bg-status-risk" />;
  }
  return (
    <span className="h-[7px] w-[7px] rounded-full border border-ink-500/60 bg-navy-900" />
  );
}
