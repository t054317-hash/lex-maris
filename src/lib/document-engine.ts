/**
 * Document assembly engine.
 *
 * Turns a validated `ContractInput` plus party details into an ordered list of
 * clauses. The same clause tree feeds three consumers:
 *
 *   1. the live preview in the builder wizard (rendered as HTML)
 *   2. the server-side PDF engine (see docs/ARCHITECTURE.md, Document Engine)
 *   3. the risk scanner, which annotates clauses by `clauseId`
 *
 * Keeping assembly declarative -- data in, clause tree out -- is what makes the
 * preview trustworthy: the PDF cannot drift from what the client approved.
 *
 * The instrument is drafted in the reader's language. Every locale carries a
 * complete clause text table below; the STRUCTURE (which clauses appear, in
 * which order, with which numbers) is decided once, above the tables, so the
 * English, Arabic and French drafts of the same input are always the same
 * contract. A native legal reviewer should read the Arabic and French before
 * either is used as an executed version.
 */

import { NUMBER_LOCALE, type Locale } from '@/i18n/config';
import type { ContractInput, ContractType, DisputeForum, Security } from './risk-engine';
import { CATEGORY_TEXT, type CategoryClauseId } from './document-categories';

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
  /** ISO date (YYYY-MM-DD). Formatted per locale; a non-ISO string is used as-is. */
  executionDate: string;
  parties: { first: Party; second: Party };
}

export type CoreClauseId =
  | 'definitions'
  | 'scope'
  | 'payment'
  | 'security'
  | 'laytime'
  | 'demurrage'
  | 'insurance'
  | 'liability'
  | 'indemnity'
  | 'force-majeure'
  | 'sanctions'
  | 'termination'
  | 'confidentiality'
  | 'governing-law'
  | 'dispute-resolution'
  | 'execution';

export type ClauseId = CoreClauseId | CategoryClauseId;

export interface Clause {
  /** Stable id, used as the anchor target from risk findings. */
  id: ClauseId;
  number: string;
  heading: string;
  /** Paragraphs. Rendered as separate <p> / PDF blocks. */
  body: string[];
  /** True when the clause was omitted by the user's selections. */
  omitted?: boolean;
}

export interface AssembledDocument {
  locale: Locale;
  title: string;
  recitals: string[];
  clauses: Clause[];
}

/* -------------------------------------------------------------------------- */
/* Locale text tables                                                         */
/* -------------------------------------------------------------------------- */

interface Fmt {
  money: (usd: number) => string;
  num: (n: number) => string;
}

interface DocText {
  typeTitles: Record<ContractType, string>;
  headings: Record<CoreClauseId, string>;
  lawNames: Record<string, string>;
  lawFallback: (code: string) => string;
  /** Country as it reads after "registered in". */
  registeredIn: (code: string) => string;
  forum: Record<DisputeForum, string>;
  security: Record<Exclude<Security, 'none'>, string>;
  recitals: (a: {
    date: string;
    reference: string;
    first: Party;
    second: Party;
    /** Second party is a natural person (the employee), not a company. */
    individualSecond?: boolean;
  }) => string[];
  body: {
    definitions: string[];
    scope: (value: string) => string[];
    payment: (days: number, contractualInterest: boolean) => string[];
    security: (instrument: string) => string[];
    laytime: (hours: number | undefined) => string[];
    demurrage: (rate: string | null) => string[];
    insurance: (allocated: boolean) => string[];
    liability: (cap: { amount: string; multiple: string } | null) => string[];
    indemnity: string[];
    forceMajeure: string[];
    sanctions: string[];
    termination: (convenience: boolean) => string[];
    confidentiality: string[];
    governingLaw: (law: string) => string[];
    dispute: (forum: string) => string[];
    execution: string[];
  };
}

const COUNTRY: Record<Locale, Record<string, string>> = {
  en: {
    AE: 'the United Arab Emirates',
    KW: 'the State of Kuwait',
    SA: 'the Kingdom of Saudi Arabia',
    QA: 'the State of Qatar',
    GB: 'England and Wales',
    SG: 'Singapore',
    TW: 'Taiwan',
    US: 'the United States',
    CH: 'Switzerland',
    XX: '[jurisdiction of registration]',
  },
  ar: {
    AE: 'دولة الإمارات العربية المتحدة',
    KW: 'دولة الكويت',
    SA: 'المملكة العربية السعودية',
    QA: 'دولة قطر',
    GB: 'إنجلترا وويلز',
    SG: 'سنغافورة',
    TW: 'تايوان',
    US: 'الولايات المتحدة الأمريكية',
    CH: 'سويسرا',
    XX: '[دولة القيد]',
  },
  fr: {
    AE: 'aux Émirats arabes unis',
    KW: 'au Koweït',
    SA: 'en Arabie saoudite',
    QA: 'au Qatar',
    GB: 'en Angleterre et au pays de Galles',
    SG: 'à Singapour',
    TW: 'à Taïwan',
    US: 'aux États-Unis',
    CH: 'en Suisse',
    XX: "[lieu d'immatriculation]",
  },
};

