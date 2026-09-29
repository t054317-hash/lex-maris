import { auditDocument } from './brief-audit';
import {
  CHAMBER_LABEL,
  FORUM_LABEL,
  GOVERNORATE_LABEL,
  LEVEL_LABEL,
  PARTIAL_COURT_CAP_KWD,
  PREREQUISITE_LABEL,
  formatKwd,
  levelForValue,
} from './catalog';
import { addDays, computeDeadline, formatDate, rollForward } from './deadlines';
import type {
  CaseRecord,
  FilingDecision,
  ISODate,
  ProceduralReport,
  ReportItem,
  Scenario,
  Severity,
} from './types';

/**
 * The life of a training case, as pure transitions over a CaseRecord.
 *
 *   intake ─file→ filed ─(clock reaches hearing)→ hearing ─memo→ awaiting_judgment
 *     ─(clock reaches judgment)→ judgment ─appeal/accept→ closed (+ report)
 *
 * Defendant-side matters open already `filed`, because the other side has
 * sued. Choosing arbitration closes the case at once: there is no court
 * hearing to hold. Every function returns a new record; nothing mutates.
 */

const FIRST_HEARING_AFTER_FILING = 21;
const FIRST_HEARING_AFTER_SERVICE = 10;
const JUDGMENT_AFTER_MEMO_DEADLINE = 14;
/** Grace period after the memo deadline before the court reserves the case anyway. */
const RESERVE_AFTER_DEADLINE = 2;

export function dateOf(scenario: Scenario, record: CaseRecord, label: string): ISODate | undefined {
  const d = scenario.keyDates.find((k) => k.label === label);
  return d ? addDays(record.openedOn, d.offsetDays) : undefined;
}

export function timeBarDeadline(scenario: Scenario, record: CaseRecord) {
  if (!scenario.timeBar) return undefined;
  const from = dateOf(scenario, record, scenario.timeBar.fromLabel);
  return from ? computeDeadline(scenario.timeBar.ruleId, from) : undefined;
}

export function openCase(scenario: Scenario, today: ISODate): CaseRecord {
  const base: CaseRecord = {
    id: `${scenario.id}-${today}-${Math.random().toString(36).slice(2, 7)}`,
    scenarioId: scenario.id,
    openedOn: today,
    phase: 'intake',
    petitionText: '',
    memoText: '',
  };
  if (scenario.side === 'defendant') {
    return { ...base, phase: 'filed', hearingOn: rollForward(addDays(today, FIRST_HEARING_AFTER_SERVICE)).date };
  }
  return base;
}

export function fileCase(record: CaseRecord, scenario: Scenario, decision: FilingDecision): CaseRecord {
  const next: CaseRecord = { ...record, filing: decision };
  if (decision.forum === 'arbitration') {
    const closed: CaseRecord = { ...next, phase: 'closed', judgment: 'أُحيل النزاع إلى التحكيم وفق شرط العقد؛ لا تُنظر الدعوى أمام القضاء.' };
    return { ...closed, report: evaluateCase(closed, scenario, decision.filedOn) };
  }
  return { ...next, phase: 'filed', hearingOn: rollForward(addDays(decision.filedOn, FIRST_HEARING_AFTER_FILING)).date };
}

/** Moves the case along whatever the clock has made due. Safe to call on every tick. */
export function advanceCase(record: CaseRecord, scenario: Scenario, now: ISODate): CaseRecord {
  let r = record;
  if (r.phase === 'filed' && r.hearingOn && now >= r.hearingOn) {
    r = { ...r, phase: 'hearing', memoDeadline: computeDeadline('court_memo', r.hearingOn).due };
  }
  if (r.phase === 'hearing' && r.memoDeadline && now > addDays(r.memoDeadline, RESERVE_AFTER_DEADLINE)) {
    // The trainee let the deadline pass: the court reserves the case without the memo.
    r = reserveForJudgment(r);
  }
  if (r.phase === 'awaiting_judgment' && r.judgmentOn && now >= r.judgmentOn) {
    r = { ...r, phase: 'judgment', judgment: judgmentText(scenario, r) };
  }
  return r;
}

