import type { Metadata } from 'next';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { LegalMatrixCanvas } from '@/components/ui/LegalMatrixCanvas';
import {
  ContractTimeline,
  type TimelineStage,
} from '@/components/dashboard/ContractTimeline';

export const metadata: Metadata = { title: 'Client dashboard' };

/**
 * Client dashboard.
 *
 * The fixtures below stand in for the matter API. In production this page is a
 * server component that awaits `getMatter(id)` and passes the result to the
 * same presentational children, with the WebSocket channel patching stage
 * state client-side after hydration.
 */

const STAGES: readonly TimelineStage[] = [
  {
    id: 'instructed',
    label: 'Instructions received',
    meta: '2 Sep, 09:14',
    state: 'done',
    actor: 'Client portal',
  },
  {
    id: 'assembled',
    label: 'First draft assembled',
    meta: '2 Sep, 09:16',
    state: 'done',
    actor: 'Document engine',
  },
  {
    id: 'scanned',
    label: 'Risk pass complete — 3 findings',
    meta: '2 Sep, 09:16',
    state: 'done',
    actor: 'Scanner v1.0.0',
  },
  {
    id: 'partner',
    label: 'Partner review',
    meta: '4 Sep, 15:40',
    state: 'done',
    actor: 'H. Al-Rashed',
  },
  {
    id: 'counterparty',
    label: 'Counterparty comments awaited',
    meta: 'Due 10 Sep',
    state: 'active',
    actor: 'Northgate Commodities Ltd',
  },
  {
    id: 'sanctions',
    label: 'Sanctions re-screen required before execution',
    meta: 'Screening expired 6 Sep',
    state: 'blocked',
  },
  {
    id: 'execution',
    label: 'Execution and sealing',
    meta: 'Not started',
    state: 'pending',
  },
];

const ALERTS = [
  {
    severity: 'high' as const,
    title: 'Sanctions screening expired',
    body: 'The counterparty screening record is 91 days old. Execution is blocked until a fresh screen is recorded against the current consolidated lists.',
    action: 'Re-screen counterparty',
  },
  {
    severity: 'medium' as const,
    title: 'Demurrage time bar approaching',
    body: 'Claim LM-2026-0388 must be presented with supporting documents within 11 days or it is time-barred under clause 6.2.',
    action: 'Open claim file',
  },
  {
    severity: 'low' as const,
    title: 'Letter of credit expiry',
    body: 'The confirmed LC on matter LM-2026-0402 expires in 24 days, ahead of the final shipment window.',
    action: 'Request amendment',
  },
];

const DOCUMENTS = [
  ['Voyage charterparty — executed', 'SHA-256 · 4f9c…a71e', '6 Sep'],
  ['Supply agreement — draft 4', 'Sealed · AES-256-GCM', '4 Sep'],
  ['Sanctions screening record', 'Expired', '7 Jun'],
  ['Bill of lading — MV Sirocco', 'Sealed · AES-256-GCM', '1 Sep'],
] as const;

const SEVERITY_STYLE = {
  high: 'border-status-risk/40 text-status-risk',
  medium: 'border-status-watch/40 text-status-watch',
  low: 'border-ink-500/40 text-ink-300',
} as const;

export default function DashboardPage() {
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
              Lex Maris
            </Link>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">
              Meridian Trading DMCC
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              4 open matters · 2 awaiting your action
            </p>
          </div>
          <Link
            href="/#builder"
            data-cursor="hover"
            className="rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
          >
            New instrument
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <GlassCard interactive={false} sheen className="p-6 sm:p-8">
            <ContractTimeline stages={STAGES} reference="LM-2026-0417" />
          </GlassCard>

          <div className="space-y-6">
            <GlassCard interactive={false} className="p-6">
              <p className="eyebrow">Compliance alerts</p>
              <ul className="mt-4 space-y-3">
                {ALERTS.map((a) => (
                  <li
                    key={a.title}
                    className={`rounded-lg border bg-navy-800/40 p-4 ${SEVERITY_STYLE[a.severity]}`}
                  >
                    <p className="text-sm text-ink-100">{a.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
                      {a.body}
                    </p>
                    <button
                      type="button"
                      data-cursor="hover"
                      className="mt-3 text-[11px] uppercase tracking-[0.14em] underline decoration-1 underline-offset-4"
                    >
                      {a.action}
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard interactive={false} className="p-6">
              <p className="eyebrow">Encrypted document vault</p>
              <ul className="mt-4 divide-y divide-ink-500/12">
                {DOCUMENTS.map(([name, state, date]) => (
                  <li
                    key={name}
                    data-cursor="hover"
                    className="flex items-center justify-between gap-4 py-3 transition-colors duration-300 hover:text-gold-400"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-100">{name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-500">
                        {state}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-500">
                      {date}
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