const EN: DocText = {
  typeTitles: {
    supply: 'Agreement for the Supply of Goods',
    distribution: 'Exclusive Distribution Agreement',
    charterparty: 'Voyage Charterparty',
    'bill-of-lading': 'Contract of Carriage (Bill of Lading Terms)',
    shareholders: 'Shareholders Agreement',
    jv: 'Joint Venture Agreement',
    nda: 'Mutual Non-Disclosure Agreement',
    services: 'Services Agreement',
    agency: 'Commercial Agency Agreement',
    lease: 'Commercial Lease',
    licence: 'Software Licence Agreement',
    employment: 'Employment Contract',
    mou: 'Memorandum of Understanding',
    settlement: 'Settlement Agreement',
    construction: 'Construction Contract',
    'property-sale': 'Contract for the Sale of Real Property',
  },
  headings: {
    definitions: 'Definitions and Interpretation',
    scope: 'Scope of Agreement',
    payment: 'Payment',
    security: 'Security',
    laytime: 'Laytime',
    demurrage: 'Demurrage',
    insurance: 'Insurance',
    liability: 'Limitation of Liability',
    indemnity: 'Indemnities',
    'force-majeure': 'Force Majeure',
    sanctions: 'Sanctions and Trade Controls',
    termination: 'Termination',
    confidentiality: 'Confidentiality',
    'governing-law': 'Governing Law',
    'dispute-resolution': 'Dispute Resolution',
    execution: 'Execution',
  },
  lawNames: {
    GB: 'the laws of England and Wales',
    AE: 'the laws of the United Arab Emirates',
    KW: 'the laws of the State of Kuwait',
    SA: 'the laws of the Kingdom of Saudi Arabia',
    SG: 'the laws of Singapore',
    US: 'the laws of the State of New York',
    CH: 'the laws of Switzerland',
    XX: '[GOVERNING LAW NOT SELECTED]',
  },
  lawFallback: (code) => `the laws of ${code}`,
  registeredIn: (code) => COUNTRY.en[code] ?? code,
  forum: {
    'local-courts':
      'the courts of the jurisdiction of the First Party shall have exclusive jurisdiction',
    'foreign-courts':
      'the courts of the jurisdiction of the Second Party shall have exclusive jurisdiction',
    'arbitration-lcia':
      'any dispute shall be referred to and finally resolved by arbitration under the LCIA Rules, seated in London, before three arbitrators, in the English language',
    'arbitration-icc':
      'any dispute shall be referred to and finally resolved by arbitration under the Rules of Arbitration of the International Chamber of Commerce, before three arbitrators, in the English language',
    // The DIFC-LCIA Arbitration Centre was abolished by Dubai Decree No. 34
    // of 2021; its caseload passed to DIAC. The code keeps the old key for
    // stored briefs, but the clause names the institution that exists.
    'arbitration-difc':
      'any dispute shall be referred to and finally resolved by arbitration under the Arbitration Rules of the Dubai International Arbitration Centre (DIAC), seated in the Dubai International Financial Centre, before three arbitrators, in the English language',
    'arbitration-adhoc':
      'any dispute shall be referred to ad hoc arbitration as the parties may agree at the relevant time',
    silent: '[DISPUTE RESOLUTION MECHANISM NOT SELECTED]',
  },
  security: {
    lc: 'a confirmed irrevocable documentary letter of credit issued by a bank acceptable to the First Party and governed by UCP 600',
    'bank-guarantee':
      'an on-demand bank guarantee issued by an investment-grade bank acceptable to the First Party',
    'parent-guarantee':
      'a guarantee of the Second Party obligations executed by its ultimate parent undertaking',
  },
  recitals: ({ date, reference, first, second, individualSecond }) => [
    `THIS AGREEMENT is dated ${date} and made under reference ${reference}.`,
    `(1) ${first.name.toUpperCase()}, a company registered in ${EN.registeredIn(first.jurisdiction)} under number ${first.registrationNo}, whose registered office is at ${first.address} (the "First Party"); and`,
    individualSecond
      ? `(2) ${second.name.toUpperCase()}, holder of identity document number ${second.registrationNo}, residing at ${second.address} (the "Second Party").`
      : `(2) ${second.name.toUpperCase()}, a company registered in ${EN.registeredIn(second.jurisdiction)} under number ${second.registrationNo}, whose registered office is at ${second.address} (the "Second Party").`,
    'IT IS AGREED as follows:',
  ],
  body: {
    definitions: [
      'In this Agreement, capitalised terms have the meanings given to them in Schedule 1. References to a statute include that statute as amended or re-enacted from time to time.',
      'Headings are for convenience only and do not affect the construction of this Agreement.',
    ],
    scope: (value) => [
      'The First Party shall provide, and the Second Party shall accept, the goods, services or vessel capacity described in Schedule 2, on and subject to the terms of this Agreement.',
      `The aggregate value of this Agreement is ${value} (the "Contract Value").`,
    ],
    payment: (days, contractualInterest) => [
      `The Second Party shall pay each valid invoice within ${days} days of the date of invoice, in cleared funds, without set-off or deduction.`,
      contractualInterest
        ? 'To the extent permitted by the governing law, sums not paid when due shall bear interest at 4% per annum above the applicable reference rate, accruing daily, from the due date until payment.'
        : 'To the extent permitted by the governing law, sums not paid when due shall bear interest at the statutory rate from the due date until payment.',
    ],
    security: (instrument) => [
      `As a condition precedent to the First Party performance obligations, the Second Party shall procure and maintain ${instrument} in an amount not less than the Contract Value.`,
    ],
    laytime: (hours) => [
      hours
        ? `Laytime for loading and discharging shall be ${hours} running hours in total, weather permitting, Sundays and holidays excepted, commencing upon tender of a valid Notice of Readiness.`
        : '[LAYTIME NOT SPECIFIED - demurrage cannot accrue until laytime is defined.]',
    ],
    demurrage: (rate) => [
      rate
        ? `Demurrage shall accrue at ${rate} per day, or pro rata for part of a day, for all time by which laytime is exceeded. Claims for demurrage shall be time-barred unless presented with supporting documents within 90 days of completion of discharge.`
        : '[DEMURRAGE RATE NOT SPECIFIED - delay recoverable only as damages for detention.]',
    ],
    insurance: (allocated) => [
      allocated
        ? 'The party bearing risk in the goods under the applicable Incoterm shall maintain cargo insurance on Institute Cargo Clauses (A) terms for not less than 110% of the CIF value, naming the other party as loss payee to the extent of its interest.'
        : '[INSURANCE RESPONSIBILITY NOT ALLOCATED - cover defaults to whichever party bears risk under the applicable Incoterm.]',
    ],
    liability: (cap) => [
      cap
        ? `Subject to the following paragraph, the aggregate liability of each party under or in connection with this Agreement shall not exceed ${cap.amount}, being ${cap.multiple}x the Contract Value.`
        : 'The liability of the parties under this Agreement is not limited. [UNCAPPED - review before execution.]',
      'Nothing in this Agreement limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for any liability that cannot lawfully be limited.',
      'Neither party shall be liable for loss of profit, loss of business or any indirect or consequential loss, in each case whether or not foreseeable.',
    ],
    indemnity: [
      'Each party shall indemnify the other against all losses, liabilities, costs and expenses arising out of any third-party claim that the indemnifying party has infringed that third party intellectual property rights, or has caused damage to property or the environment.',
      'The indemnified party shall notify the indemnifying party promptly of any claim, and shall not settle it without prior written consent.',
    ],
    forceMajeure: [
      'Neither party shall be liable for any failure or delay in performance to the extent caused by an event beyond its reasonable control, including act of God, war, civil commotion, port closure, embargo, epidemic or governmental action.',
      'The affected party shall give notice within five business days, shall use reasonable endeavours to mitigate, and shall resume performance as soon as practicable.',
      'If the event continues for more than 60 consecutive days, either party may terminate this Agreement on written notice without liability, save for accrued rights.',
    ],
    sanctions: [
      'Each party represents and warrants that neither it, nor any of its affiliates, directors or beneficial owners, is a Restricted Party, and that it will not use, resell or transfer anything supplied under this Agreement in breach of applicable sanctions or export-control laws.',
      'Each party shall screen its counterparties, vessels and end-users against the applicable restricted-party lists on an ongoing basis.',
      'Notwithstanding any other provision, a party may suspend or terminate performance immediately and without liability where performance would expose it to a sanctions risk.',
    ],
    termination: (convenience) => [
      'Either party may terminate this Agreement immediately on written notice if the other commits a material breach that it fails to remedy within 30 days of notice, or suffers an insolvency event.',
      convenience
        ? 'Either party may additionally terminate this Agreement for convenience on 90 days written notice given after the first anniversary of the date of this Agreement, subject to payment of the break fee set out in Schedule 3.'
        : 'There is no right to terminate for convenience.',
    ],
    confidentiality: [
      'Each party shall keep confidential all information disclosed by the other that is marked confidential or would reasonably be understood to be confidential, and shall use it only for the purposes of this Agreement.',
      'The obligation survives termination for a period of five years.',
    ],
    governingLaw: (law) => [
      `This Agreement and any dispute arising out of or in connection with it shall be governed by and construed in accordance with ${law}.`,
    ],
    dispute: (forum) => [
      `The parties agree that ${forum}.`,
      'Nothing in this clause prevents either party from seeking interim or conservatory relief from any court of competent jurisdiction.',
    ],
    execution: [
      'This Agreement may be executed in counterparts and by electronic signature, each of which shall constitute an original and all of which together shall constitute one and the same instrument.',
      'To the extent permitted by applicable law, the parties agree that an electronic signature satisfies any requirement for signature in writing. Where the law requires a particular form, notarisation or wet-ink signature, that requirement shall be complied with.',
    ],
  },
};

