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

import { clauseHeading, type ClauseId } from './document-engine';

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
  | 'jv'
  | 'nda'
  | 'services'
  | 'agency'
  | 'lease'
  | 'licence'
  | 'employment'
  | 'mou'
  | 'settlement'
  | 'construction'
  | 'property-sale';

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
  /**
   * Contract value in `currency` (the name is historical). 0 = not yet
   * entered; the draft then shows an [amount] placeholder.
   */
  valueUsd: number;
  /** ISO 4217 currency of every amount in the contract. Defaults to KWD. */
  currency?: string;
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
  /** NDA only: years the confidentiality obligation survives; 0 = indefinite. */
  confidentialityYears?: number;
  /** Agency only: commission as a percentage of net sales in the territory. */
  commissionPct?: number;
  /** Lease only: term in years. */
  leaseTermYears?: number;
  /** MoU only: exclusivity period in months; 0 = none. */
  exclusivityMonths?: number;
  /** Construction only: time for completion in months. */
  completionMonths?: number;
}

export interface Finding {
  id: string;
  /**
   * Stable message key for this exact outcome (a rule can trip in more than
   * one way). The UI translates by code; the English text below stays the
   * record written to the audit log.
   */
  code: FindingCode;
  severity: Severity;
  /** Clause the finding attaches to, for the marked-up draft. */
  clauseId: ClauseId;
  /** English clause heading, kept for the audit record. */
  clause: string;
  /** Numbers interpolated into the message, so translations can reuse them. */
  params?: Record<string, number>;
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

/** Types whose value is a price paid for performance (so caps and credit terms make sense). */
const PRICED_TYPES: ReadonlySet<ContractType> = new Set([
  'supply',
  'distribution',
  'charterparty',
  'bill-of-lading',
  'services',
  'agency',
  'licence',
  'construction',
]);

/** No commercial risk allocation: rules about caps, credit, sanctions etc. do not apply. */
const NON_COMMERCIAL: ContractType[] = ['nda', 'employment', 'mou', 'settlement', 'property-sale'];

/**
 * USD equivalent, for the value thresholds only. AED and SAR are pegged to
 * the dollar; KWD (basket peg) and EUR float, so their rates are rounded
 * approximations -- adequate for a triage threshold, never for a price.
 */
const USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  AED: 1 / 3.6725,
  SAR: 1 / 3.75,
  KWD: 3.25,
  EUR: 1.1,
};
const usdEquivalent = (c: ContractInput) =>
  c.valueUsd * (USD_PER_UNIT[c.currency ?? 'KWD'] ?? 1);

const not =
  (...types: ContractType[]) =>
  (c: ContractInput) =>
    !types.includes(c.type);

/**
 * Jurisdictions where recognition of a foreign *court* judgment is materially
 * harder than enforcement of an arbitral award. 'XX' stands for "unstated".
 */
const WEAK_JUDGMENT_ENFORCEMENT: ReadonlySet<string> = new Set(['XX']);

export type FindingCode =
  | 'gov-law-silent'
  | 'forum-silent'
  | 'forum-adhoc'
  | 'forum-foreign-courts'
  | 'liability-uncapped'
  | 'liability-excessive'
  | 'payment-over-90'
  | 'payment-over-60'
  | 'security-missing'
  | 'force-majeure-missing'
  | 'sanctions-missing'
  | 'termination-convenience'
  | 'indemnity-missing'
  | 'insurance-unallocated'
  | 'laytime-undefined'
  | 'demurrage-undefined'
  | 'nda-term-short'
  | 'agency-mandatory-law'
  | 'lease-law-not-situs'
  | 'lease-arbitration'
  | 'employment-mandatory-law'
  | 'employment-arbitration'
  | 'mou-binding-risk'
  | 'settlement-enforcement'
  | 'construction-decennial'
  | 'construction-delay-damages'
  | 'construction-time-undefined'
  | 'property-registration'
  | 'property-law-not-situs'
  | 'property-foreign-ownership';

