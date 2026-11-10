import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { buildAssessmentSession, getReplacementMemoryQuestion, SESSION_TARGET_COUNT } from './session';
import {
  CURRENT_SESSION_VERSION,
  buildConservativeRecovery,
  getSessionIntegrityIssues,
  inspectAnswers,
  inspectStoredAssessment,
  isValidSession,
  type AssessmentSnapshot
} from './sessionIntegrity';
import type { Answer } from './scoring';

const seed = 'recoverable-seed-v1';
const baseline = buildAssessmentSession(questions, { sessionSeed: seed });
const answers: Answer[] = baseline.slice(0, 68).map((q) => ({
  questionId: q.id, value: q.options[0].value, score: q.options[0].score
}));
const snapshot = (ids: string[] | null, savedAnswers: Answer[] | null = answers, versionRaw: string | null = null): AssessmentSnapshot => ({
  idsRaw: ids === null ? null : JSON.stringify(ids),
  seedRaw: seed,
  answersRaw: savedAnswers === null ? null : JSON.stringify(savedAnswers),
  versionRaw
});

describe('assessment session structural integrity and conservative recovery', () => {
  it('accepts the current full contract with 101 unique, ordered known questions', () => {
    expect(baseline).toHaveLength(SESSION_TARGET_COUNT);
    expect(getSessionIntegrityIssues(baseline)).toEqual([]);
    expect(isValidSession(baseline)).toBe(true);
    const duplicate = [...baseline];
    duplicate[5] = duplicate[4];
    expect(getSessionIntegrityIssues(duplicate)).toContain('duplicate-question-ids');
    expect(isValidSession(baseline.slice(0, 1))).toBe(false);
  });

  it('hydrates a valid legacy session without requiring a new version marker or modifying it', () => {
    const state = inspectStoredAssessment(snapshot(baseline.map((q) => q.id)));
    expect(state.recovery).toBeNull();
    expect(state.seed).toBe(seed);
    expect(state.questions.map((q) => q.id)).toEqual(baseline.map((q) => q.id));
    expect(state.answers).toEqual(answers);
    expect(state.snapshot.idsRaw).toBe(JSON.stringify(baseline.map((q) => q.id)));
  });

  it('offers explicit recovery only when a truncated tail contains no memory questions', () => {
    const candidateSeeds = [seed, 'safe-prefix-seed-a', 'safe-prefix-seed-b', 'safe-prefix-seed-c'];
    const suitable = candidateSeeds.map((item) => ({
      seed: item,
      session: buildAssessmentSession(questions, { sessionSeed: item })
    })).find((item) => item.session[SESSION_TARGET_COUNT - 1].cognitiveDomain !== 'memory');
    if (!suitable) throw Error('Expected a deterministic non-memory final question');
    const originalAnswers = suitable.session.slice(0, 68).map((q) => ({
      questionId: q.id, value: q.options[0].value, score: q.options[0].score
    }));
    const original: AssessmentSnapshot = {
      seedRaw: suitable.seed,
      idsRaw: JSON.stringify(suitable.session.slice(0, -1).map((q) => q.id)),
      answersRaw: JSON.stringify(originalAnswers),
      versionRaw: null
    };
    const state = inspectStoredAssessment(original);
    expect(state.recovery).not.toBeNull();
    expect(state.recovery?.candidate?.questions.map((q) => q.id)).toEqual(suitable.session.map((q) => q.id));
    expect(state.recovery?.candidate?.answers).toEqual(originalAnswers);
    expect(original.idsRaw).toBe(JSON.stringify(suitable.session.slice(0, -1).map((q) => q.id)));
  });

  it('can repair a single duplicated ID without replacing unaffected questions', () => {
    const ids = baseline.map((q) => q.id);
    ids[5] = ids[4];
    const recovered = buildConservativeRecovery(ids, seed, answers);
    expect(recovered?.questions.map((q) => q.id)).toEqual(baseline.map((q) => q.id));
    expect(recovered?.answers).toEqual(answers);
  });

  it('allows a legitimate memory replacement in a verified session', () => {
    const index = baseline.findIndex((q) => q.cognitiveDomain === 'memory');
    expect(index).toBeGreaterThan(0);
    const current = baseline[index];
    const replacement = getReplacementMemoryQuestion(questions, baseline, new Set([current.id]), current.id, seed);
    if (!replacement) throw Error('A replacement memory question is required for this test');
    const altered = [...baseline];
    altered[index] = replacement;
    expect(isValidSession(altered, seed)).toBe(true);
    const ids = altered.map((q) => q.id);
    ids[5] = ids[4];
    const recovered = buildConservativeRecovery(ids, seed, answers);
    expect(recovered?.questions[index].id).toBe(replacement.id);
    expect(recovered?.questions[index].options).toEqual(replacement.options);
  });

  it('rejects a 101-item same-section reshuffle that does not match the saved seed', () => {
    const swapped = [...baseline];
    [swapped[6], swapped[7]] = [swapped[7], swapped[6]];
    expect(isValidSession(swapped)).toBe(true); // Structural length/sections alone are insufficient.
    expect(isValidSession(swapped, seed)).toBe(false);
    expect(getSessionIntegrityIssues(swapped, seed)).toContain('unverifiable-session-order');
    const persisted = inspectStoredAssessment(snapshot(swapped.map((q) => q.id)));
    expect(persisted.recovery?.reasons).toContain('invalid-stored-session');
    expect(persisted.recovery?.candidate).toBeNull();
  });

  it('does not guess where an unexpected known ID belongs', () => {
    const ids = baseline.map((q) => q.id);
    [ids[5], ids[6]] = [ids[6], ids[5]];
    expect(buildConservativeRecovery(ids, seed, answers)).toBeNull();
  });

  it('refuses speculative memory replay for truncated tails even with no cognitive answers', () => {
    const cutoff = baseline.findIndex((q, i) => i > 80 && q.cognitiveDomain === 'memory');
    expect(cutoff).toBeGreaterThan(80);
    expect(buildConservativeRecovery(baseline.slice(0, cutoff).map((q) => q.id), seed, answers)).toBeNull();
  });

  it('refuses automatic repair of damaged memory slots', () => {
    const memoryIndex = baseline.findIndex((q) => q.cognitiveDomain === 'memory');
    expect(memoryIndex).toBeGreaterThanOrEqual(81);
    const ids = baseline.map((q) => q.id);
    ids[memoryIndex] = ids[memoryIndex - 1];
    expect(buildConservativeRecovery(ids, seed, answers)).toBeNull();
  });

  it('does not overwrite unknown-version, malformed JSON, or missing-seed data', () => {
    const raw = snapshot(baseline.map((q) => q.id), answers, 'unsupported-v2');
    const versionResult = inspectStoredAssessment(raw);
    expect(versionResult.recovery?.candidate).toBeNull();
    const corrupted = inspectStoredAssessment({ ...raw, versionRaw: CURRENT_SESSION_VERSION, idsRaw: '{not json' });
    expect(corrupted.recovery?.candidate).toBeNull();
    expect(corrupted.snapshot.idsRaw).toBe('{not json');
    const noSeed = inspectStoredAssessment({ ...raw, versionRaw: null, seedRaw: null });
    expect(noSeed.recovery?.candidate).toBeNull();
  });

  it('never treats an explicitly empty saved ID list as a valid fresh session', () => {
    const allAnswers: Answer[] = baseline.map((q) => ({
      questionId: q.id, value: q.options[0].value, score: q.options[0].score
    }));
    const result = inspectStoredAssessment(snapshot([], allAnswers));
    expect(result.recovery?.reasons).toContain('invalid-stored-session');
    expect(result.recovery?.candidate).toBeNull();
    expect(result.snapshot.idsRaw).toBe('[]');
  });

  it('requires a nonblank saved seed when restoring existing IDs', () => {
    const raw = snapshot(baseline.map((q) => q.id));
    for (const missing of [null, '', '   ']) {
      const state = inspectStoredAssessment({ ...raw, seedRaw: missing });
      expect(state.recovery?.reasons).toContain('missing-session-seed');
      expect(state.recovery?.candidate).toBeNull();
    }
  });

  it('recognizes corrupted answers and preserves the original raw snapshot', () => {
    const raw = snapshot(baseline.map((q) => q.id), [...answers, answers[0]]);
    const result = inspectStoredAssessment(raw);
    expect(result.recovery?.candidate?.answers.length).toBe(answers.length - 1);
    expect(result.snapshot.answersRaw).toBe(raw.answersRaw);
    const invalidRaw = inspectStoredAssessment({ ...raw, answersRaw: '"bad JSON shape"' });
    expect(invalidRaw.recovery?.candidate).toBeNull();
    expect(invalidRaw.snapshot.answersRaw).toBe('"bad JSON shape"');
  });

  it('refuses automatic recovery that would replay an exposed memory prompt', () => {
    const memoryIndex = baseline.findIndex((q) => q.id === 'cog-memory-1');
    expect(memoryIndex).toBe(81); // Codex reproduction: recoverable-seed-v1
    const completeAnswers: Answer[] = baseline.map((q) => ({
      questionId: q.id, value: q.options[0].value, score: q.options[0].score
    }));
    const memoryAnswer = completeAnswers[memoryIndex];
    const invalidScenarios: Answer[][] = [
      [...completeAnswers, { ...memoryAnswer }],
      completeAnswers.map((answer, i) => i === memoryIndex ? { ...answer, score: 999 } : answer)
    ];

    for (const corruptedAnswers of invalidScenarios) {
      const hydrated = inspectStoredAssessment(snapshot(baseline.map((q) => q.id), corruptedAnswers));
      expect(hydrated.recovery?.reasons).toContain('invalid-or-duplicate-answers');
      expect(hydrated.recovery?.candidate).toBeNull();

      // The conservative reconstruction path must also refuse memory replay
      // when an unrelated non-memory slot is damaged.
      const damagedIds = baseline.map((q) => q.id);
      damagedIds[5] = damagedIds[4];
      expect(buildConservativeRecovery(damagedIds, seed, corruptedAnswers)).toBeNull();
    }
  });

  it('keeps further memory replacements valid after refreshing a replaced session', () => {
    const refreshSeed = 'repro-0';
    const original = buildAssessmentSession(questions, { sessionSeed: refreshSeed });
    expect(original[82].id).toBe('cog-memory-4');
    expect(original[86].id).toBe('cog-memory-11');
    const makeReplacement = (id: string) =>
      buildAssessmentSession(questions, { sessionSeed: refreshSeed, sessionIds: [id] })[0];
    const restoredIds = [...original];
    restoredIds[82] = makeReplacement('cog-memory-8');
    restoredIds[86] = makeReplacement('cog-memory-2');
    expect(isValidSession(restoredIds, refreshSeed)).toBe(true);

    // A browser refresh loses the transient usedMemoryQuestionIds set.
    const refreshed = buildAssessmentSession(questions, {
      sessionSeed: refreshSeed, sessionIds: restoredIds.map((q) => q.id)
    });
    expect(isValidSession(refreshed, refreshSeed)).toBe(true);
    const replacement = getReplacementMemoryQuestion(
      questions, refreshed, new Set<string>(), refreshed[86].id, refreshSeed
    );
    expect(replacement).not.toBeNull();
    const originalIds = new Set(original.map((q) => q.id));
    expect(originalIds.has(replacement!.id)).toBe(false);
    const afterBack = [...refreshed];
    afterBack[86] = replacement!;
    expect(isValidSession(afterBack, refreshSeed)).toBe(true);
  });

  it('canonicalizes only unique valid options, excluding foreign and conflicting answers', () => {
    const selected = inspectAnswers(baseline, [...answers, answers[0], {
      questionId: 'unrecognized', value: 'x', score: 12
    }]);
    expect(selected.clean).toBe(false);
    expect(selected.canonicalAnswers.length).toBe(answers.length - 1);
    expect(selected.canonicalAnswers.every((a) => a.questionId !== answers[0].questionId)).toBe(true);
  });
});
