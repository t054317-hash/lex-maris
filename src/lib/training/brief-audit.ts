import { CHAMBER_LABEL, GOVERNORATE_LABEL, formatKwd } from './catalog';
import type { AuditFinding, AuditResult, DocumentKind, Scenario, Severity } from './types';

/**
 * Procedural audit of a trainee's petition or defence memo.
 *
 * This is a teaching aid built from text patterns, not a legal parser: it
 * looks for the elements a statement of claim must carry under the Civil and
 * Commercial Procedure Law (court, parties with identification and domicile,
 * facts, grounds, specific requests) and for the ordering rules that decide
 * whether a defence survives. A pass means "nothing obvious is missing", never
 * "this pleading is sound". The UI states that.
 *
 * Pure: same text + same scenario always yields the same findings, so the
 * panel can re-run it on every keystroke.
 */

const WEIGHT: Record<Severity, number> = { critical: 18, major: 9, minor: 3 };

/** Arabic-Indic digits and separators to ASCII, so number patterns match either script. */
export function normaliseDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/٬/g, ',')
    .replace(/٫/g, '.');
}

const RX = {
  court: /المحكمة\s+(?:الكلية|الجزئية)|(?:الدائرة|دائرة)\s+(?:التجارية|المدنية|العمالية|الإدارية|الأحوال)/,
  chamberNamed: {
    commercial: /(?:الدائرة|دائرة)\s+التجارية|تجاري\s+كلي|تجاري\s+جزئي/,
    civil: /(?:الدائرة|دائرة)\s+المدنية|مدني\s+كلي|مدني\s+جزئي/,
    labour: /(?:الدائرة|دائرة)\s+العمالية|عمالي\s+كلي|عمالي\s+جزئي/,
    family: /الأحوال\s+الشخصية/,
    administrative: /(?:الدائرة|دائرة)\s+الإدارية/,
  },
  plaintiff: /(?:^|\s)(?:المدعي|المدعية|المدعون|مقدمة\s+من|مقدّمة\s+من)\s*[:：]?/,
  defendant: /المدع[ىي]\s+(?:عليه|عليها|عليهم)/,
  civilId: /\b\d{12}\b|الرقم\s+المدني/,
  address: /العنوان|الموطن|منطقة|قطعة|شارع|جادة|مبنى|منزل|قسيمة|برج/g,
  company: /شركة|مؤسسة|مجموعة/,
  legalForm: /ذ\.?\s?م\.?\s?م|ش\.?\s?م\.?\s?ك|مساهمة|تضامن|توصية|فرع\s+شركة/,
  registry: /سجل(?:ها)?\s+(?:ال)?تجاري|رقم\s+القيد/,
  representative: /ويمثلها|ويمثله|بصفته|بصفتها|ممثلها\s+القانوني/,
  facts: /الوقائع|وقائع\s+الدعوى|تخلص\s+وقائع/,
  date: /\b\d{1,2}\s*[/-]\s*\d{1,2}\s*[/-]\s*\d{4}\b|\b\d{4}\s*[/-]\s*\d{1,2}\s*[/-]\s*\d{1,2}\b|(?:يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s+\d{4}/,
  legalBasis: /الماد(?:ة|تين|تان|ات)\s*\(?\s*\d+|(?:^|[\s(])م\s*\d+|قانون\s+[^\n.،]{0,60}?رقم\s*\d+\s*لسنة\s*\d{4}/,
  requestsHeading: /الطلبات|لهذه\s+الأسباب|لذلك|بناء[ًا]?\s+على\s+ما\s+تقدم|يلتمس|نلتمس|يلتمسون/,
  compel: /بإلزام|إلزام|الحكم\s+ب/,
  vague: /ما\s+تراه\s+المحكمة|كافة\s+(?:الحقوق|المستحقات)|جميع\s+(?:الحقوق|المستحقات)|حقوقه\s+كاملة|حقوقها\s+كاملة|المبالغ\s+المستحقة\s+قانوناً/,
  amount: /(\d[\d,]*(?:\.\d+)?)\s*(?:د\.?\s?ك|دينار|KWD)/g,
  expenses: /المصروفات|المصاريف/,
  fees: /أتعاب\s+المحاماة/,
  signature: /المحامي|وكيل\s+(?:المدعي|المدعية|المدعى)|التوقيع/,
  pam: /القوى\s+العاملة|علاقات\s+العمل|إحالة\s+النزاع|أحيل\s+النزاع|الشكوى\s+العمالية/,
  billOfLading: /سند\s+(?:ال)?شحن|بوليصة/,
  maritimeLaw: /التجارة\s+البحرية/,
  labourLaw: /قانون\s+العمل/,
  caseNumber: /(?:الدعوى|القضية)\s+رقم|\b\d{2,6}\s*\/\s*\d{4}\b/,
  hearing: /جلسة/,
  formalDefence: /بطلان|عدم\s+الاختصاص\s+المحلي|عدم\s+قبول|عدم\s+سماع|انقضاء\s+(?:المدة|الدعوى)|شرط\s+التحكيم|انتفاء\s+الصفة/,
  substantive: /في\s+الموضوع|موضوعاً|رفض\s+الدعوى|براءة\s+(?:ال)?ذمة|الوفاء\s+بال|سداد\s+المبلغ/,
  localIncompetence: /عدم\s+الاختصاص\s+المحلي/,
  primaryAlternative: /أصلي[اًا]/,
  alternative: /احتياطي[اًا]/,
  timeBar: /عدم\s+سماع|انقضاء\s+(?:المدة|الدعوى)|التقادم/,
  arbitration: /تحكيم/,
};

function amounts(text: string): number[] {
  return [...text.matchAll(RX.amount)].map((m) => Number((m[1] ?? '0').replace(/,/g, ''))).filter((n) => n > 0);
}

/** The closing requests: text after the last requests heading. */
function requestsSection(text: string): string {
  let last = -1;
  const rx = new RegExp(RX.requestsHeading.source, 'g');
  for (const m of text.matchAll(rx)) last = m.index ?? last;
  return last >= 0 ? text.slice(last) : '';
}

export function auditDocument(raw: string, kind: DocumentKind, scenario?: Scenario): AuditResult {
  const text = normaliseDigits(raw);
  const findings: AuditFinding[] = [];
  const passed: string[] = [];
  const add = (f: AuditFinding) => findings.push(f);
  const pass = (label: string) => passed.push(label);

  if (text.trim().length < 40) {
    return {
      score: 0,
      findings: [{
        id: 'empty',
        severity: 'critical',
        title: 'المستند فارغ أو موجز جداً',
        detail: 'لا يكفي النص الحالي لإجراء التدقيق.',
        suggestion: kind === 'petition' ? 'ابدأ من «إدراج هيكل الصحيفة» ثم املأ كل قسم.' : 'ابدأ من «إدراج هيكل المذكرة» ثم املأ كل قسم.',
      }],
      passed,
    };
  }

  if (kind === 'petition') auditPetition(text, scenario, add, pass);
  else auditMemo(text, scenario, add, pass);

  const penalty = findings.reduce((sum, f) => sum + WEIGHT[f.severity], 0);
  findings.sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity]);
  return { score: Math.max(0, 100 - penalty), findings, passed };
}

type Add = (f: AuditFinding) => void;
type Pass = (label: string) => void;

function auditPetition(text: string, scenario: Scenario | undefined, add: Add, pass: Pass) {
  // --- the court -------------------------------------------------------------
  if (!RX.court.test(text)) {
    add({
      id: 'court',
      severity: 'critical',
      title: 'لم تُحدَّد المحكمة المرفوعة أمامها الدعوى',
      detail: 'بيان المحكمة من البيانات الواجبة في صحيفة الدعوى، وبه يتحدد الاختصاص.',
      suggestion: 'اذكر المحكمة ودرجتها والدائرة المختصة في صدر الصحيفة.',
      example: 'السيد/ رئيس المحكمة الكلية — الدائرة التجارية، المحترم',
      rule: 'قانون المرافعات — بيانات صحيفة الدعوى',
    });
  } else {
    pass('بيان المحكمة المرفوعة أمامها الدعوى');
    if (scenario) {
      const want = scenario.expected.chamber;
      const named = (Object.keys(RX.chamberNamed) as (keyof typeof RX.chamberNamed)[]).filter((c) => RX.chamberNamed[c].test(text));
      if (named.length && !named.includes(want)) {
        add({
          id: 'chamber-mismatch',
          severity: 'critical',
          title: `الدائرة المذكورة لا تختص بهذا النزاع`,
          detail: `وجّهت الصحيفة إلى ${named.map((c) => CHAMBER_LABEL[c]).join(' / ')}، بينما النزاع يدخل في اختصاص ${CHAMBER_LABEL[want]}.`,
          suggestion: scenario.domain === 'maritime'
            ? 'المنازعات البحرية منازعات تجارية؛ وجّه الصحيفة إلى الدائرة التجارية.'
            : `وجّه الصحيفة إلى ${CHAMBER_LABEL[want]}.`,
          rule: 'الاختصاص النوعي من النظام العام',
        });
      }
    }
  }

  // --- parties ---------------------------------------------------------------
  const hasPlaintiff = RX.plaintiff.test(text);
  const hasDefendant = RX.defendant.test(text);
  if (!hasPlaintiff || !hasDefendant) {
    add({
      id: 'parties',
      severity: 'critical',
      title: 'الخصوم غير معيّنين بوضوح',
      detail: `لم يرد في الصحيفة تعيين ${!hasPlaintiff && !hasDefendant ? 'المدعي والمدعى عليه' : !hasPlaintiff ? 'المدعي' : 'المدعى عليه'} بصفة صريحة.`,
      suggestion: 'خصّص لكل خصم فقرة تبدأ بصفته في الدعوى، ثم اسمه الكامل وبيانات تعيينه وموطنه.',
      example: 'المدعية: شركة ... ذ.م.م، سجل تجاري رقم ...، ويمثلها مديرها بصفته، وعنوانها: ...',
      rule: 'قانون المرافعات — بيانات صحيفة الدعوى',
    });
  } else pass('تعيين المدعي والمدعى عليه');

  if (!RX.civilId.test(text) && !RX.registry.test(text)) {
    add({
      id: 'identification',
      severity: 'major',
      title: 'لم تُذكر بيانات التعيين الرسمية للخصوم',
      detail: 'غياب الرقم المدني للشخص الطبيعي أو رقم السجل التجاري للشركة يفتح باب النزاع حول شخص الخصم ويعطّل الإعلان والتنفيذ.',
      suggestion: 'أضف الرقم المدني (12 رقماً) لكل شخص طبيعي، ورقم السجل التجاري لكل شركة.',
      example: 'المدعى عليه: خالد عبدالله المطيري، الرقم المدني: 285010203040',
    });
  } else pass('بيانات التعيين الرسمية (الرقم المدني / السجل التجاري)');

  const addressHits = (text.match(RX.address) ?? []).length;
  if (addressHits < 2) {
    add({
      id: 'domicile',
      severity: 'major',
      title: 'موطن الخصوم غير محدد تحديداً كافياً',
      detail: 'الموطن هو ما يُعلن فيه الخصم، وبه يتحدد الاختصاص المحلي. عنوان ناقص يعني إعلاناً معيباً.',
      suggestion: 'اذكر المنطقة والقطعة والشارع ورقم المبنى أو المنزل لكل خصم.',
      example: 'وعنوانها: حولي، شارع تونس، قطعة 4، مبنى 9',
    });
  } else pass('موطن الخصوم');

  if (RX.company.test(text)) {
    if (!RX.legalForm.test(text)) {
      add({
        id: 'legal-form',
        severity: 'major',
        title: 'لم يُذكر الشكل القانوني للشركة',
        detail: 'الشكل القانوني (ذ.م.م، ش.م.ك ...) جزء من اسم الشركة ويحدد من يمثلها ومن يُسأل عن ديونها.',
        suggestion: 'أتبع اسم كل شركة بشكلها القانوني كما في سجلها التجاري.',
      });
    }
    if (!RX.representative.test(text)) {
      add({
        id: 'representative',
        severity: 'minor',
        title: 'لم يُحدَّد الممثل القانوني للشركة',
        detail: 'الشركة شخص اعتباري يُختصم في شخص ممثلها القانوني.',
        suggestion: 'أضف «ويمثلها مديرها بصفته» أو ما يطابق عقد تأسيسها.',
      });
    }
  }

  // --- facts and grounds -----------------------------------------------------
  if (!RX.facts.test(text)) {
    add({
      id: 'facts',
      severity: 'major',
      title: 'لا يوجد قسم مستقل للوقائع',
      detail: 'عرض الوقائع مرتبة زمنياً هو ما يبني عليه القاضي فهمه للنزاع.',
      suggestion: 'أضف عنواناً «الوقائع» واعرضها في فقرات مرقمة بالتسلسل الزمني.',
    });
  } else pass('قسم الوقائع');
  if (!RX.date.test(text)) {
    add({
      id: 'dates',
      severity: 'major',
      title: 'خلت الصحيفة من التواريخ',
      detail: 'التواريخ تحسم مسائل التأخير والمدد وبدء سريان المواعيد.',
      suggestion: 'اذكر تاريخ العقد والتسليم والاستحقاق والإنذار كلاً في موضعه.',
    });
  } else pass('التواريخ الجوهرية');

  if (!RX.legalBasis.test(text)) {
    add({
      id: 'legal-basis',
      severity: 'critical',
      title: 'غياب السند القانوني',
      detail: 'الطلب الذي لا يسنده نص يضع عبء التكييف كاملاً على المحكمة، وقد يُرفض لعدم بيان الأساس.',
      suggestion: 'اربط كل طلب بالمادة التي يقوم عليها، مع ذكر رقم القانون وسنته.',
      example: scenario?.domain === 'maritime'
        ? 'وحيث إن الناقل مسؤول عن البضاعة منذ تسلّمها حتى تسليمها وفقاً لأحكام قانون التجارة البحرية رقم 28 لسنة 1980 ...'
        : scenario?.domain === 'labour'
          ? 'وحيث إن المادة 51 من قانون العمل في القطاع الأهلي رقم 6 لسنة 2010 تقرر ...'
          : 'وحيث إن المادة 196 من القانون المدني رقم 67 لسنة 1980 تنص على أن العقد شريعة المتعاقدين ...',
      rule: 'قانون المرافعات — بيان الطلبات وأسانيدها',
    });
  } else {
    pass('السند القانوني');
    if (scenario?.domain === 'maritime' && !RX.maritimeLaw.test(text)) {
      add({
        id: 'maritime-basis',
        severity: 'major',
        title: 'السند القانوني لا يشمل قانون التجارة البحرية',
        detail: 'مسؤولية الناقل البحري تحكمها قواعد خاصة تسبق القواعد العامة في القانون المدني.',
        suggestion: 'استند إلى قانون التجارة البحرية رقم 28 لسنة 1980 وإلى سند الشحن.',
      });
    }
    if (scenario?.domain === 'labour' && !RX.labourLaw.test(text)) {
      add({
        id: 'labour-basis',
        severity: 'major',
        title: 'السند القانوني لا يشمل قانون العمل',
        detail: 'حقوق العامل في القطاع الأهلي يحكمها قانون العمل رقم 6 لسنة 2010.',
        suggestion: 'استند إلى مواد قانون العمل المنظمة للمكافأة والإنذار والتعويض.',
      });
    }
  }

  // --- domain prerequisites --------------------------------------------------
  if (scenario?.domain === 'labour' && !RX.pam.test(text)) {
    add({
      id: 'pam',
      severity: 'critical',
      title: 'لم تُذكر مرحلة العرض على الهيئة العامة للقوى العاملة',
      detail: 'قبول الدعوى العمالية معلّق على عرض النزاع على إدارة علاقات العمل وتعذّر تسويته. خلوّ الصحيفة من ذلك يعرّضها للحكم بعدم القبول.',
      suggestion: 'أثبت تاريخ الشكوى ورقمها وتاريخ الإحالة، وأرفق محضر الإدارة.',
      example: 'وقد تقدمت المدعية بشكواها إلى إدارة علاقات العمل بتاريخ ...، وإذ تعذّرت التسوية أُحيل النزاع إلى المحكمة بتاريخ ...',
    });
  }
  if (scenario?.domain === 'maritime' && !RX.billOfLading.test(text)) {
    add({
      id: 'bill-of-lading',
      severity: 'major',
      title: 'لم يُذكر سند الشحن',
      detail: 'سند الشحن هو عقد النقل ودليله، وبياناته عن حالة البضاعة عند الشحن هي أساس الإثبات.',
      suggestion: 'اذكر رقم سند الشحن وتاريخه، وأنه صدر نظيفاً دون تحفظات.',
    });
  }
  if (scenario?.expected.forum === 'arbitration' && !RX.arbitration.test(text)) {
    add({
      id: 'arbitration-clause',
      severity: 'major',
      title: 'العقد يتضمن شرط تحكيم لم تتعامل معه الصحيفة',
      detail: 'سيتمسك الخصم بالشرط في أول جلسة، والأرجح أن تقضي المحكمة بعدم القبول.',
      suggestion: 'راجع البند المنظم لتسوية المنازعات قبل اختيار القضاء، أو بيّن سبب عدم إعماله.',
    });
  }

  // --- requests --------------------------------------------------------------
  const req = requestsSection(text);
  if (!req) {
    add({
      id: 'requests',
      severity: 'critical',
      title: 'لا توجد طلبات ختامية',
      detail: 'المحكمة لا تقضي بما لم يُطلب، والطلبات الختامية هي ما يحدد نطاق الحكم.',
      suggestion: 'اختم الصحيفة بفقرة «لذلك يلتمس المدعي الحكم بـ» تتضمن طلبات مرقمة ومحددة.',
      example: 'لذلك\nيلتمس المدعي تحديد أقرب جلسة وإعلان المدعى عليه والحكم:\n1. بإلزام المدعى عليه بأن يؤدي للمدعي مبلغ ... د.ك.\n2. مع إلزامه المصروفات ومقابل أتعاب المحاماة الفعلية.',
    });
  } else {
    const reqAmounts = amounts(req);
    const isVague = RX.vague.test(req);
    if (!RX.compel.test(req) || (!reqAmounts.length && scenario?.claimKwd)) {
      add({
        id: 'requests-specific',
        severity: 'major',
        title: 'الطلبات الختامية غير محددة',
        detail: isVague
          ? 'عبارات مثل «ما تراه المحكمة» أو «كافة الحقوق» لا تحدد محلاً للحكم، ولا يجوز للمحكمة أن تكمّلها من عندها.'
          : 'الطلبات لا تتضمن إلزاماً بمبلغ محدد.',
        suggestion: 'حدّد كل طلب بمحله ومقداره بالدينار الكويتي، كلٌّ في بند مستقل.',
      });
    } else pass('طلبات ختامية محددة');

    if (scenario && reqAmounts.length) {
      const total = Math.max(...reqAmounts);
      const sum = reqAmounts.reduce((a, b) => a + b, 0);
      const matches = [total, sum].some((v) => Math.abs(v - scenario.claimKwd) < 1);
      if (!matches && scenario.side === 'plaintiff') {
        add({
          id: 'amount-mismatch',
          severity: 'major',
          title: 'المبلغ المطلوب لا يطابق الثابت في المستندات',
          detail: `الطلبات تتضمن ${reqAmounts.map(formatKwd).join(' و')}، بينما تثبت مستندات الملف ${formatKwd(scenario.claimKwd)}.`,
          suggestion: 'طابق المبلغ مع الفاتورة أو كشف الحساب، واشرح أي فرق في الوقائع.',
        });
      }
    }
    if (!RX.expenses.test(req) || !RX.fees.test(req)) {
      add({
        id: 'costs',
        severity: 'minor',
        title: 'لم تُطلب المصروفات ومقابل أتعاب المحاماة',
        detail: 'المحكمة تقضي بالمصروفات على الخاسر، ويحسن النص على طلبها صراحة.',
        suggestion: 'أضف بنداً أخيراً: «مع إلزام المدعى عليه المصروفات ومقابل أتعاب المحاماة الفعلية».',
      });
    }
  }

  if (!RX.signature.test(text)) {
    add({
      id: 'signature',
      severity: 'minor',
      title: 'لا يوجد توقيع أو صفة لمقدّم الصحيفة',
      detail: 'الصحيفة تُذيَّل بتوقيع المحامي الوكيل مع بيان صفته.',
      suggestion: 'اختم بـ «وكيل المدعي — المحامي/ ...».',
    });
  }

  if (scenario) {
    const venue = GOVERNORATE_LABEL[scenario.expected.governorate];
    if (!text.includes(venue)) {
      add({
        id: 'venue-hint',
        severity: 'minor',
        title: `لم يظهر موطن المدعى عليه (${venue}) في الصحيفة`,
        detail: 'موطن المدعى عليه هو الأصل في تحديد المحكمة المختصة محلياً، وهو ما يُعلن فيه.',
        suggestion: `تأكد من ذكر عنوان المدعى عليه في ${venue} كاملاً.`,
      });
    }
  }
}

function auditMemo(text: string, scenario: Scenario | undefined, add: Add, pass: Pass) {
  if (!RX.caseNumber.test(text)) {
    add({
      id: 'case-number',
      severity: 'major',
      title: 'لم يُذكر رقم الدعوى',
      detail: 'المذكرة تُقدَّم في دعوى بعينها؛ رقمها وسنتها ودائرتها أول ما يُكتب فيها.',
      suggestion: 'اكتب في الصدر: «مذكرة بدفاع المدعى عليه في الدعوى رقم .../2026 تجاري كلي».',
    });
  } else pass('رقم الدعوى');
  if (!RX.hearing.test(text)) {
    add({
      id: 'hearing-date',
      severity: 'minor',
      title: 'لم تُذكر الجلسة المقدَّمة فيها المذكرة',
      detail: 'ذكر الجلسة يثبت تقديم المذكرة في الأجل الممنوح.',
      suggestion: 'أضف: «والمحدد لنظرها جلسة يوم ... الموافق ...».',
    });
  }

  // Ordering: formal defences that are not of public order are waived once the
  // party speaks to the merits. This is the single most expensive memo error.
  const formalAt = text.search(RX.formalDefence);
  const substantiveAt = text.search(RX.substantive);
  if (substantiveAt >= 0 && formalAt > substantiveAt) {
    add({
      id: 'defence-order',
      severity: 'critical',
      title: 'الدفوع الشكلية وردت بعد الدفاع في الموضوع',
      detail: 'الدفع بالبطلان وبعدم الاختصاص المحلي يسقط إذا لم يُبدَ قبل أي طلب أو دفاع في الموضوع. أما عدم الاختصاص النوعي أو القيمي فمن النظام العام ويجوز إبداؤه في أي حالة.',
      suggestion: 'أعد ترتيب المذكرة: الدفوع الشكلية أولاً، ثم الدفوع بعدم القبول، ثم الدفاع الموضوعي.',
      rule: 'قانون المرافعات — ترتيب الدفوع',
    });
  } else if (formalAt >= 0) pass('ترتيب الدفوع: الشكلية قبل الموضوعية');

  if (!RX.legalBasis.test(text)) {
    add({
      id: 'memo-basis',
      severity: 'major',
      title: 'الدفوع بلا سند قانوني',
      detail: 'الدفع الذي لا يُسند إلى نص أو مبدأ مستقر يسهل الالتفات عنه.',
      suggestion: 'أتبع كل دفع بالمادة التي يقوم عليها أو بالمبدأ القضائي المستقر.',
    });
  } else pass('السند القانوني للدفوع');

  const req = requestsSection(text);
  if (!req) {
    add({
      id: 'memo-requests',
      severity: 'critical',
      title: 'لا توجد طلبات ختامية في المذكرة',
      detail: 'المذكرة التي لا تنتهي بطلبات محددة تترك للمحكمة أن تستخلص مقصدك.',
      suggestion: 'اختم بـ «لذلك يلتمس المدعى عليه الحكم: أصلياً ... واحتياطياً ...».',
    });
  } else {
    if (!RX.primaryAlternative.test(req) || !RX.alternative.test(req)) {
      add({
        id: 'memo-alternative',
        severity: 'minor',
        title: 'الطلبات غير مرتبة أصلياً واحتياطياً',
        detail: 'الطلب الاحتياطي يحمي موكلك إن لم تأخذ المحكمة بالطلب الأصلي.',
        suggestion: 'رتّب: أصلياً (الدفع الحاسم)، واحتياطياً (رفض الدعوى موضوعاً أو ندب خبير).',
      });
    } else pass('ترتيب الطلبات أصلياً واحتياطياً');
  }

  // Scenario-specific: the defence the file makes decisive.
  if (scenario?.filedBy && scenario.filedBy.governorate !== scenario.expected.governorate) {
    if (!RX.localIncompetence.test(text)) {
      add({
        id: 'missed-local',
        severity: 'major',
        title: 'لم يُدفع بعدم الاختصاص المحلي',
        detail: `الدعوى مرفوعة في ${GOVERNORATE_LABEL[scenario.filedBy.governorate]} بينما موطن موكلك في ${GOVERNORATE_LABEL[scenario.expected.governorate]}. إن لم يُبدَ الدفع أولاً سقط الحق فيه.`,
        suggestion: 'ابدأ المذكرة بالدفع بعدم اختصاص المحكمة محلياً وإحالة الدعوى إلى المحكمة المختصة.',
      });
    } else {
      const localAt = text.search(RX.localIncompetence);
      if (substantiveAt >= 0 && localAt > substantiveAt) {
        // already reported by the ordering rule
      } else pass('الدفع بعدم الاختصاص المحلي في موضعه');
    }
  }
  if (scenario?.timeBar && scenario.side === 'defendant' && !RX.timeBar.test(text)) {
    add({
      id: 'missed-time-bar',
      severity: 'critical',
      title: 'لم يُتمسَّك بعدم سماع الدعوى لانقضاء المدة',
      detail: 'الوقائع تُظهر أن الدعوى رُفعت بعد انقضاء المدة المقررة، وهو دفع يحسم النزاع كله إن تمسّكت به.',
      suggestion: 'ضع الدفع بعدم السماع في مقدمة المذكرة وطلباتك الأصلية، مع حساب المدة من تاريخ انتهاء العقد.',
      example: 'أصلياً: الدفع بعدم سماع الدعوى لرفعها بعد انقضاء سنة من تاريخ انتهاء عقد العمل ...',
    });
  }
  if (!RX.signature.test(text)) {
    add({
      id: 'memo-signature',
      severity: 'minor',
      title: 'لا يوجد توقيع أو صفة لمقدّم المذكرة',
      detail: 'المذكرة تُذيَّل بتوقيع الوكيل.',
      suggestion: 'اختم بـ «وكيل المدعى عليه — المحامي/ ...».',
    });
  }
}

/** Starter skeletons, so the trainee practises the content rather than the layout. */
export function documentSkeleton(kind: DocumentKind, scenario?: Scenario): string {
  if (kind === 'petition') {
    return [
      'السيد/ رئيس المحكمة ... — الدائرة ...، المحترم',
      '',
      'صحيفة دعوى',
      '',
      'المدعي: ...، (الرقم المدني / السجل التجاري: ...)، ويمثله ... بصفته، وعنوانه: ...',
      'ضد',
      'المدعى عليه: ...، (الرقم المدني / السجل التجاري: ...)، ويمثله ... بصفته، وعنوانه: ...',
      '',
      'الوقائع',
      '1. بتاريخ ... ',
      '',
      'الأسانيد القانونية',
      'وحيث إن المادة ... من القانون رقم ... لسنة ... تنص على ...',
      '',
      'الطلبات',
      'لذلك يلتمس المدعي تحديد أقرب جلسة وإعلان المدعى عليه والحكم:',
      '1. بإلزام المدعى عليه بأن يؤدي للمدعي مبلغ ... د.ك.',
      '2. مع إلزامه المصروفات ومقابل أتعاب المحاماة الفعلية.',
      '',
      `وكيل المدعي — المحامي/ ...`,
      scenario ? `\n(الملف: ${scenario.title})` : '',
    ].join('\n');
  }
  return [
    'مذكرة بدفاع المدعى عليه',
    'في الدعوى رقم .../2026 ... — المحدد لنظرها جلسة ...',
    '',
    'أولاً: الدفوع الشكلية',
    '...',
    '',
    'ثانياً: الدفع بعدم القبول / عدم السماع',
    '...',
    '',
    'ثالثاً: الدفاع الموضوعي',
    '...',
    '',
    'الطلبات',
    'لذلك يلتمس المدعى عليه الحكم:',
    'أصلياً: ...',
    'احتياطياً: ...',
    'وفي جميع الأحوال: إلزام المدعي المصروفات ومقابل أتعاب المحاماة الفعلية.',
    '',
    'وكيل المدعى عليه — المحامي/ ...',
  ].join('\n');
}
