import { beforeEach, describe, expect, it } from 'vitest';

import { getInitialSessionState } from './App';
import { questions } from './data/questions';
import { buildAssessmentSession, SESSION_IDS_STORAGE_KEY, SESSION_SEED_STORAGE_KEY, SESSION_TARGET_COUNT } from './engine/session';
import { en } from './i18n/en';

const createStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); }
  };
};

describe('getInitialSessionState', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: createStorage(), configurable: true });
  });

  it('uses the same seed for both sessionSeed and sessionQuestions initialization', () => {
    localStorage.setItem(SESSION_SEED_STORAGE_KEY, 'stable-seed');
    const stateA = getInitialSessionState();
    const stateB = getInitialSessionState();

    expect(stateA.seed).toBe('stable-seed');
    expect(stateA.questions.map((q) => q.id)).toEqual(stateB.questions.map((q) => q.id));
  });

  it('uses stored ids with same seed deterministically', () => {
    const seed = 'resume-seed';
    localStorage.setItem(SESSION_SEED_STORAGE_KEY, seed);
    const first = getInitialSessionState();
    localStorage.setItem(SESSION_IDS_STORAGE_KEY, JSON.stringify(first.questions.map((q) => q.id)));

    const resumed = getInitialSessionState();
    expect(resumed.seed).toBe(seed);
    expect(resumed.questions.map((q) => q.id)).toEqual(first.questions.map((q) => q.id));
  });

  it('keeps start-screen session count text dynamic with the active session length', () => {
    const initial = getInitialSessionState();
    expect(initial.questions.length).toBe(SESSION_TARGET_COUNT);
    expect(en.sessionCountNotice).toContain('{count}');
    expect(en.sessionCountNotice).not.toContain(`75 ${'questions'}`);
    expect(en.sessionCountNotice.replace('{count}', String(initial.questions.length))).toContain(`${initial.questions.length} questions`);
  });

  it('builds questions using the returned seed when no stored seed exists', () => {
    const initial = getInitialSessionState();
    const expected = buildAssessmentSession(questions, { sessionSeed: initial.seed });
    expect(initial.questions.map((q) => q.id)).toEqual(expected.map((q) => q.id));
  });
});
