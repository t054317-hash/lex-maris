/**
 * Document assembly engine.
 *
 * Turns a validated `ContractInput` plus party details into an ordered list of
 * clauses. The same clause tree feeds three consumers:
 *
 *   1. the live preview in the builder wizard (rendered as HTML)
 *   2. the server-side PDF engine (see docs/ARCHITECTURE.md, Document Engine)
 *   3. the risk scanner, which annotates clauses by `clause` heading
 *
 * Keeping assembly declarative -- data in, clause tree out -- is what makes the
 * preview trustworthy: the PDF cannot drift from what the client approved.
 */

import type { ContractInput, ContractType } from './risk-engine';

export interface Party {
  name: string;
  /** Company number, CR number or equivalent registry identifier. */
  registrationNo: string;
  /** Registered address, single line. */
  address: string;
  /** ISO-3166 alpha-2. */
  jurisdiction: string;
}

export interface DocumentMeta {
  reference: string;
  executionDate: string;
  parties: { first: Party; second: Party };
}

export interface Clause {
  /** Stable id, used as the anchor target from risk findings. */
  id: string;
  number: string;
  heading: string;
  /** Paragraphs. Rendered as separate <p> / PDF blocks. */
  body: string[];
  /** True when the clause was omitted by the user's selections. */
  omitted?: boolean;
}

const TYPE_TITLES: Record<ContractType, string> = {
  supply: 'Agreement for the Supply of Goods',
  distribution: 'Exclusive Distribution Agreement',
  charterparty: 'Voyage Charterparty',
  'bill-of-lading': 'Contract of Carriage (Bill of Lading Terms)',
  shareholders: 'Shareholders Agreement',
  jv: 'Joint Venture Agreement',
};

const LAW_NAMES: Record<string, string> = {
  GB: 'the laws of England and Wales',
  AE: 'the laws of the United Arab Emirates',
  KW: 'the laws of the State of Kuwait',
  SA: 'the laws of the Kingdom of Saudi Arabia',
  SG: 'the laws of Singapore',
  US: 'the laws of the State of New York',
  CH: 'the laws of Switzerland',
  XX: '[GOVERNING LAW NOT SELECTED]',
};

const FORUM_TEXT: Record<ContractInput['disputeForum'], string> = {
  'local-courts':
    'the courts of the jurisdiction of the First Party shall have exclusive jurisdiction',
  'foreign-courts':
    'the courts of the jurisdiction of the Second Party shall have exclusive jurisdiction',
  'arbitration-lcia':
    'any dispute shall be referred to and finally resolved by arbitration under the LCIA Rules, seated in London, before three arbitrators, in the English language',
  'arbitration-icc':
    'any dispute shall be referred to and finally resolved by arbitration under the Rules of Arbitration of the International Chamber of Commerce, before three arbitrators, in the English language',
  'arbitration-difc':
    'any dispute shall be referred to and finally resolved by arbitration under the DIFC-LCIA Arbitration Rules, seated in the Dubai International Financial Centre, before three arbitrators, in the English language',
  'arbitration-adhoc':
    'any dispute shall be referred to ad hoc arbitration as the parties may agree at the relevant time',
  silent: '[DISPUTE RESOLUTION MECHANISM NOT SELECTED]',
};

const SECURITY_TEXT: Record<ContractInput['security'], string> = {
  lc: 'a confirmed irrevocable documentary letter of credit issued by a bank acceptable to the First Party and governed by UCP 600',
  'bank-guarantee':
    'an on-demand bank guarantee issued by an investment-grade bank acceptable to the First Party',
  'parent-guarantee':
    'a guarantee of the Second Party obligations executed by its ultimate parent undertaking',
  none: 'no security',
};

const money = (usd: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);

/**
 * Assembles the clause tree. Clause numbering is derived, never hand-written,
 * so omitting an optional clause renumbers the document automatically.
 */
