/**
 * Clause-level risk engine.
 *
 * Deterministic, dependency-free and pure, so the identical module runs in the
 * browser (live scanner preview) and on the server (authoritative score written
 * to the audit log). Never let the two diverge: the client score is advisory,
 * the server score is the record.
 *
 * Scoring model
 * -------------
 * Each rule declares a `weight` and, when it trips, a `severity`. The exposure
 * score is the weighted severity sum divided by the maximum attainable weight
 * for the *applicable* rule set, expressed 0-100 where 100 is maximum exposure.
 * Rules that do not apply to a contract type are removed from the denominator
 * as well as the numerator, so a clean charterparty scores like a clean supply
 * agreement. Band thresholds are fixed; changing them requires bumping
 * SCORE_MODEL_VERSION so historical scores stay comparable.
 *
 * NOT LEGAL ADVICE: output is a triage signal for a qualified practitioner.
 */

export const SCORE_MODEL_VERSION = '1.0.0';

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  info: 0,
  low: 1,
  medium: 2.5,
  high: 4.5,
  critical: 7,
};

export type ContractType =
  | 'supply'
  | 'distribution'
  | 'charterparty'
  | 'bill-of-lading'
  | 'shareholders'
  | 'jv';

export type DisputeForum =
  | 'local-courts'
  | 'foreign-courts'
  | 'arbitration-lcia'
  | 'arbitration-icc'
  | 'arbitration-difc'
  | 'arbitration-adhoc'
  | 'silent';

export type Security = 'lc' | 'bank-guarantee' | 'parent-guarantee' | 'none';

export interface ContractInput {
  type: ContractType;
  /** ISO-3166 alpha-2 of the governing law, or 'XX' if unstated. */
  governingLaw: string;
  /** Counterparty home jurisdiction, ISO-3166 alpha-2. */
  counterpartyJurisdiction: string;
  disputeForum: DisputeForum;
  /** Contract value in USD. Drives proportionality of caps and security. */
  valueUsd: number;
  /** Aggregate liability cap as a multiple of contract value; 0 = uncapped. */
  liabilityCapMultiple: number;
  paymentTermsDays: number;
  security: Security;
  hasForceMajeure: boolean;
  hasSanctionsClause: boolean;
  hasIndemnity: boolean;
  hasTerminationForConvenience: boolean;
  /** Insurance responsibility expressly allocated between the parties. */
  insuranceAllocated: boolean;
  /** Maritime only: laytime in running hours; 0 or undefined = unstated. */
  laytimeHours?: number;
  /** Maritime only: demurrage rate USD/day; 0 or undefined = unstated. */
  demurrageRateUsd?: number;
}

export interface Finding {
  id: string;
  severity: Severity;
  /** Clause heading the finding attaches to, for the marked-up draft. */
  clause: string;
  title: string;
  detail: string;
  remediation: string;
  /** Instrument or authority the rule leans on, for the practitioner note. */
  authority?: string;
}

export type RiskBand = 'safe' | 'watch' | 'risk' | 'critical';

export interface RiskReport {
  score: number;
  band: RiskBand;
  findings: Finding[];
  tally: Record<Severity, number>;
  modelVersion: string;
  generatedAt: string;
}

const MARITIME_TYPES: ReadonlySet<ContractType> = new Set([
  'charterparty',
  'bill-of-lading',
]);

const GOODS_TYPES: ReadonlySet<ContractType> = new Set([
  'supply',
  'distribution',
]);

/**
 * Jurisdictions where recognition of a foreign *court* judgment is materially
 * harder than enforcement of an arbitral award. 'XX' stands for "unstated".
 */
const WEAK_JUDGMENT_ENFORCEMENT: ReadonlySet<string> = new Set([
  'TW',
  'ER',
  'SO',
  'XX',
]);

interface Rule {
  id: string;
  clause: string;
  weight: number;
  /** Omit to apply to every contract type. */
  appliesTo?: (c: ContractInput) => boolean;
  /** Returns a finding when the rule trips, otherwise null. */
  evaluate: (c: ContractInput) => Omit<Finding, 'id' | 'clause'> | null;
}

