'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskMeter } from './RiskMeter';
import { FindingsList } from './FindingsList';
import { DocumentPreview } from './DocumentPreview';
import {
  analyseContract,
  defaultContractInput,
  type ContractInput,
} from '@/lib/risk-engine';
import { assembleDocument, type DocumentMeta } from '@/lib/document-engine';
import { useI18n } from '@/i18n/I18nProvider';
import { NUMBER_LOCALE, type Locale } from '@/i18n/config';
import {
  BUILDER_TYPES,
  COUNTERPARTY_JURISDICTIONS,
  DISPUTE_FORUMS,
  GOVERNING_LAWS,
  SECURITIES,
  options,
} from '@/i18n/options';

const TRADE_TYPES: ReadonlySet<ContractInput['type']> = new Set([
  'supply',
  'distribution',
  'charterparty',
]);

const STEPS = ['instrument', 'commercial', 'allocation', 'forum', 'execute'] as const;

/**
 * The builder drafts a template, so every party detail is a bracketed
 * placeholder rather than an invented company: nothing on the page should
 * read as a real party, registration number or date.
 */
const placeholderMeta = (p: {
  ref: string;
  date: string;
  first: string;
  second: string;
  reg: string;
  address: string;
}): DocumentMeta => ({
  reference: p.ref,
  executionDate: p.date,
  parties: {
    first: { name: p.first, registrationNo: p.reg, address: p.address, jurisdiction: 'XX' },
    second: { name: p.second, registrationNo: p.reg, address: p.address, jurisdiction: 'XX' },
  },
});

const META_FOR: Record<Locale, DocumentMeta> = {
  en: placeholderMeta({
    ref: '[reference]',
    date: '[date]',
    first: '[First Party name]',
    second: '[Second Party name]',
    reg: '[registration no.]',
    address: '[registered address]',
  }),
  ar: placeholderMeta({
    ref: '[المرجع]',
    date: '[التاريخ]',
    first: '[اسم الطرف الأول]',
    second: '[اسم الطرف الثاني]',
    reg: '[رقم القيد]',
    address: '[عنوان المقر المسجّل]',
  }),
  fr: placeholderMeta({
    ref: '[référence]',
    date: '[date]',
    first: '[dénomination du Premier Contractant]',
    second: '[dénomination du Second Contractant]',
    reg: "[numéro d'immatriculation]",
    address: '[adresse du siège social]',
  }),
};

/**
 * The Live Contract Builder.
 *
 * Two panes, one state atom. Every keystroke re-derives (a) the exposure report
 * and (b) the assembled clause tree, both of which are pure functions -- so the
 * preview a client approves is byte-identical to what the PDF engine renders
 * server-side from the same input.
 *
 * `useMemo` on both derivations keeps the render cheap: the analysis is ~12 rule
 * evaluations and assembly is a single map, so there is no need for a worker.
 */
