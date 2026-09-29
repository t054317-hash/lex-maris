'use client';

import { useState } from 'react';
import type { DocumentKind } from '@/lib/training/types';
import { BriefEditor } from './BriefEditor';
import { CaseWorkspace } from './CaseWorkspace';
import { DeadlineCalculator } from './DeadlineCalculator';
import { OfficeDashboard } from './OfficeDashboard';
import { ScenarioLibrary } from './ScenarioLibrary';
import { TrainingProvider, useTraining } from './TrainingProvider';
import { VirtualClock } from './VirtualClock';
import { Panel, btnGhost } from './ui';

type Tab = 'office' | 'library' | 'auditor' | 'deadlines';

const TABS: { id: Tab; label: string }[] = [
  { id: 'office', label: 'المكتب الافتراضي' },
  { id: 'library', label: 'مكتبة السيناريوهات' },
  { id: 'auditor', label: 'مدقق الصياغة' },
  { id: 'deadlines', label: 'حاسبة المواعيد' },
];

/**
 * Lawyer-training module. Arabic and RTL by design: the matters, the
 * pleadings and the procedure it teaches are Kuwaiti, so the module sets
 * its own `lang`/`dir` rather than following the site locale.
 */
export function TrainingApp() {
  return (
    <TrainingProvider>
      <div lang="ar" dir="rtl" className="font-arabic">
        <Shell />
      </div>
    </TrainingProvider>
  );
}

function Shell() {
  const { dispatch, open } = useTraining();
  const [tab, setTab] = useState<Tab>('office');
  const [caseId, setCaseId] = useState<string | null>(null);
  const openScenario = (scenarioId: string) => setCaseId(open(scenarioId));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-10">
      <header className="mb-6">
        <p className="eyebrow">منصة تدريب المحامين</p>
        <h1 className="mt-2 font-arabic text-3xl font-bold text-ink-100 sm:text-4xl">المحكمة الذكية — بيئة التدريب الإجرائي</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-300">
          قضايا افتراضية من واقع التقاضي الكويتي: تقيّد الدعوى، وتصوغ الصحيفة أو المذكرة مع تدقيق فوري، وتدير المهل على ساعة تدريبية، ثم تتلقى تقريراً بأخطائك الإجرائية وكيف تتلافاها.
        </p>
      </header>

      <div className="mb-5"><VirtualClock /></div>

      {caseId ? (
        <CaseWorkspace caseId={caseId} onBack={() => { setCaseId(null); setTab('office'); }} />
      ) : (
        <>
          <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-ink-500/15" role="tablist" aria-label="أقسام التدريب">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-sm transition-colors ${tab === t.id ? 'border-gold-500 text-gold-400' : 'border-transparent text-ink-300 hover:text-ink-100'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <div role="tabpanel">
            {tab === 'office' && <OfficeDashboard onOpenCase={setCaseId} onBrowse={() => setTab('library')} />}
            {tab === 'library' && <ScenarioLibrary onOpen={openScenario} />}
            {tab === 'auditor' && <FreeAuditor />}
            {tab === 'deadlines' && <DeadlineCalculator />}
          </div>
        </>
      )}

      <footer className="mt-12 flex flex-wrap items-center gap-3 border-t border-ink-500/15 pt-5 text-[11px] leading-6 text-ink-500">
        <p className="min-w-0 flex-1">
          بيئة تدريبية: القضايا والأسماء افتراضية، والمدد والنصاب مراجع تعليمية يجب التحقق منها من النصوص النافذة. لا يُعدّ شيء هنا استشارة قانونية.
        </p>
        <button type="button" className={btnGhost} onClick={() => { if (window.confirm('حذف كل القضايا وإعادة الساعة إلى اليوم؟')) { dispatch({ type: 'reset' }); setCaseId(null); } }}>
          إعادة ضبط التدريب
        </button>
      </footer>
    </div>
  );
}

/** Audit any pleading without opening a case. */
function FreeAuditor() {
  const [kind, setKind] = useState<DocumentKind>('petition');
  const [text, setText] = useState('');
  return (
    <Panel eyebrow="مدقق الصياغة" title="دقّق صحيفة أو مذكرة من إعدادك" action={
      <div className="flex gap-2" role="group" aria-label="نوع المستند">
        {(['petition', 'defence_memo'] as DocumentKind[]).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
            className={`rounded-full border px-3 py-1.5 text-xs ${kind === k ? 'border-gold-500 bg-gold-500/15 text-gold-400' : 'border-ink-500/30 text-ink-300'}`}>
            {k === 'petition' ? 'صحيفة دعوى' : 'مذكرة دفاع'}
          </button>
        ))}
      </div>
    }>
      <BriefEditor id="free-auditor" kind={kind} value={text} onChange={setText} />
    </Panel>
  );
}
