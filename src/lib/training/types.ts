/**
 * Shared types for the lawyer-training module.
 *
 * Everything under `src/lib/training/` is pure: no React, no storage, no
 * clock. The UI passes the virtual "now" in, which is what lets a trainee
 * fast-forward a case through its deadlines and lets the same functions be
 * unit-tested with fixed dates.
 */

/** Calendar dates only, as `YYYY-MM-DD`. Deadlines never depend on the hour. */
export type ISODate = string;

export type Domain = 'commercial' | 'labour' | 'maritime';

export type Forum = 'court' | 'arbitration';

export type Chamber = 'commercial' | 'civil' | 'labour' | 'family' | 'administrative';

export type CourtLevel = 'partial' | 'total';

export type Governorate = 'capital' | 'hawalli' | 'farwaniya' | 'ahmadi' | 'jahra' | 'mubarak';

/** Steps a lawyer may have to take before a claim is admissible or safe to file. */
export type PrerequisiteId =
  | 'pam_complaint'
  | 'carrier_notice'
  | 'arbitration_check'
  | 'formal_notice';

export type Side = 'plaintiff' | 'defendant';

export interface Party {
  name: string;
  /** e.g. "ذ.م.م" — omitted for natural persons. */
  legalForm?: string;
  civilId?: string;
  commercialRegistry?: string;
  representative?: string;
  address: string;
  governorate: Governorate;
}

export interface ScenarioDocument {
  title: string;
  note: string;
}

/** A date in the case file, expressed relative to the day the case is opened. */
export interface RelativeDate {
  label: string;
  offsetDays: number;
}

export interface DefenceOption {
  id: string;
  text: string;
  correct: boolean;
  explanation: string;
}

/** What the other side raises at the first hearing, and how the trainee may answer. */
export interface HearingChallenge {
  raisedBy: string;
  argument: string;
  options: DefenceOption[];
}

export interface Scenario {
  id: string;
  domain: Domain;
  side: Side;
  title: string;
  summary: string;
  difficulty: 1 | 2 | 3;
  client: Party;
  opponent: Party;
  facts: string[];
  documents: ScenarioDocument[];
  claimKwd: number;
  keyDates: RelativeDate[];
  expected: {
    forum: Forum;
    chamber: Chamber;
    /** Where the defendant is domiciled — the general rule for venue. */
    governorate: Governorate;
    prerequisites: PrerequisiteId[];
    /** Keywords a well-founded pleading in this matter should cite. */
    legalBases: string[];
  };
  /** Defendant-side matters only: where the other side actually filed. */
  filedBy?: { chamber: Chamber; level: CourtLevel; governorate: Governorate; filedOffsetDays: number };
  /** Limitation that runs against the claim, if any. `fromLabel` names a keyDates label. */
  timeBar?: { ruleId: DeadlineRuleId; fromLabel: string };
  challenge: HearingChallenge;
  /** Short coaching notes shown in the brief. */
  pitfalls: string[];
}

export type DeadlineRuleId =
  | 'appeal'
  | 'cassation'
  | 'reconsideration'
  | 'labour_time_bar'
  | 'maritime_cargo_time_bar'
  | 'court_memo';

export interface DeadlineRule {
  id: DeadlineRuleId;
  label: string;
  /** Period length. Months and years follow the calendar, days are counted. */
  period: { days?: number; months?: number; years?: number };
  startsFrom: string;
  basis: string;
  /** Some deadlines forfeit a right, others only weaken a position. */
  consequence: string;
  /** True where the period is a training figure the trainee must still verify. */
  verify?: boolean;
}

export interface ComputedDeadline {
  ruleId: DeadlineRuleId;
  label: string;
  start: ISODate;
  /** The last day before any holiday roll-forward. */
  nominal: ISODate;
  /** The last day on which the step can validly be taken. */
  due: ISODate;
  rolledOver: string[];
}

export type DeadlineStatus = 'done' | 'overdue' | 'due-soon' | 'upcoming';

export type Severity = 'critical' | 'major' | 'minor';

export interface AuditFinding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  suggestion: string;
  /** A ready-to-adapt drafting example. */
  example?: string;
  rule?: string;
}

export interface AuditResult {
  score: number;
  findings: AuditFinding[];
  passed: string[];
}

export type DocumentKind = 'petition' | 'defence_memo';

export interface FilingDecision {
  forum: Forum;
  chamber: Chamber;
  level: CourtLevel;
  governorate: Governorate;
  prerequisites: PrerequisiteId[];
  filedOn: ISODate;
}

export type CasePhase = 'intake' | 'filed' | 'hearing' | 'awaiting_judgment' | 'judgment' | 'closed';

export interface CaseRecord {
  id: string;
  scenarioId: string;
  openedOn: ISODate;
  phase: CasePhase;
  filing?: FilingDecision;
  petitionText: string;
  memoText: string;
  hearingOn?: ISODate;
  memoDeadline?: ISODate;
  memoSubmittedOn?: ISODate;
  challengeAnswer?: string;
  judgmentOn?: ISODate;
  judgment?: string;
  appeal?: { kind: 'appeal' | 'accept'; on: ISODate };
  report?: ProceduralReport;
}

export type ReportStage = 'القيد' | 'الصياغة' | 'الجلسة' | 'المواعيد' | 'الطعن';

export interface ReportItem {
  id: string;
  stage: ReportStage;
  severity: Severity;
  title: string;
  whatHappened: string;
  rule: string;
  howToAvoid: string;
}

export interface ProceduralReport {
  score: number;
  grade: string;
  items: ReportItem[];
  strengths: string[];
  generatedOn: ISODate;
}
