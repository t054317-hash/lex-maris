/**
 * Clause text for the non-trade categories: mutual NDA, services agreement,
 * commercial agency and commercial lease.
 *
 * Kept apart from document-engine.ts, which holds the trade and maritime
 * clauses, so each file stays readable. The engine decides which clauses a
 * given category uses and in what order; this file only supplies wording,
 * one complete table per locale. The three language versions say the same
 * thing clause for clause.
 *
 * Drafting notes that shape the text:
 *  - Agency: GCC commercial agency statutes are mandatory (registration,
 *    termination and compensation), so the draft yields to them expressly.
 *  - Lease: tenancy law of the place where the premises are is mandatory;
 *    renewal and rent increases are expressed as subject to it.
 *  - IP in services: only ECONOMIC rights are assigned, "to the extent
 *    assignable" -- moral rights are inalienable in the civil-law systems
 *    of the region.
 */

import type { Locale } from '@/i18n/config';

/** "1 year" / "3 years" -- and Arabic's singular, dual and plural forms. */
const enYears = (n: number) => (n === 1 ? '1 year' : `${n} years`);
const frYears = (n: number) => (n === 1 ? '1 an' : `${n} ans`);
const arYears = (n: number) =>
  n === 1 ? 'سنة واحدة' : n === 2 ? 'سنتين' : n <= 10 ? `${n} سنوات` : `${n} سنة`;
const arDays = (n: number) => (n >= 3 && n <= 10 ? `${n} أيام` : `${n} يوماً`);

export type CategoryClauseId =
  | 'purpose'
  | 'nda-obligations'
  | 'nda-exceptions'
  | 'nda-term'
  | 'nda-return'
  | 'no-licence'
  | 'remedies'
  | 'services'
  | 'standard-of-care'
  | 'ip'
  | 'appointment'
  | 'agent-duties'
  | 'commission'
  | 'agency-law'
  | 'premises'
  | 'lease-term'
  | 'rent'
  | 'deposit'
  | 'use'
  | 'maintenance'
  | 'assignment'
  | 'licence-grant'
  | 'licence-restrictions'
  | 'licence-fees'
  | 'support'
  | 'data-protection'
  | 'warranty'
  | 'employment-position'
  | 'probation'
  | 'remuneration'
  | 'working-time'
  | 'employee-duties'
  | 'employment-termination'
  | 'labour-law'
  | 'mou-purpose'
  | 'non-binding'
  | 'exclusivity'
  | 'costs'
  | 'settlement-dispute'
  | 'settlement-sum'
  | 'release'
  | 'proceedings';

export interface CategoryText {
  headings: Record<CategoryClauseId, string>;
  nda: {
    purpose: string[];
    obligations: string[];
    exceptions: string[];
    term: (years: number) => string[];
    returnDestroy: string[];
    noLicence: string[];
    remedies: string[];
  };
  services: {
    services: (fees: string) => string[];
    standardOfCare: string[];
    ip: string[];
  };
  agency: {
    appointment: string[];
    duties: string[];
    commission: (pct: string | null, days: number) => string[];
    law: string[];
  };
  lease: {
    premises: string[];
    term: (years: number) => string[];
    rent: (annual: string) => string[];
    deposit: string[];
    use: string[];
    maintenance: string[];
    assignment: string[];
    insurance: string[];
  };
  licence: {
    grant: string[];
    restrictions: string[];
    fees: (fees: string) => string[];
    support: string[];
    data: string[];
    warranty: string[];
  };
  employment: {
    position: string[];
    probation: string[];
    remuneration: string[];
    workingTime: string[];
    duties: string[];
    termination: string[];
    law: string[];
  };
  mou: {
    purpose: string[];
    nonBinding: string[];
    exclusivity: (months: number) => string[];
    costs: string[];
  };
  settlement: {
    dispute: string[];
    sum: string[];
    release: string[];
    proceedings: string[];
  };
}