export function ContractWizard() {
  const { t, locale, dir } = useI18n();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ContractInput>(defaultContractInput);

  const patch = useCallback(
    <K extends keyof ContractInput>(key: K, value: ContractInput[K]) =>
      setInput((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const report = useMemo(() => analyseContract(input), [input]);
  const doc = useMemo(
    () => assembleDocument(input, META_FOR[locale], locale),
    [input, locale],
  );
  const usd = useMemo(() => usdFormatter(locale), [locale]);

  const isMaritime =
    input.type === 'charterparty' || input.type === 'bill-of-lading';
  const isTrade = TRADE_TYPES.has(input.type);
  const { type } = input;
  // Which risk-allocation controls a category actually uses.
  const uses = {
    cap: type !== 'nda' && type !== 'lease',
    forceMajeure: type !== 'nda',
    sanctions: type !== 'nda' && type !== 'lease',
    indemnity: type !== 'nda' && type !== 'lease',
    convenience: isTrade || type === 'services',
    insurance: isTrade,
  };
  const pct = (n: number) => new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(n);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Left: wizard                                                     */}
      {/* ---------------------------------------------------------------- */}
      <GlassCard interactive={false} className="p-6 sm:p-8">
        <ol className="mb-8 flex flex-wrap gap-x-1 gap-y-2" aria-label={t('wizard.progress')}>
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(i)}
                data-cursor="hover"
                aria-current={i === step ? 'step' : undefined}
                className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                  i === step
                    ? 'bg-gold-500/15 text-gold-400'
                    : i < step
                      ? 'text-ink-300 hover:text-gold-400'
                      : 'text-ink-500 hover:text-ink-300'
                }`}
              >
                {t(`wizard.step.${s}`)}
              </button>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="mx-1 h-px w-4 bg-ink-500/30" />
              )}
            </li>
          ))}
        </ol>

        <div className="min-h-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              {step === 0 && (
                <>
                  <Field label={t('checkout.field.instrumentType')}>
                    <Select
                      value={input.type}
                      onChange={(v) =>
                        setInput((prev) => {
                          const next = { ...prev, type: v as ContractInput['type'] };
                          // The value slider means annual rent for a lease, with its
                          // own range; keep the figure inside the range it is shown on.
                          if (next.type === 'lease' && next.valueUsd > 2_000_000) next.valueUsd = 120_000;
                          if (next.type !== 'lease' && next.valueUsd < 50_000) next.valueUsd = 50_000;
                          return next;
                        })
                      }
                      options={options(t, 'opt.type', BUILDER_TYPES)}
                    />
                  </Field>
                  <Field
                    label={
                      type === 'lease'
                        ? t('wizard.field.premisesLocation')
                        : t('checkout.field.counterpartyJurisdiction')
                    }
                  >
                    <Select
                      value={input.counterpartyJurisdiction}
                      onChange={(v) => patch('counterpartyJurisdiction', v)}
                      options={options(t, 'opt.country', COUNTERPARTY_JURISDICTIONS)}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-ink-500">
                    {t('wizard.partyNote')}
                  </p>
                </>
              )}

              {step === 1 && type === 'nda' && (
                <Field
                  label={t('wizard.field.ndaYears', {
                    value: input.confidentialityYears
                      ? pct(input.confidentialityYears)
                      : t('wizard.indefinite'),
                  })}
                >
                  <Range
                    min={0}
                    max={10}
                    step={1}
                    value={input.confidentialityYears ?? 0}
                    onChange={(v) => patch('confidentialityYears', v)}
                    dir={dir}
                  />
                </Field>
              )}

              {step === 1 && type === 'lease' && (
                <>
                  <Field label={t('wizard.field.annualRent', { value: usd(input.valueUsd) })}>
                    <Range
                      min={10_000}
                      max={2_000_000}
                      step={10_000}
                      value={input.valueUsd}
                      onChange={(v) => patch('valueUsd', v)}
                      dir={dir}
                    />
                  </Field>
                  <Field
                    label={t('wizard.field.leaseYears', { value: pct(input.leaseTermYears ?? 0) })}
                  >
                    <Range
                      min={1}
                      max={15}
                      step={1}
                      value={input.leaseTermYears ?? 1}
                      onChange={(v) => patch('leaseTermYears', v)}
                      dir={dir}
                    />
                  </Field>
                </>
              )}

              {step === 1 && (isTrade || type === 'services' || type === 'agency') && (
                <>
                  {type === 'agency' ? (
                    <Field
                      label={t('wizard.field.commission', { n: pct(input.commissionPct ?? 0) })}
                    >
                      <Range
                        min={0}
                        max={20}
                        step={0.5}
                        value={input.commissionPct ?? 0}
                        onChange={(v) => patch('commissionPct', v)}
                        dir={dir}
                      />
                    </Field>
                  ) : (
                    <Field
                      label={t(type === 'services' ? 'wizard.field.fees' : 'wizard.field.value', {
                        value: usd(input.valueUsd),
                      })}
                    >
                      <Range
                        min={50_000}
                        max={50_000_000}
                        step={50_000}
                        value={input.valueUsd}
                        onChange={(v) => patch('valueUsd', v)}
                        dir={dir}
                      />
                    </Field>
                  )}
                  <Field
                    label={t('wizard.field.paymentTerms', { n: input.paymentTermsDays })}
                  >
                    <Range
                      min={7}
                      max={180}
                      step={1}
                      value={input.paymentTermsDays}
                      onChange={(v) => patch('paymentTermsDays', v)}
                      dir={dir}
                    />
                  </Field>
                </>
              )}

              {step === 1 && isTrade && (
                <>
                  <Field label={t('wizard.field.security')}>
                    <Select
                      value={input.security}
                      onChange={(v) =>
                        patch('security', v as ContractInput['security'])
                      }
                      options={options(t, 'opt.security', SECURITIES)}
                    />
                  </Field>
                  {isMaritime && (
                    <>
                      <Field
                        label={t('wizard.field.laytime', {
                          value: input.laytimeHours
                            ? t('wizard.laytime.hours', { n: input.laytimeHours })
                            : t('wizard.notStated'),
                        })}
                      >
                        <Range
                          min={0}
                          max={240}
                          step={6}
                          value={input.laytimeHours ?? 0}
                          onChange={(v) => patch('laytimeHours', v)}
                          dir={dir}
                        />
                      </Field>
                      <Field
                        label={t('wizard.field.demurrage', {
                          value: input.demurrageRateUsd
                            ? t('wizard.demurrage.perDay', {
                                amount: usd(input.demurrageRateUsd),
                              })
                            : t('wizard.notStated'),
                        })}
                      >
                        <Range
                          min={0}
                          max={60_000}
                          step={1_000}
                          value={input.demurrageRateUsd ?? 0}
                          onChange={(v) => patch('demurrageRateUsd', v)}
                          dir={dir}
                        />
                      </Field>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {type === 'nda' && (
                    <p className="text-xs leading-relaxed text-ink-500">{t('wizard.ndaNote')}</p>
                  )}
                  {uses.cap && (
                  <Field
                    label={t('wizard.field.cap', {
                      value:
                        input.liabilityCapMultiple === 0
                          ? t('wizard.cap.uncapped')
                          : t('wizard.cap.multiple', {
                              n: new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(
                                input.liabilityCapMultiple,
                              ),
                            }),
                    })}
                  >
                    <Range
                      min={0}
                      max={5}
                      step={0.5}
                      value={input.liabilityCapMultiple}
                      onChange={(v) => patch('liabilityCapMultiple', v)}
                      dir={dir}
                    />
                  </Field>
                  )}
                  {uses.forceMajeure && (
                  <Toggle
                    label={t('wizard.toggle.forceMajeure')}
                    checked={input.hasForceMajeure}
                    onChange={(v) => patch('hasForceMajeure', v)}
                  />
                  )}
                  {uses.sanctions && (
                  <Toggle
                    label={t('wizard.toggle.sanctions')}
                    checked={input.hasSanctionsClause}
                    onChange={(v) => patch('hasSanctionsClause', v)}
                  />
                  )}
                  {uses.indemnity && (
                  <Toggle
                    label={t('wizard.toggle.indemnity')}
                    checked={input.hasIndemnity}
                    onChange={(v) => patch('hasIndemnity', v)}
                  />
                  )}
                  {uses.convenience && (
                  <Toggle
                    label={t('wizard.toggle.convenience')}
                    checked={input.hasTerminationForConvenience}
                    onChange={(v) =>
                      patch('hasTerminationForConvenience', v)
                    }
                  />
                  )}
                  {uses.insurance && (
                  <Toggle
                    label={t('wizard.toggle.insurance')}
                    checked={input.insuranceAllocated}
                    onChange={(v) => patch('insuranceAllocated', v)}
                  />
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <Field label={t('wizard.field.governingLaw')}>
                    <Select
                      value={input.governingLaw}
                      onChange={(v) => patch('governingLaw', v)}
                      options={options(t, 'opt.law', GOVERNING_LAWS)}
                    />
                  </Field>
                  <Field label={t('wizard.field.forum')}>
                    <Select
                      value={input.disputeForum}
                      onChange={(v) =>
                        patch('disputeForum', v as ContractInput['disputeForum'])
                      }
                      options={options(t, 'opt.forum', DISPUTE_FORUMS)}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-ink-500">
                    {t('wizard.forumNote')}
                  </p>
                </>
              )}

              {step === 4 && (
                <FindingsList findings={report.findings} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            data-cursor="hover"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-xs uppercase tracking-[0.16em] text-ink-500 transition-colors hover:text-ink-100 disabled:opacity-30"
          >
            {t('common.back')}
          </button>
          <button
            type="button"
            data-cursor="hover"
            onClick={() =>
              setStep((s) => Math.min(STEPS.length - 1, s + 1))
            }
            disabled={step === STEPS.length - 1}
            className="rounded-full border border-gold-500/45 bg-gold-500/10 px-6 py-2.5 text-xs uppercase tracking-[0.16em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/20 disabled:opacity-30"
          >
            {step === STEPS.length - 2 ? t('wizard.reviewFindings') : t('common.continue')}
          </button>
        </div>
      </GlassCard>

      {/* ---------------------------------------------------------------- */}
      {/* Right: live risk + document                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-6">
        <GlassCard interactive={false} sheen className="p-6">
          <RiskMeter report={report} />
        </GlassCard>
        <GlassCard interactive={false} className="p-0">
          <DocumentPreview doc={doc} findings={report.findings} />
        </GlassCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */

const usdFormatter = (locale: Locale) => (n: number) =>
  new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: 'currency',
    currency: 'USD',
    notation: n >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: n >= 1_000_000 ? 1 : 0,
  }).format(n);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-ink-500/25 bg-navy-800/70 px-3.5 py-2.5 text-sm text-ink-100 transition-colors duration-300 hover:border-gold-500/50 focus:border-gold-500"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v} className="bg-navy-800">
          {label}
        </option>
      ))}
    </select>
  );
}

function Range({
  min,
  max,
  step,
  value,
  onChange,
  dir,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  dir: 'ltr' | 'rtl';
}) {
  const pct = ((value - min) / (max - min)) * 100;
  // A range input fills from the inline-start edge, which is the right in RTL.
  const angle = dir === 'rtl' ? '270deg' : '90deg';
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
      style={{
        background: `linear-gradient(${angle}, #D4AF37 ${pct}%, rgba(195,202,219,0.18) ${pct}%)`,
      }}
    />
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-cursor="hover"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-ink-500/20 bg-navy-800/40 px-4 py-3 text-start text-sm text-ink-100 transition-colors duration-300 hover:border-gold-500/45"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-gold-500/70' : 'bg-ink-500/30'
        }`}
      >
        <span
          className={`absolute start-0 top-0.5 h-4 w-4 rounded-full bg-ink-100 transition-transform duration-300 ${
            checked
              ? 'translate-x-[18px] rtl:-translate-x-[18px]'
              : 'translate-x-0.5 rtl:-translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
