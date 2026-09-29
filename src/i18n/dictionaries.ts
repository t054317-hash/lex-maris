import type { Locale } from './config';

/**
 * Translation dictionaries.
 *
 * Flat dotted keys rather than nested objects: it keeps the type of `t()` a
 * simple union of string literals, so a missing or misspelt key is a compile
 * error instead of a blank space on the page.
 *
 * French uses the register of a Paris commercial practice (cocontractant,
 * clause compromissoire, staries / surestaries for laytime / demurrage).
 *
 * The Arabic is Modern Standard, using the register a Gulf commercial practice
 * would actually use in correspondence -- e.g. الطرف المقابل for counterparty,
 * المحكَّمة for arbitration. It is not a machine gloss of the English, and a
 * native reviewer should still read it before launch.
 */
const en = {
  // --- Brand / chrome ------------------------------------------------------
  'brand.name': 'LEX MARIS',
  'brand.tagline': 'Commercial · Corporate · Maritime',
  'nav.services': 'Services',
  'nav.bench': 'Contract bench',
  'nav.dashboard': "My files",
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.account': 'Account',
  'nav.language': 'Change language',

  // --- Hero ----------------------------------------------------------------
  'hero.eyebrow': 'Commercial, corporate & maritime trade law',
  'hero.title.a': 'Every clause',
  'hero.title.accent': "assessed before",
  'hero.title.b': 'you sign it.',
  'hero.lede':
    "Lex Maris drafts commercial and maritime instruments from your terms and assesses every clause against a fixed, published rule set — in Arabic, English or French.",
  'hero.cta.primary': 'Commission a contract',
  'hero.cta.secondary': 'Try the risk bench',
  'hero.trust':
    "Governing laws modelled: Kuwait · UAE · England & Wales · Singapore · Switzerland · New York",
  'hero.metric.rules': 'clause rules per pass',
  'hero.metric.turnaround': "drafting languages",
  'hero.metric.sealing': "standard clauses in the drafting engine",
  'hero.metric.forum': "arbitral institutions modelled (LCIA · ICC · DIAC)",
  'hero.gavel.hint': 'Strike the gavel',

  // --- Auth ----------------------------------------------------------------
  'auth.signIn.title': 'Sign in',
  'auth.signIn.subtitle': 'Access your matters, drafts and executed instruments.',
  'auth.signUp.title': 'Create an account',
  'auth.signUp.subtitle': 'Commission work and track it from instruction to execution.',
  'auth.email': 'Email address',
  'auth.password': 'Password',
  'auth.fullName': 'Full name',
  'auth.organisation': 'Organisation',
  'auth.submit.signIn': 'Sign in',
  'auth.submit.signUp': 'Create account',
  'auth.toggle.toSignUp': 'No account yet? Create one',
  'auth.toggle.toSignIn': 'Already registered? Sign in',
  'auth.forgot': 'Forgotten your password?',
  'auth.reset.sent': 'Check your email for a reset link.',
  'auth.confirm.sent': 'Check your email to confirm your address, then sign in.',
  'auth.duplicate': 'An account with this email already exists. Please log in.',
  'auth.close': 'Close',
  'auth.working': 'One moment…',
  'auth.privilegeNotice':
    "Information you submit is treated as confidential. Do not share your credentials.",

  // --- Checkout ------------------------------------------------------------
  'checkout.title': 'Contract Writing',
  'checkout.subtitle':
    "Tell us the terms. Counsel reviews your instructions and sends a written fee quote before any drafting begins.",
  'checkout.section.instrument': 'The instrument',
  'checkout.section.parties': 'The parties',
  'checkout.section.terms': 'Commercial terms',
  'checkout.section.contact': 'Your details',
  'checkout.section.payment': 'Payment',
  'checkout.field.instrumentType': 'Instrument type',
  'checkout.field.governingLaw': 'Preferred governing law',
  'checkout.field.forum': 'Preferred dispute forum',
  'checkout.field.firstParty': 'Your entity',
  'checkout.field.secondParty': 'Counterparty',
  'checkout.field.counterpartyJurisdiction': 'Counterparty jurisdiction',
  'checkout.field.value': 'Contract value (USD)',
  'checkout.field.paymentTerms': 'Payment terms (days)',
  'checkout.field.deadline': 'Needed by',
  'checkout.field.instructions': 'Anything else counsel should know',
  'checkout.field.instructions.placeholder':
    'Laytime expectations, security required, known sticking points…',
  'checkout.field.name': 'Full name',
  'checkout.field.email': 'Email address',
  'checkout.field.phone': 'Phone (optional)',
  'checkout.field.country': 'Billing country',
  'checkout.summary.title': 'Order summary',
  'checkout.summary.service': 'Contract writing',
  'checkout.summary.turnaround': 'Turnaround',
  'checkout.summary.days': 'business days',
  'checkout.summary.subtotal': 'Subtotal',
  'checkout.summary.tax': 'Tax',
  'checkout.summary.total': 'Total due',
  'checkout.pay.card': 'Pay by card',
  'checkout.pay.knet': 'Pay by KNET',
  'checkout.pay.transfer': 'Bank transfer',
  'checkout.pay.submit': 'Continue to payment',
  'checkout.pay.redirect':
    'You will be taken to our payment provider. Card details are entered there, never on this site.',
  'checkout.pay.working': 'Creating your order…',
  'checkout.signInPrompt': 'Sign in to attach this order to your account.',
  'checkout.error.required': 'Please complete the highlighted fields.',
  'checkout.riskPreview.title': 'Provisional exposure',
  'checkout.riskPreview.note':
    'Scored live from the terms above by the same engine counsel uses. Indicative only.',

  // --- Capabilities --------------------------------------------------------
  'cap.heading': 'Built for counsel who carry the risk',
  'cap.automation.eyebrow': 'Contract automation',
  'cap.automation.title': 'Draft in minutes, not days',
  'cap.automation.body':
    "A declarative clause tree assembles eleven kinds of instrument — supply, distribution, voyage charterparty, NDA, services, commercial agency, commercial lease, software licence, employment, MoU and settlement — from validated inputs, each with its own clause set. Clause numbering updates automatically as terms are added or removed.",
  'cap.analysis.eyebrow': 'Clause-level analysis',
  'cap.analysis.title': 'Exposure scored as you type',
  'cap.analysis.body':
    'A deterministic rule set scores governing law, forum, caps, security, sanctions and laytime against a fixed model, so scores stay comparable across a portfolio and over time.',
  'cap.maritime.eyebrow': 'Maritime trade',
  'cap.maritime.title': 'Laytime and demurrage, handled',
  'cap.maritime.body':
    'Notice of readiness, excepted periods, demurrage accrual and claim time bars are modelled as first-class terms rather than free-text riders.',
  'cap.execution.eyebrow': "Languages",
  'cap.execution.title': "One contract, three languages",
  'cap.execution.body':
    "The same terms produce the draft in Arabic, English or French, clause for clause. Where a contract is signed in more than one language, it should state which version prevails.",
  'cap.realtime.eyebrow': "Tracking",
  'cap.realtime.title': "Follow every request",
  'cap.realtime.body':
    "Each set of instructions you submit appears in your account with its current stage: received, fee quote, drafting and delivery.",
  'cap.custody.eyebrow': "Confidentiality",
  'cap.custody.title': "Access limited to your account",
  'cap.custody.body':
    "Data travels over encrypted connections (HTTPS). Each request can be read only by you and authorised members of your organisation, and no card details are collected on this site.",

  // --- Bench ---------------------------------------------------------------
  'bench.eyebrow': 'Risk scanner & live contract builder',
  'bench.heading': 'Change a term. Watch the exposure move.',
  'bench.lede':
    'The draft on the right is assembled from the same inputs the scanner reads, so the document a client approves is the document the engine renders.',

  // --- Options (every select on the site) ----------------------------------
  'opt.type.supply': 'Supply of goods',
  'opt.type.distribution': 'Exclusive distribution',
  'opt.type.charterparty': 'Voyage charterparty',
  'opt.type.bill-of-lading': 'Bill of lading terms',
  'opt.type.shareholders': 'Shareholders agreement',
  'opt.type.jv': 'Joint venture',
  'opt.country.AE': 'United Arab Emirates',
  'opt.country.KW': 'Kuwait',
  'opt.country.SA': 'Saudi Arabia',
  'opt.country.QA': 'Qatar',
  'opt.country.GB': 'United Kingdom',
  'opt.country.SG': 'Singapore',
  'opt.country.TW': 'Taiwan',
  'opt.country.XX': 'Not stated',
  'opt.law.GB': 'England & Wales',
  'opt.law.AE': 'United Arab Emirates',
  'opt.law.KW': 'Kuwait',
  'opt.law.SG': 'Singapore',
  'opt.law.CH': 'Switzerland',
  'opt.law.US': 'New York',
  'opt.law.XX': 'Not stated',
  'opt.forum.arbitration-lcia': 'LCIA arbitration, London',
  'opt.forum.arbitration-icc': 'ICC arbitration',
  'opt.forum.arbitration-difc': "DIAC arbitration, seat DIFC",
  'opt.forum.arbitration-adhoc': 'Ad hoc arbitration',
  'opt.forum.local-courts': 'Courts — first party seat',
  'opt.forum.foreign-courts': 'Courts — counterparty seat',
  'opt.forum.silent': 'Not stated',
  'opt.security.lc': 'Confirmed irrevocable LC',
  'opt.security.bank-guarantee': 'On-demand bank guarantee',
  'opt.security.parent-guarantee': 'Parent company guarantee',
  'opt.security.none': 'None',

  // --- Contract builder (wizard) -------------------------------------------
  'wizard.progress': 'Progress',
  'wizard.step.instrument': 'Instrument',
  'wizard.step.commercial': 'Commercial',
  'wizard.step.allocation': 'Risk allocation',
  'wizard.step.forum': 'Law & forum',
  'wizard.step.execute': 'Review',
  'wizard.partyNote':
    "Party names, registration numbers and addresses appear as placeholders. They must be completed and verified against the relevant commercial register before signature.",
  'wizard.field.value': 'Contract value — {value}',
  'wizard.field.paymentTerms': 'Payment terms — {n} days',
  'wizard.field.security': 'Payment security',
  'wizard.field.laytime': 'Laytime — {value}',
  'wizard.laytime.hours': '{n} hours',
  'wizard.field.demurrage': 'Demurrage — {value}',
  'wizard.demurrage.perDay': '{amount} / day',
  'wizard.notStated': 'not stated',
  'wizard.field.cap': 'Liability cap — {value}',
  'wizard.cap.uncapped': 'uncapped',
  'wizard.cap.multiple': '{n}× value',
  'wizard.toggle.forceMajeure': 'Force majeure clause',
  'wizard.toggle.sanctions': 'Sanctions & trade-control clause',
  'wizard.toggle.indemnity': 'Express indemnities',
  'wizard.toggle.convenience': 'Termination for convenience',
  'wizard.toggle.insurance': 'Insurance responsibility allocated',
  'wizard.field.governingLaw': 'Governing law',
  'wizard.field.forum': 'Dispute resolution',
  'wizard.forumNote':
    'Enforceability is assessed against the counterparty asset jurisdiction, not the seat.',
  'wizard.reviewFindings': 'Review findings',

  // --- Risk report ---------------------------------------------------------
  'risk.exposure': 'exposure',
  'risk.aggregate': 'Aggregate risk',
  'risk.noFindings': 'No findings',
  'risk.band.safe': 'Acceptable',
  'risk.band.watch': 'Watch',
  'risk.band.risk': 'Elevated',
  'risk.band.critical': 'Critical',
  'severity.critical': 'Critical',
  'severity.high': 'High',
  'severity.medium': 'Medium',
  'severity.low': 'Low',
  'severity.info': 'Info',
  'findings.none.title': 'No findings raised',
  'findings.none.body':
    'Every rule in the current model passed. The draft is ready for partner review and execution.',
  'findings.remedy': 'Recommended amendment',

  // --- Draft preview -------------------------------------------------------
  'doc.live': 'Live draft',
  'doc.clauses': '{n} clauses',
  'doc.footer': 'Draft — not for execution. Generated by the Lex Maris document engine.',

  // --- Checkout (extra fields and page chrome) ------------------------------
  'checkout.field.laytime': 'Laytime (running hours)',
  'checkout.field.demurrage': 'Demurrage (USD / day)',
  'checkout.error.failed': 'Checkout failed ({status}).',
  'checkout.error.noRedirect': 'The payment provider returned no redirect URL.',
  'checkout.breadcrumb': 'Contract writing',
  'checkout.eyebrow': 'Commission',
  'checkout.offline':
    "The ordering service is temporarily unavailable. Please try again shortly.",
  'checkout.disclaimer':
    "Submitting this form sends instructions; it does not create a lawyer–client engagement. An engagement letter setting out scope and fees follows before work begins. The risk score shown is an automated indicator, not legal advice.",
  'meta.checkout.description':
    'Commission a commercial or maritime instrument, drafted by counsel and returned with a clause-level risk report.',

  // --- Auth (extra) ----------------------------------------------------------
  'auth.error.invalid': 'Incorrect email or password.',
  'auth.error.rateLimited': 'Too many attempts. Please wait a moment and try again.',
  'auth.error.unconfirmed': 'Please confirm your email address first, then sign in.',
  'auth.error.check': 'Check the details you entered.',
  'auth.error.notProvisioned': 'This account is not fully provisioned. Please contact support.',
  'auth.error.generic': 'Something went wrong. Please try again.',
  'auth.error.emailFirst': 'Enter your email address first.',
  'auth.error.oauth':
    'Sign-in could not be completed. Please try again, or sign in with your email.',
  'auth.error.oauthCancelled': 'Sign-in was cancelled.',

  // --- Intro ---------------------------------------------------------------
  'intro.label': 'Introduction',
  'intro.strike': 'Strike the gavel to enter',
  'intro.convene': 'Click anywhere to convene',
  'intro.skip': 'Skip intro',

  // --- Dashboard -----------------------------------------------------------
  'meta.dashboard.title': "My files",
  'dash.new': "New instructions",
  'timeline.title': 'Matter progress',
  'timeline.complete': '{done} of {total} stages complete',
  'timeline.action': 'Action required',

  // --- Site-wide -------------------------------------------------------------
  'meta.title': 'LEX MARIS — Commercial, Corporate & Maritime Trade Law',
  'meta.description':
    'Contract automation, clause-level risk analysis and cryptographic execution for commercial, corporate and maritime trade counsel.',
  'common.skip': 'Skip to content',

  'checkout.fee.title': "Fees",
  'checkout.fee.body':
    "No fixed fee applies. Fees depend on the scope and complexity of the instrument and are set out in a written quote and engagement letter for your approval. Nothing is charged when you submit this form.",
  'checkout.submit': "Submit instructions",
  'checkout.working': "Submitting…",
  'checkout.success.title': "Instructions received",
  'checkout.success.body':
    "Reference {ref}. Counsel will review your instructions and send a fee quote. You can follow the status of this request in your account.",
  'checkout.success.cta': "View my files",
  'dash.heading': "My files",
  'dash.lede':
    "Every set of instructions you have submitted, with its current stage.",
  'dash.empty.title': "No files yet",
  'dash.empty.body':
    "When you submit instructions, each request appears here with its current stage.",
  'dash.error': "Your files could not be loaded. Please refresh the page.",
  'dash.submitted': "Submitted {date}",
  'dash.stage.received': "Instructions received",
  'dash.stage.quote': "Review and fee quote",
  'dash.stage.drafting': "Drafting",
  'dash.stage.delivered': "Delivered",
  'dash.stage.pending': "Pending",
  'dash.stage.current': "In progress",
  'dash.stage.done': "Complete",
  'dash.status.cancelled': "Cancelled",
  'dash.status.refunded': "Refunded",
  'opt.type.nda': "Mutual non-disclosure agreement (NDA)",
  'opt.type.services': "Services agreement",
  'opt.type.agency': "Commercial agency",
  'opt.type.lease': "Commercial lease",
  'wizard.field.premisesLocation': "Location of the premises",
  'wizard.field.ndaYears': "Confidentiality period (years) — {value}",
  'wizard.indefinite': "indefinite",
  'wizard.field.annualRent': "Annual rent — {value}",
  'wizard.field.leaseYears': "Lease term (years) — {value}",
  'wizard.field.commission': "Commission rate — {n}%",
  'wizard.field.fees': "Fees — {value}",
  'wizard.ndaNote':
    "An NDA has no liability cap or commercial risk allocation: a breach is remedied by damages and injunctive relief. Continue to the governing law and forum.",
  'opt.type.licence': "Software licence",
  'opt.type.employment': "Employment contract",
  'opt.type.mou': "Memorandum of understanding (MoU)",
  'opt.type.settlement': "Settlement agreement",
  'wizard.field.exclusivity': "Exclusivity period (months) — {value}",
  'wizard.none': "none",
  'wizard.employmentNote':
    "Salary, allowances, probation, notice and leave are set in Schedule 1 of the draft, and may not be less favourable to the employee than the labour law of the place of work.",
  'wizard.settlementNote':
    "The settlement sum, the paying party and the payment period are set in Schedule 1 of the draft.",
  'wizard.noAllocationNote':
    "This category has no commercial risk allocation (liability cap, force majeure, sanctions). Continue to the governing law and forum.",
  'wizard.field.licenceFees': "Licence fees — {value}",
  // --- Shared --------------------------------------------------------------
  'common.notLegalAdvice':
    'Output is a triage signal for a qualified practitioner, not legal advice.',
  'common.required': 'Required',
  'common.optional': 'Optional',
  'common.back': 'Back',
  'common.continue': 'Continue',
} as const;