const AR: DocText = {
  typeTitles: {
    supply: 'اتفاقية توريد بضائع',
    distribution: 'اتفاقية توزيع حصري',
    charterparty: 'مشارطة إيجار سفينة بالرحلة',
    'bill-of-lading': 'عقد نقل بحري (شروط سند الشحن)',
    shareholders: 'اتفاقية مساهمين',
    jv: 'اتفاقية مشروع مشترك',
    nda: 'اتفاقية عدم إفصاح متبادلة',
    services: 'اتفاقية تقديم خدمات',
    agency: 'عقد وكالة تجارية',
    lease: 'عقد إيجار تجاري',
    licence: 'اتفاقية ترخيص برمجيات',
    employment: 'عقد عمل',
    mou: 'مذكرة تفاهم',
    settlement: 'اتفاقية تسوية (صلح)',
    construction: 'عقد مقاولة',
    'property-sale': 'عقد بيع عقار',
  },
  headings: {
    definitions: 'التعريفات والتفسير',
    scope: 'نطاق الاتفاقية',
    payment: 'الدفع',
    security: 'الضمانات',
    laytime: 'مدة التحميل والتفريغ',
    demurrage: 'غرامة التأخير',
    insurance: 'التأمين',
    liability: 'تحديد المسؤولية',
    indemnity: 'التعويضات',
    'force-majeure': 'القوة القاهرة',
    sanctions: 'العقوبات وضوابط التجارة',
    termination: 'الإنهاء',
    confidentiality: 'السرية',
    'governing-law': 'القانون الواجب التطبيق',
    'dispute-resolution': 'تسوية النزاعات',
    execution: 'التوقيع والنفاذ',
  },
  lawNames: {
    GB: 'قوانين إنجلترا وويلز',
    AE: 'قوانين دولة الإمارات العربية المتحدة',
    KW: 'قوانين دولة الكويت',
    SA: 'أنظمة المملكة العربية السعودية',
    SG: 'قوانين سنغافورة',
    US: 'قوانين ولاية نيويورك',
    CH: 'قوانين سويسرا',
    XX: '[لم يُحدَّد القانون الواجب التطبيق]',
  },
  lawFallback: (code) => `قوانين ${code}`,
  registeredIn: (code) => COUNTRY.ar[code] ?? code,
  forum: {
    'local-courts': 'تختص محاكم دولة الطرف الأول اختصاصاً حصرياً بنظر أي نزاع',
    'foreign-courts': 'تختص محاكم دولة الطرف الثاني اختصاصاً حصرياً بنظر أي نزاع',
    'arbitration-lcia':
      'يُحال أي نزاع إلى التحكيم ويُفصل فيه نهائياً وفقاً لقواعد محكمة لندن للتحكيم الدولي (LCIA)، ويكون مقر التحكيم مدينة لندن، أمام هيئة من ثلاثة محكّمين، وتكون لغة التحكيم الإنجليزية',
    'arbitration-icc':
      'يُحال أي نزاع إلى التحكيم ويُفصل فيه نهائياً وفقاً لقواعد التحكيم لدى غرفة التجارة الدولية (ICC)، أمام هيئة من ثلاثة محكّمين، وتكون لغة التحكيم الإنجليزية',
    'arbitration-difc':
      'يُحال أي نزاع إلى التحكيم ويُفصل فيه نهائياً وفقاً لقواعد التحكيم لدى مركز دبي للتحكيم الدولي (DIAC)، ويكون مقر التحكيم مركز دبي المالي العالمي، أمام هيئة من ثلاثة محكّمين، وتكون لغة التحكيم الإنجليزية',
    'arbitration-adhoc':
      'يُحال أي نزاع إلى تحكيم حرّ (غير مؤسسي) وفقاً لما قد يتفق عليه الطرفان في حينه',
    silent: '[لم تُحدَّد آلية تسوية النزاعات]',
  },
  security: {
    lc: 'خطاب اعتماد مستندي معزَّز وغير قابل للإلغاء، صادر عن بنك يقبله الطرف الأول وخاضع للأصول والأعراف الموحّدة للاعتمادات المستندية (UCP 600)',
    'bank-guarantee':
      'خطاب ضمان بنكي واجب الدفع عند أول طلب، صادر عن بنك ذي تصنيف استثماري يقبله الطرف الأول',
    'parent-guarantee':
      'كفالة لالتزامات الطرف الثاني صادرة عن الشركة الأم النهائية التابع لها',
  },
  recitals: ({ date, reference, first, second, individualSecond }) => [
    `حُرّرت هذه الاتفاقية بتاريخ ${date} تحت المرجع رقم ${reference}، بين كلٍّ من:`,
    `(1) ${first.name}، شركة مسجّلة في ${AR.registeredIn(first.jurisdiction)} تحت رقم ${first.registrationNo}، ويقع مكتبها المسجّل في ${first.address} (ويُشار إليها فيما يلي بـ«الطرف الأول»)؛ و`,
    individualSecond
      ? `(2) ${second.name}، حامل وثيقة الهوية رقم ${second.registrationNo}، والمقيم في ${second.address} (ويُشار إليه فيما يلي بـ«الطرف الثاني»).`
      : `(2) ${second.name}، شركة مسجّلة في ${AR.registeredIn(second.jurisdiction)} تحت رقم ${second.registrationNo}، ويقع مكتبها المسجّل في ${second.address} (ويُشار إليها فيما يلي بـ«الطرف الثاني»).`,
    'وقد اتفق الطرفان على ما يلي:',
  ],
  body: {
    definitions: [
      'في هذه الاتفاقية، تكون للمصطلحات المعرَّفة المعاني المحددة لها في الملحق رقم (1). وتشمل الإشارة إلى أي تشريع ذلك التشريع بصيغته المعدَّلة أو المعاد إصداره من وقت لآخر.',
      'وُضعت العناوين للتيسير فقط، ولا أثر لها في تفسير هذه الاتفاقية.',
    ],
    scope: (value) => [
      'يلتزم الطرف الأول بتقديم البضائع أو الخدمات أو السعة الناقلة للسفينة المبيّنة في الملحق رقم (2)، ويلتزم الطرف الثاني بقبولها، وذلك وفقاً لأحكام هذه الاتفاقية وشروطها.',
      `تبلغ القيمة الإجمالية لهذه الاتفاقية ${value} (ويُشار إليها فيما يلي بـ«قيمة العقد»).`,
    ],
    payment: (days, contractualInterest) => [
      `يلتزم الطرف الثاني بسداد كل فاتورة صحيحة خلال ${days} يوماً من تاريخ إصدارها، بأموال محصَّلة، ودون أي مقاصة أو خصم.`,
      contractualInterest
        ? 'في الحدود التي يُجيزها القانون الواجب التطبيق، تستحق على المبالغ غير المسدَّدة في مواعيد استحقاقها فائدة بنسبة 4% سنوياً فوق السعر المرجعي المطبَّق، تُحتسب يومياً، من تاريخ الاستحقاق حتى تمام السداد.'
        : 'في الحدود التي يُجيزها القانون الواجب التطبيق، تستحق على المبالغ غير المسدَّدة في مواعيد استحقاقها الفائدة القانونية من تاريخ الاستحقاق حتى تمام السداد.',
    ],
    security: (instrument) => [
      `كشرط مسبق لالتزامات الطرف الأول بالتنفيذ، يلتزم الطرف الثاني بتقديم ${instrument} والمحافظة على سريانه، بمبلغ لا يقل عن قيمة العقد.`,
    ],
    laytime: (hours) => [
      hours
        ? `تكون مدة التحميل والتفريغ ${hours} ساعة متواصلة إجمالاً، إذا سمحت الأحوال الجوية، باستثناء أيام الأحد والعطلات الرسمية، وتبدأ من تاريخ تقديم إشعار جاهزية صحيح.`
        : '[لم تُحدَّد مدة التحميل والتفريغ — لا تستحق غرامة التأخير ما لم تُحدَّد هذه المدة.]',
    ],
    demurrage: (rate) => [
      rate
        ? `تستحق غرامة التأخير بواقع ${rate} عن كل يوم، أو بنسبة جزء اليوم، عن كامل الوقت الذي تتجاوز فيه مدة التحميل والتفريغ المتفق عليها. وتسقط المطالبات بغرامة التأخير ما لم تُقدَّم مشفوعة بالمستندات المؤيدة لها خلال 90 يوماً من تاريخ إتمام التفريغ.`
        : '[لم يُحدَّد سعر غرامة التأخير — لا يُسترد التأخير إلا بوصفه تعويضاً عن الاحتجاز.]',
    ],
    insurance: (allocated) => [
      allocated
        ? 'يلتزم الطرف الذي يتحمّل مخاطر البضائع وفقاً لقاعدة الإنكوترمز المطبَّقة بالتأمين على البضائع وفق شروط معهد لندن للبضائع (A) بمبلغ لا يقل عن 110% من قيمتها وفق شرط CIF، مع تسمية الطرف الآخر مستفيداً من التعويض في حدود مصلحته.'
        : '[لم تُحدَّد مسؤولية التأمين — يقع التأمين على الطرف الذي يتحمّل المخاطر بموجب قاعدة الإنكوترمز المطبَّقة.]',
    ],
    liability: (cap) => [
      cap
        ? `مع مراعاة الفقرة التالية، لا تتجاوز المسؤولية الإجمالية لأيٍّ من الطرفين بموجب هذه الاتفاقية أو فيما يتصل بها مبلغ ${cap.amount}، أي ما يعادل ${cap.multiple} ضعف قيمة العقد.`
        : 'مسؤولية الطرفين بموجب هذه الاتفاقية غير محدودة. [مسؤولية غير محدودة — تجب المراجعة قبل التوقيع.]',
      'ليس في هذه الاتفاقية ما يحدّ من المسؤولية عن الوفاة أو الإصابة الشخصية الناتجة عن الإهمال، أو عن الغش أو التدليس، أو عن أي مسؤولية لا يجوز قانوناً الحدّ منها.',
      'لا يكون أيٌّ من الطرفين مسؤولاً عن فوات الربح أو خسارة الأعمال أو أي خسارة غير مباشرة أو تبعية، سواء أكانت متوقَّعة أم غير متوقَّعة.',
    ],
    indemnity: [
      'يلتزم كل طرف بتعويض الطرف الآخر عن جميع الخسائر والالتزامات والتكاليف والمصروفات الناشئة عن أي مطالبة من الغير بأن الطرف الملتزم بالتعويض قد تعدّى على حقوق الملكية الفكرية لذلك الغير، أو تسبّب في ضرر بالممتلكات أو بالبيئة.',
      'يلتزم الطرف المستحق للتعويض بإخطار الطرف الملتزم به فوراً بأي مطالبة، ولا يجوز له تسويتها دون موافقة كتابية مسبقة.',
    ],
    forceMajeure: [
      'لا يكون أيٌّ من الطرفين مسؤولاً عن أي إخفاق أو تأخير في التنفيذ بقدر ما يكون ناتجاً عن حدث خارج عن سيطرته المعقولة، بما في ذلك الكوارث الطبيعية والحرب والاضطرابات الأهلية وإغلاق الموانئ والحظر والأوبئة والإجراءات الحكومية.',
      'يلتزم الطرف المتأثر بتوجيه إخطار خلال خمسة أيام عمل، وببذل المساعي المعقولة للتخفيف من الآثار، وباستئناف التنفيذ في أقرب وقت ممكن عملياً.',
      'إذا استمر الحدث أكثر من 60 يوماً متتالية، جاز لأيٍّ من الطرفين إنهاء هذه الاتفاقية بإخطار كتابي دون مسؤولية، مع عدم الإخلال بالحقوق المكتسبة.',
    ],
    sanctions: [
      'يقرّ كل طرف ويضمن أنه ليس طرفاً محظوراً، ولا أيٌّ من الشركات التابعة له أو مديريه أو مالكيه المستفيدين، وأنه لن يستخدم أي شيء مورَّد بموجب هذه الاتفاقية أو يعيد بيعه أو ينقله بما يخالف قوانين العقوبات أو ضوابط التصدير المعمول بها.',
      'يلتزم كل طرف بفحص الأطراف المتعاملة معه والسفن والمستخدمين النهائيين مقابل قوائم الأطراف المحظورة المعمول بها بصورة مستمرة.',
      'على الرغم من أي حكم آخر، يجوز لأي طرف تعليق التنفيذ أو إنهاؤه فوراً ودون مسؤولية متى كان من شأن التنفيذ تعريضه لمخاطر العقوبات.',
    ],
    termination: (convenience) => [
      'يجوز لأيٍّ من الطرفين إنهاء هذه الاتفاقية فوراً بإخطار كتابي إذا ارتكب الطرف الآخر إخلالاً جوهرياً ولم يعالجه خلال 30 يوماً من إخطاره بذلك، أو إذا تعرّض لحالة إعسار.',
      convenience
        ? 'يجوز لأيٍّ من الطرفين كذلك إنهاء هذه الاتفاقية للملاءمة بموجب إخطار كتابي مدته 90 يوماً يُوجَّه بعد انقضاء السنة الأولى من تاريخ هذه الاتفاقية، مقابل سداد رسم الإنهاء المحدد في الملحق رقم (3).'
        : 'لا يجوز إنهاء هذه الاتفاقية للملاءمة.',
    ],
    confidentiality: [
      'يلتزم كل طرف بالمحافظة على سرية جميع المعلومات التي يفصح عنها الطرف الآخر والمصنَّفة سرية أو التي يُفهم بصورة معقولة أنها سرية، وألا يستخدمها إلا لأغراض هذه الاتفاقية.',
      'يستمر هذا الالتزام بعد انتهاء الاتفاقية لمدة خمس سنوات.',
    ],
    governingLaw: (law) => [
      `تخضع هذه الاتفاقية وأي نزاع ينشأ عنها أو يتصل بها لأحكام ${law}، وتُفسَّر وفقاً لها.`,
    ],
    dispute: (forum) => [
      `اتفق الطرفان على أن ${forum}.`,
      'ليس في هذا البند ما يمنع أياً من الطرفين من طلب اتخاذ إجراءات وقتية أو تحفظية من أي محكمة مختصة.',
    ],
    execution: [
      'يجوز توقيع هذه الاتفاقية على نسخ متعددة وبالتوقيع الإلكتروني، وتُعدّ كل نسخة منها أصلاً، وتشكّل جميعها معاً صكاً واحداً.',
      'في الحدود التي يُجيزها القانون المعمول به، يتفق الطرفان على أن التوقيع الإلكتروني يستوفي أي اشتراط للتوقيع الكتابي. وحيثما يشترط القانون شكلاً معيناً أو توثيقاً أو توقيعاً خطياً، وجب استيفاء ذلك الشرط.',
    ],
  },
};

