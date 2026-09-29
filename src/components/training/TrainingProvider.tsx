'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { advanceCase, decideAppeal, fileCase, openCase, submitMemo } from '@/lib/training/case-engine';
import { addDays, todayISO } from '@/lib/training/deadlines';
import { getScenario } from '@/lib/training/scenarios';
import type { CaseRecord, FilingDecision, ISODate } from '@/lib/training/types';
import { userScopedKey } from '@/lib/session';

/**
 * Training state: one virtual clock and the trainee's open cases.
 *
 * The clock is the point of the module. Deadlines only teach when the trainee
 * can feel them approach, so "now" is a value the trainee advances, and every
 * change of "now" runs each case through `advanceCase` — hearings arrive,
 * memo windows close, judgments issue.
 *
 * Persisted under the user-scoped prefix, so signing out wipes it along with
 * every other per-user cache (see lib/session.ts).
 */

interface TrainingState {
  now: ISODate;
  cases: CaseRecord[];
}

type Action =
  | { type: 'hydrate'; state: TrainingState }
  | { type: 'advance'; days: number }
  | { type: 'set-now'; now: ISODate }
  | { type: 'add'; record: CaseRecord }
  | { type: 'file'; caseId: string; decision: FilingDecision }
  | { type: 'text'; caseId: string; field: 'petitionText' | 'memoText'; value: string }
  | { type: 'memo'; caseId: string; answer: string }
  | { type: 'appeal'; caseId: string; kind: 'appeal' | 'accept' }
  | { type: 'remove'; caseId: string }
  | { type: 'reset' };

const STORAGE_KEY = userScopedKey('training.v1');

function tick(state: TrainingState): TrainingState {
  return {
    ...state,
    cases: state.cases.map((c) => {
      const s = getScenario(c.scenarioId);
      return s ? advanceCase(c, s, state.now) : c;
    }),
  };
}

function update(state: TrainingState, caseId: string, fn: (c: CaseRecord) => CaseRecord): TrainingState {
  return tick({ ...state, cases: state.cases.map((c) => (c.id === caseId ? fn(c) : c)) });
}

function reducer(state: TrainingState, action: Action): TrainingState {
  switch (action.type) {
    case 'hydrate':
      return tick(action.state);
    case 'advance':
      return tick({ ...state, now: addDays(state.now, action.days) });
    case 'set-now':
      // The clock never runs backwards: that would reopen deadlines already missed.
      return action.now > state.now ? tick({ ...state, now: action.now }) : state;
    case 'add':
      return tick({ ...state, cases: [action.record, ...state.cases] });
    case 'file':
      return update(state, action.caseId, (c) => {
        const s = getScenario(c.scenarioId);
        return s ? fileCase(c, s, action.decision) : c;
      });
    case 'text':
      return { ...state, cases: state.cases.map((c) => (c.id === action.caseId ? { ...c, [action.field]: action.value } : c)) };
    case 'memo':
      return update(state, action.caseId, (c) => submitMemo(c, state.now, action.answer));
    case 'appeal':
      return update(state, action.caseId, (c) => {
        const s = getScenario(c.scenarioId);
        return s ? decideAppeal(c, s, action.kind, state.now) : c;
      });
    case 'remove':
      return { ...state, cases: state.cases.filter((c) => c.id !== action.caseId) };
    case 'reset':
      return { now: todayISO(), cases: [] };
    default:
      return state;
  }
}

interface TrainingValue extends TrainingState {
  dispatch: (a: Action) => void;
  getCase: (id: string) => CaseRecord | undefined;
  /** Opens a new case on the current virtual date and returns its id. */
  open: (scenarioId: string) => string | null;
}

const TrainingContext = createContext<TrainingValue | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ now: todayISO(), cases: [] }));
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TrainingState;
        if (parsed && typeof parsed.now === 'string' && Array.isArray(parsed.cases)) dispatch({ type: 'hydrate', state: parsed });
      }
    } catch {
      // Private window or corrupt entry: start fresh rather than fail.
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked; the session still works, it just won't persist.
    }
  }, [state]);

  const value = useMemo<TrainingValue>(
    () => ({
      ...state,
      dispatch,
      getCase: (id) => state.cases.find((c) => c.id === id),
      open: (scenarioId) => {
        const s = getScenario(scenarioId);
        if (!s) return null;
        const record = openCase(s, state.now);
        dispatch({ type: 'add', record });
        return record.id;
      },
    }),
    [state],
  );
  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining(): TrainingValue {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used inside <TrainingProvider>');
  return ctx;
}
