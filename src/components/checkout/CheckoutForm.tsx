'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskMeter } from '@/components/wizard/RiskMeter';
import { useI18n } from '@/i18n/I18nProvider';
import { useSession } from '@/hooks/useSession';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  analyseContract,
  defaultContractInput,
  type ContractInput,
  type ContractType,
  type DisputeForum,
} from '@/lib/risk-engine';
import type { ServiceRow } from '@/lib/database.types';
import {
  BILLING_JURISDICTIONS,
  CONTRACT_TYPES,
  DISPUTE_FORUMS,
  GOVERNING_LAWS,
  SECURITIES,
  options,
} from '@/i18n/options';

/**
 * Contract Writing checkout.
 *
 * Two things worth knowing about the design:
 *
 * 1. The brief form is typed as `ContractInput` -- the same structure the risk
 *    engine and the document engine already consume. So the provisional
 *    exposure shown here is computed by the identical rule set counsel will run
 *    on the finished draft, not by a marketing approximation of it. When the
 *    order converts to a matter, the brief maps onto the matter columns
 *    one-for-one with no translation layer.
 *
 * 2. There is no fixed price and no payment step. Submitting records the
 *    instructions (amounts zero); counsel then issues a written fee quote and
 *    engagement letter. No card data is collected anywhere on this site.
 */
