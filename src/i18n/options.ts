import type { ContractType, DisputeForum, Security } from '@/lib/risk-engine';
import type { TranslationKey, TranslationVars } from './dictionaries';

/**
 * Every choice list on the site, held as codes only. The labels come from the
 * dictionary (`opt.*` keys), so a select can never show English options inside
 * an Arabic or French form.
 */
export const CONTRACT_TYPES: readonly ContractType[] = [
  'supply',
  'distribution',
  'charterparty',
  'bill-of-lading',
  'shareholders',
  'jv',
  'nda',
  'services',
  'agency',
  'lease',
  'licence',
  'employment',
  'mou',
  'settlement',
];

/**
 * Instruments the live builder drafts. Deliberately narrower than
 * CONTRACT_TYPES: the builder's clause set (contract value, invoice payment,
 * a liability cap as a multiple of value) is right for the trade types and
 * wrong for the others -- a bill of lading's liability is fixed by the Hague-Visby
 * Rules (Art. III r. 8 voids clauses lessening it), and a shareholders or JV
 * agreement is not a supply of goods. Those remain orderable from counsel.
 */
export const BUILDER_TYPES: readonly ContractType[] = [
  'supply',
  'distribution',
  'charterparty',
  // Each of these has its own clause set in document-categories.ts.
  'nda',
  'services',
  'agency',
  'lease',
  'licence',
  'employment',
  'mou',
  'settlement',
];

export const COUNTERPARTY_JURISDICTIONS = ['AE', 'KW', 'SA', 'QA', 'GB', 'SG', 'XX'] as const;

export const BILLING_JURISDICTIONS = ['KW', 'AE', 'SA', 'QA', 'GB', 'SG', 'XX'] as const;

export const GOVERNING_LAWS = ['GB', 'AE', 'KW', 'SG', 'CH', 'US', 'XX'] as const;

export const DISPUTE_FORUMS: readonly DisputeForum[] = [
  'arbitration-lcia',
  'arbitration-icc',
  'arbitration-difc',
  'arbitration-adhoc',
  'local-courts',
  'foreign-courts',
  'silent',
];

export const SECURITIES: readonly Security[] = [
  'lc',
  'bank-guarantee',
  'parent-guarantee',
  'none',
];

export type Option = readonly [value: string, label: string];
type T = (key: TranslationKey, vars?: TranslationVars) => string;

/** Builds `[code, label]` pairs for a select from a list of codes. */
export function options(
  t: T,
  prefix: 'opt.type' | 'opt.country' | 'opt.law' | 'opt.forum' | 'opt.security',
  codes: readonly string[],
): Option[] {
  return codes.map((code) => [code, t(`${prefix}.${code}` as TranslationKey)] as const);
}
