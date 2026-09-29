'use client';

import { useMemo } from 'react';
import { CHAMBER_LABEL, DOMAIN_LABEL } from '@/lib/training/catalog';
import { listDeadlines, type CaseDeadline } from '@/lib/training/case-engine';
import { deadlineStatus, formatDate, workingDaysUntil } from '@/lib/training/deadlines';
import { getScenario } from '@/lib/training/scenarios';
import type { CasePhase } from '@/lib/training/types';
import { useTraining } from './TrainingProvider';
import { EmptyState, Panel, Stat, StatusBadge, btnGhost, btnGold } from './ui';

export const PHASE_LABEL: Record<CasePhase, string> = {
  intake: 'دراسة الملف والقيد',
  filed: 'بانتظار الجلسة الأولى',
  hearing: 'منظورة — أجل المذكرات',
  awaiting_judgment: 'محجوزة للحكم',
  judgment: 'صدر الحكم',
  closed: 'مغلقة',
};

/**
 * The trainee's virtual office: what is on today, what is about to lapse,
 * and how past matters were graded.
 */
export function OfficeDashboard({ onOpenCase, onBrowse }: { onOpenCase: (id: string) => void; onBrowse: () => void }) {
  const { now, cases } = useTraining();

  const all = useMemo(() => cases.flatMap((c) => {
    const s = getScenario(c.scenarioId);
    return s ? listDeadlines(c, s) : [];
  }), [cases]);

  const hearings = all.filter((d) => d.kind === 'hearing' && !d.doneOn).sort((a, b) => a.due.localeCompare(b.due));
  const deadlines = all.filter((d) => d.kind === 'deadline').sort((a, b) => Number(Boolean(a.doneOn)) - Number(Boolean(b.doneOn)) || a.due.localeCompare(b.due));
  const pressing = deadlines.filter((d) => ['overdue', 'due-soon'].includes(deadlineStatus(now, d.due, d.doneOn)));
  const closed = cases.filter((c) => c.report);
  const avg = closed.length ? Math.round(closed.reduce((s, c) => s + (c.report?.score ?? 0), 0) / closed.length) : null;

  if (!cases.length) {
    return (
      <EmptyState
        title="مكتبك الافتراضي فارغ"
        body="افتح ملف قضية من مكتبة السيناريوهات؛ ستظهر هنا جلساتها ومواعيدها وتنبيهاتها، ثم تقرير التقييم بعد انتهائها."
        action={<button type="button" className={btnGold} onClick={onBrowse}>تصفّح مكتبة السيناريوهات</button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="قضايا نشطة" value={cases.filter((c) => c.phase !== 'closed').length} />
        <Stat label="جلسات قادمة" value={hearings.length} />
        <Stat label="مواعيد حرجة" value={pressing.length} tone={pressing.length ? 'alert' : 'default'} />
        <Stat label="متوسط التقييم" value={avg ?? '—'} tone={avg !== null && avg >= 75 ? 'good' : 'default'} />
      </div>

      {pressing.length > 0 && (
        <div role="alert" className="rounded-glass border border-status-risk/50 bg-status-risk/10 p-4">
          <p className="font-bold text-status-risk">تنبيه مواعيد</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-100">
            {pressing.map((d) => (
              <li key={`${d.caseId}-${d.label}`}>
                <button type="button" className="text-start hover:underline" onClick={() => onOpenCase(d.caseId)}>
                  {d.label} — {d.scenarioTitle}: {now > d.due ? `فات منذ ${formatDate(d.due)}` : `آخر يوم ${formatDate(d.due, true)}`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel eyebrow="جدول الجلسات" title="الجلسات الافتراضية">
          {hearings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-ink-500/20 text-xs text-ink-500">
                    <th className="py-2 text-start font-medium">التاريخ</th>
                    <th className="py-2 text-start font-medium">القضية</th>
                    <th className="py-2 text-start font-medium">البند</th>
                    <th className="py-2 text-start font-medium">المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {hearings.map((h) => (
                    <tr key={`${h.caseId}-${h.label}`} className="border-b border-ink-500/10 last:border-0">
                      <td className="py-2.5 text-ink-100">{formatDate(h.due, true)}</td>
                      <td className="py-2.5"><button type="button" className="text-start text-gold-400 hover:underline" onClick={() => onOpenCase(h.caseId)}>{h.scenarioTitle}</button></td>
                      <td className="py-2.5 text-ink-300">{h.label}</td>
                      <td className="py-2.5 tabular-nums text-ink-300">{h.due <= now ? 'اليوم' : `${workingDaysUntil(now, h.due)} يوم عمل`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-ink-500">لا جلسات قادمة. قيّد دعوى أو قدّم الساعة التدريبية.</p>}
        </Panel>

        <Panel eyebrow="المهل والمواعيد" title="لوحة المواعيد">
          <DeadlineList items={deadlines} now={now} onOpenCase={onOpenCase} />
        </Panel>
      </div>

      <Panel eyebrow="الملفات" title="قضايا المكتب">
        <ul className="divide-y divide-ink-500/10">
          {cases.map((c) => {
            const s = getScenario(c.scenarioId);
            if (!s) return null;
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="rounded-full border border-gold-500/40 px-2 py-0.5 text-[11px] text-gold-400">{DOMAIN_LABEL[s.domain]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-100">{s.title}</p>
                  <p className="text-xs text-ink-500">{PHASE_LABEL[c.phase]}{c.filing ? ` · ${CHAMBER_LABEL[c.filing.chamber]}` : ''}</p>
                </div>
                {c.report && <span className="text-sm font-bold tabular-nums text-ink-100">{c.report.score}<span className="text-ink-500">/100</span></span>}
                <button type="button" className={btnGhost} onClick={() => onOpenCase(c.id)}>{c.report ? 'التقرير' : 'متابعة'}</button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

export function DeadlineList({ items, now, onOpenCase }: { items: CaseDeadline[]; now: string; onOpenCase?: (id: string) => void }) {
  if (!items.length) return <p className="text-sm text-ink-500">لا مواعيد مسجلة بعد.</p>;
  return (
    <ul className="space-y-2">
      {items.map((d) => {
        const status = deadlineStatus(now, d.due, d.doneOn);
        const left = workingDaysUntil(now, d.due);
        return (
          <li key={`${d.caseId}-${d.label}`} className="flex items-start gap-3 rounded-xl border border-ink-500/15 bg-navy-950/40 p-3">
            <StatusBadge status={status} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-100">{d.label}</p>
              <p className="text-xs text-ink-500">
                {onOpenCase ? <button type="button" className="hover:text-gold-400" onClick={() => onOpenCase(d.caseId)}>{d.scenarioTitle}</button> : d.basis}
                {onOpenCase && ` · ${d.basis}`}
              </p>
            </div>
            <div className="shrink-0 text-end text-xs">
              <p className="text-ink-100">{formatDate(d.due)}</p>
              {!d.doneOn && <p className={`tabular-nums ${status === 'overdue' ? 'text-[#F2A596]' : 'text-ink-500'}`}>{left >= 0 ? `${left} يوم عمل` : `متأخر ${-left} يوماً`}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
