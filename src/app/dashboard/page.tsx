import type { Metadata } from 'next';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { LegalMatrixCanvas } from '@/components/ui/LegalMatrixCanvas';
import {
  ContractTimeline,
  type TimelineStage,
} from '@/components/dashboard/ContractTimeline';

import { getServerT } from '@/i18n/server';
import type { TranslationKey } from '@/i18n/dictionaries';

export function generateMetadata(): Metadata {
  return { title: getServerT().t('meta.dashboard.title') };
}

/**
 * Client dashboard.
 *
 * The fixtures below stand in for the matter API. In production this page is a
 * server component that awaits `getMatter(id)` and passes the result to the
 * same presentational children, with the WebSocket channel patching stage
 * state client-side after hydration.
 *
 * Fixtures hold dictionary keys, not prose, so the page renders in whichever
 * language the visitor chose. Proper names (people, companies, vessels) and
 * references stay as they are.
 */

const STAGES: ReadonlyArray<{
  id: string;
  state: TimelineStage['state'];
  actor?: TranslationKey | string;
}> = [
  { id: 'instructed', state: 'done', actor: 'dash.actor.portal' },
  { id: 'assembled', state: 'done', actor: 'dash.actor.engine' },
  { id: 'scanned', state: 'done', actor: 'dash.actor.scanner' },
  { id: 'partner', state: 'done', actor: 'H. Al-Rashed' },
  { id: 'counterparty', state: 'active', actor: 'Northgate Commodities Ltd' },
  { id: 'sanctions', state: 'blocked' },
  { id: 'execution', state: 'pending' },
];

const ALERTS = [
  { id: 'sanctions', severity: 'high' as const },
  { id: 'demurrage', severity: 'medium' as const },
  { id: 'lc', severity: 'low' as const },
];

const DOCUMENTS: ReadonlyArray<readonly [TranslationKey, TranslationKey | string, TranslationKey]> = [
  ['dash.doc.charter', 'SHA-256 · 4f9c…a71e', 'dash.date.6sep'],
  ['dash.doc.supply', 'dash.doc.sealed', 'dash.date.4sep'],
  ['dash.doc.screening', 'dash.doc.expired', 'dash.date.7jun'],
  ['dash.doc.bol', 'dash.doc.sealed', 'dash.date.1sep'],
];

const isKey = (v: string): v is TranslationKey => v.startsWith('dash.');

const SEVERITY_STYLE = {
  high: 'border-status-risk/40 text-status-risk',
  medium: 'border-status-watch/40 text-status-watch',
  low: 'border-ink-500/40 text-ink-300',
} as const;

export default function DashboardPage() {
  const { t } = getServerT();
  const label = (v: TranslationKey | string) => (isKey(v) ? t(v) : v);

  const stages: TimelineStage[] = STAGES.map((s) => ({
    id: s.id,
    state: s.state,
    label: t(`dash.stage.${s.id}` as TranslationKey),
    meta: t(`dash.stage.${s.id}.meta` as TranslationKey),
    actor: s.actor ? label(s.actor) : undefined,
  }));

  return (
    <main id="main" className="relative min-h-screen px-6 py-16 sm:px-10">
      <LegalMatrixCanvas className="opacity-25" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/"
              data-cursor="hover"
              className="eyebrow transition-colors hover:text-gold-400"
            >
              {t('brand.name')}
            </Link>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              Meridian Trading DMCC
            </h1>
            <p className="mt-2 text-sm text-ink-500">{t('dash.summary')}</p>
          </div>
          <Link
            href="/#bench"
            data-cursor="hover"
            className="rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
          >
            {t('dash.new')}
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <GlassCard interactive={false} sheen className="p-6 sm:p-8">
            <ContractTimeline stages={stages} reference="LM-2026-0417" />
          </GlassCard>

          <div className="space-y-6">
            <GlassCard interactive={false} className="p-6">
              <p className="eyebrow">{t('dash.alerts')}</p>
              <ul className="mt-4 space-y-3">
                {ALERTS.map((a) => (
                  <li
                    key={a.id}
                    className={`rounded-lg border bg-navy-800/40 p-4 ${SEVERITY_STYLE[a.severity]}`}
                  >
                    <p className="text-sm text-ink-100">
                      {t(`dash.alert.${a.id}.title` as TranslationKey)}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
                      {t(`dash.alert.${a.id}.body` as TranslationKey)}
                    </p>
                    <button
                      type="button"
                      data-cursor="hover"
                      className="mt-3 text-[11px] uppercase tracking-[0.14em] underline decoration-1 underline-offset-4"
                    >
                      {t(`dash.alert.${a.id}.action` as TranslationKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard interactive={false} className="p-6">
              <p className="eyebrow">{t('dash.vault')}</p>
              <ul className="mt-4 divide-y divide-ink-500/12">
                {DOCUMENTS.map(([name, state, date]) => (
                  <li
                    key={name}
                    data-cursor="hover"
                    className="flex items-center justify-between gap-4 py-3 transition-colors duration-300 hover:text-gold-400"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-100">{t(name)}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-500">
                        {label(state)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-500">
                      {t(date)}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
