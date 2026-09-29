'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { THEME } from '@/lib/theme';
import type { Finding } from '@/lib/risk-engine';
import type { AssembledDocument, ClauseId } from '@/lib/document-engine';
import { DIRECTION } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { localiseFinding } from '@/i18n/findings';

/**
 * Instant document preview, and the printable contract.
 *
 * On screen the assembled clause tree sits on a light "paper" surface, with a
 * margin marker on any clause that carries a risk finding (matched by clause
 * id, so it holds in every language). The paper takes its language and
 * direction from the document itself, so an Arabic draft reads right-to-left
 * end to end.
 *
 * Printing renders a clean copy -- no risk markers, no tool chrome, full
 * length, with schedules and signature blocks -- into a portal at the root of
 * <body>, and print CSS shows only that portal. Printing the in-page panel
 * instead would inherit its scroll box, its card transforms and every other
 * element on the page.
 */
export function DocumentPreview({
  doc,
  findings,
}: {
  doc: AssembledDocument;
  findings: readonly Finding[];
}) {
  const { t, formatNumber } = useI18n();
  const [printing, setPrinting] = useState(false);

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

  const print = useCallback(() => setPrinting(true), []);

  // Mount the print copy, let it paint, open the dialog, then unmount.
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done, { once: true });
    const id = requestAnimationFrame(() => {
      window.print();
      // Some mobile browsers never fire afterprint.
      setTimeout(done, 1500);
    });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('afterprint', done);
    };
  }, [printing]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-500/15 px-5 py-3">
        <p className="eyebrow">{t('doc.live')}</p>
        <div className="flex items-center gap-3">
          <p dir={DIRECTION[doc.locale]} className="font-mono text-[11px] text-ink-500">
            {t('doc.clauses', { n: formatNumber(doc.clauses.length) })}
          </p>
          <button
            type="button"
            onClick={print}
            data-cursor="hover"
            className="flex items-center gap-1.5 rounded-full border border-gold-500/50 bg-gold-500/10 px-3.5 py-1.5 text-[11px] text-gold-400 transition-colors hover:border-gold-500 hover:bg-gold-500/20"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
              <path d="M6 14h12v7H6z" />
            </svg>
            {t('doc.print')}
          </button>
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto bg-[#F6F3EA] px-6 py-7 text-[#1A1A1A] sm:px-8">
        <Paper doc={doc} flagged={flagged} brand={t('brand.name')} severityLabel={(s) => t(`severity.${s}`)} />
        <footer className="mt-8 border-t border-[#1A1A1A]/15 pt-4 text-[10px] uppercase tracking-[0.14em] text-[#6A6A6A]">
          {t('doc.footer')}
        </footer>
      </div>

      {printing &&
        createPortal(
          <div className="print-root bg-white text-[#111]">
            <Paper doc={doc} brand={t('brand.name')} />
          </div>,
          document.body,
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Paper({
  doc,
  brand,
  flagged,
  severityLabel,
}: {
  doc: AssembledDocument;
  brand: string;
  /** Omitted for print: the signed contract carries no risk annotations. */
  flagged?: Map<ClauseId, Finding>;
  severityLabel?: (s: Finding['severity']) => string;
}) {
  const forPrint = !flagged;

  return (
    <article lang={doc.locale} dir={DIRECTION[doc.locale]}>
      <header className="mb-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A6F1F]">{brand}</p>
        <h3 className={`mt-2 font-display uppercase tracking-[0.06em] ${forPrint ? 'text-2xl' : 'text-lg'}`}>
          {doc.title}
        </h3>
        <div className="mx-auto mt-3 h-px w-16 bg-[#8A6F1F]/50" />
      </header>

      <div className={`space-y-2 leading-relaxed ${forPrint ? 'text-[11pt]' : 'text-[12.5px]'}`}>
        {doc.recitals.map((r) => (
          <p key={r}>{r}</p>
        ))}
      </div>

      <ol className="mt-7 space-y-5">
        {doc.clauses.map((c) => {
          const finding = flagged?.get(c.id);
          const color = finding
            ? finding.severity === 'critical'
              ? THEME.status.critical
              : finding.severity === 'high'
                ? THEME.status.risk
                : THEME.gold700
            : undefined;

          const Item = forPrint ? 'li' : motion.li;
          const motionProps = forPrint
            ? {}
            : { layout: true, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } };

          return (
            <Item
              key={c.id}
              {...motionProps}
              className="relative break-inside-avoid-page ps-4"
              style={
                color
                  ? { borderInlineStart: `2px solid ${color}`, marginInlineStart: '-2px' }
                  : { borderInlineStart: '2px solid transparent' }
              }
            >
              <h4 className={`font-semibold uppercase tracking-[0.05em] ${forPrint ? 'text-[11pt]' : 'text-[12.5px]'}`}>
                {c.number}. {c.heading}
              </h4>
              {finding && severityLabel && (
                <p className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.1em]" style={{ color }}>
                  {severityLabel(finding.severity)} — {finding.title}
                </p>
              )}
              <div className={`mt-1.5 space-y-2 leading-relaxed text-[#2A2A2A] ${forPrint ? 'text-[11pt]' : 'text-[12.5px]'}`}>
                {c.body.map((p, i) => (
                  <p key={i}>
                    <span className="me-1.5 text-[#8A6F1F]">
                      {c.number}.{i + 1}
                    </span>
                    {p}
                  </p>
                ))}
              </div>
            </Item>
          );
        })}
      </ol>

      {/* Signature blocks. */}
      <section className="mt-10 break-inside-avoid-page">
        <h4 className={`font-semibold uppercase tracking-[0.05em] ${forPrint ? 'text-[11pt]' : 'text-[12.5px]'}`}>
          {doc.closing.signatures.heading}
        </h4>
        <p className={`mt-2 leading-relaxed ${forPrint ? 'text-[11pt]' : 'text-[12.5px]'}`}>
          {doc.closing.signatures.intro}
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 print:grid-cols-2">
          {doc.closing.signatures.blocks.map((b) => (
            <div key={b.role} className={forPrint ? 'text-[10.5pt]' : 'text-[12px]'}>
              <p className="font-semibold">{b.role}</p>
              <p className="mt-0.5 text-[#555]">{b.name}</p>
              <dl className="mt-4 space-y-5">
                {b.fields.map((f) => (
                  <div key={f} className="flex items-end gap-2">
                    {/* French sets a space before the colon. */}
                    <dt className="shrink-0 text-[#555]">{doc.locale === 'fr' ? `${f} :` : `${f}:`}</dt>
                    <dd className="h-5 flex-1 border-b border-[#1A1A1A]/40" />
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* Schedules: each starts on its own page when printed. */}
      {doc.closing.schedules.map((title) => (
        <section key={title} className="mt-10 break-before-page">
          <h4 className={`font-semibold uppercase tracking-[0.05em] ${forPrint ? 'text-[11pt]' : 'text-[12.5px]'}`}>
            {title}
          </h4>
          <div className="mt-4 space-y-6">
            {Array.from({ length: forPrint ? 12 : 4 }, (_, i) => (
              <div key={i} className="h-5 border-b border-[#1A1A1A]/25" />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
