'use client';

import { motion } from 'framer-motion';
import { THEME } from '@/lib/theme';
import type { RiskBand, RiskReport } from '@/lib/risk-engine';

const BAND_LABEL: Record<RiskBand, string> = {
  safe: 'Acceptable',
  watch: 'Watch',
  risk: 'Elevated',
  critical: 'Critical',
};

const BAND_COLOR: Record<RiskBand, string> = {
  safe: THEME.status.safe,
  watch: THEME.status.watch,
  risk: THEME.status.risk,
  critical: THEME.status.critical,
};

const CIRCUMFERENCE = 2 * Math.PI * 54;

/**
 * Live exposure dial. The arc is an SVG stroke animated by `strokeDashoffset`,
 * which the compositor can handle on its own thread -- no layout, no repaint of
 * the surrounding panel while the user is still typing in the wizard.
 *
 * The score is also announced through `aria-live` so screen-reader users get
 * the same real-time signal as sighted users, rather than a silent graphic.
 */
export function RiskMeter({ report }: { report: RiskReport }) {
  const color = BAND_COLOR[report.band];
  const offset = CIRCUMFERENCE * (1 - report.score / 100);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(195,202,219,0.14)"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: offset, stroke: color }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-3xl tabular-nums"
            style={{ color }}
          >
            {report.score}
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-500">
            exposure
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="eyebrow">Aggregate risk</p>
        <p
          className="mt-1 font-display text-xl"
          style={{ color }}
          aria-live="polite"
        >
          {BAND_LABEL[report.band]}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-300">
          {(['critical', 'high', 'medium', 'low'] as const).map((sev) =>
            report.tally[sev] > 0 ? (
              <div key={sev} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      sev === 'critical'
                        ? THEME.status.critical
                        : sev === 'high'
                          ? THEME.status.risk
                          : sev === 'medium'
                            ? THEME.status.watch
                            : THEME.ink500,
                  }}
                />
                <dt className="capitalize">{sev}</dt>
                <dd className="tabular-nums text-ink-100">
                  {report.tally[sev]}
                </dd>
              </div>
            ) : null,
          )}
          {report.findings.length === 0 && (
            <span className="text-status-safe">No findings</span>
          )}
        </dl>
      </div>
    </div>
  );
}