const FR: DocText = {
  typeTitles: {
    supply: 'Contrat de fourniture de marchandises',
    distribution: 'Contrat de distribution exclusive',
    charterparty: 'Charte-partie au voyage',
    'bill-of-lading': 'Contrat de transport (conditions du connaissement)',
    shareholders: "Pacte d'actionnaires",
    jv: 'Contrat de coentreprise',
    nda: 'Accord de confidentialité réciproque',
    services: 'Contrat de prestation de services',
    agency: "Contrat d'agence commerciale",
    lease: 'Bail commercial',
    licence: 'Contrat de licence de logiciel',
    employment: 'Contrat de travail',
    mou: "Protocole d'accord",
    settlement: 'Protocole transactionnel',
    construction: 'Marché de travaux',
    'property-sale': 'Contrat de vente immobilière',
  },
  headings: {
    definitions: 'Définitions et interprétation',
    scope: 'Objet du contrat',
    payment: 'Paiement',
    security: 'Sûretés',
    laytime: 'Staries',
    demurrage: 'Surestaries',
    insurance: 'Assurance',
    liability: 'Limitation de responsabilité',
    indemnity: 'Garanties et indemnisation',
    'force-majeure': 'Force majeure',
    sanctions: 'Sanctions et contrôle des échanges',
    termination: 'Résiliation',
    confidentiality: 'Confidentialité',
    'governing-law': 'Droit applicable',
    'dispute-resolution': 'Règlement des différends',
    execution: 'Signature',
  },
  lawNames: {
    GB: 'le droit anglais (Angleterre et pays de Galles)',
    AE: 'le droit des Émirats arabes unis',
    KW: "le droit de l'État du Koweït",
    SA: "le droit du Royaume d'Arabie saoudite",
    SG: 'le droit de Singapour',
    US: "le droit de l'État de New York",
    CH: 'le droit suisse',
    XX: '[DROIT APPLICABLE NON SÉLECTIONNÉ]',
  },
  lawFallback: (code) => `le droit de ${code}`,
  registeredIn: (code) => COUNTRY.fr[code] ?? `(${code})`,
  forum: {
    'local-courts':
      'les juridictions du ressort du Premier Contractant seront exclusivement compétentes',
    'foreign-courts':
      'les juridictions du ressort du Second Contractant seront exclusivement compétentes',
    'arbitration-lcia':
      "tout différend sera soumis à l'arbitrage et définitivement tranché selon le Règlement de la LCIA, le siège de l'arbitrage étant fixé à Londres, par trois arbitres, en langue anglaise",
    'arbitration-icc':
      "tout différend sera définitivement tranché suivant le Règlement d'arbitrage de la Chambre de commerce internationale (CCI), par trois arbitres, en langue anglaise",
    'arbitration-difc':
      "tout différend sera soumis à l'arbitrage et définitivement tranché selon le Règlement d'arbitrage du Dubai International Arbitration Centre (DIAC), le siège de l'arbitrage étant fixé au Dubai International Financial Centre, par trois arbitres, en langue anglaise",
    'arbitration-adhoc':
      'tout différend sera soumis à un arbitrage ad hoc selon les modalités dont les parties pourront convenir le moment venu',
    silent: '[MODE DE RÈGLEMENT DES DIFFÉRENDS NON SÉLECTIONNÉ]',
  },
  security: {
    lc: 'un crédit documentaire irrévocable et confirmé, émis par une banque agréée par le Premier Contractant et soumis aux RUU 600',
    'bank-guarantee':
      'une garantie bancaire à première demande émise par une banque de catégorie investissement agréée par le Premier Contractant',
    'parent-guarantee':
      'une garantie des obligations du Second Contractant souscrite par sa société mère ultime',
  },
  recitals: ({ date, reference, first, second, individualSecond }) => [
    `LE PRÉSENT CONTRAT est conclu le ${date} sous la référence ${reference}, entre :`,
    `(1) ${first.name.toUpperCase()}, société immatriculée ${FR.registeredIn(first.jurisdiction)} sous le numéro ${first.registrationNo}, dont le siège social se trouve à l'adresse suivante : ${first.address} (le « Premier Contractant ») ; et`,
    individualSecond
      ? `(2) ${second.name.toUpperCase()}, titulaire de la pièce d'identité n° ${second.registrationNo}, demeurant à l'adresse suivante : ${second.address} (le « Second Contractant »).`
      : `(2) ${second.name.toUpperCase()}, société immatriculée ${FR.registeredIn(second.jurisdiction)} sous le numéro ${second.registrationNo}, dont le siège social se trouve à l'adresse suivante : ${second.address} (le « Second Contractant »).`,
    'IL A ÉTÉ CONVENU CE QUI SUIT :',
  ],
  body: {
    definitions: [
      "Dans le présent Contrat, les termes commençant par une majuscule ont le sens qui leur est donné à l'Annexe 1. Toute référence à un texte législatif s'entend de ce texte tel que modifié ou remplacé le cas échéant.",
      "Les titres ne sont insérés que pour la commodité de lecture et n'affectent pas l'interprétation du présent Contrat.",
    ],
    scope: (value) => [
      "Le Premier Contractant fournit, et le Second Contractant accepte, les marchandises, services ou capacités de navire décrits à l'Annexe 2, selon les termes et conditions du présent Contrat.",
      `La valeur globale du présent Contrat s'élève à ${value} (la « Valeur du Contrat »).`,
    ],
    payment: (days, contractualInterest) => [
      `Le Second Contractant règle chaque facture valablement émise dans un délai de ${days} jours à compter de sa date d'émission, en fonds disponibles, sans compensation ni déduction.`,
      contractualInterest
        ? "Dans la mesure permise par le droit applicable, les sommes non payées à leur échéance portent intérêt au taux de 4 % l'an au-dessus du taux de référence applicable, courant quotidiennement, de la date d'échéance jusqu'au paiement effectif."
        : "Dans la mesure permise par le droit applicable, les sommes non payées à leur échéance portent intérêt au taux légal de la date d'échéance jusqu'au paiement effectif.",
    ],
    security: (instrument) => [
      `À titre de condition préalable aux obligations d'exécution du Premier Contractant, le Second Contractant fournit et maintient ${instrument}, pour un montant au moins égal à la Valeur du Contrat.`,
    ],
    laytime: (hours) => [
      hours
        ? `Les staries de chargement et de déchargement sont fixées à ${hours} heures consécutives au total, temps permettant, dimanches et jours fériés exceptés, et commencent à courir à compter de la remise d'un avis de disponibilité (Notice of Readiness) valable.`
        : '[STARIES NON PRÉCISÉES – les surestaries ne peuvent courir tant que les staries ne sont pas définies.]',
    ],
    demurrage: (rate) => [
      rate
        ? `Les surestaries sont dues au taux de ${rate} par jour, ou au prorata pour toute fraction de jour, pour tout le temps excédant les staries. Les réclamations au titre des surestaries sont forcloses si elles ne sont pas présentées, accompagnées des justificatifs, dans un délai de 90 jours à compter de la fin du déchargement.`
        : "[TAUX DE SURESTARIES NON PRÉCISÉ – le retard n'est indemnisable qu'au titre de dommages-intérêts pour immobilisation.]",
    ],
    insurance: (allocated) => [
      allocated
        ? "La partie supportant les risques sur les marchandises selon l'Incoterm applicable souscrit une assurance facultés aux conditions Institute Cargo Clauses (A) pour au moins 110 % de la valeur CIF, en désignant l'autre partie comme bénéficiaire à hauteur de son intérêt."
        : "[RESPONSABILITÉ D'ASSURANCE NON RÉPARTIE – l'assurance incombe à la partie qui supporte les risques selon l'Incoterm applicable.]",
    ],
    liability: (cap) => [
      cap
        ? `Sous réserve du paragraphe suivant, la responsabilité globale de chaque partie au titre du présent Contrat ou en relation avec celui-ci ne saurait excéder ${cap.amount}, soit ${cap.multiple} fois la Valeur du Contrat.`
        : "La responsabilité des parties au titre du présent Contrat n'est pas limitée. [RESPONSABILITÉ ILLIMITÉE – à revoir avant signature.]",
      'Aucune stipulation du présent Contrat ne limite la responsabilité en cas de décès ou de dommage corporel causé par une négligence, de fraude ou de déclaration frauduleuse, ni toute responsabilité qui ne peut légalement être limitée.',
      "Aucune partie n'est responsable des pertes de bénéfices, pertes d'exploitation ou de tout préjudice indirect ou consécutif, qu'il ait été prévisible ou non.",
    ],
    indemnity: [
      "Chaque partie garantit l'autre contre l'ensemble des pertes, responsabilités, frais et dépenses résultant de toute réclamation d'un tiers alléguant que la partie garante a porté atteinte aux droits de propriété intellectuelle de ce tiers, ou a causé un dommage aux biens ou à l'environnement.",
      'La partie garantie notifie sans délai toute réclamation à la partie garante et ne peut transiger sans son accord écrit préalable.',
    ],
    forceMajeure: [
      "Aucune partie n'est responsable d'un manquement ou d'un retard d'exécution dans la mesure où il résulte d'un événement échappant à son contrôle raisonnable, notamment catastrophe naturelle, guerre, troubles civils, fermeture de port, embargo, épidémie ou fait du prince.",
      "La partie affectée le notifie dans un délai de cinq jours ouvrés, met en œuvre des efforts raisonnables pour en atténuer les effets et reprend l'exécution dès que possible.",
      "Si l'événement se prolonge au-delà de 60 jours consécutifs, chaque partie peut résilier le présent Contrat par notification écrite sans engager sa responsabilité, sous réserve des droits acquis.",
    ],
    sanctions: [
      "Chaque partie déclare et garantit que ni elle-même, ni aucun de ses affiliés, dirigeants ou bénéficiaires effectifs, n'est une Personne Visée, et qu'elle n'utilisera, ne revendra ni ne transférera aucun bien fourni au titre du présent Contrat en violation des lois applicables en matière de sanctions ou de contrôle des exportations.",
      'Chaque partie procède en permanence au filtrage de ses cocontractants, navires et utilisateurs finaux au regard des listes de personnes visées applicables.',
      "Nonobstant toute autre stipulation, une partie peut suspendre ou résilier l'exécution immédiatement et sans engager sa responsabilité lorsque cette exécution l'exposerait à un risque de sanctions.",
    ],
    termination: (convenience) => [
      "Chaque partie peut résilier le présent Contrat avec effet immédiat par notification écrite si l'autre partie commet un manquement grave auquel elle ne remédie pas dans les 30 jours suivant sa notification, ou fait l'objet d'une procédure d'insolvabilité.",
      convenience
        ? "Chaque partie peut en outre résilier le présent Contrat pour convenance moyennant un préavis écrit de 90 jours notifié après le premier anniversaire de sa date de conclusion, sous réserve du paiement de l'indemnité de résiliation prévue à l'Annexe 3."
        : "Aucune résiliation pour convenance n'est prévue.",
    ],
    confidentiality: [
      "Chaque partie garde confidentielles toutes les informations communiquées par l'autre partie qui sont identifiées comme confidentielles ou qui pourraient raisonnablement être considérées comme telles, et ne les utilise qu'aux fins du présent Contrat.",
      'Cette obligation survit à la fin du Contrat pendant une durée de cinq ans.',
    ],
    governingLaw: (law) => [
      `Le présent Contrat et tout litige né de celui-ci ou en relation avec celui-ci sont régis par ${law} et interprétés conformément à ce droit.`,
    ],
    dispute: (forum) => [
      `Les parties conviennent que ${forum}.`,
      "La présente clause n'empêche aucune partie de solliciter des mesures provisoires ou conservatoires auprès de toute juridiction compétente.",
    ],
    execution: [
      'Le présent Contrat peut être signé en plusieurs exemplaires et par signature électronique, chacun constituant un original et leur ensemble constituant un seul et même instrument.',
      "Dans la mesure permise par le droit applicable, les parties conviennent qu'une signature électronique satisfait à toute exigence de signature écrite. Lorsque la loi impose une forme particulière, une légalisation ou une signature manuscrite, cette exigence doit être respectée.",
    ],
  },
};

