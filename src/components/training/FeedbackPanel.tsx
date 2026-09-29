'use client';

import { useState } from 'react';
import type { AuditResult } from '@/lib/training/types';
import { ScoreRing, SeverityBadge } from './ui';

/**
 * Instant feedback on a draft. Re-renders on every keystroke (the audit is a
 * pure function), so the trainee sees a finding disappear the moment the
 * missing element is written — that feedback loop is the teaching.
 */
export function FeedbackPanel({ result, onInsert }: { result: AuditResult; onInsert?: (text: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const counts = {
    critical: result.findings.filter((f) => f.severity === 'critical').length,
    major: result.findings.filter((f) => f.severity === 'major').length,
    minor: result.findings.filter((f) => f.severity === 'minor').length,
  };

  return (
    <aside className="glass flex flex-col gap-4 p-5" aria-live="polite" aria-label="التغذية الراجعة الفورية">
      <div className="flex items-center gap-4">
        <ScoreRing score={result.score} label="درجة التدقيق" />
        <div className="min-w-0">
          <p className="eyebrow">تغذية راجعة فورية</p>
          <p className="mt-1 text-sm text-ink-300">
            {result.findings.length === 0 ? 'لم يُرصد نقص إجرائي ظاهر.' : `${result.findings.length} ملاحظة تحتاج إلى معالجة`}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-ink-500">
            <span>جوهري {counts.critical}</span><span aria-hidden>·</span>
            <span>مهم {counts.major}</span><span aria-hidden>·</span>
            <span>تحسيني {counts.minor}</span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {result.findings.map((f) => {
          const expanded = open === f.id;
          return (
            <li key={f.id} className="rounded-xl border border-ink-500/20 bg-navy-950/40">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : f.id)}
                className="flex w-full items-start gap-2 p-3 text-start"
              >
                <SeverityBadge severity={f.severity} />
                <span className="min-w-0 flex-1 text-sm font-medium leading-6 text-ink-100">{f.title}</span>
                <span aria-hidden className={`mt-1 text-ink-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              {expanded && (
                <div className="space-y-2 border-t border-ink-500/15 p-3 text-sm leading-7">
                  <p className="text-ink-300">{f.detail}</p>
                  <p className="text-ink-100"><span className="font-bold text-gold-400">المقترح: </span>{f.suggestion}</p>
                  {f.rule && <p className="text-xs text-ink-500">المرجع: {f.rule}</p>}
                  {f.example && (
                    <div className="rounded-lg border border-gold-500/25 bg-gold-500/5 p-3">
                      <p className="mb-1 text-[11px] font-bold text-gold-500">صياغة استرشادية</p>
                      <p className="whitespace-pre-line text-ink-300">{f.example}</p>
                      {onInsert && (
                        <button type="button" onClick={() => onInsert(f.example ?? '')} className="mt-2 text-xs font-bold text-gold-400 hover:underline">
                          إدراج في نهاية المستند
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {result.passed.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-bold text-status-safe">ما استوفاه المستند ({result.passed.length})</summary>
          <ul className="mt-2 space-y-1 text-ink-300">
            {result.passed.map((p) => <li key={p}>✓ {p}</li>)}
          </ul>
        </details>
      )}

      <p className="text-[11px] leading-5 text-ink-500">
        التدقيق آلي يعتمد على أنماط نصية، ويرصد النقص الظاهر فقط. خلوّ المستند من الملاحظات لا يعني سلامته قانونياً.
      </p>
    </aside>
  );
}
