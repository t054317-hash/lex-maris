'use client';

import { useDeferredValue, useMemo } from 'react';
import { auditDocument, documentSkeleton } from '@/lib/training/brief-audit';
import type { DocumentKind, Scenario } from '@/lib/training/types';
import { FeedbackPanel } from './FeedbackPanel';
import { btnGhost } from './ui';

/**
 * Drafting surface with the live procedural audit beside it. The audit runs
 * on a deferred copy of the text so typing never waits on it.
 */
export function BriefEditor({
  id, kind, value, onChange, scenario, readOnly = false,
}: {
  id: string;
  kind: DocumentKind;
  value: string;
  onChange: (v: string) => void;
  scenario?: Scenario;
  readOnly?: boolean;
}) {
  const deferred = useDeferredValue(value);
  const result = useMemo(() => auditDocument(deferred, kind, scenario), [deferred, kind, scenario]);
  const label = kind === 'petition' ? 'صحيفة الدعوى' : 'مذكرة الدفاع';

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={id} className="text-sm font-bold text-ink-100">{label}</label>
          {!readOnly && (
            <div className="flex gap-2">
              <button
                type="button"
                className={btnGhost}
                disabled={value.trim().length > 0}
                title={value.trim().length > 0 ? 'امسح النص أولاً لإدراج الهيكل' : undefined}
                onClick={() => onChange(documentSkeleton(kind, scenario))}
              >
                إدراج هيكل {kind === 'petition' ? 'الصحيفة' : 'المذكرة'}
              </button>
            </div>
          )}
        </div>
        <textarea
          id={id}
          dir="rtl"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === 'petition' ? 'اكتب صحيفة الدعوى هنا، أو ابدأ بإدراج الهيكل…' : 'اكتب مذكرة الدفاع هنا، أو ابدأ بإدراج الهيكل…'}
          className="min-h-[420px] w-full resize-y rounded-glass border border-ink-500/25 bg-navy-950/60 p-4 font-arabic text-[15px] leading-8 text-ink-100 outline-none transition-colors focus:border-gold-500/70"
        />
        <p className="mt-1 text-[11px] text-ink-500 tabular-nums">{value.length} حرفاً</p>
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <FeedbackPanel result={result} onInsert={readOnly ? undefined : (t) => onChange(`${value.trimEnd()}\n\n${t}`)} />
      </div>
    </div>
  );
}
