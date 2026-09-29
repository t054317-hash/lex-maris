'use client';

import { useState } from 'react';
import {
  CHAMBER_LABEL,
  DOMAIN_LABEL,
  FORUM_LABEL,
  GOVERNORATE_LABEL,
  LEVEL_LABEL,
  PREREQUISITE_LABEL,
  formatKwd,
} from '@/lib/training/catalog';
import { appealDeadline, dateOf, listDeadlines } from '@/lib/training/case-engine';
import { deadlineStatus, formatDate, workingDaysUntil } from '@/lib/training/deadlines';
import { getScenario } from '@/lib/training/scenarios';
import type {
  CaseRecord,
  Chamber,
  CourtLevel,
  FilingDecision,
  Forum,
  Governorate,
  Party,
  PrerequisiteId,
  Scenario,
} from '@/lib/training/types';
import { BriefEditor } from './BriefEditor';
import { DeadlineList, PHASE_LABEL } from './OfficeDashboard';
import { ProceduralReportView } from './ProceduralReportView';
import { useTraining } from './TrainingProvider';
import { Field, Panel, StatusBadge, btnGhost, btnGold, inputCls } from './ui';

const STEPS: { phase: CaseRecord['phase'][]; label: string }[] = [
  { phase: ['intake'], label: 'الملف والقيد' },
  { phase: ['filed'], label: 'الجلسة الأولى' },
  { phase: ['hearing'], label: 'المذكرات' },
  { phase: ['awaiting_judgment', 'judgment'], label: 'الحكم' },
  { phase: ['closed'], label: 'التقرير' },
];