const EN: CategoryText = {
  headings: {
    purpose: 'Purpose and Confidential Information',
    'nda-obligations': 'Obligations of Confidentiality',
    'nda-exceptions': 'Exceptions',
    'nda-term': 'Duration',
    'nda-return': 'Return and Destruction',
    'no-licence': 'No Licence or Commitment',
    remedies: 'Remedies',
    services: 'The Services',
    'standard-of-care': 'Standard of Performance',
    ip: 'Intellectual Property',
    appointment: 'Appointment',
    'agent-duties': 'Duties of the Parties',
    commission: 'Commission',
    'agency-law': 'Registration and Mandatory Law',
    premises: 'The Premises',
    'lease-term': 'Term',
    rent: 'Rent',
    deposit: 'Security Deposit',
    use: 'Use of the Premises',
    maintenance: 'Repairs and Alterations',
    assignment: 'Assignment and Subletting',
    'licence-grant': 'Grant of Licence',
    'licence-restrictions': 'Restrictions',
    'licence-fees': 'Licence Fees',
    support: 'Maintenance and Support',
    'data-protection': 'Data Protection',
    warranty: 'Warranty',
    'employment-position': 'Position and Place of Work',
    probation: 'Probation',
    remuneration: 'Remuneration',
    'working-time': 'Working Time and Leave',
    'employee-duties': "Employee's Duties",
    'employment-termination': 'Termination of Employment',
    'labour-law': 'Mandatory Labour Law',
    'mou-purpose': 'Purpose',
    'non-binding': 'Non-Binding Effect',
    exclusivity: 'Exclusivity',
    costs: 'Costs',
    'settlement-dispute': 'The Dispute',
    'settlement-sum': 'Settlement Sum',
    release: 'Release',
    proceedings: 'Withdrawal of Proceedings',
  },
  nda: {
    purpose: [
      'The parties wish to exchange Confidential Information solely for the purpose of evaluating, negotiating and, if agreed, entering into a business relationship between them (the "Purpose").',
      '"Confidential Information" means all information, in any form, disclosed by one party (the "Disclosing Party") to the other (the "Receiving Party") in connection with the Purpose that is marked as confidential or would reasonably be understood to be confidential.',
    ],
    obligations: [
      'The Receiving Party shall keep the Confidential Information strictly confidential, use it only for the Purpose, and protect it with at least the degree of care it applies to its own confidential information, and in any event no less than reasonable care.',
      'The Receiving Party may disclose Confidential Information only to its directors, employees and professional advisers who need to know it for the Purpose and who are bound by obligations of confidentiality no less protective than this Agreement, and it remains responsible for their compliance.',
    ],
    exceptions: [
      'The obligations in this Agreement do not apply to information that the Receiving Party can show: (a) is or becomes public other than through its breach; (b) was lawfully in its possession before disclosure without an obligation of confidence; (c) is lawfully received from a third party entitled to disclose it; or (d) is independently developed without use of the Confidential Information.',
      'The Receiving Party may disclose Confidential Information to the extent required by law, regulation or a competent court or authority, provided that, where lawful, it gives the Disclosing Party prompt prior notice and discloses only what is required.',
    ],
    term: (years) => [
      years
        ? `The obligations of confidentiality continue for ${enYears(years)} from the date of each disclosure. Obligations in respect of trade secrets continue for as long as the information remains a trade secret.`
        : 'The obligations of confidentiality continue without limit of time for as long as the information remains confidential.',
    ],
    returnDestroy: [
      'On written request, or when the Purpose ends, the Receiving Party shall promptly return or destroy the Confidential Information and confirm this in writing, save for copies it is required by law to retain or that are held in automatic back-up systems, which remain subject to this Agreement.',
    ],
    noLicence: [
      'No licence or other right in any Confidential Information or intellectual property is granted by this Agreement. Neither party is obliged to disclose any particular information or to enter into any further agreement.',
    ],
    remedies: [
      'Each party acknowledges that damages alone may not be an adequate remedy for breach of this Agreement, and that the Disclosing Party may seek injunctive or other interim relief in addition to any other remedy available to it.',
    ],
  },
  services: {
    services: (fees) => [
      'The First Party (the "Provider") shall provide to the Second Party (the "Client") the services and deliverables described in Schedule 2 (the "Services"), in accordance with the timetable set out there.',
      `The fees for the Services are ${fees} in aggregate (the "Contract Value"), exclusive of applicable taxes. Any change to the scope of the Services shall be agreed in writing together with any adjustment to the fees.`,
    ],
    standardOfCare: [
      'The Provider shall perform the Services with the reasonable skill, care and diligence of a competent provider of similar services, in compliance with applicable law, using suitably qualified personnel.',
      "The Client shall provide in good time the information, access and decisions reasonably required for performance of the Services. The Provider is not liable for delay to the extent caused by the Client's failure to do so.",
    ],
    ip: [
      'With effect from payment in full of the fees relating to them, the Provider assigns to the Client, to the extent assignable under applicable law, the economic rights in the intellectual property in deliverables created specifically for the Client under this Agreement.',
      'Each party retains its pre-existing intellectual property. The Provider grants the Client a non-exclusive, royalty-free licence to use any pre-existing materials incorporated in the deliverables to the extent necessary to use the deliverables.',
    ],
  },
  agency: {
    appointment: [
      'The First Party (the "Principal") appoints the Second Party (the "Agent") as its commercial agent for the products described in Schedule 2 (the "Products") in the territory stated in Schedule 1 (the "Territory"), on the exclusive or non-exclusive basis stated there.',
      "The Agent shall negotiate sales of the Products on the Principal's behalf. The Agent has no authority to conclude contracts, receive payment or incur obligations in the Principal's name unless the Principal authorises it in writing.",
    ],
    duties: [
      "The Agent shall use its best endeavours to promote the Products in the Territory, follow the Principal's reasonable instructions, keep the Principal informed of market conditions, and comply with all laws applicable to its activities.",
      "The Principal shall provide the Agent with the information, samples and materials reasonably necessary for the Agent's activities, and shall inform the Agent promptly whether it accepts, refuses or fails to perform a transaction the Agent has negotiated.",
    ],
    commission: (pct, days) => [
      pct
        ? `The Principal shall pay the Agent a commission of ${pct}% of the net invoiced value of each sale of the Products in the Territory concluded as a result of the Agent's activities, within ${days} days of the Principal receiving payment from the customer.`
        : '[COMMISSION RATE NOT SPECIFIED - state the rate and the sales on which it is payable.]',
      'The Principal shall provide the Agent with a quarterly statement of the commission due, and the Agent may, on reasonable notice, verify the relevant records.',
    ],
    law: [
      'Where the law of the Territory requires this Agreement to be registered in a register of commercial agencies, the parties shall cooperate to register it, and it shall take effect in the Territory as that law provides.',
      'The parties acknowledge that the mandatory provisions of the law of the Territory on commercial agencies, including those on termination, non-renewal and compensation, apply notwithstanding any other provision of this Agreement.',
    ],
  },
  lease: {
    premises: [
      'The First Party (the "Landlord") lets to the Second Party (the "Tenant") the premises described in Schedule 2 (the "Premises") for the Permitted Use.',
      'The Landlord warrants that it is entitled to let the Premises and that, at the commencement date, the Premises may lawfully be used for the Permitted Use.',
    ],
    term: (years) => [
      years
        ? `The lease is granted for a term of ${enYears(years)} from the commencement date stated in Schedule 1. Any renewal shall be on terms agreed in writing, subject to any mandatory rights under the law of the place where the Premises are located.`
        : '[TERM NOT SPECIFIED - state the commencement date and the length of the term.]',
    ],
    rent: (annual) => [
      `The annual rent is ${annual}, payable in advance in the instalments and on the dates set out in Schedule 1, together with any service charge stated there.`,
      'The rent may be increased during the term only as agreed in writing and as permitted by the law of the place where the Premises are located.',
    ],
    deposit: [
      "On signature, the Tenant shall pay the security deposit stated in Schedule 1, which the Landlord shall hold as security for the Tenant's obligations and return within 30 days after handover of the Premises, less any sums properly due.",
    ],
    use: [
      'The Tenant shall use the Premises only for the use stated in Schedule 1 (the "Permitted Use"), shall obtain and maintain the licences required for its business, and shall comply with the building rules.',
    ],
    maintenance: [
      'The Landlord shall keep the structure, exterior and common services of the Premises in good repair. The Tenant shall keep the interior in good condition, fair wear and tear excepted, and shall make no structural alterations without the prior written consent of the Landlord.',
      'At the end of the term the Tenant shall hand back the Premises in the condition required by this clause and, if the Landlord so requires, remove its fixtures and reinstate any alterations.',
    ],
    assignment: [
      'The Tenant shall not assign, sublet or part with possession of the whole or any part of the Premises without the prior written consent of the Landlord, which shall not be unreasonably withheld.',
    ],
    insurance: [
      'The Landlord shall insure the building against the usual risks. The Tenant shall insure its contents and fit-out, and its liability to third parties arising from its use of the Premises.',
    ],
  },
  licence: {
    grant: [
      'The First Party (the "Licensor") grants the Second Party (the "Licensee") a non-exclusive, non-transferable licence to use the software described in Schedule 2 (the "Software") for the Licensee\'s internal business purposes, for the number of users and in the territory stated in Schedule 1, during the term of this Agreement.',
      'The Software and all intellectual property in it remain the property of the Licensor or its licensors. No right is granted except as expressly stated in this Agreement.',
    ],
    restrictions: [
      'The Licensee shall not copy, modify, reverse-engineer or decompile the Software, except to the extent that applicable law expressly permits it notwithstanding this restriction, and shall not sublicense, rent or otherwise make the Software available to any third party.',
    ],
    fees: (fees) => [
      `The licence fees are ${fees} (the "Contract Value"), payable as set out in Schedule 1, exclusive of applicable taxes.`,
    ],
    support: [
      'The Licensor shall provide the maintenance, updates and support described in Schedule 3, and shall use reasonable endeavours to correct reproducible defects notified to it.',
    ],
    data: [
      "Each party shall comply with the data-protection law applicable to it. Where the Licensor processes personal data on the Licensee's behalf, it shall do so only on the Licensee's documented instructions, keep the data secure and confidential, and return or delete it at the end of this Agreement.",
    ],
    warranty: [
      "The Licensor warrants that the Software will perform materially in accordance with its documentation for 90 days from delivery. The Licensee's remedy for breach of this warranty is correction or replacement of the Software or, failing that, a refund of the fees paid for the defective Software.",
    ],
  },
  employment: {
    position: [
      'The First Party (the "Employer") employs the Second Party (the "Employee") in the position and at the place of work stated in Schedule 1, with effect from the commencement date stated there.',
    ],
    probation: [
      'The employment is subject to a probationary period of the length stated in Schedule 1, which shall not exceed the maximum permitted by the labour law applicable at the place of work. During that period either party may end the employment as that law provides.',
    ],
    remuneration: [
      "The Employer shall pay the Employee the salary and allowances stated in Schedule 1, monthly in arrears, by transfer to the Employee's bank account, in accordance with the applicable wage-protection rules.",
    ],
    workingTime: [
      'Working hours, weekly rest, public holidays, annual leave and sick leave are as stated in Schedule 1 and are in no case less favourable to the Employee than the applicable labour law provides.',
    ],
    duties: [
      "The Employee shall perform the duties of the position diligently and in good faith, follow the Employer's lawful instructions, and comply with the Employer's policies notified in writing.",
    ],
    termination: [
      'Either party may terminate the employment by written notice of the period stated in Schedule 1, which shall not be shorter than the minimum required by the applicable labour law, or otherwise as that law permits.',
      'On termination the Employee is entitled to the end-of-service benefits and any other sums due under the applicable labour law.',
    ],
    law: [
      'Nothing in this Contract reduces any right of the Employee under the mandatory provisions of the labour law applicable at the place of work, which prevail over any inconsistent term.',
    ],
  },
  mou: {
    purpose: [
      'This Memorandum records the current intentions of the parties regarding the proposed transaction described in Schedule 2 (the "Proposed Transaction").',
    ],
    nonBinding: [
      'Except for the clauses on Exclusivity, Costs, Confidentiality, Governing Law and Dispute Resolution (the "Binding Provisions"), this Memorandum is not legally binding and creates no obligation to negotiate or to enter into the Proposed Transaction. Any such obligation arises only under a definitive agreement signed by both parties.',
      'This Memorandum terminates on the earlier of the signature of a definitive agreement and the date stated in Schedule 1. The Binding Provisions survive as stated in them.',
    ],
    exclusivity: (months) => [
      months
        ? `For ${months === 1 ? '1 month' : `${months} months`} from the date of this Memorandum, the First Party shall not solicit, negotiate or enter into any agreement with a third party concerning a transaction substantially similar to the Proposed Transaction.`
        : 'Neither party is bound by any obligation of exclusivity.',
    ],
    costs: [
      'Each party shall bear its own costs in connection with this Memorandum and the Proposed Transaction.',
    ],
  },
  settlement: {
    dispute: [
      'The parties are in dispute concerning the matters described in Schedule 2 (the "Dispute") and wish to settle the Dispute on the terms of this Agreement, without any admission of liability by either party.',
    ],
    sum: [
      'The party identified in Schedule 1 as the paying party shall pay the settlement sum stated there (the "Settlement Sum") within the period stated there, by transfer to the account notified in writing by the receiving party.',
    ],
    release: [
      'With effect from receipt of the Settlement Sum in full, and to the extent permitted by law, each party releases the other from all claims arising out of or in connection with the Dispute, whether or not known at the date of this Agreement, other than claims to enforce this Agreement.',
    ],
    proceedings: [
      'Within 14 days of receipt of the Settlement Sum, the parties shall take the steps required to withdraw or discontinue any proceedings relating to the Dispute, each bearing its own costs unless Schedule 1 provides otherwise.',
    ],
  },
};

