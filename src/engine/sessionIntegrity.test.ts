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

  it('offers explicit, non-mutating recovery of a truncated unchanged prefix', () => {
    const original = snapshot(baseline.slice(0, 80).map((q) => q.id));
    const state = inspectStoredAssessment(original);
    expect(state.recovery).not.toBeNull();
    expect(state.recovery?.candidate?.questions.map((q) => q.id)).toEqual(baseline.map((q) => q.id));
    expect(state.recovery?.candidate?.answers).toEqual(answers);
    expect(original.idsRaw).toBe(JSON.stringify(baseline.slice(0, 80).map((q) => q.id)));
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

  it('refuses speculative memory replay when truncated cognitive tail may be exposed', () => {
    const cutoff = SESSION_TARGET_COUNT - 4;
    const exposed: Answer[] = [...answers, {
      questionId: baseline[82].id, value: baseline[82].options[0].value, score: baseline[82].options[0].score
    }];
    const missingTail = baseline.slice(cutoff);
    if (missingTail.some((q) => q.cognitiveDomain === 'memory')) {
      expect(buildConservativeRecovery(baseline.slice(0, cutoff).map((q) => q.id), seed, exposed)).toBeNull();
    }
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

  it('canonicalizes only unique valid options, excluding foreign and conflicting answers', () => {
    const selected = inspectAnswers(baseline, [...answers, answers[0], {
      questionId: 'unrecognized', value: 'x', score: 12
    }]);
    expect(selected.clean).toBe(false);
    expect(selected.canonicalAnswers.length).toBe(answers.length - 1);
    expect(selected.canonicalAnswers.every((a) => a.questionId !== answers[0].questionId)).toBe(true);
  });
});
