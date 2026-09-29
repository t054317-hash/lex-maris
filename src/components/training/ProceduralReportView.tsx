'use client';

import type { ProceduralReport, ReportStage } from '@/lib/training/types';
import { Panel, ScoreRing, SeverityBadge } from './ui';

const STAGES: ReportStage[] = ['القيد', 'الصياغة', 'الجلسة', 'المواعيد', 'الطعن'];

/** The after-action report, grouped by the stage of the case where each error happened. */
export function ProceduralReportView({ report, judgment }: { report: ProceduralReport; judgment?: string }) {
  return (
    <div className="space-y-5">
      <Panel eyebrow="تقرير التقييم الإجرائي" title="نتيجة الجلسة الافتراضية">
        <div className="flex flex-wrap items-center gap-5">
          <ScoreRing score={report.score} size={96} label="التقييم الإجرائي" />
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold text-ink-100">{report.grade}</p>
            <p className="mt-1 text-sm text-ink-300">
              {report.items.length ? `${report.items.length} خطأ إجرائي مرصود` : 'لم يُرصد خطأ إجرائي.'}
            </p>
            {judgment && <p className="mt-3 rounded-xl border border-gold-500/25 bg-gold-500/5 p-3 text-sm leading-7 text-ink-100">{judgment}</p>}
          </div>
        </div>
      </Panel>

      {STAGES.map((stage) => {
        const items = report.items.filter((i) => i.stage === stage);
        if (!items.length) return null;
        return (
          <Panel key={stage} eyebrow={`مرحلة ${stage}`}>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="rounded-xl border border-ink-500/20 bg-navy-950/40 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={i.severity} />
                    <h3 className="font-bold text-ink-100">{i.title}</h3>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm leading-7 md:grid-cols-3">
                    <div><dt className="text-xs font-bold text-ink-500">ما حدث</dt><dd className="mt-1 text-ink-300">{i.whatHappened}</dd></div>
                    <div><dt className="text-xs font-bold text-ink-500">القاعدة</dt><dd className="mt-1 text-ink-300">{i.rule}</dd></div>
                    <div><dt className="text-xs font-bold text-gold-500">كيف تتلافاه</dt><dd className="mt-1 text-ink-100">{i.howToAvoid}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}

      {report.strengths.length > 0 && (
        <Panel eyebrow="نقاط القوة">
          <ul className="space-y-1.5 text-sm text-ink-300">
            {report.strengths.map((s) => <li key={s}><span className="text-status-safe">✓</span> {s}</li>)}
          </ul>
        </Panel>
      )}
    </div>
  );
}