const AR: CategoryText = {
  headings: {
    purpose: 'الغرض والمعلومات السرية',
    'nda-obligations': 'الالتزام بالسرية',
    'nda-exceptions': 'الاستثناءات',
    'nda-term': 'المدة',
    'nda-return': 'الإعادة والإتلاف',
    'no-licence': 'عدم منح ترخيص أو التزام',
    remedies: 'وسائل الانتصاف',
    services: 'الخدمات',
    'standard-of-care': 'معيار الأداء',
    ip: 'الملكية الفكرية',
    appointment: 'التعيين',
    'agent-duties': 'التزامات الطرفين',
    commission: 'العمولة',
    'agency-law': 'القيد والأحكام الآمرة',
    premises: 'العين المؤجَّرة',
    'lease-term': 'مدة الإيجار',
    rent: 'الأجرة',
    deposit: 'مبلغ التأمين',
    use: 'استعمال العين المؤجَّرة',
    maintenance: 'الصيانة والتعديلات',
    assignment: 'التنازل والتأجير من الباطن',
    'licence-grant': 'منح الترخيص',
    'licence-restrictions': 'القيود',
    'licence-fees': 'رسوم الترخيص',
    support: 'الصيانة والدعم',
    'data-protection': 'حماية البيانات',
    warranty: 'الضمان',
    'employment-position': 'الوظيفة ومكان العمل',
    probation: 'فترة التجربة',
    remuneration: 'الأجر',
    'working-time': 'ساعات العمل والإجازات',
    'employee-duties': 'واجبات العامل',
    'employment-termination': 'إنهاء عقد العمل',
    'labour-law': 'أحكام قانون العمل الآمرة',
    'mou-purpose': 'الغرض',
    'non-binding': 'عدم الإلزام',
    exclusivity: 'الحصرية',
    costs: 'المصروفات',
    'settlement-dispute': 'النزاع',
    'settlement-sum': 'مبلغ التسوية',
    release: 'الإبراء',
    proceedings: 'ترك الإجراءات',
  },
  nda: {
    purpose: [
      'يرغب الطرفان في تبادل المعلومات السرية لغرض وحيد هو تقييم علاقة عمل بينهما والتفاوض بشأنها، والدخول فيها إن اتُّفق على ذلك (ويُشار إليه فيما يلي بـ«الغرض»).',
      'يُقصد بـ«المعلومات السرية» جميع المعلومات، بأي شكل كانت، التي يفصح عنها أحد الطرفين («الطرف المُفصِح») للطرف الآخر («الطرف المتلقي») فيما يتصل بالغرض، والمصنَّفة سرية أو التي يُفهم بصورة معقولة أنها سرية.',
    ],
    obligations: [
      'يلتزم الطرف المتلقي بالمحافظة على سرية المعلومات السرية التامة، وألا يستخدمها إلا لتحقيق الغرض، وأن يحميها بدرجة من العناية لا تقل عن تلك التي يبذلها في حماية معلوماته السرية، ولا تقل في جميع الأحوال عن العناية المعقولة.',
      'لا يجوز للطرف المتلقي الإفصاح عن المعلومات السرية إلا لمديريه وموظفيه ومستشاريه المهنيين الذين يحتاجون إليها لتحقيق الغرض، والملتزمين بواجبات سرية لا تقل حماية عن هذه الاتفاقية، ويبقى مسؤولاً عن التزامهم بها.',
    ],
    exceptions: [
      'لا تسري الالتزامات الواردة في هذه الاتفاقية على المعلومات التي يُثبت الطرف المتلقي أنها: (أ) متاحة للعامة أو أصبحت كذلك دون إخلال منه؛ أو (ب) كانت في حوزته بصورة مشروعة قبل الإفصاح دون التزام بالسرية؛ أو (ج) تلقّاها بصورة مشروعة من الغير المخوَّل بالإفصاح عنها؛ أو (د) طوّرها باستقلال دون استخدام المعلومات السرية.',
      'يجوز للطرف المتلقي الإفصاح عن المعلومات السرية بالقدر الذي يوجبه القانون أو اللوائح أو محكمة أو جهة مختصة، على أن يُخطر الطرف المُفصِح بذلك مسبقاً وفوراً متى كان ذلك جائزاً قانوناً، وألا يُفصح إلا عمّا هو مطلوب.',
    ],
    term: (years) => [
      years
        ? `يستمر الالتزام بالسرية مدة ${arYears(years)} من تاريخ كل إفصاح. ويستمر الالتزام فيما يخص الأسرار التجارية ما دامت المعلومات محتفظة بصفتها سراً تجارياً.`
        : 'يستمر الالتزام بالسرية دون تحديد مدة ما دامت المعلومات محتفظة بسريتها.',
    ],
    returnDestroy: [
      'يلتزم الطرف المتلقي، عند الطلب الكتابي أو عند انتهاء الغرض، بإعادة المعلومات السرية أو إتلافها فوراً وتأكيد ذلك كتابةً، باستثناء النسخ التي يلزمه القانون بالاحتفاظ بها أو المحفوظة في أنظمة النسخ الاحتياطي الآلي، والتي تبقى خاضعة لهذه الاتفاقية.',
    ],
    noLicence: [
      'لا تمنح هذه الاتفاقية أي ترخيص أو حق آخر في أي معلومات سرية أو ملكية فكرية، ولا يلتزم أيٌّ من الطرفين بالإفصاح عن معلومات بعينها أو بإبرام أي اتفاق لاحق.',
    ],
    remedies: [
      'يقرّ كل طرف بأن التعويض وحده قد لا يكون كافياً لجبر الإخلال بهذه الاتفاقية، وبأن للطرف المُفصِح أن يطلب اتخاذ إجراءات وقتية أو مستعجلة، إضافةً إلى أي وسيلة انتصاف أخرى متاحة له.',
    ],
  },
  services: {
    services: (fees) => [
      'يلتزم الطرف الأول («مقدّم الخدمة») بتقديم الخدمات والمخرجات المبيّنة في الملحق رقم (2) («الخدمات») إلى الطرف الثاني («العميل»)، وفقاً للجدول الزمني الوارد فيه.',
      `تبلغ الأتعاب الإجمالية للخدمات ${fees} («قيمة العقد»)، غير شاملة الضرائب المستحقة. ويُتَّفق كتابةً على أي تغيير في نطاق الخدمات وعلى أي تعديل مترتب عليه في الأتعاب.`,
    ],
    standardOfCare: [
      'يلتزم مقدّم الخدمة بأداء الخدمات بالمهارة والعناية والحرص المعقولين المعهودين في مقدّم خدمات مماثلة كفء، ووفقاً للقانون المعمول به، وبواسطة أفراد مؤهَّلين على نحو مناسب.',
      'يلتزم العميل بتقديم المعلومات والتسهيلات والقرارات اللازمة بصورة معقولة لأداء الخدمات في الوقت المناسب، ولا يُسأل مقدّم الخدمة عن التأخير بقدر ما ينتج عن تقصير العميل في ذلك.',
    ],
    ip: [
      'اعتباراً من سداد الأتعاب المتعلقة بها كاملةً، يتنازل مقدّم الخدمة للعميل، في الحدود التي يُجيزها القانون المعمول به، عن الحقوق المالية للملكية الفكرية في المخرجات المُعدَّة خصيصاً للعميل بموجب هذه الاتفاقية.',
      'يحتفظ كل طرف بملكيته الفكرية السابقة. ويمنح مقدّم الخدمة العميلَ ترخيصاً غير حصري ودون مقابل باستخدام أي مواد سابقة مُدرَجة في المخرجات بالقدر اللازم لاستخدام تلك المخرجات.',
    ],
  },
  agency: {
    appointment: [
      'يعيّن الطرف الأول («الموكِّل») الطرفَ الثاني («الوكيل») وكيلاً تجارياً له للمنتجات المبيّنة في الملحق رقم (2) («المنتجات») في الإقليم المحدد في الملحق رقم (1) («الإقليم»)، على أساس حصري أو غير حصري وفقاً لما هو مبيّن فيه.',
      'يتولى الوكيل التفاوض على بيع المنتجات لحساب الموكِّل، ولا يملك صلاحية إبرام العقود أو قبض الثمن أو ترتيب التزامات باسم الموكِّل ما لم يأذن له الموكِّل بذلك كتابةً.',
    ],
    duties: [
      'يلتزم الوكيل ببذل أقصى جهده في الترويج للمنتجات في الإقليم، وباتباع تعليمات الموكِّل المعقولة، وبإطلاعه على أحوال السوق، وبالامتثال لجميع القوانين المنطبقة على نشاطه.',
      'يلتزم الموكِّل بتزويد الوكيل بالمعلومات والعيّنات والمواد اللازمة بصورة معقولة لنشاطه، وبإخطاره فوراً بقبول أي صفقة تفاوض عليها الوكيل أو رفضها أو عدم تنفيذها.',
    ],
    commission: (pct, days) => [
      pct
        ? `يلتزم الموكِّل بأن يؤدي للوكيل عمولة نسبتها ${pct}% من صافي القيمة المفوترة لكل عملية بيع للمنتجات في الإقليم تُبرَم نتيجة نشاط الوكيل، وذلك خلال ${arDays(days)} من تاريخ تحصيل الموكِّل الثمن من العميل.`
        : '[لم تُحدَّد نسبة العمولة — يجب بيان النسبة والمبيعات التي تُستحق عليها.]',
      'يلتزم الموكِّل بتقديم كشف ربع سنوي بالعمولات المستحقة للوكيل، ويجوز للوكيل، بإخطار معقول، التحقق من السجلات ذات الصلة.',
    ],
    law: [
      'إذا أوجب قانون الإقليم قيد هذه الاتفاقية في سجل الوكالات التجارية، تعاون الطرفان على قيدها، وتنفذ في الإقليم وفقاً لما يقضي به ذلك القانون.',
      'يقرّ الطرفان بأن الأحكام الآمرة في قانون الإقليم بشأن الوكالات التجارية، بما فيها أحكام الإنهاء وعدم التجديد والتعويض، تسري على الرغم من أي حكم آخر في هذه الاتفاقية.',
    ],
  },
  lease: {
    premises: [
      'يؤجّر الطرف الأول («المؤجِّر») للطرف الثاني («المستأجر») العين المبيّنة في الملحق رقم (2) («العين المؤجَّرة») لاستعمالها في الغرض المسموح به.',
      'يضمن المؤجِّر أن له الحق في تأجير العين المؤجَّرة، وأنه يجوز قانوناً استعمالها في الغرض المسموح به في تاريخ بدء الإيجار.',
    ],
    term: (years) => [
      years
        ? `مدة الإيجار ${arYears(years)} تبدأ من تاريخ البدء المحدد في الملحق رقم (1). ويكون أي تجديد وفق شروط يُتَّفق عليها كتابةً، مع مراعاة أي حقوق آمرة يقررها قانون الدولة التي تقع فيها العين المؤجَّرة.`
        : '[لم تُحدَّد مدة الإيجار — يجب بيان تاريخ البدء ومدة الإيجار.]',
    ],
    rent: (annual) => [
      `الأجرة السنوية ${annual}، تُدفع مقدماً على الأقساط وفي المواعيد المحددة في الملحق رقم (1)، إضافةً إلى أي رسوم خدمات مبيّنة فيه.`,
      'لا تجوز زيادة الأجرة خلال مدة الإيجار إلا باتفاق كتابي وفي الحدود التي يُجيزها قانون الدولة التي تقع فيها العين المؤجَّرة.',
    ],
    deposit: [
      'يلتزم المستأجر عند التوقيع بدفع مبلغ التأمين المحدد في الملحق رقم (1)، ويحتفظ به المؤجِّر ضماناً لالتزامات المستأجر، ويردّه خلال 30 يوماً من تسليم العين المؤجَّرة، بعد خصم أي مبالغ مستحقة بحق.',
    ],
    use: [
      'يلتزم المستأجر بعدم استعمال العين المؤجَّرة إلا في الغرض المحدد في الملحق رقم (1) («الغرض المسموح به»)، وباستخراج التراخيص اللازمة لنشاطه والمحافظة على سريانها، وبالتقيّد بأنظمة المبنى.',
    ],
    maintenance: [
      'يلتزم المؤجِّر بصيانة الهيكل الإنشائي والواجهات والخدمات المشتركة للعين المؤجَّرة. ويلتزم المستأجر بالمحافظة على الأجزاء الداخلية في حالة جيدة، باستثناء الاستهلاك العادي، وبعدم إجراء أي تعديلات إنشائية دون موافقة المؤجِّر الكتابية المسبقة.',
      'يلتزم المستأجر عند انتهاء المدة بتسليم العين المؤجَّرة بالحالة التي يقتضيها هذا البند، وبإزالة تجهيزاته وإعادة الحال إلى ما كانت عليه إذا طلب المؤجِّر ذلك.',
    ],
    assignment: [
      'لا يجوز للمستأجر التنازل عن الإيجار أو التأجير من الباطن أو التخلي عن حيازة العين المؤجَّرة كلها أو بعضها دون موافقة المؤجِّر الكتابية المسبقة، ولا يجوز للمؤجِّر رفضها دون مبرر معقول.',
    ],
    insurance: [
      'يلتزم المؤجِّر بالتأمين على المبنى ضد المخاطر المعتادة. ويلتزم المستأجر بالتأمين على محتوياته وتجهيزاته، وعلى مسؤوليته تجاه الغير الناشئة عن استعماله العين المؤجَّرة.',
    ],
  },
  licence: {
    grant: [
      'يمنح الطرف الأول («المرخِّص») الطرفَ الثاني («المرخَّص له») ترخيصاً غير حصري وغير قابل للتحويل باستخدام البرنامج المبيّن في الملحق رقم (2) («البرنامج») لأغراض عمله الداخلية، لعدد المستخدمين وفي الإقليم المحددين في الملحق رقم (1)، طوال مدة هذه الاتفاقية.',
      'يبقى البرنامج وجميع حقوق الملكية الفكرية فيه مملوكاً للمرخِّص أو لمن رخّصوا له، ولا يُمنح أي حق إلا ما نصّت عليه هذه الاتفاقية صراحةً.',
    ],
    restrictions: [
      'لا يجوز للمرخَّص له نسخ البرنامج أو تعديله أو إجراء هندسة عكسية له أو تفكيكه، إلا بالقدر الذي يُجيزه القانون المعمول به صراحةً رغم هذا القيد، ولا يجوز له الترخيص به من الباطن أو تأجيره أو إتاحته للغير بأي وجه.',
    ],
    fees: (fees) => [
      `تبلغ رسوم الترخيص ${fees} («قيمة العقد»)، تُدفع وفقاً لما هو مبيّن في الملحق رقم (1)، غير شاملة الضرائب المستحقة.`,
    ],
    support: [
      'يلتزم المرخِّص بتقديم خدمات الصيانة والتحديثات والدعم المبيّنة في الملحق رقم (3)، وببذل المساعي المعقولة لتصحيح العيوب القابلة لإعادة الظهور التي يُخطَر بها.',
    ],
    data: [
      'يلتزم كل طرف بقانون حماية البيانات المنطبق عليه. وإذا عالج المرخِّص بيانات شخصية لحساب المرخَّص له، فلا يعالجها إلا وفق تعليماته الموثّقة، ويحافظ على أمنها وسريتها، ويعيدها أو يحذفها عند انتهاء هذه الاتفاقية.',
    ],
    warranty: [
      'يضمن المرخِّص أن يعمل البرنامج بما يتفق جوهرياً مع وثائقه مدة 90 يوماً من تاريخ التسليم. ويقتصر حق المرخَّص له عند الإخلال بهذا الضمان على تصحيح البرنامج أو استبداله، فإن تعذّر ذلك فردّ الرسوم المدفوعة عن البرنامج المعيب.',
    ],
  },
  employment: {
    position: [
      'يستخدم الطرف الأول («صاحب العمل») الطرفَ الثاني («العامل») في الوظيفة ومكان العمل المحددين في الملحق رقم (1)، اعتباراً من تاريخ المباشرة المبيّن فيه.',
    ],
    probation: [
      'يخضع العامل لفترة تجربة بالمدة المحددة في الملحق رقم (1)، على ألا تتجاوز الحد الأقصى الذي يُجيزه قانون العمل المعمول به في مكان العمل. ويجوز لأيٍّ من الطرفين إنهاء العلاقة خلالها وفقاً لأحكام ذلك القانون.',
    ],
    remuneration: [
      'يلتزم صاحب العمل بأن يؤدي للعامل الأجر والبدلات المحددة في الملحق رقم (1) شهرياً في نهاية كل شهر، بالتحويل إلى حسابه المصرفي، ووفقاً لقواعد حماية الأجور المعمول بها.',
    ],
    workingTime: [
      'تكون ساعات العمل والراحة الأسبوعية والعطلات الرسمية والإجازة السنوية والإجازة المرضية وفقاً لما هو محدد في الملحق رقم (1)، ولا تقل في أي حال عمّا يقرره قانون العمل المعمول به لصالح العامل.',
    ],
    duties: [
      'يلتزم العامل بأداء مهام وظيفته بعناية وحسن نية، وباتباع تعليمات صاحب العمل المشروعة، وبالتقيّد بسياسات صاحب العمل المُبلَّغة إليه كتابةً.',
    ],
    termination: [
      'يجوز لأيٍّ من الطرفين إنهاء عقد العمل بإخطار كتابي بالمدة المحددة في الملحق رقم (1)، على ألا تقل عن الحد الأدنى الذي يوجبه قانون العمل المعمول به، أو على أي وجه آخر يُجيزه ذلك القانون.',
      'يستحق العامل عند انتهاء الخدمة مكافأة نهاية الخدمة وأي مبالغ أخرى مستحقة له بموجب قانون العمل المعمول به.',
    ],
    law: [
      'ليس في هذا العقد ما ينتقص من أي حق للعامل تقرره الأحكام الآمرة لقانون العمل المعمول به في مكان العمل، وتسود هذه الأحكام على أي شرط يخالفها.',
    ],
  },
  mou: {
    purpose: [
      'تُثبت هذه المذكرة النوايا الحالية للطرفين بشأن الصفقة المقترحة المبيّنة في الملحق رقم (2) («الصفقة المقترحة»).',
    ],
    nonBinding: [
      'باستثناء البنود المتعلقة بالحصرية والمصروفات والسرية والقانون الواجب التطبيق وتسوية النزاعات («الأحكام الملزمة»)، لا تُعدّ هذه المذكرة ملزمة قانوناً، ولا تُنشئ أي التزام بالتفاوض أو بإبرام الصفقة المقترحة. ولا ينشأ أي التزام من هذا القبيل إلا بموجب اتفاقية نهائية يوقّعها الطرفان.',
      'تنتهي هذه المذكرة بتوقيع اتفاقية نهائية أو بحلول التاريخ المحدد في الملحق رقم (1)، أيهما أسبق. وتبقى الأحكام الملزمة سارية وفقاً لما تنص عليه.',
    ],
    exclusivity: (months) => [
      months
        ? `يلتزم الطرف الأول، مدة ${months === 1 ? 'شهر واحد' : months === 2 ? 'شهرين' : months <= 10 ? `${months} أشهر` : `${months} شهراً`} من تاريخ هذه المذكرة، بعدم السعي أو التفاوض أو التعاقد مع الغير بشأن صفقة مماثلة في جوهرها للصفقة المقترحة.`
        : 'لا يلتزم أيٌّ من الطرفين بأي التزام بالحصرية.',
    ],
    costs: [
      'يتحمّل كل طرف مصروفاته المتعلقة بهذه المذكرة وبالصفقة المقترحة.',
    ],
  },
  settlement: {
    dispute: [
      'نشأ بين الطرفين نزاع بشأن المسائل المبيّنة في الملحق رقم (2) («النزاع»)، ويرغبان في تسويته صلحاً وفقاً لشروط هذه الاتفاقية، دون أن يُعدّ ذلك إقراراً بالمسؤولية من أيٍّ منهما.',
    ],
    sum: [
      'يلتزم الطرف المحدد في الملحق رقم (1) بوصفه الطرف الدافع بأداء مبلغ التسوية المبيّن فيه («مبلغ التسوية») خلال المدة المحددة فيه، بالتحويل إلى الحساب الذي يُخطره به الطرف المستفيد كتابةً.',
    ],
    release: [
      'اعتباراً من استلام مبلغ التسوية كاملاً، وفي الحدود التي يُجيزها القانون، يُبرئ كل طرف الطرفَ الآخر من جميع المطالبات الناشئة عن النزاع أو المتصلة به، سواء أكانت معلومة في تاريخ هذه الاتفاقية أم لا، عدا المطالبات الرامية إلى تنفيذ هذه الاتفاقية.',
    ],
    proceedings: [
      'يلتزم الطرفان، خلال 14 يوماً من استلام مبلغ التسوية، باتخاذ الإجراءات اللازمة لترك أي دعاوى أو إجراءات متعلقة بالنزاع أو إنهائها، ويتحمّل كل طرف مصروفاته ما لم ينص الملحق رقم (1) على خلاف ذلك.',
    ],
  },
};

