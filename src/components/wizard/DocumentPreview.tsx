'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { THEME } from '@/lib/theme';
import type { Finding } from '@/lib/risk-engine';
import type { AssembledDocument, ClauseId } from '@/lib/document-engine';
import { DIRECTION } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { localiseFinding } from '@/i18n/findings';

/**
 * Instant document preview.
 *
 * Renders the assembled clause tree on a light "paper" surface -- deliberately
 * inverted from the app chrome, because a legal draft the client will print or
 * sign should look like the document, not like the tool.
 *
 * Clauses carrying a risk finding get a gold margin marker. Matching is by
 * clause id, never by heading, so it holds in every language.
 *
 * The paper takes its language and direction from the document itself, not
 * from the page, so an Arabic draft reads right-to-left end to end.
 */
export function DocumentPreview({
  doc,
  findings,
}: {
  doc: AssembledDocument;
  findings: readonly Finding[];
}) {
  const { t, formatNumber } = useI18n();

  // Clause id -> worst severity, so the margin marker reflects the top issue.
  const flagged = useMemo(() => {
    const rank = { info: 0, low: 1, medium: 2, high: 3, critical: 4 } as const;
    const map = new Map<ClauseId, Finding>();
    for (const raw of findings) {
      const f = localiseFinding(raw, doc.locale);
      const existing = map.get(f.clauseId);
      if (!existing || rank[f.severity] > rank[existing.severity]) {
        map.set(f.clauseId, f);
      }
    }
    return map;
  }, [findings, doc.locale]);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink-500/15 px-5 py-3">
        <p className="eyebrow">{t('doc.live')}</p>
        <p dir={DIRECTION[doc.locale]} className="font-mono text-[11px] text-ink-500">
          {t('doc.clauses', { n: formatNumber(doc.clauses.length) })}
        </p>
      </div>

      <div
        lang={doc.locale}
        dir={DIRECTION[doc.locale]}
        className="max-h-[520px] overflow-y-auto bg-[#F6F3EA] px-6 py-7 text-[#1A1A1A] sm:px-8"
      >
        <header className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A6F1F]">
            {t('brand.name')}
          </p>
          <h3 className="mt-2 font-display text-lg uppercase tracking-[0.06em]">
            {doc.title}
          </h3>
          <div className="mx-auto mt-3 h-px w-16 bg-[#8A6F1F]/50" />
        </header>

        <div className="space-y-2 text-[12.5px] leading-relaxed">
          {doc.recitals.map((r) => (
            <p key={r}>{r}</p>
          ))}
        </div>

        <ol className="mt-7 space-y-5">
          {doc.clauses.map((c) => {
            const finding = flagged.get(c.id);
            const color = finding
              ? finding.severity === 'critical'
                ? THEME.status.critical
                : finding.severity === 'high'
                  ? THEME.status.risk
                  : THEME.gold700
              : undefined;

            return (
              <motion.li
                key={c.id}
                id={`clause-${c.id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative ps-4"
                style={
                  color
                    ? { borderInlineStart: `2px solid ${color}`, marginInlineStart: '-2px' }
                    : { borderInlineStart: '2px solid transparent' }
                }
              >
                <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.05em]">
                  {c.number}. {c.heading}
                </h4>
                {finding && (
                  <p
                    className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.1em]"
                    style={{ color }}
                  >
                    {t(`severity.${finding.severity}`)} — {finding.title}
                  </p>
                )}
                <div className="mt-1.5 space-y-2 text-[12.5px] leading-relaxed text-[#2A2A2A]">
                  {c.body.map((p, i) => (
                    <p key={i}>
                      <span className="me-1.5 text-[#8A6F1F]">
                        {c.number}.{i + 1}
                      </span>
                      {p}
                    </p>
                  ))}
                </div>
              </motion.li>
            );
          })}
        </ol>

        <footer className="mt-8 border-t border-[#1A1A1A]/15 pt-4 text-[10px] uppercase tracking-[0.14em] text-[#6A6A6A]">
          {t('doc.footer')}
        </footer>
      </div>
    </div>
  );
}
