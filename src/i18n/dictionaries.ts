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
  'nav.dashboard': 'Dashboard',
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.account': 'Account',
  'nav.language': 'Change language',

  // --- Hero ----------------------------------------------------------------
  'hero.eyebrow': 'Commercial, corporate & maritime trade law',
  'hero.title.a': 'Every clause',
  'hero.title.accent': 'priced before',
  'hero.title.b': 'you sign it.',
  'hero.lede':
    'Lex Maris drafts commercial and maritime instruments from your terms, scores each clause against a fixed exposure model, and executes them with a verifiable cryptographic trail.',
  'hero.cta.primary': 'Commission a contract',
  'hero.cta.secondary': 'Try the risk bench',
  'hero.trust': 'Kuwait · UAE · England & Wales · Singapore',
  'hero.metric.rules': 'clause rules per pass',
  'hero.metric.turnaround': 'draft to sealed PDF',
  'hero.metric.sealing': 'per-document sealing',
  'hero.metric.forum': 'arbitral seats modelled',
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
    'Communications through this platform may be privileged. Do not share your credentials.',

  // --- Checkout ------------------------------------------------------------
  'checkout.title': 'Contract Writing',
  'checkout.subtitle':
    'Tell us the terms. Counsel drafts the instrument and returns it with a clause-level risk report.',
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
    'A declarative clause tree assembles supply, distribution, charterparty and shareholder instruments from validated inputs. Numbering, cross-references and schedules derive themselves.',
  'cap.analysis.eyebrow': 'Clause-level analysis',
  'cap.analysis.title': 'Exposure scored as you type',
  'cap.analysis.body':
    'A deterministic rule set scores governing law, forum, caps, security, sanctions and laytime against a fixed model, so scores stay comparable across a portfolio and over time.',
  'cap.maritime.eyebrow': 'Maritime trade',
  'cap.maritime.title': 'Laytime and demurrage, handled',
  'cap.maritime.body':
    'Notice of readiness, excepted periods, demurrage accrual and claim time bars are modelled as first-class terms rather than free-text riders.',
  'cap.execution.eyebrow': 'Execution',
  'cap.execution.title': 'Cryptographic signature trail',
  'cap.execution.body':
    'Every executed instrument carries a SHA-256 content hash, a signed audit record and a QR verification route that resolves without an account.',
  'cap.realtime.eyebrow': 'Real time',
  'cap.realtime.title': 'The client always knows where it is',
  'cap.realtime.body':
    'Matter status streams over an authenticated channel. Drafting, review, counterparty comment and execution land on the client rail the moment they happen.',
  'cap.custody.eyebrow': 'Custody',
  'cap.custody.title': 'Encrypted at rest, per document',
  'cap.custody.body':
    'Documents are sealed with AES-256-GCM under per-document data keys, wrapped by a KMS master key. Plaintext never touches disk.',

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
  'opt.forum.arbitration-difc': 'DIFC-LCIA arbitration',
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
    'Party details are drawn from the matter record. Registry data is verified against the relevant commercial register before execution.',
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
    'Showing the default catalogue price — the live pricing service is not reachable.',
  'checkout.disclaimer':
    'Submitting this form creates an instruction, not a retainer. An engagement letter follows before work begins. Output is a triage signal for a qualified practitioner, not legal advice.',
  'meta.checkout.description':
    'Commission a commercial or maritime instrument, drafted by counsel and returned with a clause-level risk report.',

  // --- Auth (extra) ----------------------------------------------------------
  'auth.google': 'Continue with Google',
  'auth.or': 'or',
  'auth.error.invalid': 'Incorrect email or password.',
  'auth.error.rateLimited': 'Too many attempts. Please wait a moment and try again.',
  'auth.error.unconfirmed': 'Please confirm your email address first, then sign in.',
  'auth.error.check': 'Check the details you entered.',
  'auth.error.notProvisioned': 'This account is not fully provisioned. Please contact support.',
  'auth.error.generic': 'Something went wrong. Please try again.',
  'auth.error.emailFirst': 'Enter your email address first.',
  'auth.error.oauth':
    'Google sign-in could not be completed. Please try again, or sign in with your email.',
  'auth.error.oauthCancelled': 'Google sign-in was cancelled.',

  // --- Intro ---------------------------------------------------------------
  'intro.label': 'Introduction',
  'intro.strike': 'Strike the gavel to enter',
  'intro.convene': 'Click anywhere to convene',
  'intro.skip': 'Skip intro',

  // --- Dashboard -----------------------------------------------------------
  'meta.dashboard.title': 'Client dashboard',
  'dash.summary': '4 open matters · 2 awaiting your action',
  'dash.new': 'New instrument',
  'dash.alerts': 'Compliance alerts',
  'dash.vault': 'Encrypted document vault',
  'dash.stage.instructed': 'Instructions received',
  'dash.stage.instructed.meta': '2 Sep, 09:14',
  'dash.stage.assembled': 'First draft assembled',
  'dash.stage.assembled.meta': '2 Sep, 09:16',
  'dash.stage.scanned': 'Risk pass complete — 3 findings',
  'dash.stage.scanned.meta': '2 Sep, 09:16',
  'dash.stage.partner': 'Partner review',
  'dash.stage.partner.meta': '4 Sep, 15:40',
  'dash.stage.counterparty': 'Counterparty comments awaited',
  'dash.stage.counterparty.meta': 'Due 10 Sep',
  'dash.stage.sanctions': 'Sanctions re-screen required before execution',
  'dash.stage.sanctions.meta': 'Screening expired 6 Sep',
  'dash.stage.execution': 'Execution and sealing',
  'dash.stage.execution.meta': 'Not started',
  'dash.actor.portal': 'Client portal',
  'dash.actor.engine': 'Document engine',
  'dash.actor.scanner': 'Scanner v1.0.0',
  'dash.alert.sanctions.title': 'Sanctions screening expired',
  'dash.alert.sanctions.body':
    'The counterparty screening record is 91 days old. Execution is blocked until a fresh screen is recorded against the current consolidated lists.',
  'dash.alert.sanctions.action': 'Re-screen counterparty',
  'dash.alert.demurrage.title': 'Demurrage time bar approaching',
  'dash.alert.demurrage.body':
    'Claim LM-2026-0388 must be presented with supporting documents within 11 days or it is time-barred under clause 6.2.',
  'dash.alert.demurrage.action': 'Open claim file',
  'dash.alert.lc.title': 'Letter of credit expiry',
  'dash.alert.lc.body':
    'The confirmed LC on matter LM-2026-0402 expires in 24 days, ahead of the final shipment window.',
  'dash.alert.lc.action': 'Request amendment',
  'dash.doc.charter': 'Voyage charterparty — executed',
  'dash.doc.supply': 'Supply agreement — draft 4',
  'dash.doc.screening': 'Sanctions screening record',
  'dash.doc.bol': 'Bill of lading — MV Sirocco',
  'dash.doc.sealed': 'Sealed · AES-256-GCM',
  'dash.doc.expired': 'Expired',
  'dash.date.6sep': '6 Sep',
  'dash.date.4sep': '4 Sep',
  'dash.date.7jun': '7 Jun',
  'dash.date.1sep': '1 Sep',
  'timeline.title': 'Matter progress',
  'timeline.complete': '{done} of {total} stages complete',
  'timeline.action': 'Action required',

  // --- Site-wide -------------------------------------------------------------
  'meta.title': 'LEX MARIS — Commercial, Corporate & Maritime Trade Law',
  'meta.description':
    'Contract automation, clause-level risk analysis and cryptographic execution for commercial, corporate and maritime trade counsel.',
  'common.skip': 'Skip to content',
  'hero.metric.turnaround.value': '< 2s',

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
  'nav.dashboard': 'لوحة المتابعة',
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
    'تصوغ ليكس ماريس العقود التجارية والبحرية وفقاً لشروطك، وتقيّم كل بند وفق نموذج مخاطر ثابت، وتنفّذها بسجل تحقّق تشفيري قابل للإثبات.',
  'hero.cta.primary': 'اطلب صياغة عقد',
  'hero.cta.secondary': 'جرّب منصة المخاطر',
  'hero.trust': 'الكويت · الإمارات · إنجلترا وويلز · سنغافورة',
  'hero.metric.rules': 'قاعدة بنود في كل تقييم',
  'hero.metric.turnaround': 'من المسودة إلى ملف مختوم',
  'hero.metric.sealing': 'تشفير لكل مستند',
  'hero.metric.forum': 'مقار تحكيم مُنمذجة',
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
    'قد تكون المراسلات عبر هذه المنصة مشمولة بالسرية المهنية. لا تشارك بيانات دخولك.',

  // --- Checkout ------------------------------------------------------------
  'checkout.title': 'صياغة العقود',
  'checkout.subtitle':
    'أخبرنا بالشروط. تتولى المحاماة الصياغة وتعيد العقد مع تقرير مخاطر على مستوى البنود.',
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
    'شجرة بنود وصفية تُركّب عقود التوريد والتوزيع والإيجار البحري واتفاقيات المساهمين من مدخلات مُتحقَّق منها. الترقيم والإحالات والملاحق تُستنتج تلقائياً.',
  'cap.analysis.eyebrow': 'تحليل على مستوى البنود',
  'cap.analysis.title': 'تقييم التعرّض أثناء الكتابة',
  'cap.analysis.body':
    'مجموعة قواعد حتمية تقيّم القانون الحاكم وجهة النزاع وحدود المسؤولية والضمانات والعقوبات ومدة التحميل وفق نموذج ثابت، بحيث تبقى النتائج قابلة للمقارنة عبر المحفظة وعبر الزمن.',
  'cap.maritime.eyebrow': 'التجارة البحرية',
  'cap.maritime.title': 'مدة التحميل والغرامة، مُعالجتان',
  'cap.maritime.body':
    'إشعار الجهوزية والفترات المستثناة واستحقاق غرامة التأخير ومواعيد سقوط المطالبات، جميعها مُنمذجة كشروط أساسية وليست ملاحق نصية حرة.',
  'cap.execution.eyebrow': 'التنفيذ',
  'cap.execution.title': 'سجل توقيع تشفيري',
  'cap.execution.body':
    'كل عقد منفَّذ يحمل بصمة SHA-256 لمحتواه، وسجل تدقيق موقَّعاً، ومسار تحقّق برمز QR يعمل دون حساب.',
  'cap.realtime.eyebrow': 'الزمن الفعلي',
  'cap.realtime.title': 'العميل يعرف دائماً أين وصل ملفه',
  'cap.realtime.body':
    'تُبَثّ حالة الملف عبر قناة موثَّقة. الصياغة والمراجعة وملاحظات الطرف المقابل والتنفيذ تظهر على مسار العميل لحظة حدوثها.',
  'cap.custody.eyebrow': 'الحفظ',
  'cap.custody.title': 'مشفَّر في التخزين، لكل مستند',
  'cap.custody.body':
    'تُختم المستندات بتشفير AES-256-GCM بمفاتيح بيانات مستقلة لكل مستند، مُغلَّفة بمفتاح رئيسي في نظام إدارة المفاتيح. النص الصريح لا يُكتب على القرص أبداً.',

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
  'opt.forum.arbitration-difc': 'تحكيم مركز DIFC-LCIA',
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
    'تُستمد بيانات الأطراف من سجل الملف، ويُتحقَّق من بيانات السجل مقابل السجل التجاري المختص قبل التوقيع.',
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
    'يُعرض السعر الافتراضي من الكتالوج — خدمة التسعير المباشر غير متاحة حالياً.',
  'checkout.disclaimer':
    'إرسال هذا النموذج يُنشئ تكليفاً وليس اتفاقية أتعاب. يُرسَل خطاب التكليف قبل بدء العمل. النتيجة مؤشر فرز لممارس مؤهّل، وليست استشارة قانونية.',
  'meta.checkout.description':
    'اطلب صياغة عقد تجاري أو بحري يُعدّه محامون متخصصون ويُسلَّم مع تقرير مخاطر على مستوى البنود.',

  // --- Auth (extra) ----------------------------------------------------------
  'auth.google': 'المتابعة باستخدام Google',
  'auth.or': 'أو',
  'auth.error.invalid': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth.error.rateLimited': 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مجدداً.',
  'auth.error.unconfirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً، ثم تسجيل الدخول.',
  'auth.error.check': 'يرجى مراجعة البيانات التي أدخلتها.',
  'auth.error.notProvisioned': 'لم يكتمل إعداد هذا الحساب. يرجى التواصل مع الدعم.',
  'auth.error.generic': 'حدث خطأ ما. يرجى المحاولة مجدداً.',
  'auth.error.emailFirst': 'أدخل بريدك الإلكتروني أولاً.',
  'auth.error.oauth':
    'تعذّر إكمال تسجيل الدخول عبر Google. يرجى المحاولة مجدداً، أو تسجيل الدخول بالبريد الإلكتروني.',
  'auth.error.oauthCancelled': 'أُلغي تسجيل الدخول عبر Google.',

  // --- Intro ---------------------------------------------------------------
  'intro.label': 'المقدمة',
  'intro.strike': 'اطرق المطرقة للدخول',
  'intro.convene': 'انقر في أي مكان لافتتاح الجلسة',
  'intro.skip': 'تخطّي المقدمة',

  // --- Dashboard -----------------------------------------------------------
  'meta.dashboard.title': 'لوحة العميل',
  'dash.summary': '4 ملفات مفتوحة · 2 بانتظار إجرائك',
  'dash.new': 'عقد جديد',
  'dash.alerts': 'تنبيهات الامتثال',
  'dash.vault': 'خزنة المستندات المشفّرة',
  'dash.stage.instructed': 'استلام التكليف',
  'dash.stage.instructed.meta': '2 سبتمبر، 09:14',
  'dash.stage.assembled': 'إعداد المسودة الأولى',
  'dash.stage.assembled.meta': '2 سبتمبر، 09:16',
  'dash.stage.scanned': 'اكتمال فحص المخاطر — 3 ملاحظات',
  'dash.stage.scanned.meta': '2 سبتمبر، 09:16',
  'dash.stage.partner': 'مراجعة الشريك',
  'dash.stage.partner.meta': '4 سبتمبر، 15:40',
  'dash.stage.counterparty': 'بانتظار ملاحظات الطرف المقابل',
  'dash.stage.counterparty.meta': 'الموعد 10 سبتمبر',
  'dash.stage.sanctions': 'يلزم إعادة فحص العقوبات قبل التوقيع',
  'dash.stage.sanctions.meta': 'انتهت صلاحية الفحص في 6 سبتمبر',
  'dash.stage.execution': 'التوقيع والختم',
  'dash.stage.execution.meta': 'لم يبدأ',
  'dash.actor.portal': 'بوابة العميل',
  'dash.actor.engine': 'محرّك المستندات',
  'dash.actor.scanner': 'الماسح الإصدار 1.0.0',
  'dash.alert.sanctions.title': 'انتهت صلاحية فحص العقوبات',
  'dash.alert.sanctions.body':
    'مضى على سجل فحص الطرف المقابل 91 يوماً. التوقيع موقوف حتى يُسجَّل فحص جديد مقابل القوائم الموحّدة الحالية.',
  'dash.alert.sanctions.action': 'إعادة فحص الطرف المقابل',
  'dash.alert.demurrage.title': 'اقتراب موعد سقوط مطالبة غرامة التأخير',
  'dash.alert.demurrage.body':
    'يجب تقديم المطالبة LM-2026-0388 مع المستندات المؤيدة خلال 11 يوماً، وإلا سقطت بموجب البند 6.2.',
  'dash.alert.demurrage.action': 'فتح ملف المطالبة',
  'dash.alert.lc.title': 'قرب انتهاء خطاب الاعتماد',
  'dash.alert.lc.body':
    'ينتهي خطاب الاعتماد المعزَّز في الملف LM-2026-0402 خلال 24 يوماً، قبل نافذة الشحنة الأخيرة.',
  'dash.alert.lc.action': 'طلب تعديل',
  'dash.doc.charter': 'مشارطة إيجار بالرحلة — موقّعة',
  'dash.doc.supply': 'اتفاقية توريد — المسودة 4',
  'dash.doc.screening': 'سجل فحص العقوبات',
  'dash.doc.bol': 'سند شحن — السفينة سيروكو',
  'dash.doc.sealed': 'مختوم · AES-256-GCM',
  'dash.doc.expired': 'منتهي الصلاحية',
  'dash.date.6sep': '6 سبتمبر',
  'dash.date.4sep': '4 سبتمبر',
  'dash.date.7jun': '7 يونيو',
  'dash.date.1sep': '1 سبتمبر',
  'timeline.title': 'مراحل الملف',
  'timeline.complete': 'اكتملت {done} من {total} مراحل',
  'timeline.action': 'مطلوب إجراء',

  // --- Site-wide -------------------------------------------------------------
  'meta.title': 'ليكس ماريس — القانون التجاري والمؤسسي والتجارة البحرية',
  'meta.description':
    'أتمتة صياغة العقود، وتحليل المخاطر على مستوى البنود، والتوقيع التشفيري للمحامين في القانون التجاري والمؤسسي والتجارة البحرية.',
  'common.skip': 'انتقل إلى المحتوى',
  'hero.metric.turnaround.value': '< 2 ث',

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
  'nav.dashboard': 'Tableau de bord',
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
    "Lex Maris rédige vos instruments commerciaux et maritimes à partir de vos conditions, évalue chaque clause selon un modèle d'exposition fixe et les fait signer avec une piste cryptographique vérifiable.",
  'hero.cta.primary': 'Commander un contrat',
  'hero.cta.secondary': "Essayer l'atelier de risques",
  'hero.trust': 'Koweït · Émirats · Angleterre et pays de Galles · Singapour',
  'hero.metric.rules': 'règles de clauses par analyse',
  'hero.metric.turnaround': 'du projet au PDF scellé',
  'hero.metric.sealing': 'scellement par document',
  'hero.metric.forum': "sièges d'arbitrage modélisés",
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
    'Les échanges sur cette plateforme peuvent être couverts par le secret professionnel. Ne partagez pas vos identifiants.',

  // --- Checkout ------------------------------------------------------------
  'checkout.title': 'Rédaction de contrats',
  'checkout.subtitle':
    "Indiquez-nous vos conditions. Nos avocats rédigent l'instrument et vous le remettent avec un rapport de risques clause par clause.",
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
    "Un arbre de clauses déclaratif assemble contrats de fourniture, de distribution, chartes-parties et pactes d'actionnaires à partir de données validées. Numérotation, renvois et annexes se déduisent d'eux-mêmes.",
  'cap.analysis.eyebrow': 'Analyse clause par clause',
  'cap.analysis.title': 'Exposition évaluée pendant la saisie',
  'cap.analysis.body':
    'Un ensemble de règles déterministes évalue droit applicable, for, plafonds, sûretés, sanctions et staries selon un modèle fixe, afin que les scores restent comparables au sein d’un portefeuille et dans le temps.',
  'cap.maritime.eyebrow': 'Commerce maritime',
  'cap.maritime.title': 'Staries et surestaries, maîtrisées',
  'cap.maritime.body':
    "Avis de disponibilité, périodes exceptées, calcul des surestaries et délais de forclusion sont modélisés comme des conditions à part entière, et non comme des avenants en texte libre.",
  'cap.execution.eyebrow': 'Signature',
  'cap.execution.title': 'Piste de signature cryptographique',
  'cap.execution.body':
    "Chaque instrument signé porte une empreinte SHA-256 de son contenu, un journal d'audit signé et un lien de vérification par QR code accessible sans compte.",
  'cap.realtime.eyebrow': 'Temps réel',
  'cap.realtime.title': 'Le client sait toujours où en est son dossier',
  'cap.realtime.body':
    "L'état du dossier est diffusé sur un canal authentifié. Rédaction, revue, observations du cocontractant et signature apparaissent sur le suivi client dès qu'elles ont lieu.",
  'cap.custody.eyebrow': 'Conservation',
  'cap.custody.title': 'Chiffré au repos, document par document',
  'cap.custody.body':
    "Les documents sont scellés en AES-256-GCM avec une clé de données propre à chaque document, elle-même protégée par une clé maîtresse KMS. Le texte en clair ne touche jamais le disque.",

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
  'opt.forum.arbitration-difc': 'Arbitrage DIFC-LCIA',
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
    "Les informations sur les parties proviennent du dossier. Les données d'immatriculation sont vérifiées auprès du registre du commerce compétent avant signature.",
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
    "Prix catalogue par défaut affiché — le service de tarification en direct est injoignable.",
  'checkout.disclaimer':
    "L'envoi de ce formulaire constitue une instruction, et non une convention d'honoraires. Une lettre de mission vous sera adressée avant le début des travaux. Le résultat est un signal de tri destiné à un praticien qualifié, et non un conseil juridique.",
  'meta.checkout.description':
    'Commandez un instrument commercial ou maritime, rédigé par nos avocats et remis avec un rapport de risques clause par clause.',

  // --- Auth (extra) ----------------------------------------------------------
  'auth.google': 'Continuer avec Google',
  'auth.or': 'ou',
  'auth.error.invalid': 'Adresse e-mail ou mot de passe incorrect.',
  'auth.error.rateLimited': 'Trop de tentatives. Veuillez patienter un instant puis réessayer.',
  'auth.error.unconfirmed': "Veuillez d'abord confirmer votre adresse e-mail, puis vous connecter.",
  'auth.error.check': 'Vérifiez les informations saisies.',
  'auth.error.notProvisioned': "Ce compte n'est pas entièrement configuré. Veuillez contacter l'assistance.",
  'auth.error.generic': "Une erreur s'est produite. Veuillez réessayer.",
  'auth.error.emailFirst': "Saisissez d'abord votre adresse e-mail.",
  'auth.error.oauth':
    "La connexion avec Google n'a pas pu aboutir. Veuillez réessayer, ou vous connecter avec votre adresse e-mail.",
  'auth.error.oauthCancelled': 'La connexion avec Google a été annulée.',

  // --- Intro ---------------------------------------------------------------
  'intro.label': 'Introduction',
  'intro.strike': 'Frappez le maillet pour entrer',
  'intro.convene': "Cliquez n'importe où pour ouvrir l'audience",
  'intro.skip': "Passer l'introduction",

  // --- Dashboard -----------------------------------------------------------
  'meta.dashboard.title': 'Tableau de bord client',
  'dash.summary': '4 dossiers ouverts · 2 en attente de votre action',
  'dash.new': 'Nouvel instrument',
  'dash.alerts': 'Alertes de conformité',
  'dash.vault': 'Coffre-fort documentaire chiffré',
  'dash.stage.instructed': 'Instructions reçues',
  'dash.stage.instructed.meta': '2 sept., 09:14',
  'dash.stage.assembled': 'Premier projet assemblé',
  'dash.stage.assembled.meta': '2 sept., 09:16',
  'dash.stage.scanned': 'Analyse des risques terminée — 3 constats',
  'dash.stage.scanned.meta': '2 sept., 09:16',
  'dash.stage.partner': "Revue de l'associé",
  'dash.stage.partner.meta': '4 sept., 15:40',
  'dash.stage.counterparty': 'Observations du cocontractant attendues',
  'dash.stage.counterparty.meta': 'Échéance 10 sept.',
  'dash.stage.sanctions': 'Nouveau filtrage sanctions requis avant signature',
  'dash.stage.sanctions.meta': 'Filtrage expiré le 6 sept.',
  'dash.stage.execution': 'Signature et scellement',
  'dash.stage.execution.meta': 'Non commencé',
  'dash.actor.portal': 'Portail client',
  'dash.actor.engine': 'Moteur documentaire',
  'dash.actor.scanner': 'Analyseur v1.0.0',
  'dash.alert.sanctions.title': 'Filtrage sanctions expiré',
  'dash.alert.sanctions.body':
    "Le filtrage du cocontractant date de 91 jours. La signature est bloquée jusqu'à l'enregistrement d'un nouveau filtrage au regard des listes consolidées en vigueur.",
  'dash.alert.sanctions.action': 'Refiltrer le cocontractant',
  'dash.alert.demurrage.title': 'Forclusion des surestaries imminente',
  'dash.alert.demurrage.body':
    'La réclamation LM-2026-0388 doit être présentée avec ses justificatifs sous 11 jours, faute de quoi elle sera forclose en vertu de la clause 6.2.',
  'dash.alert.demurrage.action': 'Ouvrir le dossier de réclamation',
  'dash.alert.lc.title': 'Expiration du crédit documentaire',
  'dash.alert.lc.body':
    "Le crédit documentaire confirmé du dossier LM-2026-0402 expire dans 24 jours, avant la fenêtre d'expédition finale.",
  'dash.alert.lc.action': 'Demander une modification',
  'dash.doc.charter': 'Charte-partie au voyage — signée',
  'dash.doc.supply': 'Contrat de fourniture — projet 4',
  'dash.doc.screening': 'Rapport de filtrage sanctions',
  'dash.doc.bol': 'Connaissement — MV Sirocco',
  'dash.doc.sealed': 'Scellé · AES-256-GCM',
  'dash.doc.expired': 'Expiré',
  'dash.date.6sep': '6 sept.',
  'dash.date.4sep': '4 sept.',
  'dash.date.7jun': '7 juin',
  'dash.date.1sep': '1er sept.',
  'timeline.title': 'Avancement du dossier',
  'timeline.complete': '{done} étapes sur {total} terminées',
  'timeline.action': 'Action requise',

  // --- Site-wide -------------------------------------------------------------
  'meta.title': 'LEX MARIS — Droit commercial, des sociétés et du commerce maritime',
  'meta.description':
    "Automatisation contractuelle, analyse des risques clause par clause et signature cryptographique pour les juristes en droit commercial, des sociétés et du commerce maritime.",
  'common.skip': 'Aller au contenu',
  'hero.metric.turnaround.value': '< 2 s',

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