export function submitMemo(record: CaseRecord, now: ISODate, answer: string): CaseRecord {
  return reserveForJudgment({ ...record, memoSubmittedOn: now, challengeAnswer: answer });
}

function reserveForJudgment(r: CaseRecord): CaseRecord {
  const base = r.memoDeadline ?? r.hearingOn ?? r.openedOn;
  return { ...r, phase: 'awaiting_judgment', judgmentOn: rollForward(addDays(base, JUDGMENT_AFTER_MEMO_DEADLINE)).date };
}

export function decideAppeal(record: CaseRecord, scenario: Scenario, kind: 'appeal' | 'accept', now: ISODate): CaseRecord {
  const closed: CaseRecord = { ...record, phase: 'closed', appeal: { kind, on: now } };
  return { ...closed, report: evaluateCase(closed, scenario, now) };
}

export function appealDeadline(record: CaseRecord) {
  return record.judgmentOn ? computeDeadline('appeal', record.judgmentOn) : undefined;
}

// --- outcome ---------------------------------------------------------------

type Outcome =
  | { kind: 'fatal'; reason: string }
  | { kind: 'win' | 'partial' | 'loss' };

function fatalDefect(scenario: Scenario, r: CaseRecord): string | null {
  if (scenario.side !== 'plaintiff' || !r.filing) return null;
  const f = r.filing;
  if (scenario.expected.forum === 'arbitration' && f.forum === 'court') return 'بعدم قبول الدعوى لوجود شرط التحكيم الذي تمسّك به المدعى عليه';
  if (f.chamber !== scenario.expected.chamber) return `بعدم اختصاص ${CHAMBER_LABEL[f.chamber]} نوعياً بنظر الدعوى وإحالتها بحالتها إلى ${CHAMBER_LABEL[scenario.expected.chamber]}`;
  if (scenario.expected.prerequisites.includes('pam_complaint') && !f.prerequisites.includes('pam_complaint')) return 'بعدم قبول الدعوى لرفعها قبل عرض النزاع على الهيئة العامة للقوى العاملة';
  const bar = timeBarDeadline(scenario, r);
  if (bar && f.filedOn > bar.due) return 'بعدم سماع الدعوى لرفعها بعد انقضاء المدة المقررة';
  return null;
}

function memoOnTime(r: CaseRecord): boolean {
  return Boolean(r.memoSubmittedOn && r.memoDeadline && r.memoSubmittedOn <= r.memoDeadline);
}

function answeredCorrectly(scenario: Scenario, r: CaseRecord): boolean {
  return scenario.challenge.options.some((o) => o.id === r.challengeAnswer && o.correct);
}

export function caseOutcome(scenario: Scenario, r: CaseRecord): Outcome {
  const fatal = fatalDefect(scenario, r);
  if (fatal) return { kind: 'fatal', reason: fatal };
  const doc = scenario.side === 'plaintiff' ? r.petitionText : r.memoText;
  const audit = auditDocument(doc, scenario.side === 'plaintiff' ? 'petition' : 'defence_memo', scenario);
  const points = [answeredCorrectly(scenario, r), memoOnTime(r), audit.findings.every((f) => f.severity !== 'critical')].filter(Boolean).length;
  return { kind: points === 3 ? 'win' : points === 2 ? 'partial' : 'loss' };
}

