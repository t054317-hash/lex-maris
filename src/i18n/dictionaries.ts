import type { Locale } from './config';

/**
 * Translation dictionaries.
 *
 * Flat dotted keys rather than nested objects: it keeps the type of `t()` a
 * simple union of string literals, so a missing or misspelt key is a compile
 * error instead of a blank space on the page.
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
  'nav.training': 'Training',
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
  'nav.training': 'التدريب',
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

  // --- Shared --------------------------------------------------------------
  'common.notLegalAdvice':
    'النتيجة مؤشر فرز لممارس مؤهّل، وليست استشارة قانونية.',
  'common.required': 'مطلوب',
  'common.optional': 'اختياري',
  'common.back': 'رجوع',
  'common.continue': 'متابعة',
};

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
};