const RULES: readonly Rule[] = [
  {
    id: 'gov-law-silent',
    clause: 'Governing Law',
    weight: 1,
    evaluate: (c) =>
      c.governingLaw === 'XX'
        ? {
            severity: 'critical',
            title: 'No governing law selected',
            detail:
              'Without an express choice of law, the applicable law falls to be decided by the forum conflict rules. Neither party can price that outcome at signature.',
            remediation:
              'Insert an express governing-law clause. For cross-border trade, English law or DIFC law are the conventional neutral choices.',
            authority: 'Rome I Regulation (EC) 593/2008, Art. 3',
          }
        : null,
  },
  {
    id: 'forum-defect',
    clause: 'Dispute Resolution',
    weight: 1,
    evaluate: (c) => {
      if (c.disputeForum === 'silent') {
        return {
          severity: 'critical',
          title: 'No dispute-resolution mechanism',
          detail:
            'Absent an agreed forum, proceedings can be commenced in any jurisdiction with a hook, inviting parallel actions and a race to judgment.',
          remediation:
            'Adopt a seated arbitration clause with the seat, language, rules and number of arbitrators expressly stated.',
          authority: 'New York Convention 1958, Art. II',
        };
      }
      if (c.disputeForum === 'arbitration-adhoc') {
        return {
          severity: 'medium',
          title: 'Ad hoc arbitration without institutional support',
          detail:
            'Ad hoc arbitration leaves appointment, challenge and fee mechanics to the parties. It stalls as soon as one party stops cooperating.',
          remediation:
            'Adopt UNCITRAL Rules with a named appointing authority, or move to an institutional clause (LCIA, ICC, DIFC-LCIA).',
        };
      }
      if (
        c.disputeForum === 'foreign-courts' &&
        WEAK_JUDGMENT_ENFORCEMENT.has(c.counterpartyJurisdiction)
      ) {
        return {
          severity: 'high',
          title: 'Judgment may be unenforceable where the assets sit',
          detail:
            'A court judgment must be recognised in the jurisdiction holding the counterparty assets. That route is materially weaker here than arbitral enforcement.',
          remediation:
            'Switch to arbitration so the award travels under the New York Convention.',
          authority: 'New York Convention 1958, Art. III',
        };
      }
      return null;
    },
  },
  {
    id: 'liability-cap',
    clause: 'Limitation of Liability',
    weight: 1,
    evaluate: (c) => {
      if (c.liabilityCapMultiple === 0) {
        return {
          severity: 'high',
          title: 'Liability is uncapped',
          detail:
            'Exposure is unbounded and, at this contract value, effectively uninsurable at the limits underwriters will write.',
          remediation:
            'Cap aggregate liability at 100-150% of contract value with the usual carve-outs: death or personal injury, fraud, and IP infringement.',
        };
      }
      if (c.liabilityCapMultiple > 3) {
        return {
          severity: 'medium',
          title: 'Liability cap is disproportionate to contract value',
          detail: `A cap of ${c.liabilityCapMultiple}x value sits above the market range and will not fit inside a standard professional-indemnity tower.`,
          remediation:
            'Negotiate the cap toward 1-2x value, or obtain a bespoke insurance endorsement for the excess layer.',
        };
      }
      return null;
    },
  },
  {
    id: 'payment-terms',
    clause: 'Payment',
    weight: 0.8,
    evaluate: (c) => {
      if (c.paymentTermsDays > 90) {
        return {
          severity: 'high',
          title: 'Payment terms exceed 90 days',
          detail:
            'Working-capital exposure of this length turns a trading contract into unsecured credit, and may breach late-payment statutes in the buyer jurisdiction.',
          remediation:
            'Reduce to 30-60 days, or price the credit explicitly through late-payment interest plus security.',
        };
      }
      if (c.paymentTermsDays > 60) {
        return {
          severity: 'low',
          title: 'Extended payment terms',
          detail:
            'Terms beyond 60 days warrant an express late-payment interest rate so the cost of delay is not absorbed silently.',
          remediation:
            'Add interest at a stated margin over the relevant reference rate, compounding monthly.',
        };
      }
      return null;
    },
  },
  {
    id: 'security-missing',
    clause: 'Security',
    weight: 1,
    appliesTo: (c) => c.valueUsd >= 500_000,
    evaluate: (c) =>
      c.security === 'none'
        ? {
            severity: c.valueUsd >= 5_000_000 ? 'high' : 'medium',
            title: 'No payment security for a material contract value',
            detail:
              'The full contract value rides on the counterparty balance sheet, with no instrument to call on default.',
            remediation:
              'Require a confirmed irrevocable letter of credit, or a bank guarantee from an investment-grade issuer.',
            authority: 'UCP 600',
          }
        : null,
  },
  {
    id: 'force-majeure-missing',
    clause: 'Force Majeure',
    weight: 0.9,
    evaluate: (c) =>
      !c.hasForceMajeure
        ? {
            severity: 'medium',
            title: 'No force majeure clause',
            detail:
              'Common-law frustration is far narrower than a drafted force majeure clause and rarely excuses delay short of impossibility.',
            remediation:
              'Add a force majeure clause with notice mechanics, a mitigation duty, and a long-stop termination right.',
          }
        : null,
  },
  {
    id: 'sanctions-missing',
    clause: 'Sanctions and Trade Controls',
    weight: 1,
    evaluate: (c) =>
      !c.hasSanctionsClause
        ? {
            severity: 'high',
            title: 'No sanctions or trade-control clause',
            detail:
              'Cross-border trade with no sanctions representation, no screening covenant and no suspension right exposes the party to strict-liability penalties and correspondent-bank de-risking.',
            remediation:
              'Add sanctions representations and warranties, an ongoing screening covenant, and a right to suspend or terminate without liability.',
            authority: 'OFAC 31 CFR Part 500 et seq.; EU Regulation 833/2014',
          }
        : null,
  },
  {
    id: 'termination-convenience',
    clause: 'Termination',
    weight: 0.6,
    evaluate: (c) =>
      !c.hasTerminationForConvenience
        ? {
            severity: 'low',
            title: 'No termination for convenience',
            detail:
              'Exit is limited to breach and insolvency events, removing flexibility if commercial conditions move against the party.',
            remediation:
              'Consider a convenience right after an initial committed period, with a defined break fee.',
          }
        : null,
  },
  {
    id: 'indemnity-missing',
    clause: 'Indemnities',
    weight: 0.6,
    evaluate: (c) =>
      !c.hasIndemnity
        ? {
            severity: 'low',
            title: 'No express indemnity',
            detail:
              'Recovery is confined to damages for breach, subject to remoteness, causation and the duty to mitigate.',
            remediation:
              'Add targeted indemnities for third-party IP claims, regulatory penalties, and cargo or property damage.',
          }
        : null,
  },
  {
    id: 'insurance-unallocated',
    clause: 'Insurance',
    weight: 0.8,
    appliesTo: (c) => MARITIME_TYPES.has(c.type) || GOODS_TYPES.has(c.type),
    evaluate: (c) =>
      !c.insuranceAllocated
        ? {
            severity: 'medium',
            title: 'Insurance responsibility not allocated',
            detail:
              'Where the contract is silent, cover follows risk under the applicable Incoterm, which parties routinely misread, leaving a gap in transit.',
            remediation:
              'State who insures, for what value (conventionally 110% of CIF), and name the other party as loss payee.',
            authority: 'Incoterms 2020, A5/B5',
          }
        : null,
  },

  // --- Maritime-specific -------------------------------------------------
  {
    id: 'laytime-undefined',
    clause: 'Laytime',
    weight: 1,
    appliesTo: (c) => MARITIME_TYPES.has(c.type),
    evaluate: (c) =>
      !c.laytimeHours
        ? {
            severity: 'high',
            title: 'Laytime not defined',
            detail:
              'With no laytime, the moment demurrage starts to run is indeterminate. This is the most frequently arbitrated defect in charterparty drafting.',
            remediation:
              'State laytime in running hours, define notice of readiness, and specify which periods are excepted.',
            authority: 'Laytime Definitions for Charter Parties 2013',
          }
        : null,
  },
  {
    id: 'demurrage-undefined',
    clause: 'Demurrage',
    weight: 1,
    appliesTo: (c) => MARITIME_TYPES.has(c.type),
    evaluate: (c) =>
      !c.demurrageRateUsd
        ? {
            severity: 'high',
            title: 'Demurrage rate unstated',
            detail:
              'Without an agreed rate, delay is recoverable only as damages for detention, which is harder to prove and slower to recover.',
            remediation:
              'State a daily demurrage rate, payable pro rata, with an express time bar for claims.',
          }
        : null,
  },
];

