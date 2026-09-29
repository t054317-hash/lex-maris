'use client';

import { dayOffReason, formatDate } from '@/lib/training/deadlines';
import { useTraining } from './TrainingProvider';
import { btnGhost } from './ui';

const STEPS = [
  { days: 1, label: '+ يوم' },
  { days: 3, label: '+ 3 أيام' },
  { days: 7, label: '+ أسبوع' },
  { days: 30, label: '+ شهر' },
];

/**
 * The training clock. Only moves forward — a missed deadline stays missed,
 * which is the lesson.
 */
export function VirtualClock() {
  const { now, dispatch } = useTraining();
  const off = dayOffReason(now);
  return (
    <div className="glass flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
      <div className="min-w-0">
        <p className="eyebrow">الساعة التدريبية</p>
        <p className="mt-1 font-bold text-ink-100">{formatDate(now, true)}</p>
        <p className={`text-xs ${off ? 'text-status-risk' : 'text-status-safe'}`}>{off ? `عطلة: ${off}` : 'يوم عمل'}</p>
      </div>
      <div className="ms-auto flex flex-wrap gap-2" role="group" aria-label="تقديم الساعة التدريبية">
        {STEPS.map((s) => (
          <button key={s.days} type="button" className={btnGhost} onClick={() => dispatch({ type: 'advance', days: s.days })}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