function judgmentText(scenario: Scenario, r: CaseRecord): string {
  const o = caseOutcome(scenario, r);
  const claim = scenario.claimKwd;
  if (o.kind === 'fatal') return `حكمت المحكمة ${o.reason}، وألزمت رافعها المصروفات.`;
  if (scenario.side === 'plaintiff') {
    if (o.kind === 'win') return `حكمت المحكمة بإلزام المدعى عليه بأن يؤدي للمدعي مبلغ ${formatKwd(claim)}، مع المصروفات ومقابل أتعاب المحاماة.`;
    if (o.kind === 'partial') return `حكمت المحكمة بإلزام المدعى عليه بأن يؤدي للمدعي مبلغ ${formatKwd(Math.round(claim * 0.6))}، ورفضت ما عدا ذلك من طلبات.`;
    return 'حكمت المحكمة برفض الدعوى، وألزمت المدعي المصروفات.';
  }
  if (o.kind === 'win') return scenario.timeBar ? 'حكمت المحكمة بعدم سماع الدعوى لرفعها بعد انقضاء المدة، وألزمت المدعي المصروفات.' : 'حكمت المحكمة برفض الدعوى، وألزمت المدعي المصروفات.';
  if (o.kind === 'partial') return `حكمت المحكمة بإلزام المدعى عليه (موكلك) بأن يؤدي للمدعي مبلغ ${formatKwd(Math.round(claim * 0.5))}، ورفضت ما عدا ذلك.`;
  return `حكمت المحكمة بإلزام المدعى عليه (موكلك) بأن يؤدي للمدعي مبلغ ${formatKwd(claim)} والمصروفات.`;
}

// --- report ----------------------------------------------------------------

const PENALTY: Record<Severity, number> = { critical: 20, major: 10, minor: 4 };

function grade(score: number): string {
  if (score >= 90) return 'ممتاز';
  if (score >= 75) return 'جيد جداً';
  if (score >= 60) return 'جيد';
  if (score >= 45) return 'مقبول';
  return 'يحتاج إلى مزيد من التدريب';
}

/**
 * The after-action report: every procedural error the trainee made, why it
 * matters, and the habit that prevents it. Built from the same facts the
 * judgment used, so the report and the outcome never disagree.
 */
