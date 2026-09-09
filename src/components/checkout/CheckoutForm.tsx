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

type PayMethod = 'card' | 'knet' | 'transfer';

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
 * 2. No card field exists anywhere in this component. Card capture happens on
 *    the gateway's own page, which is what keeps this site out of PCI-DSS
 *    scope. The buttons below choose a *method*; they never collect a number.
 */
export function CheckoutForm({ service }: { service: ServiceRow }) {
  const { t, dir, formatMoney, formatNumber } = useI18n();
  const { session } = useSession();

  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [terms, setTerms] = useState<ContractInput>(() => ({
    ...defaultContractInput(),
    type: 'charterparty',
  }));
  const [firstParty, setFirstParty] = useState('');
  const [secondParty, setSecondParty] = useState('');
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [country, setCountry] = useState('KW');
  const [method, setMethod] = useState<PayMethod>('card');

  const patch = useCallback(
    <K extends keyof ContractInput>(key: K, value: ContractInput[K]) =>
      setTerms((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // Same engine as the bench. Pure, so this is cheap enough to run per render.
  const report = useMemo(() => analyseContract(terms), [terms]);

  // Money is in minor units end to end; no float arithmetic on a price.
  const subtotal = service.base_price;
  const tax = 0; // Kuwait has no VAT at time of writing. Wired for when it does.
  const total = subtotal + tax;

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
            locale: dir === 'rtl' ? 'ar' : 'en',
            subtotal,
            tax,
            total,
            currency: service.currency,
            brief: {
              terms,
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

        if (orderError) throw orderError;

        // Hand off to the server, which talks to the gateway with the secret
        // key and writes the payments row as service_role.
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, method }),
        });

        const payload = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) throw new Error(payload.error ?? `Checkout failed (${res.status})`);
        if (payload.url) {
          window.location.assign(payload.url);
          return;
        }
        throw new Error('The payment provider returned no redirect URL.');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [
      session, service, contactName, contactEmail, contactPhone, country, dir,
      subtotal, tax, total, terms, firstParty, secondParty, deadline,
      instructions, report, method,
    ],
  );

  const isMaritime = terms.type === 'charterparty' || terms.type === 'bill-of-lading';

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
                  options={[
                    ['charterparty', 'Voyage charterparty'],
                    ['bill-of-lading', 'Bill of lading terms'],
                    ['supply', 'Supply of goods'],
                    ['distribution', 'Exclusive distribution'],
                    ['shareholders', 'Shareholders agreement'],
                    ['jv', 'Joint venture'],
                  ]}
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
                  options={JURISDICTIONS}
                />
              </Field>
              <Field label={t('checkout.field.governingLaw')}>
                <Select
                  value={terms.governingLaw}
                  onChange={(v) => patch('governingLaw', v)}
                  options={GOVERNING_LAWS}
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
                  value={terms.valueUsd}
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
                  options={FORUMS}
                />
              </Field>
              <Field label="Payment security">
                <Select
                  value={terms.security}
                  onChange={(v) => patch('security', v as ContractInput['security'])}
                  options={[
                    ['lc', 'Confirmed irrevocable LC'],
                    ['bank-guarantee', 'On-demand bank guarantee'],
                    ['parent-guarantee', 'Parent company guarantee'],
                    ['none', 'None'],
                  ]}
                />
              </Field>

              {isMaritime && (
                <>
                  <Field label="Laytime (running hours)">
                    <input
                      type="number"
                      min={0}
                      max={480}
                      value={terms.laytimeHours ?? 0}
                      onChange={(e) => patch('laytimeHours', Number(e.target.value))}
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Demurrage (USD / day)">
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
                  options={JURISDICTIONS.filter(([c]) => c !== 'XX')}
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
            <p className="eyebrow">{t('checkout.summary.title')}</p>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Line
                label={t('checkout.summary.service')}
                value={formatMoney(subtotal, service.currency)}
              />
              <Line
                label={t('checkout.summary.turnaround')}
                value={`${formatNumber(service.turnaround_days)} ${t('checkout.summary.days')}`}
                muted
              />
              <Line
                label={t('checkout.summary.subtotal')}
                value={formatMoney(subtotal, service.currency)}
                muted
              />
              <Line
                label={t('checkout.summary.tax')}
                value={formatMoney(tax, service.currency)}
                muted
              />
              <div className="border-t border-ink-500/15 pt-3">
                <Line
                  label={t('checkout.summary.total')}
                  value={formatMoney(total, service.currency)}
                  strong
                />
              </div>
            </dl>

            <p className="eyebrow mt-7">{t('checkout.section.payment')}</p>
            <div className="mt-3 grid gap-2">
              {(
                [
                  ['card', 'checkout.pay.card'],
                  ['knet', 'checkout.pay.knet'],
                  ['transfer', 'checkout.pay.transfer'],
                ] as const
              ).map(([value, key]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={method === value}
                  data-cursor="hover"
                  onClick={() => setMethod(value)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-300 ${
                    method === value
                      ? 'border-gold-500/60 bg-gold-500/10 text-gold-400'
                      : 'border-ink-500/22 bg-navy-800/40 text-ink-100 hover:border-gold-500/40'
                  }`}
                >
                  <span>{t(key)}</span>
                  <span
                    aria-hidden
                    className={`h-3.5 w-3.5 rounded-full border ${
                      method === value
                        ? 'border-gold-500 bg-gold-500/70'
                        : 'border-ink-500/50'
                    }`}
                  />
                </button>
              ))}
            </div>

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
              {busy ? t('checkout.pay.working') : t('checkout.pay.submit')}
            </motion.button>

            <p className="mt-4 text-[11px] leading-relaxed text-ink-500">
              {t('checkout.pay.redirect')}
            </p>
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

const JURISDICTIONS: ReadonlyArray<readonly [string, string]> = [
  ['KW', 'Kuwait'],
  ['AE', 'United Arab Emirates'],
  ['SA', 'Saudi Arabia'],
  ['QA', 'Qatar'],
  ['GB', 'United Kingdom'],
  ['SG', 'Singapore'],
  ['XX', 'Not stated'],
];

const GOVERNING_LAWS: ReadonlyArray<readonly [string, string]> = [
  ['GB', 'England & Wales'],
  ['AE', 'United Arab Emirates'],
  ['KW', 'Kuwait'],
  ['SG', 'Singapore'],
  ['CH', 'Switzerland'],
  ['US', 'New York'],
  ['XX', 'Not stated'],
];

const FORUMS: ReadonlyArray<readonly [string, string]> = [
  ['arbitration-lcia', 'LCIA arbitration, London'],
  ['arbitration-icc', 'ICC arbitration'],
  ['arbitration-difc', 'DIFC-LCIA arbitration'],
  ['arbitration-adhoc', 'Ad hoc arbitration'],
  ['local-courts', 'Courts — your seat'],
  ['foreign-courts', 'Courts — counterparty seat'],
  ['silent', 'Not stated'],
];

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

function Line({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={muted ? 'text-ink-500' : 'text-ink-300'}>{label}</dt>
      <dd
        className={`tabular-nums ${
          strong ? 'font-display text-lg text-gold-400' : 'text-ink-100'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
