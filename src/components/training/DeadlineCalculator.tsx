'use client';

import { useState } from 'react';
import { DEADLINE_RULES, computeDeadline, formatDate } from '@/lib/training/deadlines';
import type { DeadlineRuleId } from '@/lib/training/types';
import { useTraining } from './TrainingProvider';
import { Field, Panel, inputCls } from './ui';

const RULES = Object.values(DEADLINE_RULES);

/**
 * Stand-alone drill: pick a rule and a triggering date, see how the last day
 * is reached — first day excluded, weekend and fixed holidays rolled over.
 */
export function DeadlineCalculator() {
  const { now } = useTraining();
  const [ruleId, setRuleId] = useState<DeadlineRuleId>('appeal');
  const [start, setStart] = useState(now);
  const rule = DEADLINE_RULES[ruleId];
  const result = start ? computeDeadline(ruleId, start) : null;
  const period = rule.period.years ? `${rule.period.years} سنة` : rule.period.months ? `${rule.period.months} شهر` : `${rule.period.days} يوماً`;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Panel eyebrow="محاكاة المواعيد" title="حاسبة المهل الإجرائية">
        <div className="space-y-4">
          <Field label="الميعاد">
            <select id="calc-rule" className={inputCls} value={ruleId} onChange={(e) => setRuleId(e.target.value as DeadlineRuleId)}>
              {RULES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </Field>
          <Field label={`تاريخ البدء — ${rule.startsFrom}`}>
            <input id="calc-start" type="date" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <p className="text-xs leading-6 text-ink-500">
            المدة: {period}. السند: {rule.basis}.
            {rule.verify && ' هذه المدة مرجع تدريبي؛ تحقّق من النص النافذ ومن أي حكم خاص بنوع الدعوى.'}
          </p>
        </div>
      </Panel>

      {result && (
        <Panel eyebrow="النتيجة" title={`آخر يوم: ${formatDate(result.due, true)}`}>
          <ol className="space-y-3 text-sm leading-7 text-ink-300">
            <li><span className="font-bold text-ink-100">1. يوم الواقعة لا يُحسب.</span> الواقعة في {formatDate(result.start, true)}، فيبدأ العدّ من اليوم التالي.</li>
            <li><span className="font-bold text-ink-100">2. نهاية المدة الاسمية:</span> {formatDate(result.nominal, true)}.</li>
            <li>
              <span className="font-bold text-ink-100">3. العطلات:</span>{' '}
              {result.rolledOver.length
                ? `صادف آخر المدة ${result.rolledOver.join('، ثم ')}، فامتد الميعاد إلى أول يوم عمل.`
                : 'آخر المدة يوم عمل، فلا امتداد.'}
            </li>
            <li className="rounded-xl border border-status-risk/40 bg-status-risk/10 p-3 text-ink-100">الأثر: {rule.consequence}</li>
          </ol>
          <p className="mt-4 text-[11px] leading-5 text-ink-500">
            تشمل الحاسبة عطلة الجمعة والسبت والعطلات الثابتة (رأس السنة، العيد الوطني، عيد التحرير). العطلات الهجرية تُعلن سنوياً ولا تدخل في الحساب، فراجعها بنفسك.
          </p>
        </Panel>
      )}
    </div>
  );
}