const SEVERITY_ORDER: readonly Severity[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
];

/** Fixed band thresholds. Do not tune without bumping SCORE_MODEL_VERSION. */
function bandFor(score: number): RiskBand {
  if (score < 20) return 'safe';
  if (score < 45) return 'watch';
  if (score < 70) return 'risk';
  return 'critical';
}

export function analyseContract(input: ContractInput): RiskReport {
  const findings: Finding[] = [];
  let earned = 0;
  let possible = 0;

  for (const rule of RULES) {
    if (rule.appliesTo && !rule.appliesTo(input)) continue;

    possible += rule.weight * SEVERITY_WEIGHT.critical;

    const probe = rule.evaluate(input);
    if (!probe) continue;

    findings.push({ id: rule.id, clause: rule.clause, ...probe });
    earned += rule.weight * SEVERITY_WEIGHT[probe.severity];
  }

  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  const tally: Record<Severity, number> = {
    info: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const f of findings) tally[f.severity] += 1;

  findings.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return {
    score,
    band: bandFor(score),
    findings,
    tally,
    modelVersion: SCORE_MODEL_VERSION,
    generatedAt: new Date().toISOString(),
  };
}

/** Sensible starting point for the scanner wizard. */
export function defaultContractInput(): ContractInput {
  return {
    type: 'supply',
    governingLaw: 'GB',
    counterpartyJurisdiction: 'AE',
    disputeForum: 'arbitration-lcia',
    valueUsd: 2_500_000,
    liabilityCapMultiple: 1,
    paymentTermsDays: 45,
    security: 'lc',
    hasForceMajeure: true,
    hasSanctionsClause: true,
    hasIndemnity: true,
    hasTerminationForConvenience: false,
    insuranceAllocated: true,
  };
}
