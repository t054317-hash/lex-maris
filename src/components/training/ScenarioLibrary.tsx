'use client';

import { useState } from 'react';
import { DOMAIN_LABEL, formatKwd } from '@/lib/training/catalog';
import { SCENARIOS } from '@/lib/training/scenarios';
import type { Domain } from '@/lib/training/types';
import { btnGold } from './ui';

const FILTERS: { id: Domain | 'all'; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'labour', label: 'عمالي' },
  { id: 'maritime', label: 'بحري' },
];

const LEVEL = ['', 'مبتدئ', 'متوسط', 'متقدم'];

export function ScenarioLibrary({ onOpen }: { onOpen: (scenarioId: string) => void }) {
  const [filter, setFilter] = useState<Domain | 'all'>('all');
  const list = SCENARIOS.filter((s) => filter === 'all' || s.domain === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب نوع المنازعة">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === f.id ? 'border-gold-500 bg-gold-500/15 text-gold-400' : 'border-ink-500/30 text-ink-300 hover:border-gold-500/50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((s) => (
          <article key={s.id} className="glass glass-interactive flex flex-col p-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-full border border-gold-500/40 px-2 py-0.5 text-gold-400">{DOMAIN_LABEL[s.domain]}</span>
              <span className="rounded-full border border-ink-500/30 px-2 py-0.5 text-ink-300">{s.side === 'plaintiff' ? 'أنت وكيل المدعي' : 'أنت وكيل المدعى عليه'}</span>
              <span className="ms-auto flex items-center gap-1 text-ink-500" aria-label={`المستوى: ${LEVEL[s.difficulty]}`}>
                {[1, 2, 3].map((n) => <span key={n} aria-hidden className={`h-1.5 w-4 rounded-full ${n <= s.difficulty ? 'bg-gold-500' : 'bg-ink-500/30'}`} />)}
                <span className="ms-1">{LEVEL[s.difficulty]}</span>
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-ink-100">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-7 text-ink-300">{s.summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-ink-500">قيمة النزاع</dt><dd className="mt-0.5 font-bold tabular-nums text-ink-100">{formatKwd(s.claimKwd)}</dd></div>
              <div><dt className="text-ink-500">المطلوب منك</dt><dd className="mt-0.5 font-bold text-ink-100">{s.side === 'plaintiff' ? 'قيد الدعوى وصياغة الصحيفة' : 'صياغة مذكرة الدفاع'}</dd></div>
            </dl>
            <button type="button" className={`${btnGold} mt-5 self-start`} onClick={() => onOpen(s.id)}>فتح الملف</button>
          </article>
        ))}
      </div>
    </div>
  );
}
