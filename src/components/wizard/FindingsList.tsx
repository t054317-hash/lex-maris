'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { THEME } from '@/lib/theme';
import type { Finding, Severity } from '@/lib/risk-engine';

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: THEME.status.critical,
  high: THEME.status.risk,
  medium: THEME.status.watch,
  low: THEME.ink500,
  info: THEME.ink500,
};

/**
 * Findings register. Collapsed by default so a 12-finding report stays scannable;
 * expanding one reveals the drafting note and the authority relied on.
 */
export function FindingsList({ findings }: { findings: readonly Finding[] }) {
  const [open, setOpen] = useState<string | null>(findings[0]?.id ?? null);

  if (findings.length === 0) {
    return (
      <div className="rounded-lg border border-status-safe/30 bg-status-safe/5 p-6">
        <p className="font-display text-lg text-status-safe">
          No findings raised
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          Every rule in the current model passed. The draft is ready for
          partner review and execution.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {findings.map((f) => {
        const isOpen = open === f.id;
        return (
          <li
            key={f.id}
            className="overflow-hidden rounded-lg border border-ink-500/20 bg-navy-800/40"
          >
            <button
              type="button"
              data-cursor="hover"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : f.id)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-300 hover:bg-navy-700/40"
            >
              <span
                aria-hidden
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: SEVERITY_COLOR[f.severity],
                  boxShadow: `0 0 10px ${SEVERITY_COLOR[f.severity]}88`,
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink-100">{f.title}</span>
                <span className="mt-0.5 block text-[11px] uppercase tracking-[0.14em] text-ink-500">
                  {f.clause}
                  <span className="mx-1.5 opacity-40">/</span>
                  <span style={{ color: SEVERITY_COLOR[f.severity] }}>
                    {f.severity}
                  </span>
                </span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="space-y-3 border-t border-ink-500/15 px-4 py-4 pl-9">
                    <p className="text-sm leading-relaxed text-ink-300">
                      {f.detail}
                    </p>
                    <div>
                      <p className="eyebrow">Recommended amendment</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-100">
                        {f.remediation}
                      </p>
                    </div>
                    {f.authority && (
                      <p className="font-mono text-[11px] text-gold-500/80">
                        {f.authority}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