export function evaluateCase(r: CaseRecord, scenario: Scenario, today: ISODate): ProceduralReport {
  const items: ReportItem[] = [];
  const strengths: string[] = [];
  const f = r.filing;
  const exp = scenario.expected;

  if (scenario.side === 'plaintiff' && f) {
    if (f.forum !== exp.forum) {
      items.push({
        id: 'forum', stage: 'القيد', severity: 'critical',
        title: exp.forum === 'arbitration' ? 'اللجوء إلى القضاء رغم وجود شرط تحكيم' : 'اختيار التحكيم دون اتفاق عليه',
        whatHappened: `اخترت ${FORUM_LABEL[f.forum]}، بينما يقتضي الملف ${FORUM_LABEL[exp.forum]}.`,
        rule: exp.forum === 'arbitration'
          ? 'متى تمسّك الخصم بشرط تحكيم صحيح قبل الكلام في الموضوع، تقضي المحكمة بعدم قبول الدعوى.'
          : 'التحكيم لا يكون إلا باتفاق الطرفين.',
        howToAvoid: 'اقرأ بند تسوية المنازعات في العقد قبل أي إجراء، ودوّن نتيجته في ملف الدعوى.',
      });
    } else strengths.push(`اختيار الجهة الصحيحة: ${FORUM_LABEL[f.forum]}.`);

    if (f.forum === 'court') {
      if (f.chamber !== exp.chamber) {
        items.push({
          id: 'chamber', stage: 'القيد', severity: 'critical',
          title: 'رفع الدعوى أمام دائرة غير مختصة نوعياً',
          whatHappened: `قيّدت الدعوى أمام ${CHAMBER_LABEL[f.chamber]}، والنزاع من اختصاص ${CHAMBER_LABEL[exp.chamber]}.`,
          rule: 'الاختصاص النوعي من النظام العام؛ تقضي فيه المحكمة من تلقاء نفسها وتحيل الدعوى، فيضيع الوقت وتتأخر الجلسات.',
          howToAvoid: scenario.domain === 'maritime'
            ? 'المنازعات البحرية منازعات تجارية بطبيعتها. صنّف طبيعة العلاقة قبل القيد: من الأطراف؟ وما العقد؟'
            : 'حدّد طبيعة العلاقة القانونية أولاً (تجارية، مدنية، عمالية) ثم اختر الدائرة التي تتبعها.',
        });
      } else strengths.push(`تحديد الدائرة المختصة: ${CHAMBER_LABEL[f.chamber]}.`);

      const wantLevel = levelForValue(scenario.claimKwd);
      if (f.level !== wantLevel) {
        items.push({
          id: 'level', stage: 'القيد', severity: 'major',
          title: 'خطأ في الاختصاص القيمي',
          whatHappened: `اخترت ${LEVEL_LABEL[f.level]} لدعوى قيمتها ${formatKwd(scenario.claimKwd)}.`,
          rule: `يتحدد الاختصاص القيمي بقيمة الطلبات؛ والحد المعتمد في هذا التدريب ${formatKwd(PARTIAL_COURT_CAP_KWD)} (تحقّق من النصاب النافذ).`,
          howToAvoid: 'احسب قيمة الدعوى من مجموع الطلبات قبل القيد، وقارنها بالنصاب.',
        });
      }

      if (f.governorate !== exp.governorate) {
        items.push({
          id: 'venue', stage: 'القيد', severity: 'major',
          title: 'رفع الدعوى في غير موطن المدعى عليه',
          whatHappened: `قيّدت الدعوى في ${GOVERNORATE_LABEL[f.governorate]}، وموطن المدعى عليه في ${GOVERNORATE_LABEL[exp.governorate]}.`,
          rule: 'الأصل أن تختص المحكمة التي يقع في دائرتها موطن المدعى عليه. الدفع بعدم الاختصاص المحلي ليس من النظام العام، لكن الخصم إن أبداه في أول دفاعه أُحيلت الدعوى.',
          howToAvoid: 'استخرج موطن المدعى عليه من سجله التجاري أو بطاقته المدنية وابنِ عليه اختيار المحكمة.',
        });
      } else strengths.push('اختيار المحكمة المختصة محلياً.');

      for (const p of exp.prerequisites) {
        if (f.prerequisites.includes(p)) continue;
        items.push({
          id: `prereq-${p}`, stage: 'القيد',
          severity: p === 'pam_complaint' || p === 'arbitration_check' ? 'critical' : p === 'carrier_notice' ? 'major' : 'minor',
          title: `لم تتحقق من: ${PREREQUISITE_LABEL[p].label}`,
          whatHappened: 'قيّدت الدعوى دون التأكد من استيفاء هذه الخطوة.',
          rule: PREREQUISITE_LABEL[p].hint,
          howToAvoid: 'اعتمد قائمة تحقق ثابتة لكل نوع من الدعاوى تراجعها قبل القيد.',
        });
      }

      const bar = timeBarDeadline(scenario, r);
      if (bar) {
        if (f.filedOn > bar.due) {
          items.push({
            id: 'time-bar', stage: 'المواعيد', severity: 'critical',
            title: 'رفع الدعوى بعد انقضاء المدة',
            whatHappened: `رُفعت الدعوى في ${formatDate(f.filedOn)}، وآخر يوم كان ${formatDate(bar.due)}.`,
            rule: `${bar.label}: تبدأ المدة من ${formatDate(bar.start)}.`,
            howToAvoid: 'سجّل تاريخ بدء كل مدة في لوحة المواعيد يوم استلام الملف، لا يوم الصياغة.',
          });
        } else strengths.push(`رفع الدعوى قبل ${bar.label} (آخر يوم: ${formatDate(bar.due)}).`);
      }
    }
  }

  // --- drafting ---------------------------------------------------------------
  const kind = scenario.side === 'plaintiff' ? 'petition' : 'defence_memo';
  const doc = scenario.side === 'plaintiff' ? r.petitionText : r.memoText;
  if (!(scenario.side === 'plaintiff' && f?.forum === 'arbitration')) {
    const audit = auditDocument(doc, kind, scenario);
    for (const finding of audit.findings.filter((x) => x.severity !== 'minor').slice(0, 5)) {
      items.push({
        id: `draft-${finding.id}`, stage: 'الصياغة', severity: finding.severity,
        title: finding.title, whatHappened: finding.detail, rule: finding.rule ?? 'بيانات المستند الإجرائي', howToAvoid: finding.suggestion,
      });
    }
    if (audit.score >= 80) strengths.push(`صياغة ${kind === 'petition' ? 'الصحيفة' : 'المذكرة'} متماسكة (درجة التدقيق ${audit.score}).`);
  }

  // --- hearing ----------------------------------------------------------------
  if (r.memoDeadline) {
    if (!r.memoSubmittedOn) {
      items.push({
        id: 'memo-missing', stage: 'الجلسة', severity: 'critical',
        title: 'لم تُقدَّم المذكرة في الأجل',
        whatHappened: `منحت المحكمة أجلاً حتى ${formatDate(r.memoDeadline)} ولم تُقدَّم أي مذكرة، فحُجزت الدعوى للحكم.`,
        rule: 'للمحكمة أن تحجز الدعوى للحكم بحالتها متى انقضى الأجل دون تقديم المذكرات.',
        howToAvoid: 'أدخل كل أجل تمنحه المحكمة في لوحة المواعيد فور انتهاء الجلسة، مع تنبيه قبله بثلاثة أيام عمل.',
      });
    } else if (r.memoSubmittedOn > r.memoDeadline) {
      items.push({
        id: 'memo-late', stage: 'الجلسة', severity: 'major',
        title: 'تقديم المذكرة بعد انقضاء الأجل',
        whatHappened: `قُدّمت المذكرة في ${formatDate(r.memoSubmittedOn)} والأجل انتهى في ${formatDate(r.memoDeadline)}.`,
        rule: 'للمحكمة أن تلتفت عن المذكرة المقدمة بعد الأجل.',
        howToAvoid: 'اعمل بموعد داخلي يسبق الأجل بيومي عمل على الأقل.',
      });
    } else strengths.push('تقديم المذكرة في الأجل الذي منحته المحكمة.');

    const option = scenario.challenge.options.find((o) => o.id === r.challengeAnswer);
    if (option && !option.correct) {
      const right = scenario.challenge.options.find((o) => o.correct);
      items.push({
        id: 'challenge', stage: 'الجلسة', severity: 'major',
        title: 'رد غير موفق على دفاع الخصم',
        whatHappened: `اخترت: «${option.text}»`,
        rule: option.explanation,
        howToAvoid: right ? `الرد الأنسب: ${right.text}` : 'ارجع إلى مستندات الملف قبل الرد.',
      });
    } else if (option) strengths.push('الرد على دفاع الخصم بما يحسمه من مستندات الملف.');
  }

  // --- appeal -----------------------------------------------------------------
  if (r.appeal && r.judgmentOn) {
    const due = computeDeadline('appeal', r.judgmentOn);
    const outcome = caseOutcome(scenario, r);
    const lostSomething = outcome.kind !== 'win';
    if (r.appeal.kind === 'appeal') {
      if (r.appeal.on > due.due) {
        items.push({
          id: 'appeal-late', stage: 'الطعن', severity: 'critical',
          title: 'الاستئناف بعد فوات الميعاد',
          whatHappened: `أودعت صحيفة الاستئناف في ${formatDate(r.appeal.on)}، وآخر يوم كان ${formatDate(due.due)}.`,
          rule: `${due.label} ثلاثون يوماً من صدور الحكم، ولا يُحسب يوم صدوره، ويمتد إذا صادف آخره عطلة رسمية.${due.rolledOver.length ? ` (امتد هنا بسبب: ${due.rolledOver.join('، ')})` : ''}`,
          howToAvoid: 'أدخل ميعاد الطعن في اللوحة يوم صدور الحكم، وأودع الصحيفة قبل آخر يوم بأيام.',
        });
      } else if (!lostSomething) {
        items.push({
          id: 'appeal-no-interest', stage: 'الطعن', severity: 'minor',
          title: 'استئناف حكم صادر لمصلحة موكلك كاملاً',
          whatHappened: 'الحكم أجاب موكلك إلى كل طلباته، ومع ذلك طعنت فيه.',
          rule: 'لا يُقبل الطعن ممن لا مصلحة له فيه، ومن قُضي له بكل طلباته لا مصلحة له.',
          howToAvoid: 'قارن منطوق الحكم بطلباتك بنداً بنداً قبل قرار الطعن.',
        });
      } else strengths.push(`استئناف الحكم في الميعاد (آخر يوم ${formatDate(due.due)}).`);
    } else if (lostSomething && outcome.kind !== 'fatal') {
      items.push({
        id: 'appeal-missed', stage: 'الطعن', severity: 'major',
        title: 'قبول حكم لم يُجب موكلك إلى طلباته',
        whatHappened: 'قبلت الحكم رغم أنه رفض كل طلبات موكلك أو بعضها.',
        rule: `كان أمامك حتى ${formatDate(due.due)} لاستئنافه.`,
        howToAvoid: 'ادرس أسباب الحكم خلال أسبوع من صدوره، وناقش الطعن مع موكلك كتابةً.',
      });
    } else if (outcome.kind === 'fatal') {
      strengths.push('التعامل مع حكم إجرائي: الأولى تصحيح الإجراء وإعادة رفع الدعوى إن كان ذلك متاحاً.');
    } else strengths.push('قبول حكم أجاب موكلك إلى طلباته.');
  }

  const score = Math.max(0, 100 - items.reduce((s, i) => s + PENALTY[i.severity], 0));
  const order: Severity[] = ['critical', 'major', 'minor'];
  items.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  return { score, grade: grade(score), items, strengths, generatedOn: today };
}

