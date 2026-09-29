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
  | 'assignment';

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
};

export const CATEGORY_TEXT: Record<Locale, CategoryText> = { en: EN, ar: AR, fr: FR };
