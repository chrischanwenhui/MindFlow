import { questions as allQuestions, type Question } from '../data/questions';
import type { Answer } from './scoring';
import { buildAssessmentSession, createSessionSeed, SESSION_TARGET_COUNT } from './session';

export const SESSION_VERSION_STORAGE_KEY = 'mindflow_session_version_v1';
export const CURRENT_SESSION_VERSION = '1';
export const RECOVERY_BACKUP_PREFIX = 'mindflow_recovery_backup_v1_';

export type AssessmentSnapshot = {
  answersRaw: string | null;
  idsRaw: string | null;
  seedRaw: string | null;
  versionRaw: string | null;
};

export type RepairedAssessment = { seed: string; questions: Question[]; answers: Answer[] };
export type RecoveryOffer = {
  reasons: string[];
  candidate: RepairedAssessment | null;
  preservedAnswerCount: number;
};
export type InitialAssessment = RepairedAssessment & {
  snapshot: AssessmentSnapshot;
  recovery: RecoveryOffer | null;
};

const GROUP_BOUNDARIES = [
  { end: 36, name: 'mbti' },
  { end: 54, name: 'ocean' },
  { end: 63, name: 'riasec' },
  { end: 81, name: 'operating' },
  { end: SESSION_TARGET_COUNT, name: 'cognitive' }
] as const;
const OPERATING_SECTIONS = new Set(['motivation', 'stress', 'leadership', 'workstyle']);
const questionMap = new Map(allQuestions.map((question) => [question.id, question]));

function groupOf(question: Question): string {
  return OPERATING_SECTIONS.has(question.section) ? 'operating' : question.section;
}

/** Structural validation, independent of the number of saved answers. */
export function getSessionIntegrityIssues(session: Question[], sessionSeed?: string): string[] {
  const issues: string[] = [];
  if (session.length !== SESSION_TARGET_COUNT) issues.push('incorrect-session-length');
  if (new Set(session.map((item) => item.id)).size !== session.length) issues.push('duplicate-question-ids');

  const expected = sessionSeed ? buildAssessmentSession(allQuestions, { sessionSeed }) : null;
  const originalIds = new Set(expected?.map((q) => q.id) ?? []);
  session.forEach((item, index) => {
    const canonical = questionMap.get(item.id);
    if (!canonical || canonical.section !== item.section) {
      if (!issues.includes('unknown-question-id')) issues.push('unknown-question-id');
    }
    const group = GROUP_BOUNDARIES.find((boundary) => index < boundary.end)?.name;
    if (!group || groupOf(item) !== group) {
      if (!issues.includes('invalid-question-order')) issues.push('invalid-question-order');
    }
    if (expected && expected[index]) {
      const original = expected[index];
      const permittedMemoryReplacement = original.cognitiveDomain === 'memory'
        && item.cognitiveDomain === 'memory'
        && !originalIds.has(item.id);
      if (item.id !== original.id && !permittedMemoryReplacement) {
        if (!issues.includes('unverifiable-session-order')) issues.push('unverifiable-session-order');
      }
    }
  });
  return issues;
}

export function isValidSession(session: Question[], seed?: string): boolean {
  return getSessionIntegrityIssues(session, seed).length === 0;
}

/** Do not pass raw, duplicated, foreign or mismatched answers into scoring. */
export function inspectAnswers(session: Question[], answers: Answer[]): {
  canonicalAnswers: Answer[];
  invalidQuestionIds: string[];
  clean: boolean;
  nextIndex: number | null;
} {
  const answersById = new Map<string, Answer[]>();
  const canonicalAnswers: Answer[] = [];
  const invalidQuestionIds: string[] = [];
  const sessionIds = new Set(session.map((q) => q.id));

  for (const answer of answers) {
    if (!answer || typeof answer.questionId !== 'string' || !sessionIds.has(answer.questionId)) {
      invalidQuestionIds.push(answer?.questionId ?? 'malformed');
      continue;
    }
    const matches = answersById.get(answer.questionId) ?? [];
    matches.push(answer);
    answersById.set(answer.questionId, matches);
  }

  let nextIndex: number | null = null;
  for (let index = 0; index < session.length; index += 1) {
    const question = session[index];
    const matches = answersById.get(question.id) ?? [];
    const good = matches.length === 1
      && typeof matches[0].value === 'string'
      && Number.isFinite(matches[0].score)
      && question.options.some((opt) => opt.value === matches[0].value && opt.score === matches[0].score);
    if (good) canonicalAnswers.push(matches[0]);
    else {
      if (matches.length) invalidQuestionIds.push(question.id);
      if (nextIndex === null) nextIndex = index;
    }
  }
  return {
    canonicalAnswers,
    invalidQuestionIds,
    clean: invalidQuestionIds.length === 0,
    nextIndex
  };
}