interface Rule {
  id: string;
  clauseId: ClauseId;
  weight: number;
  /** Omit to apply to every contract type. */
  appliesTo?: (c: ContractInput) => boolean;
  /** Returns a finding when the rule trips, otherwise null. */
  evaluate: (c: ContractInput) => Omit<Finding, 'id' | 'clause' | 'clauseId'> | null;
}

const RULES: readonly Rule[] = [
  {
    id: 'gov-law-silent',
    clauseId: 'governing-law',
    weight: 1,
    evaluate: (c) =>
      c.governingLaw === 'XX'
        ? {
            severity: 'critical',
            code: 'gov-law-silent',
            title: 'No governing law selected',
            detail:
              'Without an express choice of law, the applicable law falls to be decided by the forum conflict rules. Neither party can price that outcome at signature.',
            remediation:
              'Insert an express governing-law clause. For cross-border trade, English law or DIFC law are the conventional neutral choices.',
            authority:
              'Rome I Regulation (EC) No 593/2008, Arts 3–4; UAE Civil Transactions Law (Federal Decree-Law No. 25 of 2025), Art. 19',
          }
        : null,
  },
  {
    id: 'forum-defect',
    clauseId: 'dispute-resolution',
    weight: 1,
    evaluate: (c) => {
      if (c.disputeForum === 'silent') {
        return {
          severity: 'critical',
          code: 'forum-silent',
          title: 'No dispute-resolution mechanism',
          detail:
            'Absent an agreed forum, proceedings can be commenced in any jurisdiction with a hook, inviting parallel actions and a race to judgment.',
          remediation:
            'Adopt a seated arbitration clause with the seat, language, rules and number of arbitrators expressly stated.',
        };
      }
      if (c.disputeForum === 'arbitration-adhoc') {
        return {
          severity: 'medium',
          code: 'forum-adhoc',
          title: 'Ad hoc arbitration without institutional support',
          detail:
            'Ad hoc arbitration leaves appointment, challenge and fee mechanics to the parties. It stalls as soon as one party stops cooperating.',
          remediation:
            'Adopt UNCITRAL Rules with a named appointing authority, or move to an institutional clause (LCIA, ICC, DIAC).',
        };
      }
      if (
        c.disputeForum === 'foreign-courts' &&
        WEAK_JUDGMENT_ENFORCEMENT.has(c.counterpartyJurisdiction)
      ) {
        return {
          severity: 'high',
          code: 'forum-foreign-courts',
          title: 'Enforcement route against the counterparty is unverified',
          detail:
            "A court judgment must be recognised where the counterparty's assets are located. With the counterparty's jurisdiction unstated, that route cannot be assessed, whereas an arbitral award is enforceable in the 170+ New York Convention states.",
          remediation:
            "State the counterparty's jurisdiction, or switch to arbitration seated in a New York Convention state.",
          authority: 'New York Convention 1958, Art. III',
        };
      }
      return null;
    },
  },
  {
    id: 'liability-cap',
    clauseId: 'liability',
    weight: 1,
    // NDA breach and lease obligations are conventionally uncapped.
    appliesTo: not(...NON_COMMERCIAL, 'lease'),
    evaluate: (c) => {
      if (c.liabilityCapMultiple === 0) {
        return {
          severity: 'high',
          code: 'liability-uncapped',
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
          code: 'liability-excessive',
          title: 'Liability cap is disproportionate to contract value',
          params: { multiple: c.liabilityCapMultiple },
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
    clauseId: 'payment',
    weight: 0.8,
    appliesTo: (c) => PRICED_TYPES.has(c.type),
    evaluate: (c) => {
      if (c.paymentTermsDays > 90) {
        return {
          severity: 'high',
          code: 'payment-over-90',
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
          code: 'payment-over-60',
          title: 'Extended payment terms',
          detail:
            'Terms beyond 60 days warrant an express late-payment interest rate so the cost of delay is not absorbed silently.',
          remediation:
            'Where the governing law permits contractual interest, add interest at a stated margin over the relevant reference rate. Under Sharia-based systems (e.g. Saudi Arabia) interest is unenforceable; use a different late-payment mechanism.',
        };
      }
      return null;
    },
  },
  {
    id: 'security-missing',
    clauseId: 'security',
    weight: 1,
    appliesTo: (c) =>
      (GOODS_TYPES.has(c.type) || MARITIME_TYPES.has(c.type)) && usdEquivalent(c) >= 500_000,
    evaluate: (c) =>
      c.security === 'none'
        ? {
            severity: usdEquivalent(c) >= 5_000_000 ? 'high' : 'medium',
            code: 'security-missing',
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
    clauseId: 'force-majeure',
    weight: 0.9,
    appliesTo: not(...NON_COMMERCIAL),
    evaluate: (c) =>
      !c.hasForceMajeure
        ? {
            severity: 'medium',
            code: 'force-majeure-missing',
            title: 'No force majeure clause',
            detail:
              "Without an express clause, relief depends on the governing law's default rules (frustration under English law; statutory force majeure and exceptional-circumstances doctrines in civil-law systems such as Kuwait and the UAE), which are narrower and less predictable than a drafted clause.",
            remediation:
              'Add a force majeure clause with notice mechanics, a mitigation duty, and a long-stop termination right.',
          }
        : null,
  },
  {
    id: 'sanctions-missing',
    clauseId: 'sanctions',
    weight: 1,
    appliesTo: not(...NON_COMMERCIAL, 'lease'),
    evaluate: (c) =>
      !c.hasSanctionsClause
        ? {
            severity: 'high',
            code: 'sanctions-missing',
            title: 'No sanctions or trade-control clause',
            detail:
              'Cross-border trade with no sanctions representation, no screening covenant and no suspension right exposes the party to strict-liability penalties and correspondent-bank de-risking.',
            remediation:
              'Add sanctions representations and warranties, an ongoing screening covenant, and a right to suspend or terminate without liability.',
            authority:
              'UN Security Council sanctions; US OFAC regulations (31 CFR Chapter V); EU restrictive measures, e.g. Council Regulation (EU) No 833/2014',
          }
        : null,
  },
  {
    id: 'termination-convenience',
    clauseId: 'termination',
    weight: 0.6,
    // Agency termination is governed by mandatory law; a lease runs its term.
    appliesTo: not(...NON_COMMERCIAL, 'agency', 'lease'),
    evaluate: (c) =>
      !c.hasTerminationForConvenience
        ? {
            severity: 'low',
            code: 'termination-convenience',
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
    clauseId: 'indemnity',
    weight: 0.6,
    appliesTo: not(...NON_COMMERCIAL, 'lease'),
    evaluate: (c) =>
      !c.hasIndemnity
        ? {
            severity: 'low',
            code: 'indemnity-missing',
            title: 'No express indemnity',
            detail:
              'Recovery is confined to damages for breach, subject to foreseeability (remoteness), causation and the duty to mitigate.',
            remediation:
              'Add targeted indemnities for third-party IP claims, regulatory penalties, and cargo or property damage.',
          }
        : null,
  },
  {
    id: 'insurance-unallocated',
    clauseId: 'insurance',
    weight: 0.8,
    appliesTo: (c) => MARITIME_TYPES.has(c.type) || GOODS_TYPES.has(c.type),
    evaluate: (c) =>
      !c.insuranceAllocated
        ? {
            severity: 'medium',
            code: 'insurance-unallocated',
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
    clauseId: 'laytime',
    weight: 1,
    appliesTo: (c) => MARITIME_TYPES.has(c.type),
    evaluate: (c) =>
      !c.laytimeHours
        ? {
            severity: 'high',
            code: 'laytime-undefined',
            title: 'Laytime not defined',
            detail:
              'With no laytime, the moment demurrage starts to run is indeterminate. This is the most frequently arbitrated defect in charterparty drafting.',
            remediation:
              'State laytime in running hours, define notice of readiness, and specify which periods are excepted.',
            authority: 'Laytime Definitions for Charter Parties 2013 (BIMCO, CMI, FONASBA, Baltic Exchange)',
          }
        : null,
  },
  {
    id: 'demurrage-undefined',
    clauseId: 'demurrage',
    weight: 1,
    appliesTo: (c) => MARITIME_TYPES.has(c.type),
    evaluate: (c) =>
      !c.demurrageRateUsd
        ? {
            severity: 'high',
            code: 'demurrage-undefined',
            title: 'Demurrage rate unstated',
            detail:
              'Without an agreed rate, delay is recoverable only as damages for detention, which is harder to prove and slower to recover.',
            remediation:
              'State a daily demurrage rate, payable pro rata, with an express time bar for claims.',
          }
        : null,
  },

  // --- Category-specific ---------------------------------------------------
  {
    id: 'nda-term-short',
    clauseId: 'nda-term',
    weight: 0.8,
    appliesTo: (c) => c.type === 'nda',
    evaluate: (c) =>
      c.confidentialityYears && c.confidentialityYears < 2
        ? {
            code: 'nda-term-short',
            severity: 'medium',
            params: { years: c.confidentialityYears },
            title: 'Confidentiality period is short',
            detail: `Protection ends ${c.confidentialityYears} year(s) after disclosure. Information that keeps its value longer, such as pricing, customer data or know-how, falls into the public domain for contractual purposes once the period expires.`,
            remediation:
              'Extend the period to at least 2–5 years, and keep trade secrets protected for as long as they remain secret.',
          }
        : null,
  },
  {
    id: 'agency-mandatory-law',
    clauseId: 'agency-law',
    weight: 0.8,
    appliesTo: (c) => c.type === 'agency',
    evaluate: () => ({
      code: 'agency-mandatory-law',
      severity: 'medium',
      title: 'Commercial agency law of the territory is mandatory',
      detail:
        'GCC commercial agency statutes apply regardless of the chosen law and forum. They typically require the agency to be registered with the ministry of commerce and can entitle the agent to compensation where the principal terminates or declines to renew without justification.',
      remediation:
        'Confirm the registration requirements and the termination and compensation rules of the territory before signature, and price the exit accordingly.',
      authority:
        'Kuwait Law No. 13 of 2016 on Commercial Agencies; UAE Federal Law No. 3 of 2022 Regulating Commercial Agencies',
    }),
  },
  {
    id: 'lease-law-not-situs',
    clauseId: 'governing-law',
    weight: 1,
    appliesTo: (c) => c.type === 'lease' && c.counterpartyJurisdiction !== 'XX',
    evaluate: (c) =>
      c.governingLaw !== c.counterpartyJurisdiction
        ? {
            code: 'lease-law-not-situs',
            severity: 'high',
            title: 'Governing law differs from the location of the premises',
            detail:
              'Leases of immovable property are governed by the law of the place where the property is located, and its tenancy legislation applies mandatorily. A different governing law is unlikely to be given effect on matters such as rent, renewal and eviction.',
            remediation:
              'Choose the law of the country where the premises are located.',
          }
        : null,
  },
  {
    id: 'lease-arbitration',
    clauseId: 'dispute-resolution',
    weight: 0.8,
    appliesTo: (c) => c.type === 'lease',
    evaluate: (c) =>
      c.disputeForum.startsWith('arbitration')
        ? {
            code: 'lease-arbitration',
            severity: 'medium',
            title: 'Tenancy disputes may not be arbitrable',
            detail:
              'In several Gulf jurisdictions tenancy disputes are reserved to the local courts or to specialised rental dispute bodies, so an arbitration clause in a lease may be unenforceable for core landlord-and-tenant claims.',
            remediation:
              'Refer disputes to the competent courts or rental dispute authority of the place where the premises are located.',
          }
        : null,
  },
  {
    id: 'employment-mandatory-law',
    clauseId: 'labour-law',
    weight: 0.8,
    appliesTo: (c) => c.type === 'employment',
    evaluate: () => ({
      code: 'employment-mandatory-law',
      severity: 'medium',
      title: 'Labour law of the place of work is mandatory',
      detail:
        'Probation, working hours, leave, notice and end-of-service benefits are fixed by the labour law of the place of work as minimum standards. Terms less favourable to the employee are void, whatever law the contract chooses.',
      remediation:
        'Fill Schedule 1 (salary, probation, notice, leave) at or above the statutory minimums of the place of work, and check any required registration or approval of the contract.',
      authority:
        'Kuwait Law No. 6 of 2010 on Labour in the Private Sector; UAE Federal Decree-Law No. 33 of 2021 on the Regulation of Labour Relations',
    }),
  },
  {
    id: 'employment-arbitration',
    clauseId: 'dispute-resolution',
    weight: 1,
    appliesTo: (c) => c.type === 'employment',
    evaluate: (c) =>
      c.disputeForum.startsWith('arbitration')
        ? {
            code: 'employment-arbitration',
            severity: 'high',
            title: 'Employment disputes are generally not arbitrable',
            detail:
              'Labour disputes in the Gulf follow a statutory route through the labour authority and the labour courts. An arbitration clause is unlikely to bind the employee.',
            remediation:
              'Refer disputes to the competent labour authority and courts of the place of work.',
          }
        : null,
  },
  {
    id: 'mou-binding-risk',
    clauseId: 'non-binding',
    weight: 0.6,
    appliesTo: (c) => c.type === 'mou',
    evaluate: () => ({
      code: 'mou-binding-risk',
      severity: 'low',
      title: 'An MoU can become binding by its content',
      detail:
        'In civil-law jurisdictions a court looks at substance, not title: a document recording agreement on the essential terms may be treated as a binding contract despite being called a memorandum.',
      remediation:
        'Keep commercial terms indicative, state expressly that they are subject to a definitive agreement, and avoid conduct that implements the transaction before signature.',
    }),
  },
  {
    id: 'settlement-enforcement',
    clauseId: 'proceedings',
    weight: 0.6,
    appliesTo: (c) => c.type === 'settlement',
    evaluate: () => ({
      code: 'settlement-enforcement',
      severity: 'low',
      title: 'Make the settlement directly enforceable',
      detail:
        'A private settlement is a contract: if the paying party defaults, the other must sue on it. Where proceedings are pending, recording the settlement before the court or tribunal can give it executory force.',
      remediation:
        'Where local procedure allows, have the settlement recorded or ratified by the court or tribunal hearing the dispute, or embodied in a consent award.',
    }),
  },
  {
    id: 'construction-decennial',
    clauseId: 'decennial-liability',
    weight: 0.8,
    appliesTo: (c) => c.type === 'construction',
    evaluate: () => ({
      code: 'construction-decennial',
      severity: 'medium',
      title: 'Decennial liability cannot be excluded or capped',
      detail:
        "The contractor and the engineer are jointly liable for ten years for collapse of the building and for defects threatening its stability, and any agreement excluding or limiting that liability is void. The contract's liability cap does not reach it.",
      remediation:
        "Price the ten-year exposure, confirm the contractor's and designer's professional indemnity cover, and keep the carve-out in the limitation clause.",
      authority:
        'Kuwait Civil Code, Arts 692–697; UAE Civil Transactions Law (Federal Decree-Law No. 25 of 2025), Arts 821–824 (formerly Federal Law No. 5 of 1985, Arts 880–883)',
    }),
  },
  {
    id: 'construction-delay-damages',
    clauseId: 'delay-damages',
    weight: 0.6,
    appliesTo: (c) => c.type === 'construction',
    evaluate: () => ({
      code: 'construction-delay-damages',
      severity: 'low',
      title: 'Agreed delay damages may be adjusted by the court',
      detail:
        'Under the civil codes of the region agreed compensation is not due where no loss is suffered, and the court may reduce it where it is grossly exaggerated. A rate set far above the likely loss may not be enforced as written.',
      remediation:
        'Set the daily rate and the cap by reference to a genuine estimate of the loss from delay, and record the basis of that estimate.',
      authority:
        'Kuwait Civil Code, Art. 303; UAE Civil Transactions Law (Federal Decree-Law No. 25 of 2025), Art. 340 (formerly Art. 390)',
    }),
  },
  {
    id: 'construction-time-undefined',
    clauseId: 'time-for-completion',
    weight: 1,
    appliesTo: (c) => c.type === 'construction',
    evaluate: (c) =>
      !c.completionMonths
        ? {
            code: 'construction-time-undefined',
            severity: 'high',
            title: 'Time for completion not stated',
            detail:
              'Without a stated time for completion, delay damages cannot run and the employer has no fixed date against which to measure late performance.',
            remediation: 'State the time for completion as a period from the commencement date.',
          }
        : null,
  },
  {
    id: 'property-registration',
    clauseId: 'transfer-registration',
    weight: 0.8,
    appliesTo: (c) => c.type === 'property-sale',
    evaluate: () => ({
      code: 'property-registration',
      severity: 'medium',
      title: 'Title passes only on registration',
      detail:
        'Ownership of real property passes only when the sale is registered with the competent real estate registry. Until then the contract creates personal obligations only, and a later registered buyer or creditor may take priority.',
      remediation:
        'Fix the registration date, hold the balance of the price until registration, and search the register for mortgages and attachments immediately before signing.',
      authority: 'Kuwait Law No. 5 of 1959 on Real Estate Registration',
    }),
  },
  {
    id: 'property-law-not-situs',
    clauseId: 'governing-law',
    weight: 1,
    appliesTo: (c) => c.type === 'property-sale' && c.counterpartyJurisdiction !== 'XX',
    evaluate: (c) =>
      c.governingLaw !== c.counterpartyJurisdiction
        ? {
            code: 'property-law-not-situs',
            severity: 'high',
            title: 'Governing law differs from the location of the property',
            detail:
              'Transfer of ownership of real property is governed by the law of the place where the property is located, which also determines registration formalities and who may own it.',
            remediation: 'Choose the law of the country where the property is located.',
          }
        : null,
  },
  {
    id: 'property-foreign-ownership',
    clauseId: 'transfer-registration',
    weight: 0.6,
    appliesTo: (c) => c.type === 'property-sale',
    evaluate: () => ({
      code: 'property-foreign-ownership',
      severity: 'low',
      title: 'Check that the buyer may own the property',
      detail:
        'Several Gulf states restrict ownership of real property by foreign nationals and by companies with foreign shareholders, or confine it to designated areas.',
      remediation:
        "Confirm the buyer's eligibility and obtain any required approval before paying the deposit, and make the sale conditional on it.",
      authority:
        'Kuwait Decree-Law No. 74 of 1979 on Real Estate Ownership by Non-Kuwaitis, as amended by Decree-Law No. 7 of 2025',
    }),
  },
];

/** Number of rules in the model -- shown on the landing page. */
export const RULE_COUNT = RULES.length;

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

    findings.push({
      id: rule.id,
      clauseId: rule.clauseId,
      clause: clauseHeading(rule.clauseId, 'en'),
      ...probe,
    });
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
    // Nothing is assumed about the parties: unset until the user chooses.
    counterpartyJurisdiction: 'XX',
    disputeForum: 'arbitration-lcia',
    // No amount is suggested: the user types it.
    valueUsd: 0,
    currency: 'KWD',
    liabilityCapMultiple: 1,
    paymentTermsDays: 45,
    security: 'lc',
    hasForceMajeure: true,
    hasSanctionsClause: true,
    hasIndemnity: true,
    hasTerminationForConvenience: false,
    insuranceAllocated: true,
    confidentialityYears: 3,
    commissionPct: 5,
    leaseTermYears: 3,
    exclusivityMonths: 3,
    completionMonths: 18,
  };
}