export function assembleDocument(
  input: ContractInput,
  meta: DocumentMeta,
): { title: string; recitals: string[]; clauses: Clause[] } {
  const { first, second } = meta.parties;
  const isMaritime =
    input.type === 'charterparty' || input.type === 'bill-of-lading';

  const draft: Array<Omit<Clause, 'number'> | null> = [
    {
      id: 'definitions',
      heading: 'Definitions and Interpretation',
      body: [
        'In this Agreement, capitalised terms have the meanings given to them in Schedule 1. References to a statute include that statute as amended or re-enacted from time to time.',
        'Headings are for convenience only and do not affect the construction of this Agreement.',
      ],
    },
    {
      id: 'scope',
      heading: 'Scope of Agreement',
      body: [
        `The First Party shall provide, and the Second Party shall accept, the goods, services or vessel capacity described in Schedule 2, on and subject to the terms of this Agreement.`,
        `The aggregate value of this Agreement is ${money(input.valueUsd)} (the "Contract Value").`,
      ],
    },
    {
      id: 'payment',
      heading: 'Payment',
      body: [
        `The Second Party shall pay each valid invoice within ${input.paymentTermsDays} days of the date of invoice, in cleared funds, without set-off or deduction.`,
        input.paymentTermsDays > 60
          ? 'Sums not paid when due shall bear interest at 4% per annum above the applicable reference rate, accruing daily and compounding monthly, from the due date until payment.'
          : 'Sums not paid when due shall bear interest at the statutory rate from the due date until payment.',
      ],
    },
    input.security !== 'none'
      ? {
          id: 'security',
          heading: 'Security',
          body: [
            `As a condition precedent to the First Party performance obligations, the Second Party shall procure and maintain ${SECURITY_TEXT[input.security]} in an amount not less than the Contract Value.`,
          ],
        }
      : null,
    isMaritime
      ? {
          id: 'laytime',
          heading: 'Laytime',
          body: [
            input.laytimeHours
              ? `Laytime for loading and discharging shall be ${input.laytimeHours} running hours in total, weather permitting, Sundays and holidays excepted, commencing upon tender of a valid Notice of Readiness.`
              : '[LAYTIME NOT SPECIFIED - demurrage cannot accrue until laytime is defined.]',
          ],
        }
      : null,
    isMaritime
      ? {
          id: 'demurrage',
          heading: 'Demurrage',
          body: [
            input.demurrageRateUsd
              ? `Demurrage shall accrue at ${money(input.demurrageRateUsd)} per day, or pro rata for part of a day, for all time by which laytime is exceeded. Claims for demurrage shall be time-barred unless presented with supporting documents within 90 days of completion of discharge.`
              : '[DEMURRAGE RATE NOT SPECIFIED - delay recoverable only as damages for detention.]',
          ],
        }
      : null,
    {
      id: 'insurance',
      heading: 'Insurance',
      body: [
        input.insuranceAllocated
          ? 'The party bearing risk in the goods under the applicable Incoterm shall maintain cargo insurance on Institute Cargo Clauses (A) terms for not less than 110% of the CIF value, naming the other party as loss payee to the extent of its interest.'
          : '[INSURANCE RESPONSIBILITY NOT ALLOCATED - cover defaults to whichever party bears risk under the applicable Incoterm.]',
      ],
    },
    {
      id: 'liability',
      heading: 'Limitation of Liability',
      body: [
        input.liabilityCapMultiple > 0
          ? `Subject to the following paragraph, the aggregate liability of each party under or in connection with this Agreement shall not exceed ${money(input.valueUsd * input.liabilityCapMultiple)}, being ${input.liabilityCapMultiple}x the Contract Value.`
          : 'The liability of the parties under this Agreement is not limited. [UNCAPPED - review before execution.]',
        'Nothing in this Agreement limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for any liability that cannot lawfully be limited.',
        'Neither party shall be liable for loss of profit, loss of business or any indirect or consequential loss, in each case whether or not foreseeable.',
      ],
    },
    input.hasIndemnity
      ? {
          id: 'indemnity',
          heading: 'Indemnities',
          body: [
            'Each party shall indemnify the other against all losses, liabilities, costs and expenses arising out of any third-party claim that the indemnifying party has infringed that third party intellectual property rights, or has caused damage to property or the environment.',
            'The indemnified party shall notify the indemnifying party promptly of any claim, and shall not settle it without prior written consent.',
          ],
        }
      : null,
    input.hasForceMajeure
      ? {
          id: 'force-majeure',
          heading: 'Force Majeure',
          body: [
            'Neither party shall be liable for any failure or delay in performance to the extent caused by an event beyond its reasonable control, including act of God, war, civil commotion, port closure, embargo, epidemic or governmental action.',
            'The affected party shall give notice within five business days, shall use reasonable endeavours to mitigate, and shall resume performance as soon as practicable.',
            'If the event continues for more than 60 consecutive days, either party may terminate this Agreement on written notice without liability, save for accrued rights.',
          ],
        }
      : null,
    input.hasSanctionsClause
      ? {
          id: 'sanctions',
          heading: 'Sanctions and Trade Controls',
          body: [
            'Each party represents and warrants that neither it, nor any of its affiliates, directors or beneficial owners, is a Restricted Party, and that it will not use, resell or transfer anything supplied under this Agreement in breach of applicable sanctions or export-control laws.',
            'Each party shall screen its counterparties, vessels and end-users against the applicable restricted-party lists on an ongoing basis.',
            'Notwithstanding any other provision, a party may suspend or terminate performance immediately and without liability where performance would expose it to a sanctions risk.',
          ],
        }
      : null,
    {
      id: 'termination',
      heading: 'Termination',
      body: [
        'Either party may terminate this Agreement immediately on written notice if the other commits a material breach that it fails to remedy within 30 days of notice, or suffers an insolvency event.',
        input.hasTerminationForConvenience
          ? 'Either party may additionally terminate this Agreement for convenience on 90 days written notice given after the first anniversary of the date of this Agreement, subject to payment of the break fee set out in Schedule 3.'
          : 'There is no right to terminate for convenience.',
      ],
    },
    {
      id: 'confidentiality',
      heading: 'Confidentiality',
      body: [
        'Each party shall keep confidential all information disclosed by the other that is marked confidential or would reasonably be understood to be confidential, and shall use it only for the purposes of this Agreement.',
        'The obligation survives termination for a period of five years.',
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing Law',
      body: [
        `This Agreement and any dispute arising out of or in connection with it shall be governed by and construed in accordance with ${LAW_NAMES[input.governingLaw] ?? `the laws of ${input.governingLaw}`}.`,
      ],
    },
    {
      id: 'dispute-resolution',
      heading: 'Dispute Resolution',
      body: [
        `The parties agree that ${FORUM_TEXT[input.disputeForum]}.`,
        'Nothing in this clause prevents either party from seeking interim or conservatory relief from any court of competent jurisdiction.',
      ],
    },
    {
      id: 'execution',
      heading: 'Execution',
      body: [
        'This Agreement may be executed in counterparts and by electronic signature, each of which shall constitute an original and all of which together shall constitute one and the same instrument.',
        'The parties agree that an electronic signature applied through the platform, together with the associated audit record and document hash, satisfies any requirement for signature in writing.',
      ],
    },
  ];

  const clauses: Clause[] = draft
    .filter((c): c is Omit<Clause, 'number'> => c !== null)
    .map((c, i) => ({ ...c, number: String(i + 1) }));

  return {
    title: TYPE_TITLES[input.type],
    recitals: [
      `THIS AGREEMENT is dated ${meta.executionDate} and made under reference ${meta.reference}.`,
      `(1) ${first.name.toUpperCase()}, a company registered in ${first.jurisdiction} under number ${first.registrationNo}, whose registered office is at ${first.address} (the "First Party"); and`,
      `(2) ${second.name.toUpperCase()}, a company registered in ${second.jurisdiction} under number ${second.registrationNo}, whose registered office is at ${second.address} (the "Second Party").`,
      'IT IS AGREED as follows:',
    ],
    clauses,
  };
}