function parseStoredArray(raw: string | null): unknown[] | null {
  if (raw === null) return [];
  try {
    const candidate: unknown = JSON.parse(raw);
    return Array.isArray(candidate) ? candidate : null;
  } catch {
    return null;
  }
}
function parseAnswers(items: unknown[] | null): Answer[] | null {
  if (items === null) return null;
  if (!items.every((item) => item !== null && typeof item === 'object'
    && typeof (item as Answer).questionId === 'string'
    && typeof (item as Answer).value === 'string'
    && typeof (item as Answer).score === 'number')) return null;
  return items as Answer[];
}

/**
 * An answered memory item may already have exposed its recall prompt. Never
 * turn a duplicate, invalid, or displaced memory answer into an unanswered
 * question during automatic recovery: the old stimulus could be replayed.
 */
function hasUnsafeMemoryAnswerRecovery(session: Question[], answers: Answer[]): boolean {
  const activeQuestions = new Map(session.map((question) => [question.id, question]));
  const groups = new Map<string, Answer[]>();
  for (const answer of answers) {
    const original = questionMap.get(answer.questionId);
    if (original?.section !== 'cognitive' || original.cognitiveDomain !== 'memory') continue;
    const group = groups.get(answer.questionId) ?? [];
    group.push(answer);
    groups.set(answer.questionId, group);
  }
  for (const [questionId, group] of groups) {
    const active = activeQuestions.get(questionId);
    if (!active || group.length !== 1) return true;
    const answer = group[0];
    if (!Number.isFinite(answer.score)
      || !active.options.some((option) => option.value === answer.value && option.score === answer.score)) {
      return true;
    }
  }
  return false;
}

/**
 * Construct a recovery candidate only for positions that are provable from the
 * saved seed and the canonical session. Do not guess at reordered questions.
 */
export function buildConservativeRecovery(
  storedIds: string[] | null,
  seed: string | null,
  answers: Answer[] | null
): RepairedAssessment | null {
  if (!seed || !storedIds || !answers || storedIds.length === 0 || storedIds.length > SESSION_TARGET_COUNT) return null;
  const baseline = buildAssessmentSession(allQuestions, { sessionSeed: seed });
  const baselineIds = new Set(baseline.map((q) => q.id));
  const seen = new Set<string>();
  const candidate: Question[] = [...baseline];

  for (let index = 0; index < storedIds.length; index += 1) {
    const id = storedIds[index];
    const original = baseline[index];
    const current = questionMap.get(id);
    if (id === original.id) {
      if (seen.has(id)) return null;
      seen.add(id);
      continue;
    }
    const validMemoryReplacement =
      original.section === 'cognitive' && original.cognitiveDomain === 'memory'
      && current?.section === 'cognitive' && current.cognitiveDomain === 'memory'
      && !baselineIds.has(id) && !seen.has(id);
    if (validMemoryReplacement) {
      candidate[index] = buildAssessmentSession(allQuestions, { sessionSeed: seed, sessionIds: [id] })[0];
      seen.add(id);
      continue;
    }
    // Only a duplicate of a prior ID or an unknown ID is a provably corrupt slot.
    if ((seen.has(id) || !current) && !seen.has(original.id)) {
      // The damaged slot might have contained an already exposed memory item.
      // Without persisted exposure history, do not speculate about its contents.
      if (original.cognitiveDomain === 'memory') return null;
      seen.add(original.id);
      continue;
    }
    return null;
  }

  // A truncated cognitive tail could contain a previously exposed memory question.
  // Without persisted exposure history, do not replay it speculatively.
  const missingTail = baseline.slice(storedIds.length);
  if (missingTail.some((q) => q.cognitiveDomain === 'memory')) return null;
  if (!isValidSession(candidate, seed)) return null;

  const answerGroups = new Map<string, Answer[]>();
  for (const answer of answers) {
    const group = answerGroups.get(answer.questionId) ?? [];
    group.push(answer);
    answerGroups.set(answer.questionId, group);
  }
  const candidateAnswers: Answer[] = [];
  for (const q of candidate) {
    const group = answerGroups.get(q.id) ?? [];
    // Conflicting answers are deliberately left unresolved; no last-write-wins.
    if (group.length !== 1) continue;
    const answer = group[0];
    if (Number.isFinite(answer.score) && q.options.some((o) => o.value === answer.value && o.score === answer.score)) {
      candidateAnswers.push(answer);
    }
  }
  if (hasUnsafeMemoryAnswerRecovery(candidate, answers)) return null;
  return { seed, questions: candidate, answers: candidateAnswers };
}