export function CaseWorkspace({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const { getCase, now } = useTraining();
  const record = getCase(caseId);
  const scenario = record ? getScenario(record.scenarioId) : undefined;
  if (!record || !scenario) {
    return <Panel title="الملف غير موجود"><button type="button" className={btnGhost} onClick={onBack}>العودة إلى المكتب</button></Panel>;
  }
  const stepIndex = STEPS.findIndex((s) => s.phase.includes(record.phase));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnGhost} onClick={onBack}>→ المكتب</button>
        <div className="min-w-0">
          <p className="eyebrow">{DOMAIN_LABEL[scenario.domain]} · {scenario.side === 'plaintiff' ? 'وكيل المدعي' : 'وكيل المدعى عليه'}</p>
          <h2 className="text-xl font-bold text-ink-100">{scenario.title}</h2>
        </div>
        <span className="ms-auto rounded-full border border-gold-500/40 px-3 py-1 text-xs text-gold-400">{PHASE_LABEL[record.phase]}</span>
      </div>

      <ol className="flex gap-2 overflow-x-auto pb-1" aria-label="مراحل القضية">
        {STEPS.filter((s) => scenario.side === 'plaintiff' || s.label !== 'الملف والقيد').map((s) => {
          const i = STEPS.indexOf(s);
          const state = i < stepIndex ? 'done' : i === stepIndex ? 'now' : 'next';
          return (
            <li key={s.label} aria-current={state === 'now' ? 'step' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${state === 'now' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : state === 'done' ? 'border-status-safe/40 text-status-safe' : 'border-ink-500/25 text-ink-500'}`}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />{s.label}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {record.phase === 'intake' && <IntakeStage record={record} scenario={scenario} />}
          {record.phase === 'filed' && <FiledStage record={record} scenario={scenario} />}
          {record.phase === 'hearing' && <HearingStage record={record} scenario={scenario} />}
          {record.phase === 'awaiting_judgment' && <AwaitingStage record={record} />}
          {record.phase === 'judgment' && <JudgmentStage record={record} scenario={scenario} />}
          {record.phase === 'closed' && record.report && <ProceduralReportView report={record.report} judgment={record.judgment} />}
        </div>
        <aside className="space-y-5">
          <CaseFile record={record} scenario={scenario} />
          <Panel eyebrow="مواعيد القضية">
            <DeadlineList items={listDeadlines(record, scenario)} now={now} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

// --- case file ---------------------------------------------------------------

function PartyCard({ role, party }: { role: string; party: Party }) {
  return (
    <div className="rounded-xl border border-ink-500/15 bg-navy-950/40 p-3 text-xs leading-6">
      <p className="font-bold text-gold-500">{role}</p>
      <p className="text-sm font-medium text-ink-100">{party.name}{party.legalForm ? ` ${party.legalForm}` : ''}</p>
      {party.civilId && <p className="text-ink-300">الرقم المدني: <span className="tabular-nums">{party.civilId}</span></p>}
      {party.commercialRegistry && <p className="text-ink-300">السجل التجاري: <span className="tabular-nums">{party.commercialRegistry}</span></p>}
      {party.representative && <p className="text-ink-300">يمثلها: {party.representative}</p>}
      <p className="text-ink-300">{party.address}</p>
    </div>
  );
}

function CaseFile({ record, scenario }: { record: CaseRecord; scenario: Scenario }) {
  const client = scenario.side === 'plaintiff' ? 'موكلك (المدعي)' : 'موكلك (المدعى عليه)';
  const other = scenario.side === 'plaintiff' ? 'الخصم (المدعى عليه)' : 'الخصم (المدعي)';
  return (
    <Panel eyebrow="ملف القضية">
      <div className="space-y-3">
        <PartyCard role={client} party={scenario.client} />
        <PartyCard role={other} party={scenario.opponent} />
        <div>
          <p className="text-xs font-bold text-ink-500">الوقائع</p>
          <ol className="mt-1 list-decimal space-y-1 ps-5 text-sm leading-7 text-ink-300">
            {scenario.facts.map((f) => <li key={f}>{f}</li>)}
          </ol>
        </div>
        <div>
          <p className="text-xs font-bold text-ink-500">المستندات</p>
          <ul className="mt-1 space-y-1 text-sm text-ink-300">
            {scenario.documents.map((d) => <li key={d.title}><span className="text-ink-100">{d.title}:</span> {d.note}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-ink-500">تواريخ الملف</p>
          <ul className="mt-1 space-y-1 text-sm text-ink-300">
            {scenario.keyDates.map((k) => <li key={k.label}>{k.label}: <span className="text-ink-100">{formatDate(dateOf(scenario, record, k.label) ?? record.openedOn)}</span></li>)}
          </ul>
        </div>
        <p className="text-xs text-ink-500">قيمة النزاع: <span className="font-bold text-ink-100 tabular-nums">{formatKwd(scenario.claimKwd)}</span></p>
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-bold text-gold-400">تلميحات المدرّب</summary>
          <ul className="mt-2 space-y-1 text-ink-300">{scenario.pitfalls.map((p) => <li key={p}>• {p}</li>)}</ul>
        </details>
      </div>
    </Panel>
  );
}

// --- stages ------------------------------------------------------------------

function IntakeStage({ record, scenario }: { record: CaseRecord; scenario: Scenario }) {
  const { dispatch, now } = useTraining();
  const [forum, setForum] = useState<Forum>('court');
  const [chamber, setChamber] = useState<Chamber>('civil');
  const [level, setLevel] = useState<CourtLevel>('partial');
  const [governorate, setGovernorate] = useState<Governorate>(scenario.client.governorate);
  const [prereq, setPrereq] = useState<PrerequisiteId[]>([]);
  const toggle = (p: PrerequisiteId) => setPrereq((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const canFile = forum === 'arbitration' || record.petitionText.trim().length > 40;

  const submit = () => {
    const decision: FilingDecision = { forum, chamber, level, governorate, prerequisites: prereq, filedOn: now };
    dispatch({ type: 'file', caseId: record.id, decision });
  };

  return (
    <>
      <Panel eyebrow="الخطوة الأولى" title="صياغة صحيفة الدعوى">
        <BriefEditor id={`petition-${record.id}`} kind="petition" scenario={scenario} value={record.petitionText}
          onChange={(v) => dispatch({ type: 'text', caseId: record.id, field: 'petitionText', value: v })} />
      </Panel>

      <Panel eyebrow="الخطوة الثانية" title="قرار القيد">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الجهة">
            <select id="f-forum" className={inputCls} value={forum} onChange={(e) => setForum(e.target.value as Forum)}>
              {(Object.keys(FORUM_LABEL) as Forum[]).map((k) => <option key={k} value={k}>{FORUM_LABEL[k]}</option>)}
            </select>
          </Field>
          <Field label="الدائرة" hint="الاختصاص النوعي من النظام العام.">
            <select id="f-chamber" className={inputCls} value={chamber} disabled={forum === 'arbitration'} onChange={(e) => setChamber(e.target.value as Chamber)}>
              {(Object.keys(CHAMBER_LABEL) as Chamber[]).map((k) => <option key={k} value={k}>{CHAMBER_LABEL[k]}</option>)}
            </select>
          </Field>
          <Field label="درجة المحكمة" hint="تتحدد بقيمة الطلبات.">
            <select id="f-level" className={inputCls} value={level} disabled={forum === 'arbitration'} onChange={(e) => setLevel(e.target.value as CourtLevel)}>
              {(Object.keys(LEVEL_LABEL) as CourtLevel[]).map((k) => <option key={k} value={k}>{LEVEL_LABEL[k]}</option>)}
            </select>
          </Field>
          <Field label="المحكمة المختصة محلياً (المحافظة)" hint="الأصل: موطن المدعى عليه.">
            <select id="f-gov" className={inputCls} value={governorate} disabled={forum === 'arbitration'} onChange={(e) => setGovernorate(e.target.value as Governorate)}>
              {(Object.keys(GOVERNORATE_LABEL) as Governorate[]).map((k) => <option key={k} value={k}>{GOVERNORATE_LABEL[k]}</option>)}
            </select>
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-bold text-ink-300">قائمة التحقق قبل القيد</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(PREREQUISITE_LABEL) as PrerequisiteId[]).map((p) => (
              <label key={p} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-colors ${prereq.includes(p) ? 'border-gold-500/60 bg-gold-500/5' : 'border-ink-500/20'}`}>
                <input type="checkbox" className="mt-1 accent-[#D4AF37]" checked={prereq.includes(p)} onChange={() => toggle(p)} />
                <span><span className="block font-medium text-ink-100">{PREREQUISITE_LABEL[p].label}</span><span className="block text-xs leading-5 text-ink-500">{PREREQUISITE_LABEL[p].hint}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className={btnGold} disabled={!canFile} onClick={submit}>
            {forum === 'arbitration' ? 'إحالة النزاع إلى التحكيم' : `قيد الدعوى بتاريخ ${formatDate(now)}`}
          </button>
          {!canFile && <span className="text-xs text-ink-500">اكتب صحيفة الدعوى أولاً.</span>}
        </div>
      </Panel>
    </>
  );
}

function JumpTo({ date, label }: { date: string; label: string }) {
  const { dispatch, now } = useTraining();
  if (date <= now) return null;
  return <button type="button" className={btnGold} onClick={() => dispatch({ type: 'set-now', now: date })}>{label} ({formatDate(date)})</button>;
}

function FiledStage({ record, scenario }: { record: CaseRecord; scenario: Scenario }) {
  const { dispatch, now } = useTraining();
  return (
    <>
      <Panel eyebrow="الدعوى مقيدة" title={`الجلسة الأولى: ${record.hearingOn ? formatDate(record.hearingOn, true) : '—'}`}>
        <p className="text-sm leading-7 text-ink-300">
          {scenario.side === 'plaintiff' && record.filing
            ? `قُيّدت الدعوى أمام ${LEVEL_LABEL[record.filing.level]} — ${CHAMBER_LABEL[record.filing.chamber]} في ${GOVERNORATE_LABEL[record.filing.governorate]}، وأُعلن المدعى عليه.`
            : scenario.filedBy
              ? `أُعلن موكلك بصحيفة دعوى مرفوعة أمام ${LEVEL_LABEL[scenario.filedBy.level]} — ${CHAMBER_LABEL[scenario.filedBy.chamber]} في ${GOVERNORATE_LABEL[scenario.filedBy.governorate]}. أعدّ مذكرة الدفاع قبل الجلسة.`
              : 'أعدّ مذكرتك قبل الجلسة.'}
        </p>
        {record.hearingOn && <p className="mt-2 text-xs text-ink-500">المتبقي: {workingDaysUntil(now, record.hearingOn)} يوم عمل</p>}
        <div className="mt-4">{record.hearingOn && <JumpTo date={record.hearingOn} label="انتقل إلى يوم الجلسة" />}</div>
      </Panel>
      {scenario.side === 'defendant' && (
        <Panel eyebrow="الإعداد للجلسة" title="مذكرة الدفاع">
          <BriefEditor id={`memo-${record.id}`} kind="defence_memo" scenario={scenario} value={record.memoText}
            onChange={(v) => dispatch({ type: 'text', caseId: record.id, field: 'memoText', value: v })} />
        </Panel>
      )}
    </>
  );
}

function HearingStage({ record, scenario }: { record: CaseRecord; scenario: Scenario }) {
  const { dispatch, now } = useTraining();
  const [answer, setAnswer] = useState<string>('');
  const due = record.memoDeadline;
  const status = due ? deadlineStatus(now, due) : 'upcoming';
  const needsMemo = scenario.side === 'defendant';

  return (
    <>
      <Panel eyebrow={`محضر جلسة ${record.hearingOn ? formatDate(record.hearingOn) : ''}`} title="ما دار في الجلسة">
        <div className="space-y-3 text-sm leading-7">
          <p className="text-ink-300"><span className="font-bold text-ink-100">{scenario.challenge.raisedBy}:</span> {scenario.challenge.argument}</p>
          <p className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-3 text-ink-100">
            <span className="font-bold text-gold-400">قرار المحكمة: </span>
            أجّلت المحكمة الدعوى ومنحت الطرفين أجلاً لتقديم المذكرات ينتهي في {due ? formatDate(due, true) : '—'}.
          </p>
          {due && <div className="flex items-center gap-2"><StatusBadge status={status} /><span className="text-xs text-ink-500">{now > due ? 'انتهى الأجل' : `${workingDaysUntil(now, due)} يوم عمل متبقٍّ`}</span></div>}
        </div>
      </Panel>

      {needsMemo && (
        <Panel eyebrow="مذكرة الدفاع" title="راجع مذكرتك قبل تقديمها">
          <BriefEditor id={`memo-${record.id}`} kind="defence_memo" scenario={scenario} value={record.memoText}
            onChange={(v) => dispatch({ type: 'text', caseId: record.id, field: 'memoText', value: v })} />
        </Panel>
      )}

      <Panel eyebrow="الرد على دفاع الخصم" title="بمَ ترد في مذكرتك؟">
        <fieldset className="space-y-2">
          <legend className="sr-only">اختر الرد</legend>
          {scenario.challenge.options.map((o) => (
            <label key={o.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm leading-7 transition-colors ${answer === o.id ? 'border-gold-500/70 bg-gold-500/5' : 'border-ink-500/20 hover:border-ink-500/40'}`}>
              <input type="radio" name={`answer-${record.id}`} className="mt-1.5 accent-[#D4AF37]" checked={answer === o.id} onChange={() => setAnswer(o.id)} />
              <span className="text-ink-100">{o.text}</span>
            </label>
          ))}
        </fieldset>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={btnGold} disabled={!answer || (needsMemo && record.memoText.trim().length < 40)}
            onClick={() => dispatch({ type: 'memo', caseId: record.id, answer })}>
            تقديم المذكرة اليوم ({formatDate(now)})
          </button>
          {needsMemo && record.memoText.trim().length < 40 && <span className="text-xs text-ink-500">اكتب المذكرة أولاً.</span>}
        </div>
      </Panel>
    </>
  );
}

function AwaitingStage({ record }: { record: CaseRecord }) {
  return (
    <Panel eyebrow="الدعوى محجوزة للحكم" title={`النطق بالحكم: ${record.judgmentOn ? formatDate(record.judgmentOn, true) : '—'}`}>
      <p className="text-sm leading-7 text-ink-300">
        {record.memoSubmittedOn ? `قُدّمت مذكرتك في ${formatDate(record.memoSubmittedOn)}.` : 'انقضى الأجل دون تقديم مذكرة، فحجزت المحكمة الدعوى للحكم بحالتها.'}
      </p>
      <div className="mt-4">{record.judgmentOn && <JumpTo date={record.judgmentOn} label="انتقل إلى جلسة النطق بالحكم" />}</div>
    </Panel>
  );
}

function JudgmentStage({ record, scenario }: { record: CaseRecord; scenario: Scenario }) {
  const { dispatch, now } = useTraining();
  const deadline = appealDeadline(record);
  const status = deadline ? deadlineStatus(now, deadline.due) : 'upcoming';
  return (
    <Panel eyebrow={`جلسة ${record.judgmentOn ? formatDate(record.judgmentOn) : ''}`} title="منطوق الحكم">
      <p className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-4 text-[15px] leading-8 text-ink-100">{record.judgment}</p>
      {deadline && (
        <div className="mt-4 rounded-xl border border-ink-500/20 p-4 text-sm leading-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="font-bold text-ink-100">{deadline.label}: آخر يوم {formatDate(deadline.due, true)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            30 يوماً من صدور الحكم، لا يُحسب يوم صدوره{deadline.rolledOver.length ? `، وامتد لمصادفة: ${deadline.rolledOver.join('، ')}` : ''}.
          </p>
        </div>
      )}
      <p className="mt-4 text-sm text-ink-300">قرّر: هل تطعن في الحكم؟ يمكنك تقديم الساعة قبل القرار لتختبر أثر التأخير.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className={btnGold} onClick={() => dispatch({ type: 'appeal', caseId: record.id, kind: 'appeal' })}>
          إيداع صحيفة الاستئناف اليوم ({formatDate(now)})
        </button>
        <button type="button" className={btnGhost} onClick={() => dispatch({ type: 'appeal', caseId: record.id, kind: 'accept' })}>
          قبول الحكم وإنهاء الملف
        </button>
      </div>
      <p className="mt-3 text-[11px] text-ink-500">{scenario.side === 'plaintiff' ? 'موكلك هو المدعي.' : 'موكلك هو المدعى عليه.'}</p>
    </Panel>
  );
}