export type TranslationKey = keyof typeof en;

const ar: Record<TranslationKey, string> = {
  // --- Brand / chrome ------------------------------------------------------
  'brand.name': 'ليكس ماريس',
  'brand.tagline': 'تجاري · مؤسسي · بحري',
  'nav.services': 'الخدمات',
  'nav.bench': 'منصة العقود',
  'nav.dashboard': "ملفاتي",
  'nav.signIn': 'تسجيل الدخول',
  'nav.signOut': 'تسجيل الخروج',
  'nav.account': 'الحساب',
  'nav.language': 'تغيير اللغة',

  // --- Hero ----------------------------------------------------------------
  'hero.eyebrow': 'القانون التجاري والمؤسسي والتجارة البحرية',
  'hero.title.a': 'كل بند',
  'hero.title.accent': 'مُقيَّم قبل',
  'hero.title.b': 'أن توقّعه.',
  'hero.lede':
    "تصوغ ليكس ماريس العقود التجارية والبحرية وفقاً لشروطك، وتقيّم كل بند وفق مجموعة قواعد ثابتة ومعلنة — بالعربية أو الإنجليزية أو الفرنسية.",
  'hero.cta.primary': 'اطلب صياغة عقد',
  'hero.cta.secondary': 'جرّب منصة المخاطر',
  'hero.trust':
    "القوانين المُنمذجة: الكويت · الإمارات · إنجلترا وويلز · سنغافورة · سويسرا · نيويورك",
  'hero.metric.rules': 'قاعدة بنود في كل تقييم',
  'hero.metric.turnaround': "لغات للصياغة",
  'hero.metric.sealing': "بنداً نموذجياً في محرّك الصياغة",
  'hero.metric.forum': "مؤسسات تحكيم مُنمذجة (LCIA · ICC · DIAC)",
  'hero.gavel.hint': 'اطرق المطرقة',

  // --- Auth ----------------------------------------------------------------
  'auth.signIn.title': 'تسجيل الدخول',
  'auth.signIn.subtitle': 'اطّلع على قضاياك ومسوداتك والعقود المنفّذة.',
  'auth.signUp.title': 'إنشاء حساب',
  'auth.signUp.subtitle': 'اطلب العمل وتابعه من التكليف حتى التنفيذ.',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.fullName': 'الاسم الكامل',
  'auth.organisation': 'الجهة',
  'auth.submit.signIn': 'تسجيل الدخول',
  'auth.submit.signUp': 'إنشاء الحساب',
  'auth.toggle.toSignUp': 'ليس لديك حساب؟ أنشئ حساباً',
  'auth.toggle.toSignIn': 'مسجَّل بالفعل؟ سجّل الدخول',
  'auth.forgot': 'هل نسيت كلمة المرور؟',
  'auth.reset.sent': 'راجع بريدك الإلكتروني للحصول على رابط إعادة التعيين.',
  'auth.confirm.sent': 'راجع بريدك لتأكيد عنوانك، ثم سجّل الدخول.',
  'auth.duplicate': 'يوجد حساب مسجَّل بهذا البريد الإلكتروني. يرجى تسجيل الدخول.',
  'auth.close': 'إغلاق',
  'auth.working': 'لحظة واحدة…',
  'auth.privilegeNotice':
    "تُعامَل المعلومات التي ترسلها بسرية. لا تشارك بيانات دخولك مع أحد.",

  // --- Checkout ------------------------------------------------------------
  'checkout.title': 'صياغة العقود',
  'checkout.subtitle':
    "أخبرنا بالشروط. يراجع المحامي تكليفك ويرسل لك عرض أتعاب مكتوباً قبل البدء بأي صياغة.",
  'checkout.section.instrument': 'العقد',
  'checkout.section.parties': 'الأطراف',
  'checkout.section.terms': 'الشروط التجارية',
  'checkout.section.contact': 'بياناتك',
  'checkout.section.payment': 'الدفع',
  'checkout.field.instrumentType': 'نوع العقد',
  'checkout.field.governingLaw': 'القانون الحاكم المفضّل',
  'checkout.field.forum': 'جهة فضّ النزاع المفضّلة',
  'checkout.field.firstParty': 'جهتك',
  'checkout.field.secondParty': 'الطرف المقابل',
  'checkout.field.counterpartyJurisdiction': 'اختصاص الطرف المقابل',
  'checkout.field.value': 'قيمة العقد (دولار أمريكي)',
  'checkout.field.paymentTerms': 'مدة السداد (أيام)',
  'checkout.field.deadline': 'المطلوب بحلول',
  'checkout.field.instructions': 'أي معلومات أخرى تهم المحاماة',
  'checkout.field.instructions.placeholder':
    'توقعات مدة التحميل، الضمانات المطلوبة، نقاط الخلاف المعروفة…',
  'checkout.field.name': 'الاسم الكامل',
  'checkout.field.email': 'البريد الإلكتروني',
  'checkout.field.phone': 'الهاتف (اختياري)',
  'checkout.field.country': 'بلد الفاتورة',
  'checkout.summary.title': 'ملخص الطلب',
  'checkout.summary.service': 'صياغة عقد',
  'checkout.summary.turnaround': 'مدة التنفيذ',
  'checkout.summary.days': 'أيام عمل',
  'checkout.summary.subtotal': 'المجموع الفرعي',
  'checkout.summary.tax': 'الضريبة',
  'checkout.summary.total': 'الإجمالي المستحق',
  'checkout.pay.card': 'الدفع بالبطاقة',
  'checkout.pay.knet': 'الدفع عبر كي-نت',
  'checkout.pay.transfer': 'حوالة بنكية',
  'checkout.pay.submit': 'المتابعة إلى الدفع',
  'checkout.pay.redirect':
    'سيتم تحويلك إلى مزوّد الدفع. تُدخل بيانات البطاقة هناك، وليس على هذا الموقع.',
  'checkout.pay.working': 'جارٍ إنشاء طلبك…',
  'checkout.signInPrompt': 'سجّل الدخول لربط هذا الطلب بحسابك.',
  'checkout.error.required': 'يرجى إكمال الحقول المحدَّدة.',
  'checkout.riskPreview.title': 'التعرّض المبدئي',
  'checkout.riskPreview.note':
    'يُحسب فورياً من الشروط أعلاه بالمحرّك نفسه الذي تستخدمه المحاماة. للاسترشاد فقط.',

  // --- Capabilities --------------------------------------------------------
  'cap.heading': 'مُصمَّم للمحامين الذين يتحمّلون المخاطر',
  'cap.automation.eyebrow': 'آلية صياغة العقود',
  'cap.automation.title': 'صياغة في دقائق، لا في أيام',
  'cap.automation.body':
    "شجرة بنود وصفية تُركّب أحد عشر نوعاً من العقود — التوريد، والتوزيع الحصري، ومشارطة الإيجار بالرحلة، وعدم الإفصاح، وتقديم الخدمات، والوكالة التجارية، والإيجار التجاري، وترخيص البرمجيات، والعمل، ومذكرة التفاهم، والتسوية — من مدخلات مُتحقَّق منها، لكلٍّ منها بنوده الخاصة. ويتحدّث ترقيم البنود تلقائياً عند إضافة الشروط أو حذفها.",
  'cap.analysis.eyebrow': 'تحليل على مستوى البنود',
  'cap.analysis.title': 'تقييم التعرّض أثناء الكتابة',
  'cap.analysis.body':
    'مجموعة قواعد حتمية تقيّم القانون الحاكم وجهة النزاع وحدود المسؤولية والضمانات والعقوبات ومدة التحميل وفق نموذج ثابت، بحيث تبقى النتائج قابلة للمقارنة عبر المحفظة وعبر الزمن.',
  'cap.maritime.eyebrow': 'التجارة البحرية',
  'cap.maritime.title': 'مدة التحميل والغرامة، مُعالجتان',
  'cap.maritime.body':
    'إشعار الجهوزية والفترات المستثناة واستحقاق غرامة التأخير ومواعيد سقوط المطالبات، جميعها مُنمذجة كشروط أساسية وليست ملاحق نصية حرة.',
  'cap.execution.eyebrow': "اللغات",
  'cap.execution.title': "عقد واحد بثلاث لغات",
  'cap.execution.body':
    "تُنتج الشروط نفسها المسودة بالعربية أو الإنجليزية أو الفرنسية، بنداً ببند. وإذا وُقّع العقد بأكثر من لغة، وجب أن ينصّ على النسخة التي يُعتدّ بها عند الاختلاف.",
  'cap.realtime.eyebrow': "المتابعة",
  'cap.realtime.title': "تابع كل طلب",
  'cap.realtime.body':
    "يظهر كل تكليف ترسله في حسابك مع مرحلته الحالية: الاستلام، ثم عرض الأتعاب، ثم الصياغة، ثم التسليم.",
  'cap.custody.eyebrow': "السرية",
  'cap.custody.title': "الوصول مقصور على حسابك",
  'cap.custody.body':
    "تنتقل البيانات عبر اتصالات مشفّرة (HTTPS)، ولا يطّلع على طلبك إلا أنت والمخوّلون من أعضاء جهتك، ولا يجمع هذا الموقع أي بيانات بطاقات دفع.",

  // --- Bench ---------------------------------------------------------------
  'bench.eyebrow': 'ماسح المخاطر ومنصة صياغة العقود',
  'bench.heading': 'غيّر شرطاً واحداً، وراقب تغيّر التعرّض.',
  'bench.lede':
    'المسودة المعروضة مُركَّبة من المدخلات نفسها التي يقرأها الماسح، فالمستند الذي يعتمده العميل هو المستند الذي يُنتجه المحرّك.',

  // --- Options (every select on the site) ----------------------------------
  'opt.type.supply': 'توريد بضائع',
  'opt.type.distribution': 'توزيع حصري',
  'opt.type.charterparty': 'مشارطة إيجار بالرحلة',
  'opt.type.bill-of-lading': 'شروط سند الشحن',
  'opt.type.shareholders': 'اتفاقية مساهمين',
  'opt.type.jv': 'مشروع مشترك',
  'opt.country.AE': 'الإمارات العربية المتحدة',
  'opt.country.KW': 'الكويت',
  'opt.country.SA': 'المملكة العربية السعودية',
  'opt.country.QA': 'قطر',
  'opt.country.GB': 'المملكة المتحدة',
  'opt.country.SG': 'سنغافورة',
  'opt.country.TW': 'تايوان',
  'opt.country.XX': 'غير محدد',
  'opt.law.GB': 'إنجلترا وويلز',
  'opt.law.AE': 'الإمارات العربية المتحدة',
  'opt.law.KW': 'الكويت',
  'opt.law.SG': 'سنغافورة',
  'opt.law.CH': 'سويسرا',
  'opt.law.US': 'نيويورك',
  'opt.law.XX': 'غير محدد',
  'opt.forum.arbitration-lcia': 'تحكيم محكمة لندن للتحكيم الدولي (LCIA)، لندن',
  'opt.forum.arbitration-icc': 'تحكيم غرفة التجارة الدولية (ICC)',
  'opt.forum.arbitration-difc':
    "تحكيم مركز دبي للتحكيم الدولي (DIAC)، مقره مركز دبي المالي العالمي",
  'opt.forum.arbitration-adhoc': 'تحكيم حرّ (غير مؤسسي)',
  'opt.forum.local-courts': 'المحاكم — دولة الطرف الأول',
  'opt.forum.foreign-courts': 'المحاكم — دولة الطرف المقابل',
  'opt.forum.silent': 'غير محدد',
  'opt.security.lc': 'خطاب اعتماد معزَّز غير قابل للإلغاء',
  'opt.security.bank-guarantee': 'خطاب ضمان بنكي عند الطلب',
  'opt.security.parent-guarantee': 'كفالة الشركة الأم',
  'opt.security.none': 'لا يوجد',

  // --- Contract builder (wizard) -------------------------------------------
  'wizard.progress': 'مراحل الإعداد',
  'wizard.step.instrument': 'العقد',
  'wizard.step.commercial': 'الشروط التجارية',
  'wizard.step.allocation': 'توزيع المخاطر',
  'wizard.step.forum': 'القانون وجهة النزاع',
  'wizard.step.execute': 'المراجعة',
  'wizard.partyNote':
    "تظهر أسماء الأطراف وأرقام قيدها وعناوينها كحقول فارغة بين معقوفين، ويجب استكمالها والتحقق منها من السجل التجاري المختص قبل التوقيع.",
  'wizard.field.value': 'قيمة العقد — {value}',
  'wizard.field.paymentTerms': 'مدة السداد — {n} يوماً',
  'wizard.field.security': 'ضمان السداد',
  'wizard.field.laytime': 'مدة التحميل والتفريغ — {value}',
  'wizard.laytime.hours': '{n} ساعة',
  'wizard.field.demurrage': 'غرامة التأخير — {value}',
  'wizard.demurrage.perDay': '{amount} / يوم',
  'wizard.notStated': 'غير محددة',
  'wizard.field.cap': 'سقف المسؤولية — {value}',
  'wizard.cap.uncapped': 'غير محدود',
  'wizard.cap.multiple': '{n} × القيمة',
  'wizard.toggle.forceMajeure': 'بند القوة القاهرة',
  'wizard.toggle.sanctions': 'بند العقوبات وضوابط التجارة',
  'wizard.toggle.indemnity': 'تعويضات صريحة',
  'wizard.toggle.convenience': 'الإنهاء للملاءمة',
  'wizard.toggle.insurance': 'تحديد مسؤولية التأمين',
  'wizard.field.governingLaw': 'القانون الواجب التطبيق',
  'wizard.field.forum': 'تسوية النزاعات',
  'wizard.forumNote':
    'تُقيَّم قابلية التنفيذ وفق الدولة التي توجد فيها أصول الطرف المقابل، لا وفق مقر التحكيم.',
  'wizard.reviewFindings': 'مراجعة الملاحظات',

  // --- Risk report ---------------------------------------------------------
  'risk.exposure': 'التعرّض',
  'risk.aggregate': 'إجمالي المخاطر',
  'risk.noFindings': 'لا توجد ملاحظات',
  'risk.band.safe': 'مقبول',
  'risk.band.watch': 'تحت المراقبة',
  'risk.band.risk': 'مرتفع',
  'risk.band.critical': 'حرج',
  'severity.critical': 'حرجة',
  'severity.high': 'عالية',
  'severity.medium': 'متوسطة',
  'severity.low': 'منخفضة',
  'severity.info': 'للعلم',
  'findings.none.title': 'لا توجد ملاحظات',
  'findings.none.body':
    'اجتازت المسودة جميع قواعد النموذج الحالي، وهي جاهزة لمراجعة الشريك والتوقيع.',
  'findings.remedy': 'التعديل المقترح',

  // --- Draft preview -------------------------------------------------------
  'doc.live': 'المسودة الحية',
  'doc.clauses': '{n} بنداً',
  'doc.footer': 'مسودة — غير معدّة للتوقيع. أُنشئت بواسطة محرّك مستندات ليكس ماريس.',

  // --- Checkout (extra fields and page chrome) ------------------------------
  'checkout.field.laytime': 'مدة التحميل والتفريغ (ساعات متواصلة)',
  'checkout.field.demurrage': 'غرامة التأخير (دولار أمريكي / يوم)',
  'checkout.error.failed': 'تعذّر إتمام الطلب ({status}).',
  'checkout.error.noRedirect': 'لم يُرجع مزوّد الدفع رابط التحويل.',
  'checkout.breadcrumb': 'صياغة العقود',
  'checkout.eyebrow': 'طلب خدمة',
  'checkout.offline':
    "خدمة استقبال الطلبات غير متاحة مؤقتاً. يرجى المحاولة بعد قليل.",
  'checkout.disclaimer':
    "إرسال هذا النموذج هو تقديم تكليف، ولا يُنشئ بذاته علاقة وكالة بين المحامي والعميل. يُرسَل خطاب تكليف يحدد النطاق والأتعاب قبل بدء العمل. مؤشر المخاطر المعروض تقييم آلي، وليس استشارة قانونية.",
  'meta.checkout.description':
    'اطلب صياغة عقد تجاري أو بحري يُعدّه محامون متخصصون ويُسلَّم مع تقرير مخاطر على مستوى البنود.',

  // --- Auth (extra) ----------------------------------------------------------
  'auth.error.invalid': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth.error.rateLimited': 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مجدداً.',
  'auth.error.unconfirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً، ثم تسجيل الدخول.',
  'auth.error.check': 'يرجى مراجعة البيانات التي أدخلتها.',
  'auth.error.notProvisioned': 'لم يكتمل إعداد هذا الحساب. يرجى التواصل مع الدعم.',
  'auth.error.generic': 'حدث خطأ ما. يرجى المحاولة مجدداً.',
  'auth.error.emailFirst': 'أدخل بريدك الإلكتروني أولاً.',
  'auth.error.oauth':
    'تعذّر إكمال تسجيل الدخول. يرجى المحاولة مجدداً، أو تسجيل الدخول بالبريد الإلكتروني.',
  'auth.error.oauthCancelled': 'أُلغي تسجيل الدخول.',

  // --- Intro ---------------------------------------------------------------
  'intro.label': 'المقدمة',
  'intro.strike': 'اطرق المطرقة للدخول',
  'intro.convene': 'انقر في أي مكان لافتتاح الجلسة',
  'intro.skip': 'تخطّي المقدمة',

  // --- Dashboard -----------------------------------------------------------
  'meta.dashboard.title': "ملفاتي",
  'dash.new': "تكليف جديد",
  'timeline.title': 'مراحل الملف',
  'timeline.complete': 'اكتملت {done} من {total} مراحل',
  'timeline.action': 'مطلوب إجراء',

  // --- Site-wide -------------------------------------------------------------
  'meta.title': 'ليكس ماريس — القانون التجاري والمؤسسي والتجارة البحرية',
  'meta.description':
    'أتمتة صياغة العقود، وتحليل المخاطر على مستوى البنود، والتوقيع التشفيري للمحامين في القانون التجاري والمؤسسي والتجارة البحرية.',
  'common.skip': 'انتقل إلى المحتوى',

  'checkout.fee.title': "الأتعاب",
  'checkout.fee.body':
    "لا توجد أتعاب ثابتة. تُحدَّد الأتعاب بحسب نطاق العقد ودرجة تعقيده، وتُبيَّن في عرض مكتوب وخطاب تكليف لموافقتك. لا يُستوفى أي مبلغ عند إرسال هذا النموذج.",
  'checkout.submit': "إرسال التكليف",
  'checkout.working': "جارٍ الإرسال…",
  'checkout.success.title': "تم استلام تكليفك",
  'checkout.success.body':
    "المرجع {ref}. سيراجع المحامي تكليفك ويرسل لك عرض الأتعاب، ويمكنك متابعة حالة الطلب من حسابك.",
  'checkout.success.cta': "عرض ملفاتي",
  'dash.heading': "ملفاتي",
  'dash.lede': "جميع التكليفات التي أرسلتها، مع المرحلة الحالية لكل منها.",
  'dash.empty.title': "لا توجد ملفات بعد",
  'dash.empty.body': "عند إرسال أي تكليف، سيظهر هنا مع مرحلته الحالية.",
  'dash.error': "تعذّر تحميل ملفاتك. يرجى تحديث الصفحة.",
  'dash.submitted': "أُرسل في {date}",
  'dash.stage.received': "استلام التكليف",
  'dash.stage.quote': "المراجعة وعرض الأتعاب",
  'dash.stage.drafting': "الصياغة",
  'dash.stage.delivered': "التسليم",
  'dash.stage.pending': "لم تبدأ",
  'dash.stage.current': "قيد التنفيذ",
  'dash.stage.done': "مكتملة",
  'dash.status.cancelled': "ملغى",
  'dash.status.refunded': "مُسترد",
  'opt.type.nda': "اتفاقية عدم إفصاح متبادلة (NDA)",
  'opt.type.services': "اتفاقية تقديم خدمات",
  'opt.type.agency': "وكالة تجارية",
  'opt.type.lease': "إيجار تجاري",
  'wizard.field.premisesLocation': "موقع العين المؤجَّرة",
  'wizard.field.ndaYears': "مدة السرية (بالسنوات) — {value}",
  'wizard.indefinite': "غير محددة",
  'wizard.field.annualRent': "الأجرة السنوية — {value}",
  'wizard.field.leaseYears': "مدة الإيجار (بالسنوات) — {value}",
  'wizard.field.commission': "نسبة العمولة — {n}%",
  'wizard.field.fees': "الأتعاب — {value}",
  'wizard.ndaNote':
    "لا تتضمن اتفاقية عدم الإفصاح سقفاً للمسؤولية أو توزيعاً تجارياً للمخاطر، إذ يُجبر الإخلال بها بالتعويض والإجراءات الوقتية. تابع إلى القانون الواجب التطبيق وجهة النزاع.",
  'opt.type.licence': "ترخيص برمجيات",
  'opt.type.employment': "عقد عمل",
  'opt.type.mou': "مذكرة تفاهم",
  'opt.type.settlement': "اتفاقية تسوية (صلح)",
  'wizard.field.exclusivity': "مدة الحصرية (بالأشهر) — {value}",
  'wizard.none': "لا يوجد",
  'wizard.employmentNote':
    "يُحدَّد الأجر والبدلات وفترة التجربة ومهلة الإخطار والإجازات في الملحق رقم (1) من المسودة، ولا يجوز أن تكون أقل فائدة للعامل مما يقرره قانون العمل في مكان العمل.",
  'wizard.settlementNote':
    "يُحدَّد مبلغ التسوية والطرف الدافع ومدة السداد في الملحق رقم (1) من المسودة.",
  'wizard.noAllocationNote':
    "لا تتضمن هذه الفئة توزيعاً تجارياً للمخاطر (سقف المسؤولية، القوة القاهرة، العقوبات). تابع إلى القانون الواجب التطبيق وجهة النزاع.",
  'wizard.field.licenceFees': "رسوم الترخيص — {value}",
  // --- Shared --------------------------------------------------------------
  'common.notLegalAdvice':
    'النتيجة مؤشر فرز لممارس مؤهّل، وليست استشارة قانونية.',
  'common.required': 'مطلوب',
  'common.optional': 'اختياري',
  'common.back': 'رجوع',
  'common.continue': 'متابعة',
};