const TEXT: Record<Locale, DocText> = { en: EN, ar: AR, fr: FR };

/** Clause heading in the given language -- used by the findings register. */
export function clauseHeading(id: ClauseId, locale: Locale = 'en'): string {
  const core = TEXT[locale].headings as Record<string, string>;
  return core[id] ?? CATEGORY_TEXT[locale].headings[id as CategoryClauseId];
}

/** Instrument title in the given language. */
export function instrumentTitle(type: ContractType, locale: Locale = 'en'): string {
  return TEXT[locale].typeTitles[type];
}

function formatters(locale: Locale): Fmt {
  const tag = NUMBER_LOCALE[locale];
  return {
    money: (usd) =>
      new Intl.NumberFormat(tag, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(usd),
    num: (n) => new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(n),
  };
}

function formatDate(value: string, locale: Locale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  // Legal drafting in English uses the day-month-year order (8 September 2026).
  const tag = locale === 'en' ? 'en-GB' : NUMBER_LOCALE[locale];
  return new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Assembles the clause tree. Clause numbering is derived, never hand-written,
 * so omitting an optional clause renumbers the document automatically.
 */
export function assembleDocument(
  input: ContractInput,
  meta: DocumentMeta,
  locale: Locale = 'en',
): AssembledDocument {
  const text = TEXT[locale] ?? EN;
  const { money, num } = formatters(locale);
  const { first, second } = meta.parties;
  const isMaritime =
    input.type === 'charterparty' || input.type === 'bill-of-lading';

  const cat = CATEGORY_TEXT[locale] ?? CATEGORY_TEXT.en;
  const clause = (id: ClauseId, body: string[]): Omit<Clause, 'number'> => ({
    id,
    heading: clauseHeading(id, locale),
    body,
  });

  // Clauses every category ends with.
  const governingLaw = clause(
    'governing-law',
    text.body.governingLaw(
      text.lawNames[input.governingLaw] ?? text.lawFallback(input.governingLaw),
    ),
  );
  const dispute = clause('dispute-resolution', text.body.dispute(text.forum[input.disputeForum]));
  const execution = clause('execution', text.body.execution);
  const liability = clause(
    'liability',
    text.body.liability(
      input.liabilityCapMultiple > 0
        ? {
            amount: money(input.valueUsd * input.liabilityCapMultiple),
            multiple: num(input.liabilityCapMultiple),
          }
        : null,
    ),
  );
  const optional = (on: boolean, id: ClauseId, body: string[]) => (on ? clause(id, body) : null);

  let draft: Array<Omit<Clause, 'number'> | null>;

  switch (input.type) {
    case 'nda':
      draft = [
        clause('purpose', cat.nda.purpose),
        clause('nda-obligations', cat.nda.obligations),
        clause('nda-exceptions', cat.nda.exceptions),
        clause('nda-term', cat.nda.term(input.confidentialityYears ?? 0)),
        clause('nda-return', cat.nda.returnDestroy),
        clause('no-licence', cat.nda.noLicence),
        clause('remedies', cat.nda.remedies),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'services':
      draft = [
        clause('definitions', text.body.definitions),
        clause('services', cat.services.services(money(input.valueUsd))),
        clause('standard-of-care', cat.services.standardOfCare),
        clause('payment', text.body.payment(input.paymentTermsDays, input.paymentTermsDays > 60)),
        clause('ip', cat.services.ip),
        clause('confidentiality', text.body.confidentiality),
        liability,
        optional(input.hasIndemnity, 'indemnity', text.body.indemnity),
        optional(input.hasForceMajeure, 'force-majeure', text.body.forceMajeure),
        optional(input.hasSanctionsClause, 'sanctions', text.body.sanctions),
        clause('termination', text.body.termination(input.hasTerminationForConvenience)),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'agency':
      draft = [
        clause('definitions', text.body.definitions),
        clause('appointment', cat.agency.appointment),
        clause('agent-duties', cat.agency.duties),
        clause(
          'commission',
          cat.agency.commission(
            input.commissionPct ? num(input.commissionPct) : null,
            input.paymentTermsDays,
          ),
        ),
        clause('agency-law', cat.agency.law),
        clause('confidentiality', text.body.confidentiality),
        liability,
        optional(input.hasIndemnity, 'indemnity', text.body.indemnity),
        optional(input.hasForceMajeure, 'force-majeure', text.body.forceMajeure),
        optional(input.hasSanctionsClause, 'sanctions', text.body.sanctions),
        // No convenience exit: termination of an agency is governed by the
        // mandatory law the agency-law clause preserves.
        clause('termination', text.body.termination(false)),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'lease':
      draft = [
        clause('definitions', text.body.definitions),
        clause('premises', cat.lease.premises),
        clause('lease-term', cat.lease.term(input.leaseTermYears ?? 0)),
        clause('rent', cat.lease.rent(money(input.valueUsd))),
        clause('deposit', cat.lease.deposit),
        clause('use', cat.lease.use),
        clause('maintenance', cat.lease.maintenance),
        clause('assignment', cat.lease.assignment),
        clause('insurance', cat.lease.insurance),
        optional(input.hasForceMajeure, 'force-majeure', text.body.forceMajeure),
        clause('termination', text.body.termination(false)),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'licence':
      draft = [
        clause('definitions', text.body.definitions),
        clause('licence-grant', cat.licence.grant),
        clause('licence-restrictions', cat.licence.restrictions),
        clause('licence-fees', cat.licence.fees(money(input.valueUsd))),
        clause('payment', text.body.payment(input.paymentTermsDays, input.paymentTermsDays > 60)),
        clause('support', cat.licence.support),
        clause('data-protection', cat.licence.data),
        clause('warranty', cat.licence.warranty),
        clause('confidentiality', text.body.confidentiality),
        liability,
        optional(input.hasIndemnity, 'indemnity', text.body.indemnity),
        optional(input.hasForceMajeure, 'force-majeure', text.body.forceMajeure),
        optional(input.hasSanctionsClause, 'sanctions', text.body.sanctions),
        clause('termination', text.body.termination(input.hasTerminationForConvenience)),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'employment':
      draft = [
        clause('employment-position', cat.employment.position),
        clause('probation', cat.employment.probation),
        clause('remuneration', cat.employment.remuneration),
        clause('working-time', cat.employment.workingTime),
        clause('employee-duties', cat.employment.duties),
        clause('confidentiality', text.body.confidentiality),
        clause('employment-termination', cat.employment.termination),
        clause('labour-law', cat.employment.law),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'mou':
      draft = [
        clause('mou-purpose', cat.mou.purpose),
        clause('non-binding', cat.mou.nonBinding),
        clause('exclusivity', cat.mou.exclusivity(input.exclusivityMonths ?? 0)),
        clause('costs', cat.mou.costs),
        clause('confidentiality', text.body.confidentiality),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'settlement':
      draft = [
        clause('settlement-dispute', cat.settlement.dispute),
        clause('settlement-sum', cat.settlement.sum),
        clause('release', cat.settlement.release),
        clause('proceedings', cat.settlement.proceedings),
        clause('confidentiality', text.body.confidentiality),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'construction':
      draft = [
        clause('definitions', text.body.definitions),
        clause('works', cat.construction.works),
        clause('contract-price', cat.construction.price(money(input.valueUsd), input.paymentTermsDays)),
        clause('time-for-completion', cat.construction.time(input.completionMonths ?? 0)),
        clause('delay-damages', cat.construction.delay),
        clause('variations', cat.construction.variations),
        clause('performance-security', cat.construction.security),
        clause('completion-defects', cat.construction.completion),
        clause('decennial-liability', cat.construction.decennial),
        clause('construction-insurance', cat.construction.insurance),
        clause('subcontracting', cat.construction.subcontracting),
        liability,
        optional(input.hasIndemnity, 'indemnity', text.body.indemnity),
        optional(input.hasForceMajeure, 'force-majeure', text.body.forceMajeure),
        optional(input.hasSanctionsClause, 'sanctions', text.body.sanctions),
        clause('termination', text.body.termination(input.hasTerminationForConvenience)),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    case 'property-sale':
      draft = [
        clause('definitions', text.body.definitions),
        clause('property', cat.sale.property),
        clause('purchase-price', cat.sale.price(money(input.valueUsd))),
        clause('title', cat.sale.title),
        clause('transfer-registration', cat.sale.transfer),
        clause('possession-risk', cat.sale.possession),
        clause('sale-default', cat.sale.default),
        clause('fees-taxes', cat.sale.fees),
        governingLaw,
        dispute,
        execution,
      ];
      break;

    default:
      draft = [
        clause('definitions', text.body.definitions),
        clause('scope', text.body.scope(money(input.valueUsd))),
        clause('payment', text.body.payment(input.paymentTermsDays, input.paymentTermsDays > 60)),
        input.security !== 'none'
          ? clause('security', text.body.security(text.security[input.security]))
          : null,
        isMaritime ? clause('laytime', text.body.laytime(input.laytimeHours)) : null,
        isMaritime
          ? clause(
              'demurrage',
              text.body.demurrage(input.demurrageRateUsd ? money(input.demurrageRateUsd) : null),
            )
          : null,
        clause('insurance', text.body.insurance(input.insuranceAllocated)),
        liability,
        optional(input.hasIndemnity, 'indemnity', text.body.indemnity),
        optional(input.hasForceMajeure, 'force-majeure', text.body.forceMajeure),
        optional(input.hasSanctionsClause, 'sanctions', text.body.sanctions),
        clause('termination', text.body.termination(input.hasTerminationForConvenience)),
        clause('confidentiality', text.body.confidentiality),
        governingLaw,
        dispute,
        execution,
      ];
  }

  const clauses: Clause[] = draft
    .filter((c): c is Omit<Clause, 'number'> => c !== null)
    .map((c, i) => ({ ...c, number: String(i + 1) }));

  return {
    locale,
    title: text.typeTitles[input.type],
    recitals: text.recitals({
      date: formatDate(meta.executionDate, locale),
      reference: meta.reference,
      first,
      second,
      // The employee is a natural person, not a registered company.
      individualSecond: input.type === 'employment',
    }),
    clauses,
  };
}

/** Number of distinct standard clauses the engine can draft -- shown on the landing page. */
export const CLAUSE_COUNT =
  Object.keys(EN.headings).length + Object.keys(CATEGORY_TEXT.en.headings).length;
