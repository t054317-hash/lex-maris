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

const STEPS = [
  { id: 'instrument', label: 'Instrument' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'allocation', label: 'Risk Allocation' },
  { id: 'forum', label: 'Law & Forum' },
  { id: 'execute', label: 'Review' },
] as const;

const DEMO_META: DocumentMeta = {
  reference: 'LM-2026-0417',
  executionDate: '8 September 2026',
  parties: {
    first: {
      name: 'Meridian Trading DMCC',
      registrationNo: 'DMCC-114820',
      address: 'Unit 3402, Almas Tower, JLT, Dubai',
      jurisdiction: 'AE',
    },
    second: {
      name: 'Northgate Commodities Ltd',
      registrationNo: '09441237',
      address: '12 Leadenhall Street, London EC3V 1LP',
      jurisdiction: 'GB',
    },
  },
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
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ContractInput>(defaultContractInput);

  const patch = useCallback(
    <K extends keyof ContractInput>(key: K, value: ContractInput[K]) =>
      setInput((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const report = useMemo(() => analyseContract(input), [input]);
  const doc = useMemo(() => assembleDocument(input, DEMO_META), [input]);

  const isMaritime =
    input.type === 'charterparty' || input.type === 'bill-of-lading';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Left: wizard                                                     */}
      {/* ---------------------------------------------------------------- */}
      <GlassCard interactive={false} className="p-6 sm:p-8">
        <ol className="mb-8 flex flex-wrap gap-x-1 gap-y-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center">
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
                {s.label}
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
                  <Field label="Instrument type">
                    <Select
                      value={input.type}
                      onChange={(v) => patch('type', v as ContractInput['type'])}
                      options={[
                        ['supply', 'Supply of goods'],
                        ['distribution', 'Exclusive distribution'],
                        ['charterparty', 'Voyage charterparty'],
                        ['bill-of-lading', 'Bill of lading terms'],
                        ['shareholders', 'Shareholders agreement'],
                        ['jv', 'Joint venture'],
                      ]}
                    />
                  </Field>
                  <Field label="Counterparty jurisdiction">
                    <Select
                      value={input.counterpartyJurisdiction}
                      onChange={(v) => patch('counterpartyJurisdiction', v)}
                      options={[
                        ['AE', 'United Arab Emirates'],
                        ['KW', 'Kuwait'],
                        ['SA', 'Saudi Arabia'],
                        ['GB', 'United Kingdom'],
                        ['SG', 'Singapore'],
                        ['TW', 'Taiwan'],
                        ['XX', 'Not stated'],
                      ]}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Party details are drawn from the matter record. Registry data
                    is verified against the relevant commercial register before
                    execution.
                  </p>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label={`Contract value — ${usd(input.valueUsd)}`}>
                    <Range
                      min={50_000}
                      max={50_000_000}
                      step={50_000}
                      value={input.valueUsd}
                      onChange={(v) => patch('valueUsd', v)}
                    />
                  </Field>
                  <Field label={`Payment terms — ${input.paymentTermsDays} days`}>
                    <Range
                      min={7}
                      max={180}
                      step={1}
                      value={input.paymentTermsDays}
                      onChange={(v) => patch('paymentTermsDays', v)}
                    />
                  </Field>
                  <Field label="Payment security">
                    <Select
                      value={input.security}
                      onChange={(v) =>
                        patch('security', v as ContractInput['security'])
                      }
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
                      <Field
                        label={`Laytime — ${input.laytimeHours ? `${input.laytimeHours} hours` : 'not stated'}`}
                      >
                        <Range
                          min={0}
                          max={240}
                          step={6}
                          value={input.laytimeHours ?? 0}
                          onChange={(v) => patch('laytimeHours', v)}
                        />
                      </Field>
                      <Field
                        label={`Demurrage — ${input.demurrageRateUsd ? `${usd(input.demurrageRateUsd)} / day` : 'not stated'}`}
                      >
                        <Range
                          min={0}
                          max={60_000}
                          step={1_000}
                          value={input.demurrageRateUsd ?? 0}
                          onChange={(v) => patch('demurrageRateUsd', v)}
                        />
                      </Field>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <Field
                    label={`Liability cap — ${
                      input.liabilityCapMultiple === 0
                        ? 'uncapped'
                        : `${input.liabilityCapMultiple}× value`
                    }`}
                  >
                    <Range
                      min={0}
                      max={5}
                      step={0.5}
                      value={input.liabilityCapMultiple}
                      onChange={(v) => patch('liabilityCapMultiple', v)}
                    />
                  </Field>
                  <Toggle
                    label="Force majeure clause"
                    checked={input.hasForceMajeure}
                    onChange={(v) => patch('hasForceMajeure', v)}
                  />
                  <Toggle
                    label="Sanctions & trade-control clause"
                    checked={input.hasSanctionsClause}
                    onChange={(v) => patch('hasSanctionsClause', v)}
                  />
                  <Toggle
                    label="Express indemnities"
                    checked={input.hasIndemnity}
                    onChange={(v) => patch('hasIndemnity', v)}
                  />
                  <Toggle
                    label="Termination for convenience"
                    checked={input.hasTerminationForConvenience}
                    onChange={(v) =>
                      patch('hasTerminationForConvenience', v)
                    }
                  />
                  <Toggle
                    label="Insurance responsibility allocated"
                    checked={input.insuranceAllocated}
                    onChange={(v) => patch('insuranceAllocated', v)}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Field label="Governing law">
                    <Select
                      value={input.governingLaw}
                      onChange={(v) => patch('governingLaw', v)}
                      options={[
                        ['GB', 'England & Wales'],
                        ['AE', 'United Arab Emirates'],
                        ['KW', 'Kuwait'],
                        ['SG', 'Singapore'],
                        ['CH', 'Switzerland'],
                        ['US', 'New York'],
                        ['XX', 'Not stated'],
                      ]}
                    />
                  </Field>
                  <Field label="Dispute resolution">
                    <Select
                      value={input.disputeForum}
                      onChange={(v) =>
                        patch('disputeForum', v as ContractInput['disputeForum'])
                      }
                      options={[
                        ['arbitration-lcia', 'LCIA arbitration, London'],
                        ['arbitration-icc', 'ICC arbitration'],
                        ['arbitration-difc', 'DIFC-LCIA arbitration'],
                        ['arbitration-adhoc', 'Ad hoc arbitration'],
                        ['local-courts', 'Courts — first party seat'],
                        ['foreign-courts', 'Courts — counterparty seat'],
                        ['silent', 'Not stated'],
                      ]}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Enforceability is assessed against the counterparty asset
                    jurisdiction, not the seat.
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
            Back
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
            {step === STEPS.length - 2 ? 'Review findings' : 'Continue'}
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

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
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
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
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
        background: `linear-gradient(90deg, #D4AF37 ${pct}%, rgba(195,202,219,0.18) ${pct}%)`,
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
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-ink-500/20 bg-navy-800/40 px-4 py-3 text-left text-sm text-ink-100 transition-colors duration-300 hover:border-gold-500/45"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-gold-500/70' : 'bg-ink-500/30'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-100 transition-transform duration-300 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
