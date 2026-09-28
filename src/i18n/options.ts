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
];

export const COUNTERPARTY_JURISDICTIONS = ['AE', 'KW', 'SA', 'GB', 'SG', 'TW', 'XX'] as const;

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
