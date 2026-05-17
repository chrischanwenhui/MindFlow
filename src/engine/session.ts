import type { Question, QuestionOption, Section } from '../data/questions';

export const SESSION_IDS_STORAGE_KEY = 'mindflow_session_ids_v1';
export const SESSION_SEED_STORAGE_KEY = 'mindflow_session_seed_v1';
export const SESSION_TARGET_COUNT = 101;

const SESSION_DISTRIBUTION: Record<'mbti'|'ocean'|'riasec'|'motivationGroup'|'cognitive', number> = {
  mbti: 36,
  ocean: 18,
  riasec: 9,
  motivationGroup: 18,
  cognitive: 20
};

const MOTIVATION_SECTIONS: Section[] = ['motivation', 'stress', 'leadership', 'workstyle'];

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandomFactory(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = seededRandomFactory(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function takeSeeded<T>(items: T[], count: number, seed: string): T[] {
  return seededShuffle(items, seed).slice(0, Math.min(count, items.length));
}


function reorderMbtiOptions(question: Question, sessionSeed: string): Question {
  if (question.section !== 'mbti') return question;
  return { ...question, options: seededShuffle(question.options, `${sessionSeed}:${question.id}:mbti-options`) };
}

function reorderCognitiveOptions(question: Question, sessionSeed: string): Question {
  if (question.section !== 'cognitive') return question;
  const idkOption = question.options.find((option) => option.value === 'default-idk');
  const nonIdkOptions = question.options.filter((option) => option.value !== 'default-idk');
  const shuffledOptions = seededShuffle(nonIdkOptions, `${sessionSeed}:${question.id}:options`);
  const nextOptions: QuestionOption[] = idkOption ? [...shuffledOptions, idkOption] : shuffledOptions;
  return { ...question, options: nextOptions };
}

export function createSessionSeed(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildAssessmentSession(allQuestions: Question[], options?: { targetCount?: number; sessionIds?: string[]; sessionSeed: string }): Question[] {
  const targetCount = Math.max(SESSION_TARGET_COUNT, options?.targetCount ?? SESSION_TARGET_COUNT);
  const sessionSeed = options?.sessionSeed ?? 'default-seed';

  if (options?.sessionIds?.length) {
    const map = new Map(allQuestions.map((q) => [q.id, q]));
    return options.sessionIds.map((id) => map.get(id)).filter((q): q is Question => Boolean(q)).map((q) => reorderCognitiveOptions(reorderMbtiOptions(q, sessionSeed), sessionSeed));
  }

  const mbti = takeSeeded(allQuestions.filter((q) => q.section === 'mbti'), SESSION_DISTRIBUTION.mbti, `${sessionSeed}:mbti`);
  const ocean = takeSeeded(allQuestions.filter((q) => q.section === 'ocean'), SESSION_DISTRIBUTION.ocean, `${sessionSeed}:ocean`);
  const riasec = takeSeeded(allQuestions.filter((q) => q.section === 'riasec'), SESSION_DISTRIBUTION.riasec, `${sessionSeed}:riasec`);
  const motivation = takeSeeded(allQuestions.filter((q) => MOTIVATION_SECTIONS.includes(q.section)), SESSION_DISTRIBUTION.motivationGroup, `${sessionSeed}:motivation`);
  const cognitive = takeSeeded(allQuestions.filter((q) => q.section === 'cognitive'), SESSION_DISTRIBUTION.cognitive, `${sessionSeed}:cognitive`);

  let selected = [
    ...seededShuffle(mbti, `${sessionSeed}:order:mbti`),
    ...seededShuffle(ocean, `${sessionSeed}:order:ocean`),
    ...seededShuffle(riasec, `${sessionSeed}:order:riasec`),
    ...seededShuffle(motivation, `${sessionSeed}:order:motivation`),
    ...seededShuffle(cognitive, `${sessionSeed}:order:cognitive`)
  ];

  if (selected.length < targetCount) {
    const chosen = new Set(selected.map((q) => q.id));
    const fill = seededShuffle(allQuestions.filter((q) => !chosen.has(q.id)), `${sessionSeed}:fill`).slice(0, targetCount - selected.length);
    const nonCogFill = fill.filter((q) => q.section !== 'cognitive');
    const cogFill = fill.filter((q) => q.section === 'cognitive');
    selected = [...selected.slice(0, selected.length - cognitive.length), ...nonCogFill, ...selected.slice(selected.length - cognitive.length), ...cogFill];
  }

  return selected.slice(0, targetCount).map((q) => reorderCognitiveOptions(reorderMbtiOptions(q, sessionSeed), sessionSeed));
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

export function saveSessionSeed(seed: string): void {
  localStorage.setItem(SESSION_SEED_STORAGE_KEY, seed);
}

export function readStoredSessionSeed(): string {
  return localStorage.getItem(SESSION_SEED_STORAGE_KEY) ?? '';
}

export function getReplacementMemoryQuestion(
  allQuestions: Question[],
  sessionQuestions: Question[],
  usedMemoryQuestionIds: Set<string>,
  currentMemoryQuestionId: string,
  sessionSeed: string
): Question | null {
  const memoryPool = allQuestions.filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory');
  const inSession = new Set(sessionQuestions.map((q) => q.id));
  const candidates = memoryPool
    .filter((q) => q.id !== currentMemoryQuestionId)
    .filter((q) => !inSession.has(q.id))
    .filter((q) => !usedMemoryQuestionIds.has(q.id));
  const selected = seededShuffle(candidates, `${sessionSeed}:memory-replacement:${currentMemoryQuestionId}`)[0] ?? null;
  return selected ? reorderCognitiveOptions(selected, sessionSeed) : null;
}
