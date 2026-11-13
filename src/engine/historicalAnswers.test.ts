import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { buildAssessmentSession } from './session';
import { inspectStoredAssessment, type AssessmentSnapshot } from './sessionIntegrity';
import { inspectAssessmentAccess } from './reportAccess';
import type { Answer } from './scoring';

// Fixtures represent the old bank's weights, not the expected corrected keys.
const oldAwardedLabels: Record<string, string> = {
  'cog-pattern-1': '27', 'cog-pattern-8': '50', 'cog-pattern-12': '24'
};
const historicalBank = questions.map((q) => oldAwardedLabels[q.id] ? {
  ...q, options: q.options.map((o) => ({ ...o, score: o.label === oldAwardedLabels[q.id] ? 2 : 0 }))
} : q);

function storedSession(sessionSeed: string): AssessmentSnapshot {
  const session = buildAssessmentSession(historicalBank, { sessionSeed });
  const answers: Answer[] = session.map((q) => {
    const option = q.options.find((o) => o.label === oldAwardedLabels[q.id]) ?? q.options[0];
    return { questionId: q.id, value: option.value, score: option.score };
  });
  return { seedRaw: sessionSeed, idsRaw: JSON.stringify(session.map((q) => q.id)),
    answersRaw: JSON.stringify(answers), versionRaw: '1' };
}

describe('historical saved-answer limits', () => {
  it.each(Object.keys(oldAwardedLabels))('preserves old %s records without guessing a selected label or regrading', (id) => {
    const sessionSeed = Array.from({ length: 100 }, (_, i) => `historical-${i}`).find((seed) =>
      buildAssessmentSession(questions, { sessionSeed: seed }).some((q) => q.id === id));
    expect(sessionSeed).toBeDefined();
    const snapshot = storedSession(sessionSeed!);
    const original = JSON.stringify(snapshot);
    const state = inspectStoredAssessment(snapshot);
    expect(state.recovery).toBeNull();
    expect(state.answers).toEqual(JSON.parse(snapshot.answersRaw!));
    expect(state.answers.find((a) => a.questionId === id)).toEqual({ questionId: id, value: 'pattern', score: 2 });
    expect(inspectAssessmentAccess(state.questions, state.answers, sessionSeed).status).toBe('complete');
    // The old and corrected awarded labels differ, yet their stored payloads
    // are indistinguishable. Hydration must not claim this is a regraded answer.
    const oldChoice = historicalBank.find((q) => q.id === id)!.options.find((o) => o.score === 2)!;
    const newChoice = questions.find((q) => q.id === id)!.options.find((o) => o.score === 2)!;
    expect(oldChoice.label).not.toBe(newChoice.label);
    expect({ value: oldChoice.value, score: oldChoice.score }).toEqual({ value: newChoice.value, score: newChoice.score });
    expect(JSON.stringify(snapshot)).toBe(original);
    expect(state.snapshot).toEqual(snapshot);
  });

  it('cannot identify which same-score cognitive distractor was selected', () => {
    const source = questions.find((q) => q.id === 'cog-numerical-1')!;
    const wrongChoices = source.options.filter((o) => o.value === 'numerical' && o.score === 0);
    expect(new Set(wrongChoices.map((o) => o.label)).size).toBeGreaterThan(1);
    const payloads = wrongChoices.map((o) => JSON.stringify({ questionId: source.id, value: o.value, score: o.score }));
    expect(new Set(payloads).size).toBe(1);
    // Neither the clicked position, displayed text, nor language is stored.
    expect(Object.keys(JSON.parse(payloads[0])).sort()).toEqual(['questionId', 'score', 'value']);
  });

  it('preserves pre-stable-value memory answers and refuses speculative replay recovery', () => {
    const snapshot = storedSession('recoverable-seed-v1');
    const savedAnswers: Answer[] = JSON.parse(snapshot.answersRaw!);
    const memoryAnswer = savedAnswers.find((a) => a.questionId === 'cog-memory-1')!;
    expect(memoryAnswer).toBeDefined();
    // Before commit 5eb8c59, memory choices all submitted the domain value.
    memoryAnswer.value = 'memory';
    snapshot.answersRaw = JSON.stringify(savedAnswers);
    const original = JSON.stringify(snapshot);
    const state = inspectStoredAssessment(snapshot);
    expect(state.recovery?.reasons).toContain('invalid-or-duplicate-answers');
    expect(state.recovery?.candidate).toBeNull();
    expect(state.answers).toEqual(savedAnswers);
    expect(JSON.stringify(snapshot)).toBe(original);
    expect(state.snapshot).toEqual(snapshot);
  });
});
