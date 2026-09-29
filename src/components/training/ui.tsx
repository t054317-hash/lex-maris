'use client';

import type { ReactNode } from 'react';
import { SEVERITY_LABEL } from '@/lib/training/catalog';
import type { DeadlineStatus, Severity } from '@/lib/training/types';

/**
 * Small presentational pieces shared by the training screens. Colour always
 * comes from the semantic `status.*` tokens for state and `gold.*` for the
 * accent, never both for the same meaning.
 */

export const btnGold =
  'inline-flex items-center justify-center gap-2 rounded-full border border-gold-500 bg-gold-500/15 px-5 py-2.5 text-sm font-medium text-gold-400 transition-all duration-300 ease-lux hover:bg-gold-500/25 focus-visible:bg-gold-500/25 disabled:cursor-not-allowed disabled:opacity-40';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-ink-500/30 px-4 py-2 text-sm text-ink-300 transition-colors duration-300 hover:border-gold-500/50 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40';
export const inputCls =
  'w-full rounded-xl border border-ink-500/25 bg-navy-950/60 px-3 py-2.5 text-sm text-ink-100 outline-none transition-colors focus:border-gold-500/70';

export function Panel({ title, eyebrow, action, children, className = '' }: {
  title?: ReactNode; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`glass p-5 sm:p-6 ${className}`}>
      {(title || eyebrow || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-lg font-bold text-ink-100">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const SEVERITY_CLS: Record<Severity, string> = {
  critical: 'border-status-critical/60 bg-status-critical/15 text-[#F2A596]',
  major: 'border-status-risk/60 bg-status-risk/10 text-status-risk',
  minor: 'border-ink-500/40 bg-ink-500/10 text-ink-300',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${SEVERITY_CLS[severity]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

const STATUS: Record<DeadlineStatus, { label: string; cls: string }> = {
  done: { label: 'مُنجز', cls: 'border-status-safe/50 bg-status-safe/10 text-status-safe' },
  overdue: { label: 'فات الميعاد', cls: 'border-status-critical/60 bg-status-critical/15 text-[#F2A596]' },
  'due-soon': { label: 'قريب', cls: 'border-status-risk/60 bg-status-risk/10 text-status-risk' },
  upcoming: { label: 'قادم', cls: 'border-ink-500/40 bg-ink-500/10 text-ink-300' },
};

export function StatusBadge({ status }: { status: DeadlineStatus }) {
  const s = STATUS[status];
  return <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>;
}

/** 0–100 dial. Colour steps with the score so a glance reads the verdict. */
export function ScoreRing({ score, size = 72, label }: { score: number; size?: number; label?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const tone = score >= 75 ? '#3FBF8F' : score >= 50 ? '#D4AF37' : '#E0725A';
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${label ?? 'الدرجة'}: ${score} من 100`}>
      <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size} aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(139,147,168,0.2)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={tone} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <span className="absolute text-lg font-bold tabular-nums text-ink-100">{score}</span>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-5 text-ink-500">{hint}</span>}
    </label>
  );
}

export function Stat({ label, value, tone = 'default' }: { label: string; value: ReactNode; tone?: 'default' | 'alert' | 'good' }) {
  const color = tone === 'alert' ? 'text-status-risk' : tone === 'good' ? 'text-status-safe' : 'text-ink-100';
  return (
    <div className="glass p-4">
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-ink-500">{label}</div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-glass border border-dashed border-ink-500/30 px-6 py-10 text-center">
      <p className="font-bold text-ink-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
