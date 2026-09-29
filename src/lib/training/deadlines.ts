import type { ComputedDeadline, DeadlineRule, DeadlineRuleId, DeadlineStatus, ISODate } from './types';

/**
 * Procedural deadlines, counted the way a Kuwaiti court counts them.
 *
 * Three rules carry most of the weight, and each is a common trainee error:
 *
 *   1. The day of the triggering event is not counted. A 30-day appeal period
 *      from a judgment on the 1st ends on the 31st, not the 30th.
 *   2. A period whose last day falls on an official day off runs on to the
 *      next working day. Kuwait's weekend is Friday and Saturday.
 *   3. Months and years follow the calendar, not a count of 30 or 365 days.
 *
 * The periods below are the general rules as a training reference. Each one
 * the trainee relies on in practice must be checked against the text in force
 * and against any special provision for the type of case — the UI says so.
 */

export const DEADLINE_RULES: Record<DeadlineRuleId, DeadlineRule> = {
  appeal: {
    id: 'appeal',
    label: 'ميعاد الاستئناف',
    period: { days: 30 },
    startsFrom: 'تاريخ صدور الحكم',
    basis: 'قانون المرافعات المدنية والتجارية رقم 38 لسنة 1980 — القاعدة العامة',
    consequence: 'فوات الميعاد يُسقط الحق في الطعن، وتقضي المحكمة به من تلقاء نفسها.',
  },
  cassation: {
    id: 'cassation',
    label: 'ميعاد الطعن بالتمييز',
    period: { days: 30 },
    startsFrom: 'تاريخ صدور الحكم الاستئنافي',
    basis: 'قانون المرافعات المدنية والتجارية رقم 38 لسنة 1980',
    consequence: 'فوات الميعاد يُسقط الحق في الطعن بالتمييز.',
  },
  reconsideration: {
    id: 'reconsideration',
    label: 'ميعاد التماس إعادة النظر',
    period: { days: 30 },
    startsFrom: 'تاريخ ظهور سبب الالتماس بحسب الأحوال',
    basis: 'قانون المرافعات المدنية والتجارية رقم 38 لسنة 1980',
    consequence: 'فوات الميعاد يُسقط الحق في الالتماس.',
    verify: true,
  },
  labour_time_bar: {
    id: 'labour_time_bar',
    label: 'عدم سماع الدعوى العمالية',
    period: { years: 1 },
    startsFrom: 'تاريخ انتهاء عقد العمل',
    basis: 'قانون العمل في القطاع الأهلي رقم 6 لسنة 2010',
    consequence: 'تُدفع الدعوى بعدم السماع إذا رُفعت بعد انقضاء المدة.',
    verify: true,
  },
  maritime_cargo_time_bar: {
    id: 'maritime_cargo_time_bar',
    label: 'انقضاء دعوى المسؤولية عن البضاعة',
    period: { years: 1 },
    startsFrom: 'تاريخ تسليم البضاعة أو التاريخ الذي كان يجب تسليمها فيه',
    basis: 'قانون التجارة البحرية رقم 28 لسنة 1980',
    consequence: 'تنقضي الدعوى قِبَل الناقل بانقضاء المدة.',
    verify: true,
  },
  court_memo: {
    id: 'court_memo',
    label: 'أجل تقديم المذكرات',
    period: { days: 14 },
    startsFrom: 'تاريخ الجلسة التي منحت فيها المحكمة الأجل',
    basis: 'أجل تحدده المحكمة في كل دعوى بحسب ظروفها',
    consequence: 'للمحكمة أن تلتفت عن المذكرة المقدمة بعد الأجل وأن تحجز الدعوى للحكم.',
  },
};

/**
 * Fixed-date public holidays. The Islamic holidays move with the lunar
 * calendar and are announced each year, so they are not modelled; the UI
 * tells the trainee to check them.
 */
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': 'رأس السنة الميلادية',
  '02-25': 'العيد الوطني',
  '02-26': 'عيد التحرير',
};

const WEEKEND = new Set([5, 6]); // Friday, Saturday

// --- date helpers (UTC throughout, so no daylight-saving or zone drift) ----

export function parseISO(date: ISODate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = parseISO(date);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

/** Calendar months, clamped to the last day of a shorter month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: ISODate, months: number): ISODate {
  const d = parseISO(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toISO(d);
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86_400_000);
}

export function dayOffReason(date: ISODate): string | null {
  const d = parseISO(date);
  if (WEEKEND.has(d.getUTCDay())) return d.getUTCDay() === 5 ? 'يوم الجمعة' : 'يوم السبت';
  return FIXED_HOLIDAYS[date.slice(5)] ?? null;
}

export function isWorkingDay(date: ISODate): boolean {
  return dayOffReason(date) === null;
}

/** First working day on or after `date`, with the reasons for every day skipped. */
export function rollForward(date: ISODate): { date: ISODate; skipped: string[] } {
  const skipped: string[] = [];
  let current = date;
  for (let guard = 0; guard < 14; guard += 1) {
    const reason = dayOffReason(current);
    if (!reason) break;
    skipped.push(`${formatDate(current)} (${reason})`);
    current = addDays(current, 1);
  }
  return { date: current, skipped };
}

/**
 * The last valid day for a step, from the triggering date.
 *
 * Adding N days to the event date already excludes the event day itself: the
 * first counted day is the day after, and the Nth counted day is event + N.
 */
export function computeDeadline(ruleId: DeadlineRuleId, start: ISODate, overrideDays?: number): ComputedDeadline {
  const rule = DEADLINE_RULES[ruleId];
  const { days, months, years } = overrideDays !== undefined ? { days: overrideDays } : rule.period;
  let nominal = start;
  if (years) nominal = addMonths(nominal, years * 12);
  if (months) nominal = addMonths(nominal, months);
  if (days) nominal = addDays(nominal, days);
  const { date: due, skipped } = rollForward(nominal);
  return { ruleId, label: rule.label, start, nominal, due, rolledOver: skipped };
}

/** Working days from `now` to `due`, not counting `now`. Negative once overdue. */
export function workingDaysUntil(now: ISODate, due: ISODate): number {
  if (due < now) return -daysBetween(due, now);
  let n = 0;
  for (let d = addDays(now, 1); d <= due; d = addDays(d, 1)) if (isWorkingDay(d)) n += 1;
  return n;
}

export function deadlineStatus(now: ISODate, due: ISODate, doneOn?: ISODate): DeadlineStatus {
  if (doneOn) return 'done';
  if (now > due) return 'overdue';
  return workingDaysUntil(now, due) <= 3 ? 'due-soon' : 'upcoming';
}

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** Stable Arabic date text, independent of the browser's Intl data. */
export function formatDate(date: ISODate, withWeekday = false): string {
  const d = parseISO(date);
  const text = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return withWeekday ? `${WEEKDAYS[d.getUTCDay()]} ${text}` : text;
}

export function todayISO(): ISODate {
  const now = new Date();
  return toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}
