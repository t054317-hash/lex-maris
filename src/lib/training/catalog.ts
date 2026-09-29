import type { Chamber, CourtLevel, Domain, Forum, Governorate, PrerequisiteId, Severity } from './types';

/** Display labels. Kept apart from the rules so wording can change without touching logic. */

export const DOMAIN_LABEL: Record<Domain, string> = {
  commercial: 'تجاري',
  labour: 'عمالي',
  maritime: 'بحري',
};

export const FORUM_LABEL: Record<Forum, string> = {
  court: 'القضاء (المحكمة المختصة)',
  arbitration: 'التحكيم',
};

export const CHAMBER_LABEL: Record<Chamber, string> = {
  commercial: 'الدائرة التجارية',
  civil: 'الدائرة المدنية',
  labour: 'الدائرة العمالية',
  family: 'دائرة الأحوال الشخصية',
  administrative: 'الدائرة الإدارية',
};

export const LEVEL_LABEL: Record<CourtLevel, string> = {
  partial: 'المحكمة الجزئية',
  total: 'المحكمة الكلية',
};

export const GOVERNORATE_LABEL: Record<Governorate, string> = {
  capital: 'العاصمة',
  hawalli: 'حولي',
  farwaniya: 'الفروانية',
  ahmadi: 'الأحمدي',
  jahra: 'الجهراء',
  mubarak: 'مبارك الكبير',
};

export const PREREQUISITE_LABEL: Record<PrerequisiteId, { label: string; hint: string }> = {
  pam_complaint: {
    label: 'عرض النزاع على الهيئة العامة للقوى العاملة',
    hint: 'شرط لقبول الدعوى العمالية قبل إحالتها إلى المحكمة.',
  },
  carrier_notice: {
    label: 'إخطار الناقل كتابياً بالهلاك أو التلف',
    hint: 'يُوجَّه عند التسليم أو خلال المهلة القصيرة التالية له، وإلا افتُرض تسلُّم البضاعة سليمة.',
  },
  arbitration_check: {
    label: 'مراجعة العقد بحثاً عن شرط تحكيم',
    hint: 'وجود شرط التحكيم يعني أن الدعوى أمام القضاء ستُدفع بعدم القبول.',
  },
  formal_notice: {
    label: 'توجيه إنذار رسمي بالوفاء',
    hint: 'ليس شرطاً للقبول في الغالب، لكنه يثبت المطالبة ويحدد تاريخ التأخير.',
  },
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'جوهري',
  major: 'مهم',
  minor: 'تحسيني',
};

/**
 * Value threshold between the partial and the total court, used for training.
 * It is a single constant precisely because the figure is set by law and has
 * changed before: confirm the value in force before relying on it.
 */
export const PARTIAL_COURT_CAP_KWD = 5000;

export function levelForValue(amountKwd: number): CourtLevel {
  return amountKwd > PARTIAL_COURT_CAP_KWD ? 'total' : 'partial';
}

export function formatKwd(amount: number): string {
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 3 })} د.ك`;
}
