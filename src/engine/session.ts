import type { Question, Section } from '../data/questions';

export const SESSION_IDS_STORAGE_KEY = 'mindflow_session_ids_v1';
export const SESSION_TARGET_COUNT = 75;

const SESSION_DISTRIBUTION: Record<'mbti'|'ocean'|'riasec'|'motivationGroup'|'cognitive', number> = {
  mbti: 10,
  ocean: 18,
  riasec: 9,
  motivationGroup: 18,
  cognitive: 20
};

const MOTIVATION_SECTIONS: Section[] = ['motivation', 'stress', 'leadership', 'workstyle'];

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function takeRandom<T>(items: T[], count: number, random = Math.random): T[] {
  return shuffle(items, random).slice(0, Math.min(count, items.length));
}

export function buildAssessmentSession(allQuestions: Question[], options?: { targetCount?: number; random?: () => number; sessionIds?: string[] }): Question[] {
  const random = options?.random ?? Math.random;
  const targetCount = Math.max(SESSION_TARGET_COUNT, options?.targetCount ?? SESSION_TARGET_COUNT);

  if (options?.sessionIds?.length) {
    const map = new Map(allQuestions.map((q) => [q.id, q]));
    return options.sessionIds.map((id) => map.get(id)).filter((q): q is Question => Boolean(q));
  }

  const mbti = takeRandom(allQuestions.filter((q) => q.section === 'mbti'), SESSION_DISTRIBUTION.mbti, random);
  const ocean = takeRandom(allQuestions.filter((q) => q.section === 'ocean'), SESSION_DISTRIBUTION.ocean, random);
  const riasec = takeRandom(allQuestions.filter((q) => q.section === 'riasec'), SESSION_DISTRIBUTION.riasec, random);
  const motivation = takeRandom(allQuestions.filter((q) => MOTIVATION_SECTIONS.includes(q.section)), SESSION_DISTRIBUTION.motivationGroup, random);
  const cognitive = takeRandom(allQuestions.filter((q) => q.section === 'cognitive'), SESSION_DISTRIBUTION.cognitive, random);

  let selected = [...shuffle(mbti, random), ...shuffle(ocean, random), ...shuffle(riasec, random), ...shuffle(motivation, random), ...shuffle(cognitive, random)];

  if (selected.length < targetCount) {
    const chosen = new Set(selected.map((q) => q.id));
    const fill = shuffle(allQuestions.filter((q) => !chosen.has(q.id)), random).slice(0, targetCount - selected.length);
    const nonCogFill = fill.filter((q) => q.section !== 'cognitive');
    const cogFill = fill.filter((q) => q.section === 'cognitive');
    selected = [...selected.slice(0, selected.length - cognitive.length), ...nonCogFill, ...selected.slice(selected.length - cognitive.length), ...cogFill];
  }

  return selected.slice(0, targetCount);
}

export function saveSessionIds(sessionQuestions: Question[]): void {
  localStorage.setItem(SESSION_IDS_STORAGE_KEY, JSON.stringify(sessionQuestions.map((q) => q.id)));
}

export function readStoredSessionIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_IDS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}