const fr: Record<TranslationKey, string> = {
  // --- Brand / chrome ------------------------------------------------------
  'brand.name': 'LEX MARIS',
  'brand.tagline': 'Commercial · Sociétés · Maritime',
  'nav.services': 'Services',
  'nav.bench': 'Atelier contrats',
  'nav.dashboard': "Mes dossiers",
  'nav.signIn': 'Se connecter',
  'nav.signOut': 'Se déconnecter',
  'nav.account': 'Compte',
  'nav.language': 'Changer de langue',

  // --- Hero ----------------------------------------------------------------
  'hero.eyebrow': 'Droit commercial, des sociétés et du commerce maritime',
  'hero.title.a': 'Chaque clause',
  'hero.title.accent': 'évaluée avant',
  'hero.title.b': 'votre signature.',
  'hero.lede':
    "Lex Maris rédige vos instruments commerciaux et maritimes à partir de vos conditions et évalue chaque clause selon un ensemble de règles fixe et publié — en arabe, en anglais ou en français.",
  'hero.cta.primary': 'Commander un contrat',
  'hero.cta.secondary': "Essayer l'atelier de risques",
  'hero.trust':
    "Droits applicables modélisés : Koweït · Émirats · Angleterre et pays de Galles · Singapour · Suisse · New York",
  'hero.metric.rules': 'règles de clauses par analyse',
  'hero.metric.turnaround': "langues de rédaction",
  'hero.metric.sealing': "clauses types dans le moteur de rédaction",
  'hero.metric.forum':
    "institutions d'arbitrage modélisées (LCIA · CCI · DIAC)",
  'hero.gavel.hint': 'Frappez le maillet',

  // --- Auth ----------------------------------------------------------------
  'auth.signIn.title': 'Connexion',
  'auth.signIn.subtitle': 'Accédez à vos dossiers, projets et actes signés.',
  'auth.signUp.title': 'Créer un compte',
  'auth.signUp.subtitle': "Confiez-nous un dossier et suivez-le de l'instruction à la signature.",
  'auth.email': 'Adresse e-mail',
  'auth.password': 'Mot de passe',
  'auth.fullName': 'Nom complet',
  'auth.organisation': 'Organisation',
  'auth.submit.signIn': 'Se connecter',
  'auth.submit.signUp': 'Créer le compte',
  'auth.toggle.toSignUp': 'Pas encore de compte ? Créez-en un',
  'auth.toggle.toSignIn': 'Déjà inscrit ? Connectez-vous',
  'auth.forgot': 'Mot de passe oublié ?',
  'auth.reset.sent': 'Consultez votre boîte mail pour le lien de réinitialisation.',
  'auth.confirm.sent': 'Consultez votre boîte mail pour confirmer votre adresse, puis connectez-vous.',
  'auth.duplicate': 'Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter.',
  'auth.close': 'Fermer',
  'auth.working': 'Un instant…',
  'auth.privilegeNotice':
    "Les informations que vous transmettez sont traitées de manière confidentielle. Ne partagez pas vos identifiants.",

  // --- Checkout ------------------------------------------------------------
  'checkout.title': 'Rédaction de contrats',
  'checkout.subtitle':
    "Indiquez-nous vos conditions. Nos avocats examinent vos instructions et vous adressent un devis d'honoraires écrit avant toute rédaction.",
  'checkout.section.instrument': "L'instrument",
  'checkout.section.parties': 'Les parties',
  'checkout.section.terms': 'Conditions commerciales',
  'checkout.section.contact': 'Vos coordonnées',
  'checkout.section.payment': 'Paiement',
  'checkout.field.instrumentType': "Type d'instrument",
  'checkout.field.governingLaw': 'Droit applicable souhaité',
  'checkout.field.forum': 'Mode de règlement des différends souhaité',
  'checkout.field.firstParty': 'Votre société',
  'checkout.field.secondParty': 'Cocontractant',
  'checkout.field.counterpartyJurisdiction': 'Juridiction du cocontractant',
  'checkout.field.value': 'Valeur du contrat (USD)',
  'checkout.field.paymentTerms': 'Délai de paiement (jours)',
  'checkout.field.deadline': 'Échéance souhaitée',
  'checkout.field.instructions': 'Autres informations utiles à vos avocats',
  'checkout.field.instructions.placeholder':
    'Attentes en matière de staries, sûretés requises, points de blocage connus…',
  'checkout.field.name': 'Nom complet',
  'checkout.field.email': 'Adresse e-mail',
  'checkout.field.phone': 'Téléphone (facultatif)',
  'checkout.field.country': 'Pays de facturation',
  'checkout.summary.title': 'Récapitulatif de la commande',
  'checkout.summary.service': 'Rédaction de contrat',
  'checkout.summary.turnaround': 'Délai de livraison',
  'checkout.summary.days': 'jours ouvrés',
  'checkout.summary.subtotal': 'Sous-total',
  'checkout.summary.tax': 'Taxes',
  'checkout.summary.total': 'Total à payer',
  'checkout.pay.card': 'Payer par carte',
  'checkout.pay.knet': 'Payer par KNET',
  'checkout.pay.transfer': 'Virement bancaire',
  'checkout.pay.submit': 'Procéder au paiement',
  'checkout.pay.redirect':
    'Vous serez redirigé vers notre prestataire de paiement. Les données de carte y sont saisies, jamais sur ce site.',
  'checkout.pay.working': 'Création de votre commande…',
  'checkout.signInPrompt': 'Connectez-vous pour rattacher cette commande à votre compte.',
  'checkout.error.required': 'Veuillez compléter les champs signalés.',
  'checkout.riskPreview.title': 'Exposition provisoire',
  'checkout.riskPreview.note':
    'Calculée en direct à partir des conditions ci-dessus par le moteur utilisé par nos avocats. À titre indicatif.',

  // --- Capabilities --------------------------------------------------------
  'cap.heading': 'Conçu pour les juristes qui portent le risque',
  'cap.automation.eyebrow': 'Automatisation contractuelle',
  'cap.automation.title': 'Rédiger en minutes, pas en jours',
  'cap.automation.body':
    "Un arbre de clauses déclaratif assemble onze types d'instruments — fourniture, distribution, charte-partie au voyage, confidentialité, prestation de services, agence commerciale, bail commercial, licence de logiciel, travail, protocole d'accord et transaction — à partir de données validées, chacun avec ses propres clauses. La numérotation se met à jour automatiquement lorsque des conditions sont ajoutées ou retirées.",
  'cap.analysis.eyebrow': 'Analyse clause par clause',
  'cap.analysis.title': 'Exposition évaluée pendant la saisie',
  'cap.analysis.body':
    'Un ensemble de règles déterministes évalue droit applicable, for, plafonds, sûretés, sanctions et staries selon un modèle fixe, afin que les scores restent comparables au sein d’un portefeuille et dans le temps.',
  'cap.maritime.eyebrow': 'Commerce maritime',
  'cap.maritime.title': 'Staries et surestaries, maîtrisées',
  'cap.maritime.body':
    "Avis de disponibilité, périodes exceptées, calcul des surestaries et délais de forclusion sont modélisés comme des conditions à part entière, et non comme des avenants en texte libre.",
  'cap.execution.eyebrow': "Langues",
  'cap.execution.title': "Un contrat, trois langues",
  'cap.execution.body':
    "Les mêmes conditions produisent le projet en arabe, en anglais ou en français, clause par clause. Lorsqu'un contrat est signé en plusieurs langues, il doit préciser quelle version prévaut.",
  'cap.realtime.eyebrow': "Suivi",
  'cap.realtime.title': "Suivez chaque demande",
  'cap.realtime.body':
    "Chaque instruction transmise apparaît dans votre compte avec son étape en cours : réception, devis d'honoraires, rédaction et remise.",
  'cap.custody.eyebrow': "Confidentialité",
  'cap.custody.title': "Accès limité à votre compte",
  'cap.custody.body':
    "Les données transitent par des connexions chiffrées (HTTPS). Chaque demande n'est lisible que par vous et les membres habilités de votre organisation, et aucune donnée de carte n'est collectée sur ce site.",

  // --- Bench ---------------------------------------------------------------
  'bench.eyebrow': 'Analyse des risques et rédaction en direct',
  'bench.heading': "Modifiez une condition. Observez l'exposition évoluer.",
  'bench.lede':
    "Le projet affiché est assemblé à partir des mêmes données que celles lues par l'analyseur : le document approuvé par le client est celui que produit le moteur.",

  // --- Options (every select on the site) ----------------------------------
  'opt.type.supply': 'Fourniture de marchandises',
  'opt.type.distribution': 'Distribution exclusive',
  'opt.type.charterparty': 'Charte-partie au voyage',
  'opt.type.bill-of-lading': 'Conditions du connaissement',
  'opt.type.shareholders': "Pacte d'actionnaires",
  'opt.type.jv': 'Coentreprise',
  'opt.country.AE': 'Émirats arabes unis',
  'opt.country.KW': 'Koweït',
  'opt.country.SA': 'Arabie saoudite',
  'opt.country.QA': 'Qatar',
  'opt.country.GB': 'Royaume-Uni',
  'opt.country.SG': 'Singapour',
  'opt.country.TW': 'Taïwan',
  'opt.country.XX': 'Non précisé',
  'opt.law.GB': 'Angleterre et pays de Galles',
  'opt.law.AE': 'Émirats arabes unis',
  'opt.law.KW': 'Koweït',
  'opt.law.SG': 'Singapour',
  'opt.law.CH': 'Suisse',
  'opt.law.US': 'New York',
  'opt.law.XX': 'Non précisé',
  'opt.forum.arbitration-lcia': 'Arbitrage LCIA, Londres',
  'opt.forum.arbitration-icc': 'Arbitrage CCI',
  'opt.forum.arbitration-difc': "Arbitrage DIAC, siège au DIFC",
  'opt.forum.arbitration-adhoc': 'Arbitrage ad hoc',
  'opt.forum.local-courts': 'Tribunaux — siège du Premier Contractant',
  'opt.forum.foreign-courts': 'Tribunaux — siège du cocontractant',
  'opt.forum.silent': 'Non précisé',
  'opt.security.lc': 'Crédit documentaire irrévocable et confirmé',
  'opt.security.bank-guarantee': 'Garantie bancaire à première demande',
  'opt.security.parent-guarantee': 'Garantie de la société mère',
  'opt.security.none': 'Aucune',

  // --- Contract builder (wizard) -------------------------------------------
  'wizard.progress': 'Progression',
  'wizard.step.instrument': 'Instrument',
  'wizard.step.commercial': 'Conditions',
  'wizard.step.allocation': 'Répartition des risques',
  'wizard.step.forum': 'Droit et for',
  'wizard.step.execute': 'Revue',
  'wizard.partyNote':
    "Les dénominations, numéros d'immatriculation et adresses des parties figurent entre crochets. Ils doivent être complétés et vérifiés auprès du registre du commerce compétent avant signature.",
  'wizard.field.value': 'Valeur du contrat — {value}',
  'wizard.field.paymentTerms': 'Délai de paiement — {n} jours',
  'wizard.field.security': 'Garantie de paiement',
  'wizard.field.laytime': 'Staries — {value}',
  'wizard.laytime.hours': '{n} heures',
  'wizard.field.demurrage': 'Surestaries — {value}',
  'wizard.demurrage.perDay': '{amount} / jour',
  'wizard.notStated': 'non précisé',
  'wizard.field.cap': 'Plafond de responsabilité — {value}',
  'wizard.cap.uncapped': 'illimitée',
  'wizard.cap.multiple': '{n} × la valeur',
  'wizard.toggle.forceMajeure': 'Clause de force majeure',
  'wizard.toggle.sanctions': 'Clause de sanctions et de contrôle des échanges',
  'wizard.toggle.indemnity': "Garanties d'indemnisation expresses",
  'wizard.toggle.convenience': 'Résiliation pour convenance',
  'wizard.toggle.insurance': "Responsabilité d'assurance répartie",
  'wizard.field.governingLaw': 'Droit applicable',
  'wizard.field.forum': 'Règlement des différends',
  'wizard.forumNote':
    "La force exécutoire est appréciée au regard de la juridiction où se trouvent les actifs du cocontractant, et non du siège.",
  'wizard.reviewFindings': 'Voir les constats',

  // --- Risk report ---------------------------------------------------------
  'risk.exposure': 'exposition',
  'risk.aggregate': 'Risque global',
  'risk.noFindings': 'Aucun constat',
  'risk.band.safe': 'Acceptable',
  'risk.band.watch': 'À surveiller',
  'risk.band.risk': 'Élevé',
  'risk.band.critical': 'Critique',
  'severity.critical': 'Critique',
  'severity.high': 'Élevée',
  'severity.medium': 'Moyenne',
  'severity.low': 'Faible',
  'severity.info': 'Info',
  'findings.none.title': 'Aucun constat relevé',
  'findings.none.body':
    "Toutes les règles du modèle actuel sont satisfaites. Le projet est prêt pour la revue de l'associé et la signature.",
  'findings.remedy': 'Modification recommandée',

  // --- Draft preview -------------------------------------------------------
  'doc.live': 'Projet en direct',
  'doc.clauses': '{n} clauses',
  'doc.footer': 'Projet — non destiné à la signature. Généré par le moteur documentaire Lex Maris.',

  // --- Checkout (extra fields and page chrome) ------------------------------
  'checkout.field.laytime': 'Staries (heures consécutives)',
  'checkout.field.demurrage': 'Surestaries (USD / jour)',
  'checkout.error.failed': 'Échec de la commande ({status}).',
  'checkout.error.noRedirect': "Le prestataire de paiement n'a renvoyé aucune adresse de redirection.",
  'checkout.breadcrumb': 'Rédaction de contrats',
  'checkout.eyebrow': 'Commande',
  'checkout.offline':
    "Le service de commande est momentanément indisponible. Veuillez réessayer dans quelques instants.",
  'checkout.disclaimer':
    "L'envoi de ce formulaire transmet des instructions ; il ne crée pas de relation avocat-client. Une lettre de mission précisant l'étendue et les honoraires vous sera adressée avant le début des travaux. Le score de risque affiché est un indicateur automatisé, et non un conseil juridique.",
  'meta.checkout.description':
    'Commandez un instrument commercial ou maritime, rédigé par nos avocats et remis avec un rapport de risques clause par clause.',

  // --- Auth (extra) ----------------------------------------------------------
  'auth.error.invalid': 'Adresse e-mail ou mot de passe incorrect.',
  'auth.error.rateLimited': 'Trop de tentatives. Veuillez patienter un instant puis réessayer.',
  'auth.error.unconfirmed': "Veuillez d'abord confirmer votre adresse e-mail, puis vous connecter.",
  'auth.error.check': 'Vérifiez les informations saisies.',
  'auth.error.notProvisioned': "Ce compte n'est pas entièrement configuré. Veuillez contacter l'assistance.",
  'auth.error.generic': "Une erreur s'est produite. Veuillez réessayer.",
  'auth.error.emailFirst': "Saisissez d'abord votre adresse e-mail.",
  'auth.error.oauth':
    "La connexion n'a pas pu aboutir. Veuillez réessayer, ou vous connecter avec votre adresse e-mail.",
  'auth.error.oauthCancelled': 'La connexion a été annulée.',

  // --- Intro ---------------------------------------------------------------
  'intro.label': 'Introduction',
  'intro.strike': 'Frappez le maillet pour entrer',
  'intro.convene': "Cliquez n'importe où pour ouvrir l'audience",
  'intro.skip': "Passer l'introduction",

  // --- Dashboard -----------------------------------------------------------
  'meta.dashboard.title': "Mes dossiers",
  'dash.new': "Nouvelles instructions",
  'timeline.title': 'Avancement du dossier',
  'timeline.complete': '{done} étapes sur {total} terminées',
  'timeline.action': 'Action requise',

  // --- Site-wide -------------------------------------------------------------
  'meta.title': 'LEX MARIS — Droit commercial, des sociétés et du commerce maritime',
  'meta.description':
    "Automatisation contractuelle, analyse des risques clause par clause et signature cryptographique pour les juristes en droit commercial, des sociétés et du commerce maritime.",
  'common.skip': 'Aller au contenu',

  'checkout.fee.title': "Honoraires",
  'checkout.fee.body':
    "Aucun honoraire forfaitaire ne s'applique. Les honoraires dépendent de l'étendue et de la complexité de l'instrument et figurent dans un devis écrit et une lettre de mission soumis à votre accord. Rien n'est facturé lors de l'envoi de ce formulaire.",
  'checkout.submit': "Envoyer les instructions",
  'checkout.working': "Envoi en cours…",
  'checkout.success.title': "Instructions reçues",
  'checkout.success.body':
    "Référence {ref}. Nos avocats examineront vos instructions et vous adresseront un devis. Vous pouvez suivre l'état de cette demande dans votre compte.",
  'checkout.success.cta': "Voir mes dossiers",
  'dash.heading': "Mes dossiers",
  'dash.lede':
    "Toutes les instructions que vous avez transmises, avec leur étape en cours.",
  'dash.empty.title': "Aucun dossier pour le moment",
  'dash.empty.body':
    "Lorsque vous transmettez des instructions, chaque demande apparaît ici avec son étape en cours.",
  'dash.error':
    "Vos dossiers n’ont pas pu être chargés. Veuillez actualiser la page.",
  'dash.submitted': "Transmis le {date}",
  'dash.stage.received': "Instructions reçues",
  'dash.stage.quote': "Examen et devis d'honoraires",
  'dash.stage.drafting': "Rédaction",
  'dash.stage.delivered': "Remise",
  'dash.stage.pending': "À venir",
  'dash.stage.current': "En cours",
  'dash.stage.done': "Terminée",
  'dash.status.cancelled': "Annulé",
  'dash.status.refunded': "Remboursé",
  'opt.type.nda': "Accord de confidentialité réciproque (NDA)",
  'opt.type.services': "Contrat de prestation de services",
  'opt.type.agency': "Agence commerciale",
  'opt.type.lease': "Bail commercial",
  'wizard.field.premisesLocation': "Lieu de situation des locaux",
  'wizard.field.ndaYears': "Durée de confidentialité (années) — {value}",
  'wizard.indefinite': "illimitée",
  'wizard.field.annualRent': "Loyer annuel — {value}",
  'wizard.field.leaseYears': "Durée du bail (années) — {value}",
  'wizard.field.commission': "Taux de commission — {n} %",
  'wizard.field.fees': "Honoraires — {value}",
  'wizard.ndaNote':
    "Un accord de confidentialité ne prévoit ni plafond de responsabilité ni répartition commerciale des risques : un manquement se répare par des dommages-intérêts et des mesures provisoires. Passez au droit applicable et au for.",
  'opt.type.licence': "Licence de logiciel",
  'opt.type.employment': "Contrat de travail",
  'opt.type.mou': "Protocole d'accord",
  'opt.type.settlement': "Protocole transactionnel",
  'wizard.field.exclusivity': "Durée d'exclusivité (mois) — {value}",
  'wizard.none': "aucune",
  'wizard.employmentNote':
    "Le salaire, les indemnités, la période d'essai, le préavis et les congés sont fixés à l'Annexe 1 du projet et ne peuvent être moins favorables au salarié que le droit du travail du lieu de travail.",
  'wizard.settlementNote':
    "La somme transactionnelle, la partie débitrice et le délai de paiement sont fixés à l'Annexe 1 du projet.",
  'wizard.noAllocationNote':
    "Cette catégorie ne comporte pas de répartition commerciale des risques (plafond de responsabilité, force majeure, sanctions). Passez au droit applicable et au for.",
  'wizard.field.licenceFees': "Redevances — {value}",
  // --- Shared --------------------------------------------------------------
  'common.notLegalAdvice':
    'Le résultat est un signal de tri destiné à un praticien qualifié, et non un conseil juridique.',
  'common.required': 'Obligatoire',
  'common.optional': 'Facultatif',
  'common.back': 'Retour',
  'common.continue': 'Continuer',
};

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
  fr,
};

export type TranslationVars = Record<string, string | number>;

/**
 * Looks a key up and fills `{name}` placeholders. Shared by the client
 * provider and server components, so both render identical text.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: TranslationVars,
): string {
  const template =
    DICTIONARIES[locale]?.[key] ?? DICTIONARIES.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