const FR: CategoryText = {
  headings: {
    purpose: 'Objet et informations confidentielles',
    'nda-obligations': 'Obligations de confidentialité',
    'nda-exceptions': 'Exceptions',
    'nda-term': 'Durée',
    'nda-return': 'Restitution et destruction',
    'no-licence': "Absence de licence et d'engagement",
    remedies: 'Recours',
    services: 'Les Prestations',
    'standard-of-care': "Qualité d'exécution",
    ip: 'Propriété intellectuelle',
    appointment: 'Désignation',
    'agent-duties': 'Obligations des parties',
    commission: 'Commission',
    'agency-law': 'Enregistrement et dispositions impératives',
    premises: 'Les Locaux',
    'lease-term': 'Durée du bail',
    rent: 'Loyer',
    deposit: 'Dépôt de garantie',
    use: 'Destination des locaux',
    maintenance: 'Entretien et travaux',
    assignment: 'Cession et sous-location',
    'licence-grant': 'Concession de licence',
    'licence-restrictions': 'Restrictions',
    'licence-fees': 'Redevances',
    support: 'Maintenance et assistance',
    'data-protection': 'Protection des données',
    warranty: 'Garantie',
    'employment-position': 'Fonctions et lieu de travail',
    probation: "Période d'essai",
    remuneration: 'Rémunération',
    'working-time': 'Durée du travail et congés',
    'employee-duties': 'Obligations du salarié',
    'employment-termination': 'Rupture du contrat de travail',
    'labour-law': 'Dispositions impératives du droit du travail',
    'mou-purpose': 'Objet',
    'non-binding': 'Absence de force obligatoire',
    exclusivity: 'Exclusivité',
    costs: 'Frais',
    'settlement-dispute': 'Le Différend',
    'settlement-sum': 'Somme transactionnelle',
    release: 'Renonciation',
    proceedings: 'Désistement',
  },
  nda: {
    purpose: [
      "Les parties souhaitent échanger des Informations Confidentielles dans le seul but d'évaluer, de négocier et, le cas échéant, de conclure une relation d'affaires entre elles (l'« Objet »).",
      "Les « Informations Confidentielles » désignent toutes les informations, sous quelque forme que ce soit, communiquées par une partie (la « Partie Divulgatrice ») à l'autre (la « Partie Destinataire ») dans le cadre de l'Objet, qui sont identifiées comme confidentielles ou qui pourraient raisonnablement être considérées comme telles.",
    ],
    obligations: [
      "La Partie Destinataire garde les Informations Confidentielles strictement confidentielles, ne les utilise qu'aux fins de l'Objet et les protège avec au moins le même degré de soin que celui qu'elle apporte à ses propres informations confidentielles, et en tout état de cause avec un soin raisonnable.",
      "La Partie Destinataire ne peut communiquer les Informations Confidentielles qu'à ses dirigeants, salariés et conseils professionnels qui en ont besoin aux fins de l'Objet et qui sont tenus à des obligations de confidentialité au moins aussi protectrices que le présent Accord ; elle demeure responsable de leur respect.",
    ],
    exceptions: [
      "Les obligations du présent Accord ne s'appliquent pas aux informations dont la Partie Destinataire peut démontrer : (a) qu'elles sont ou deviennent publiques sans manquement de sa part ; (b) qu'elle les détenait légitimement avant leur communication, sans obligation de confidentialité ; (c) qu'elle les a reçues légitimement d'un tiers autorisé à les communiquer ; ou (d) qu'elle les a développées de manière indépendante, sans utiliser les Informations Confidentielles.",
      "La Partie Destinataire peut communiquer des Informations Confidentielles dans la mesure exigée par la loi, la réglementation ou une juridiction ou autorité compétente, à condition, lorsque la loi le permet, d'en informer préalablement et sans délai la Partie Divulgatrice et de ne communiquer que ce qui est exigé.",
    ],
    term: (years) => [
      years
        ? `Les obligations de confidentialité subsistent pendant ${frYears(years)} à compter de chaque communication. Les obligations relatives aux secrets d'affaires subsistent tant que l'information conserve ce caractère.`
        : 'Les obligations de confidentialité subsistent sans limitation de durée tant que les informations demeurent confidentielles.',
    ],
    returnDestroy: [
      "Sur demande écrite, ou à la fin de l'Objet, la Partie Destinataire restitue ou détruit sans délai les Informations Confidentielles et le confirme par écrit, à l'exception des copies qu'elle est légalement tenue de conserver ou qui figurent dans des systèmes de sauvegarde automatique, lesquelles restent soumises au présent Accord.",
    ],
    noLicence: [
      "Le présent Accord ne confère aucune licence ni aucun autre droit sur les Informations Confidentielles ou sur la propriété intellectuelle. Aucune partie n'est tenue de communiquer une information déterminée ni de conclure un accord ultérieur.",
    ],
    remedies: [
      "Chaque partie reconnaît que des dommages-intérêts peuvent ne pas suffire à réparer un manquement au présent Accord, et que la Partie Divulgatrice peut solliciter des mesures provisoires ou conservatoires, en sus de tout autre recours dont elle dispose.",
    ],
  },
  services: {
    services: (fees) => [
      "Le Premier Contractant (le « Prestataire ») fournit au Second Contractant (le « Client ») les prestations et livrables décrits à l'Annexe 2 (les « Prestations »), conformément au calendrier qui y figure.",
      `Les honoraires des Prestations s'élèvent au total à ${fees} (la « Valeur du Contrat »), hors taxes applicables. Toute modification de l'étendue des Prestations est convenue par écrit, avec l'éventuel ajustement des honoraires.`,
    ],
    standardOfCare: [
      "Le Prestataire exécute les Prestations avec la compétence, le soin et la diligence raisonnables d'un prestataire compétent de services comparables, conformément au droit applicable et au moyen d'un personnel dûment qualifié.",
      "Le Client fournit en temps utile les informations, accès et décisions raisonnablement nécessaires à l'exécution des Prestations. Le Prestataire n'est pas responsable des retards dans la mesure où ils résultent d'un manquement du Client à cet égard.",
    ],
    ip: [
      "À compter du paiement intégral des honoraires correspondants, le Prestataire cède au Client, dans la mesure où le droit applicable le permet, les droits patrimoniaux de propriété intellectuelle sur les livrables créés spécifiquement pour le Client au titre du présent Contrat.",
      "Chaque partie conserve sa propriété intellectuelle préexistante. Le Prestataire concède au Client une licence non exclusive et gratuite d'utilisation des éléments préexistants intégrés aux livrables, dans la mesure nécessaire à l'utilisation de ceux-ci.",
    ],
  },
  agency: {
    appointment: [
      "Le Premier Contractant (le « Mandant ») désigne le Second Contractant (l'« Agent ») comme son agent commercial pour les produits décrits à l'Annexe 2 (les « Produits ») sur le territoire défini à l'Annexe 1 (le « Territoire »), à titre exclusif ou non exclusif selon ce qui y est précisé.",
      "L'Agent négocie les ventes des Produits pour le compte du Mandant. Il n'a pas le pouvoir de conclure des contrats, d'encaisser des paiements ni d'engager le Mandant en son nom, sauf autorisation écrite de celui-ci.",
    ],
    duties: [
      "L'Agent met tout en œuvre pour promouvoir les Produits sur le Territoire, suit les instructions raisonnables du Mandant, le tient informé de l'état du marché et respecte toutes les lois applicables à son activité.",
      "Le Mandant fournit à l'Agent les informations, échantillons et documents raisonnablement nécessaires à son activité et l'informe sans délai de l'acceptation, du refus ou de l'inexécution de toute opération négociée par l'Agent.",
    ],
    commission: (pct, days) => [
      pct
        ? `Le Mandant verse à l'Agent une commission de ${pct} % de la valeur nette facturée de chaque vente des Produits sur le Territoire conclue grâce à l'intervention de l'Agent, dans un délai de ${days} jours à compter de l'encaissement du prix par le Mandant.`
        : "[TAUX DE COMMISSION NON PRÉCISÉ – indiquer le taux et les ventes sur lesquelles il est dû.]",
      "Le Mandant remet à l'Agent un relevé trimestriel des commissions dues, et l'Agent peut, moyennant un préavis raisonnable, vérifier les registres correspondants.",
    ],
    law: [
      "Lorsque la loi du Territoire exige l'inscription du présent Contrat à un registre des agences commerciales, les parties coopèrent en vue de cette inscription, et le Contrat produit ses effets sur le Territoire dans les conditions prévues par cette loi.",
      "Les parties reconnaissent que les dispositions impératives de la loi du Territoire relatives aux agences commerciales, notamment en matière de résiliation, de non-renouvellement et d'indemnisation, s'appliquent nonobstant toute autre stipulation du présent Contrat.",
    ],
  },
  lease: {
    premises: [
      "Le Premier Contractant (le « Bailleur ») donne à bail au Second Contractant (le « Preneur ») les locaux décrits à l'Annexe 2 (les « Locaux ») pour la Destination Autorisée.",
      "Le Bailleur garantit qu'il a le droit de donner les Locaux à bail et qu'à la date de prise d'effet, les Locaux peuvent légalement être utilisés conformément à la Destination Autorisée.",
    ],
    term: (years) => [
      years
        ? `Le bail est consenti pour une durée de ${frYears(years)} à compter de la date de prise d'effet indiquée à l'Annexe 1. Tout renouvellement intervient aux conditions convenues par écrit, sous réserve des droits impératifs prévus par la loi du lieu de situation des Locaux.`
        : "[DURÉE NON PRÉCISÉE – indiquer la date de prise d'effet et la durée du bail.]",
    ],
    rent: (annual) => [
      `Le loyer annuel s'élève à ${annual}, payable d'avance selon les échéances fixées à l'Annexe 1, majoré des charges qui y sont indiquées.`,
      "Le loyer ne peut être augmenté en cours de bail que d'un commun accord écrit et dans les limites permises par la loi du lieu de situation des Locaux.",
    ],
    deposit: [
      "À la signature, le Preneur verse le dépôt de garantie indiqué à l'Annexe 1, que le Bailleur conserve en garantie des obligations du Preneur et restitue dans les 30 jours suivant la remise des Locaux, déduction faite des sommes légitimement dues.",
    ],
    use: [
      "Le Preneur n'utilise les Locaux que pour la destination indiquée à l'Annexe 1 (la « Destination Autorisée »), obtient et maintient les autorisations nécessaires à son activité et respecte le règlement de l'immeuble.",
    ],
    maintenance: [
      "Le Bailleur maintient en bon état la structure, l'extérieur et les équipements communs des Locaux. Le Preneur maintient l'intérieur en bon état, sauf usure normale, et ne réalise aucun travail affectant la structure sans l'accord écrit préalable du Bailleur.",
      "À l'expiration du bail, le Preneur restitue les Locaux dans l'état requis par la présente clause et, si le Bailleur l'exige, retire ses aménagements et remet les lieux en état.",
    ],
    assignment: [
      "Le Preneur ne peut céder le bail, sous-louer ni se dessaisir de tout ou partie des Locaux sans l'accord écrit préalable du Bailleur, qui ne peut être refusé sans motif raisonnable.",
    ],
    insurance: [
      "Le Bailleur assure l'immeuble contre les risques usuels. Le Preneur assure ses biens et aménagements, ainsi que sa responsabilité civile à l'égard des tiers du fait de l'utilisation des Locaux.",
    ],
  },
  licence: {
    grant: [
      "Le Premier Contractant (le « Concédant ») concède au Second Contractant (le « Licencié ») une licence non exclusive et incessible d'utilisation du logiciel décrit à l'Annexe 2 (le « Logiciel ») pour les besoins internes de son activité, pour le nombre d'utilisateurs et sur le territoire indiqués à l'Annexe 1, pendant la durée du présent Contrat.",
      "Le Logiciel et l'ensemble des droits de propriété intellectuelle qui s'y rattachent demeurent la propriété du Concédant ou de ses propres concédants. Aucun droit n'est concédé au-delà de ce que prévoit expressément le présent Contrat.",
    ],
    restrictions: [
      "Le Licencié s'interdit de copier, modifier, décompiler ou procéder à l'ingénierie inverse du Logiciel, sauf dans la mesure où le droit applicable l'autorise expressément nonobstant la présente restriction, et de le sous-licencier, le louer ou le mettre à la disposition de tiers.",
    ],
    fees: (fees) => [
      `Les redevances de licence s'élèvent à ${fees} (la « Valeur du Contrat »), payables selon les modalités de l'Annexe 1, hors taxes applicables.`,
    ],
    support: [
      "Le Concédant assure la maintenance, les mises à jour et l'assistance décrites à l'Annexe 3 et met en œuvre des efforts raisonnables pour corriger les anomalies reproductibles qui lui sont signalées.",
    ],
    data: [
      "Chaque partie respecte le droit de la protection des données qui lui est applicable. Lorsque le Concédant traite des données personnelles pour le compte du Licencié, il ne le fait que sur instruction documentée de celui-ci, en assure la sécurité et la confidentialité, et les restitue ou les supprime au terme du présent Contrat.",
    ],
    warranty: [
      "Le Concédant garantit que le Logiciel fonctionnera pour l'essentiel conformément à sa documentation pendant 90 jours à compter de sa livraison. Le recours du Licencié au titre de cette garantie consiste en la correction ou le remplacement du Logiciel ou, à défaut, le remboursement des redevances versées pour le Logiciel défectueux.",
    ],
  },
  employment: {
    position: [
      "Le Premier Contractant (l'« Employeur ») engage le Second Contractant (le « Salarié ») aux fonctions et au lieu de travail indiqués à l'Annexe 1, à compter de la date d'entrée en fonctions qui y figure.",
    ],
    probation: [
      "L'engagement est soumis à une période d'essai dont la durée est indiquée à l'Annexe 1 et ne peut excéder le maximum autorisé par le droit du travail applicable au lieu de travail. Pendant cette période, chaque partie peut mettre fin à la relation dans les conditions prévues par ce droit.",
    ],
    remuneration: [
      "L'Employeur verse au Salarié le salaire et les indemnités indiqués à l'Annexe 1, mensuellement à terme échu, par virement sur son compte bancaire, conformément aux règles de protection des salaires applicables.",
    ],
    workingTime: [
      "La durée du travail, le repos hebdomadaire, les jours fériés, les congés annuels et les congés de maladie sont ceux indiqués à l'Annexe 1 et ne peuvent en aucun cas être moins favorables au Salarié que ce que prévoit le droit du travail applicable.",
    ],
    duties: [
      "Le Salarié exerce ses fonctions avec diligence et de bonne foi, se conforme aux instructions licites de l'Employeur et respecte les politiques de l'Employeur qui lui ont été notifiées par écrit.",
    ],
    termination: [
      "Chaque partie peut mettre fin au contrat de travail moyennant un préavis écrit dont la durée est indiquée à l'Annexe 1 et ne peut être inférieure au minimum exigé par le droit du travail applicable, ou selon toute autre modalité permise par ce droit.",
      "À la fin du contrat, le Salarié a droit à l'indemnité de fin de service et à toutes autres sommes dues en vertu du droit du travail applicable.",
    ],
    law: [
      "Aucune stipulation du présent Contrat ne réduit les droits que le Salarié tient des dispositions impératives du droit du travail applicable au lieu de travail, lesquelles prévalent sur toute stipulation contraire.",
    ],
  },
  mou: {
    purpose: [
      "Le présent Protocole consigne les intentions actuelles des parties concernant l'opération envisagée décrite à l'Annexe 2 (l'« Opération Envisagée »).",
    ],
    nonBinding: [
      "À l'exception des clauses relatives à l'exclusivité, aux frais, à la confidentialité, au droit applicable et au règlement des différends (les « Stipulations Obligatoires »), le présent Protocole n'a pas de force obligatoire et ne crée aucune obligation de négocier ni de conclure l'Opération Envisagée. Une telle obligation ne peut naître que d'un accord définitif signé par les deux parties.",
      "Le présent Protocole prend fin à la première des deux dates suivantes : la signature d'un accord définitif ou la date indiquée à l'Annexe 1. Les Stipulations Obligatoires survivent dans les conditions qu'elles prévoient.",
    ],
    exclusivity: (months) => [
      months
        ? `Pendant ${months} mois à compter de la date du présent Protocole, le Premier Contractant s'interdit de solliciter, négocier ou conclure avec un tiers un accord portant sur une opération substantiellement similaire à l'Opération Envisagée.`
        : "Aucune partie n'est tenue à une obligation d'exclusivité.",
    ],
    costs: [
      "Chaque partie supporte ses propres frais liés au présent Protocole et à l'Opération Envisagée.",
    ],
  },
  settlement: {
    dispute: [
      "Les parties sont en litige au sujet des questions décrites à l'Annexe 2 (le « Différend ») et souhaitent y mettre fin par voie transactionnelle aux conditions du présent Accord, sans reconnaissance de responsabilité de part ni d'autre.",
    ],
    sum: [
      "La partie désignée à l'Annexe 1 comme partie débitrice verse la somme transactionnelle qui y est indiquée (la « Somme Transactionnelle ») dans le délai qui y figure, par virement sur le compte notifié par écrit par la partie créancière.",
    ],
    release: [
      "À compter de la réception de l'intégralité de la Somme Transactionnelle, et dans la mesure permise par la loi, chaque partie renonce à l'égard de l'autre à toute réclamation née du Différend ou s'y rattachant, qu'elle soit connue ou non à la date du présent Accord, à l'exception des demandes tendant à l'exécution du présent Accord.",
    ],
    proceedings: [
      "Dans les 14 jours suivant la réception de la Somme Transactionnelle, les parties accomplissent les démarches nécessaires pour se désister de toute procédure relative au Différend ou y mettre fin, chacune supportant ses propres frais sauf stipulation contraire de l'Annexe 1.",
    ],
  },
};

export const CATEGORY_TEXT: Record<Locale, CategoryText> = { en: EN, ar: AR, fr: FR };
