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
import type { TranslationKey } from '@/i18n/dictionaries';
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

/** Categories with no commercial risk allocation (no cap, FM, sanctions...). */
const NON_COMMERCIAL: ReadonlySet<ContractInput['type']> = new Set([
  'nda',
  'employment',
  'mou',
  'settlement',
  'property-sale',
]);

/** Categories where the "counterparty jurisdiction" is where the real estate is. */
const LOCATION_TYPES: ReadonlySet<ContractInput['type']> = new Set(['lease', 'property-sale']);

/** Categories that state an amount of money. */
const MONEY_TYPES: ReadonlySet<ContractInput['type']> = new Set([
  'supply',
  'distribution',
  'charterparty',
  'services',
  'agency',
  'lease',
  'licence',
  'construction',
  'property-sale',
]);

const CURRENCIES = ['KWD', 'USD', 'AED', 'SAR', 'EUR'] as const;

interface PartyForm {
  name: string;
  reg: string;
  address: string;
  jurisdiction: string;
  individual: boolean;
}
interface PartiesForm {
  first: PartyForm;
  second: PartyForm;
  date: string;
  reference: string;
}
const EMPTY_PARTY: PartyForm = { name: '', reg: '', address: '', jurisdiction: 'XX', individual: false };
const EMPTY_PARTIES: PartiesForm = {
  first: EMPTY_PARTY,
  second: { ...EMPTY_PARTY, jurisdiction: 'XX' },
  date: '',
  reference: '',
};

/** What each party is called in each category, so a non-lawyer knows which side is theirs. */
const ROLES: Record<Locale, Partial<Record<ContractInput['type'], readonly [string, string]>>> = {
  en: {
    supply: ['First Party — Supplier', 'Second Party — Buyer'],
    distribution: ['First Party — Supplier', 'Second Party — Distributor'],
    charterparty: ['First Party — Shipowner', 'Second Party — Charterer'],
    services: ['First Party — Provider', 'Second Party — Client'],
    agency: ['First Party — Principal', 'Second Party — Agent'],
    lease: ['First Party — Landlord', 'Second Party — Tenant'],
    licence: ['First Party — Licensor', 'Second Party — Licensee'],
    employment: ['First Party — Employer', 'Second Party — Employee'],
    construction: ['First Party — Employer (owner)', 'Second Party — Contractor'],
    'property-sale': ['First Party — Seller', 'Second Party — Buyer'],
  },
  ar: {
    supply: ['الطرف الأول — المورِّد', 'الطرف الثاني — المشتري'],
    distribution: ['الطرف الأول — المورِّد', 'الطرف الثاني — الموزِّع'],
    charterparty: ['الطرف الأول — مالك السفينة', 'الطرف الثاني — المستأجر'],
    services: ['الطرف الأول — مقدّم الخدمة', 'الطرف الثاني — العميل'],
    agency: ['الطرف الأول — الموكِّل', 'الطرف الثاني — الوكيل'],
    lease: ['الطرف الأول — المؤجِّر', 'الطرف الثاني — المستأجر'],
    licence: ['الطرف الأول — المرخِّص', 'الطرف الثاني — المرخَّص له'],
    employment: ['الطرف الأول — صاحب العمل', 'الطرف الثاني — العامل'],
    construction: ['الطرف الأول — صاحب العمل (المالك)', 'الطرف الثاني — المقاول'],
    'property-sale': ['الطرف الأول — البائع', 'الطرف الثاني — المشتري'],
  },
  fr: {
    supply: ['Premier Contractant — Fournisseur', 'Second Contractant — Acheteur'],
    distribution: ['Premier Contractant — Fournisseur', 'Second Contractant — Distributeur'],
    charterparty: ['Premier Contractant — Armateur', 'Second Contractant — Affréteur'],
    services: ['Premier Contractant — Prestataire', 'Second Contractant — Client'],
    agency: ['Premier Contractant — Mandant', 'Second Contractant — Agent'],
    lease: ['Premier Contractant — Bailleur', 'Second Contractant — Preneur'],
    licence: ['Premier Contractant — Concédant', 'Second Contractant — Licencié'],
    employment: ['Premier Contractant — Employeur', 'Second Contractant — Salarié'],
    construction: ["Premier Contractant — Maître d'ouvrage", 'Second Contractant — Entrepreneur'],
    'property-sale': ['Premier Contractant — Vendeur', 'Second Contractant — Acquéreur'],
  },
};