/**
 * Read-only hydration: the caller must not persist any of these derived values
 * until the user explicitly accepts a recovery or starts a fresh assessment.
 */
export function inspectStoredAssessment(snapshot: AssessmentSnapshot): InitialAssessment {
  const savedSeed = snapshot.seedRaw?.trim() ? snapshot.seedRaw : null;
  const seed = savedSeed || createSessionSeed();
  const rawIds = parseStoredArray(snapshot.idsRaw);
  const storedIds = rawIds && rawIds.every((item): item is string => typeof item === 'string') ? rawIds : null;
  const rawAnswers = parseStoredArray(snapshot.answersRaw);
  const storedAnswers = parseAnswers(rawAnswers);
  const noSession = snapshot.idsRaw === null && snapshot.answersRaw === null;
  const unsupportedVersion = snapshot.versionRaw !== null && snapshot.versionRaw !== CURRENT_SESSION_VERSION;
  const restored = storedIds && storedIds.length
    ? buildAssessmentSession(allQuestions, { sessionSeed: seed, sessionIds: storedIds })
    : buildAssessmentSession(allQuestions, { sessionSeed: seed });
  const answerIssues = storedAnswers === null
    ? ['malformed-answer-storage']
    : inspectAnswers(restored, storedAnswers).invalidQuestionIds.length > 0
      ? ['invalid-or-duplicate-answers'] : [];
  const reasons = [
    ...(unsupportedVersion ? ['unsupported-session-version'] : []),
    ...((snapshot.idsRaw !== null && (!storedIds || storedIds.length !== SESSION_TARGET_COUNT || !isValidSession(restored, savedSeed ?? undefined))) ? ['invalid-stored-session'] : []),
    ...((snapshot.idsRaw === null && snapshot.answersRaw !== null) ? ['missing-session-ids'] : []),
    ...((snapshot.idsRaw !== null && !savedSeed) ? ['missing-session-seed'] : []),
    ...answerIssues
  ];

  const recovery = !noSession && reasons.length
    ? {
        reasons,
        candidate: unsupportedVersion ? null : storedIds && storedIds.length === SESSION_TARGET_COUNT && isValidSession(restored, savedSeed ?? undefined) && savedSeed && storedAnswers
          ? (hasUnsafeMemoryAnswerRecovery(restored, storedAnswers)
            ? null
            : { seed, questions: restored, answers: inspectAnswers(restored, storedAnswers).canonicalAnswers })
          : buildConservativeRecovery(storedIds ?? (snapshot.idsRaw === null ? [] : null), savedSeed, storedAnswers),
        preservedAnswerCount: storedAnswers?.length ?? 0
      }
    : null;
  return { seed, questions: restored, answers: storedAnswers ?? [], snapshot, recovery };
}