// --- deadlines board -------------------------------------------------------

export interface CaseDeadline {
  caseId: string;
  scenarioTitle: string;
  label: string;
  due: ISODate;
  doneOn?: ISODate;
  basis: string;
  /** Hearings are appointments, not deadlines: shown on the schedule, never "overdue". */
  kind: 'deadline' | 'hearing';
}

export function listDeadlines(record: CaseRecord, scenario: Scenario): CaseDeadline[] {
  const out: CaseDeadline[] = [];
  const common = { caseId: record.id, scenarioTitle: scenario.title };
  const bar = timeBarDeadline(scenario, record);
  if (bar && scenario.side === 'plaintiff' && record.filing?.forum !== 'arbitration') {
    out.push({ ...common, label: `آخر يوم لرفع الدعوى — ${bar.label}`, due: bar.due, doneOn: record.filing?.filedOn, basis: `تبدأ من ${formatDate(bar.start)}`, kind: 'deadline' });
  }
  if (record.hearingOn) {
    out.push({ ...common, label: 'الجلسة الأولى', due: record.hearingOn, doneOn: record.phase === 'filed' ? undefined : record.hearingOn, basis: record.filing ? `بعد القيد في ${formatDate(record.filing.filedOn)}` : 'بحسب الإعلان', kind: 'hearing' });
  }
  if (record.memoDeadline) {
    out.push({ ...common, label: 'أجل تقديم المذكرة', due: record.memoDeadline, doneOn: record.memoSubmittedOn, basis: 'أجل منحته المحكمة في الجلسة الأولى', kind: 'deadline' });
  }
  if (record.judgmentOn) {
    out.push({ ...common, label: 'جلسة النطق بالحكم', due: record.judgmentOn, doneOn: record.phase === 'judgment' || record.phase === 'closed' ? record.judgmentOn : undefined, basis: 'حُجزت الدعوى للحكم', kind: 'hearing' });
    if (record.phase === 'judgment' || record.phase === 'closed') {
      const a = computeDeadline('appeal', record.judgmentOn);
      out.push({ ...common, label: a.label, due: a.due, doneOn: record.appeal?.on, basis: `30 يوماً من ${formatDate(record.judgmentOn)}${a.rolledOver.length ? ' — امتد بسبب عطلة' : ''}`, kind: 'deadline' });
    }
  }
  return out;
}