const TEXT_INPUT =
  'w-full rounded-lg border border-ink-500/25 bg-navy-800/70 px-3.5 py-2.5 text-sm text-ink-100 transition-colors duration-300 hover:border-gold-500/50 focus:border-gold-500';

const STEPS = ['instrument', 'parties', 'commercial', 'allocation', 'forum', 'execute'] as const;

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

const EMPLOYEE_PLACEHOLDER: Record<Locale, { name: string; registrationNo: string; address: string }> = {
  en: { name: '[Employee name]', registrationNo: '[civil ID / passport no.]', address: '[residential address]' },
  ar: { name: '[اسم العامل]', registrationNo: '[رقم البطاقة المدنية / جواز السفر]', address: '[عنوان السكن]' },
  fr: { name: '[nom du salarié]', registrationNo: "[n° de carte d'identité / passeport]", address: '[adresse du domicile]' },
};

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
  const [parties, setParties] = useState<PartiesForm>(EMPTY_PARTIES);
  const setParty = (side: 'first' | 'second', key: keyof PartyForm, value: string | boolean) =>
    setParties((p) => ({ ...p, [side]: { ...p[side], [key]: value } }));

  const patch = useCallback(
    <K extends keyof ContractInput>(key: K, value: ContractInput[K]) =>
      setInput((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const report = useMemo(() => analyseContract(input), [input]);
  const doc = useMemo(() => {
    // Whatever the user typed; anything blank stays a bracketed placeholder
    // so the printed contract shows exactly what is still to be completed.
    const ph = META_FOR[locale];
    const employee = input.type === 'employment';
    const party = (side: 'first' | 'second'): DocumentMeta['parties']['first'] => {
      const f = parties[side];
      const individual = side === 'second' && employee ? true : f.individual;
      const personPh = EMPLOYEE_PLACEHOLDER[locale];
      const base = ph.parties[side];
      return {
        name: f.name.trim() || (individual && side === 'second' && employee ? personPh.name : base.name),
        registrationNo: f.reg.trim() || (individual ? personPh.registrationNo : base.registrationNo),
        address: f.address.trim() || (individual ? personPh.address : base.address),
        jurisdiction: side === 'second' && !LOCATION_TYPES.has(input.type) ? input.counterpartyJurisdiction : f.jurisdiction,
        individual,
      };
    };
    return assembleDocument(
      input,
      {
        reference: parties.reference.trim() || ph.reference,
        executionDate: parties.date || ph.executionDate,
        parties: { first: party('first'), second: party('second') },
      },
      locale,
    );
  }, [input, locale, parties]);
  const currency = input.currency ?? 'KWD';
  const usd = useMemo(() => moneyFormatter(locale, currency), [locale, currency]);

  const isMaritime =
    input.type === 'charterparty' || input.type === 'bill-of-lading';
  const isTrade = TRADE_TYPES.has(input.type);
  const { type } = input;
  // Which risk-allocation controls a category actually uses.
  const nonCommercial = NON_COMMERCIAL.has(type);
  const uses = {
    cap: !nonCommercial && type !== 'lease',
    forceMajeure: !nonCommercial,
    sanctions: !nonCommercial && type !== 'lease',
    indemnity: !nonCommercial && type !== 'lease',
    convenience: isTrade || type === 'services' || type === 'licence' || type === 'construction',
    insurance: isTrade,
  };
  const priced =
    isTrade ||
    type === 'services' ||
    type === 'agency' ||
    type === 'licence' ||
    type === 'construction';
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
                      onChange={(v) => patch('type', v as ContractInput['type'])}
                      options={options(t, 'opt.type', BUILDER_TYPES)}
                    />
                  </Field>
                  {/* What the contract is for, in one plain sentence. */}
                  <p className="-mt-2 rounded-lg border border-gold-500/20 bg-gold-500/5 px-3.5 py-2.5 text-sm leading-relaxed text-ink-100">
                    {t(`opt.desc.${type}` as TranslationKey)}
                  </p>
                  {LOCATION_TYPES.has(type) && (
                    <Field
                      label={
                        type === 'lease'
                          ? t('wizard.field.premisesLocation')
                          : t('wizard.field.propertyLocation')
                      }
                    >
                      <Select
                        value={input.counterpartyJurisdiction}
                        onChange={(v) => patch('counterpartyJurisdiction', v)}
                        options={options(t, 'opt.country', COUNTERPARTY_JURISDICTIONS)}
                      />
                    </Field>
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  <p className="text-xs leading-relaxed text-ink-500">{t('party.note')}</p>
                  {(['first', 'second'] as const).map((side) => {
                    const f = parties[side];
                    const forcedPerson = side === 'second' && type === 'employment';
                    const person = forcedPerson || f.individual;
                    return (
                      <fieldset
                        key={side}
                        className="space-y-3 rounded-lg border border-ink-500/20 bg-navy-800/30 p-4"
                      >
                        <legend className="px-1 text-sm font-medium text-gold-400">
                          {ROLES[locale][type]?.[side === 'first' ? 0 : 1] ??
                            t(side === 'first' ? 'party.first' : 'party.second')}
                        </legend>
                        {!forcedPerson && (
                          <label className="flex items-center gap-2 text-xs text-ink-300">
                            <input
                              type="checkbox"
                              checked={f.individual}
                              onChange={(e) => setParty(side, 'individual', e.target.checked)}
                              className="h-4 w-4 accent-[rgb(var(--gold-500))]"
                            />
                            {t('party.individual')}
                          </label>
                        )}
                        <TextField
                          label={t('party.name')}
                          value={f.name}
                          onChange={(v) => setParty(side, 'name', v)}
                          autoComplete={person ? 'name' : 'organization'}
                        />
                        <TextField
                          label={t(person ? 'party.id' : 'party.reg')}
                          value={f.reg}
                          onChange={(v) => setParty(side, 'reg', v)}
                        />
                        <TextField
                          label={t(person ? 'party.home' : 'party.address')}
                          value={f.address}
                          onChange={(v) => setParty(side, 'address', v)}
                          autoComplete="street-address"
                        />
                        {!person && (
                          <Field label={t('party.country')}>
                            <Select
                              value={
                                side === 'second' && !LOCATION_TYPES.has(type)
                                  ? input.counterpartyJurisdiction
                                  : f.jurisdiction
                              }
                              onChange={(v) =>
                                side === 'second' && !LOCATION_TYPES.has(type)
                                  ? patch('counterpartyJurisdiction', v)
                                  : setParty(side, 'jurisdiction', v)
                              }
                              options={options(t, 'opt.country', COUNTERPARTY_JURISDICTIONS)}
                            />
                          </Field>
                        )}
                      </fieldset>
                    );
                  })}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t('party.date')}>
                      <input
                        type="date"
                        value={parties.date}
                        onChange={(e) => setParties((p) => ({ ...p, date: e.target.value }))}
                        className={TEXT_INPUT}
                      />
                    </Field>
                    <TextField
                      label={t('party.reference')}
                      value={parties.reference}
                      onChange={(v) => setParties((p) => ({ ...p, reference: v }))}
                    />
                  </div>
                </>
              )}

              {step === 2 && MONEY_TYPES.has(type) && (
                <Field label={t('wizard.field.currency')}>
                  <Select
                    value={currency}
                    onChange={(v) => patch('currency', v)}
                    options={CURRENCIES.map((c) => [c, t(`opt.currency.${c}` as TranslationKey)] as const)}
                  />
                </Field>
              )}

              {step === 2 && type === 'nda' && (
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

              {step === 2 && type === 'lease' && (
                <>
                  <Field label={t('wizard.field.annualRent', { value: usd(input.valueUsd) })}>
                    <Range
                      min={10_000}
                      max={1_000_000_000_000}
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

              {step === 2 && type === 'mou' && (
                <Field
                  label={t('wizard.field.exclusivity', {
                    value: input.exclusivityMonths
                      ? pct(input.exclusivityMonths)
                      : t('wizard.none'),
                  })}
                >
                  <Range
                    min={0}
                    max={12}
                    step={1}
                    value={input.exclusivityMonths ?? 0}
                    onChange={(v) => patch('exclusivityMonths', v)}
                    dir={dir}
                  />
                </Field>
              )}

              {step === 2 && type === 'construction' && (
                <Field
                  label={t('wizard.field.completion', {
                    value: pct(input.completionMonths ?? 0),
                  })}
                >
                  <Range
                    min={1}
                    max={60}
                    step={1}
                    value={input.completionMonths ?? 1}
                    onChange={(v) => patch('completionMonths', v)}
                    dir={dir}
                  />
                </Field>
              )}

              {step === 2 && type === 'property-sale' && (
                <Field label={t('wizard.field.salePrice', { value: usd(input.valueUsd) })}>
                  <Range
                    min={50_000}
                    max={1_000_000_000_000}
                    step={50_000}
                    value={input.valueUsd}
                    onChange={(v) => patch('valueUsd', v)}
                    dir={dir}
                  />
                </Field>
              )}

              {step === 2 && (type === 'employment' || type === 'settlement') && (
                <p className="text-xs leading-relaxed text-ink-500">
                  {t(type === 'employment' ? 'wizard.employmentNote' : 'wizard.settlementNote')}
                </p>
              )}

              {step === 2 && priced && (
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
                      label={t(
                        type === 'services'
                          ? 'wizard.field.fees'
                          : type === 'licence'
                            ? 'wizard.field.licenceFees'
                            : type === 'construction'
                              ? 'wizard.field.contractPrice'
                              : 'wizard.field.value',
                        {
                        value: usd(input.valueUsd),
                      })}
                    >
                      <Range
                        min={50_000}
                        max={1_000_000_000_000}
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

              {step === 2 && isTrade && (
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
                          max={1_000_000_000}
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

              {step === 3 && (
                <>
                  {nonCommercial && (
                    <p className="text-xs leading-relaxed text-ink-500">
                      {t(type === 'nda' ? 'wizard.ndaNote' : 'wizard.noAllocationNote')}
                    </p>
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

              {step === 4 && (
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

              {step === 5 && (
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

const moneyFormatter = (locale: Locale, currency: string) => (n: number) =>
  n > 0
    ? new Intl.NumberFormat(NUMBER_LOCALE[locale], {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'KWD' ? 3 : 2,
      }).format(n)
    : '—';

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

function TextField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        maxLength={300}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={TEXT_INPUT}
      />
    </Field>
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

/**
 * Number entry. Every figure in the contract -- amounts, days, months,
 * percentages -- is typed by the user rather than dragged on a slider, so a
 * figure is never suggested to them. Empty means "not stated yet" (0), which
 * the draft shows as a placeholder. `min`/`max`/`step` only guide the
 * keyboard and validation; `dir` is kept for call-site compatibility.
 */
function Range({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      dir="ltr"
      min={Math.min(min, 0)}
      max={max}
      step={step}
      value={value ? value : ''}
      placeholder="—"
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0);
      }}
      className="w-full rounded-lg border border-ink-500/25 bg-navy-800/70 px-3.5 py-2.5 text-start text-sm tabular-nums text-ink-100 transition-colors duration-300 hover:border-gold-500/50 focus:border-gold-500"
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