export function CheckoutForm({ service }: { service: ServiceRow }) {
  const { t, locale } = useI18n();
  const { session } = useSession();

  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [terms, setTerms] = useState<ContractInput>(() => ({
    ...defaultContractInput(),
    type: 'charterparty',
    // No amount is suggested: the client states the value, if any.
    valueUsd: 0,
  }));
  const [firstParty, setFirstParty] = useState('');
  const [secondParty, setSecondParty] = useState('');
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [country, setCountry] = useState('KW');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const patch = useCallback(
    <K extends keyof ContractInput>(key: K, value: ContractInput[K]) =>
      setTerms((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // Same engine as the bench. Pure, so this is cheap enough to run per render.
  const report = useMemo(() => analyseContract(terms), [terms]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!session) {
        setAuthOpen(true);
        return;
      }

      setBusy(true);
      try {
        const supabase = getSupabaseBrowserClient();

        // Human-readable, collision-resistant enough for a client reference.
        const reference = `CW-${new Date().getFullYear()}-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`;

        const { data: order, error: orderError } = await supabase
          .from('service_orders')
          .insert({
            service_id: service.id,
            customer_id: session.user.id,
            reference,
            status: 'draft',
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone || null,
            billing_country: country,
            locale,
            // Fees are quoted after review, never fixed up front.
            subtotal: 0,
            tax: 0,
            total: 0,
            currency: service.currency,
            brief: {
              terms: { ...terms },
              firstParty,
              secondParty,
              deadline,
              instructions,
              // Stamp the advisory score so we can see later whether the
              // client's own expectation matched counsel's finding.
              provisionalScore: report.score,
              provisionalBand: report.band,
              modelVersion: report.modelVersion,
            },
          })
          .select('id, reference')
          .single();

        // The database's own message is English and can leak schema detail;
        // the visitor gets a translated, generic one.
        if (orderError) throw new Error(t('auth.error.generic'));

        setSubmitted(order.reference);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('auth.error.generic'));
      } finally {
        setBusy(false);
      }
    },
    [
      session, service, contactName, contactEmail, contactPhone, country, locale, t,
      terms, firstParty, secondParty, deadline, instructions, report,
    ],
  );

  const isMaritime = terms.type === 'charterparty' || terms.type === 'bill-of-lading';

  if (submitted) {
    return (
      <GlassCard interactive={false} className="mx-auto max-w-xl p-8 text-center">
        <p role="status" className="font-display text-2xl text-gold-400">
          {t('checkout.success.title')}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-300">
          {t('checkout.success.body', { ref: submitted })}
        </p>
        <a
          href="/dashboard"
          data-cursor="hover"
          className="mt-7 inline-block rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-3 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500"
        >
          {t('checkout.success.cta')}
        </a>
      </GlassCard>
    );
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-start"
      >
        {/* ---------------- Brief ------------------------------------------ */}
        <div className="space-y-6">
          <GlassCard interactive={false} className="p-6 sm:p-8">
            <p className="eyebrow">{t('checkout.section.instrument')}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t('checkout.field.instrumentType')}>
                <Select
                  value={terms.type}
                  onChange={(v) => patch('type', v as ContractType)}
                  options={options(t, 'opt.type', CONTRACT_TYPES)}
                />
              </Field>
              <Field label={t('checkout.field.deadline')}>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
          </GlassCard>

          <GlassCard interactive={false} className="p-6 sm:p-8">
            <p className="eyebrow">{t('checkout.section.parties')}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t('checkout.field.firstParty')} required>
                <input
                  required
                  value={firstParty}
                  onChange={(e) => setFirstParty(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.secondParty')} required>
                <input
                  required
                  value={secondParty}
                  onChange={(e) => setSecondParty(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.counterpartyJurisdiction')}>
                <Select
                  value={terms.counterpartyJurisdiction}
                  onChange={(v) => patch('counterpartyJurisdiction', v)}
                  options={options(t, 'opt.country', BILLING_JURISDICTIONS)}
                />
              </Field>
              <Field label={t('checkout.field.governingLaw')}>
                <Select
                  value={terms.governingLaw}
                  onChange={(v) => patch('governingLaw', v)}
                  options={options(t, 'opt.law', GOVERNING_LAWS)}
                />
              </Field>
            </div>
          </GlassCard>

          <GlassCard interactive={false} className="p-6 sm:p-8">
            <p className="eyebrow">{t('checkout.section.terms')}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t('checkout.field.value')}>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={terms.valueUsd || ''}
                  onChange={(e) => patch('valueUsd', Number(e.target.value))}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.paymentTerms')}>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={terms.paymentTermsDays}
                  onChange={(e) => patch('paymentTermsDays', Number(e.target.value))}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.forum')}>
                <Select
                  value={terms.disputeForum}
                  onChange={(v) => patch('disputeForum', v as DisputeForum)}
                  options={options(t, 'opt.forum', DISPUTE_FORUMS)}
                />
              </Field>
              <Field label={t('wizard.field.security')}>
                <Select
                  value={terms.security}
                  onChange={(v) => patch('security', v as ContractInput['security'])}
                  options={options(t, 'opt.security', SECURITIES)}
                />
              </Field>

              {isMaritime && (
                <>
                  <Field label={t('checkout.field.laytime')}>
                    <input
                      type="number"
                      min={0}
                      max={480}
                      value={terms.laytimeHours ?? 0}
                      onChange={(e) => patch('laytimeHours', Number(e.target.value))}
                      className={INPUT}
                    />
                  </Field>
                  <Field label={t('checkout.field.demurrage')}>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={terms.demurrageRateUsd ?? 0}
                      onChange={(e) => patch('demurrageRateUsd', Number(e.target.value))}
                      className={INPUT}
                    />
                  </Field>
                </>
              )}
            </div>

            <label className="mt-5 block">
              <span className="eyebrow mb-2 block">
                {t('checkout.field.instructions')}
              </span>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t('checkout.field.instructions.placeholder')}
                className={`${INPUT} resize-y leading-relaxed`}
              />
            </label>
          </GlassCard>

          <GlassCard interactive={false} className="p-6 sm:p-8">
            <p className="eyebrow">{t('checkout.section.contact')}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label={t('checkout.field.name')} required>
                <input
                  required
                  autoComplete="name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.email')} required>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.phone')}>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label={t('checkout.field.country')}>
                <Select
                  value={country}
                  onChange={setCountry}
                  options={options(
                    t,
                    'opt.country',
                    BILLING_JURISDICTIONS.filter((c) => c !== 'XX'),
                  )}
                />
              </Field>
            </div>
          </GlassCard>
        </div>

        {/* ---------------- Summary + payment ------------------------------ */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <GlassCard interactive={false} sheen className="p-6">
            <p className="eyebrow">{t('checkout.riskPreview.title')}</p>
            <div className="mt-4">
              <RiskMeter report={report} />
            </div>
            <p className="mt-4 border-t border-ink-500/15 pt-3 text-[11px] leading-relaxed text-ink-500">
              {t('checkout.riskPreview.note')}
            </p>
          </GlassCard>

          <GlassCard interactive={false} className="p-6">
            <p className="eyebrow">{t('checkout.fee.title')}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-300">
              {t('checkout.fee.body')}
            </p>

            {!session && (
              <button
                type="button"
                data-cursor="hover"
                onClick={() => setAuthOpen(true)}
                className="mt-5 w-full rounded-lg border border-ink-500/30 px-4 py-3 text-xs uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-gold-500/50 hover:text-gold-400"
              >
                {t('checkout.signInPrompt')}
              </button>
            )}

            {error && (
              <p role="alert" className="mt-4 text-sm leading-relaxed text-status-risk">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={busy}
              data-cursor="hover"
              whileTap={{ scale: 0.985 }}
              className="mt-5 w-full rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22 disabled:opacity-50"
            >
              {busy ? t('checkout.working') : t('checkout.submit')}
            </motion.button>
          </GlassCard>
        </div>
      </form>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="signUp"
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */

const INPUT =
  'w-full rounded-lg border border-ink-500/25 bg-navy-800/70 px-3.5 py-2.5 text-sm text-ink-100 transition-colors duration-300 hover:border-gold-500/50 focus:border-gold-500';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">
        {label}
        {required && <span className="ms-1 text-status-risk">*</span>}
      </span>
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
    <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
      {options.map(([v, label]) => (
        <option key={v} value={v} className="bg-navy-800">
          {label}
        </option>
      ))}
    </select>
  );
}
