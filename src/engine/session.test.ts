import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { buildAssessmentSession } from './session';

describe('buildAssessmentSession', () => {
  it('builds >=75 with no duplicates and cognitive last', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'seed-a' });
    expect(session.length).toBeGreaterThanOrEqual(101);
    expect(new Set(session.map((q) => q.id)).size).toBe(session.length);
    const firstCognitive = session.findIndex((q) => q.section === 'cognitive');
    expect(firstCognitive).toBeGreaterThan(0);
    expect(session.slice(firstCognitive).every((q) => q.section === 'cognitive')).toBe(true);
    expect(session.filter((q) => q.section === 'cognitive').length).toBeGreaterThanOrEqual(20);
  });

  it('same seed gives same session order', () => {
    const a = buildAssessmentSession(questions, { sessionSeed: 'same-seed' }).map((q) => q.id).join(',');
    const b = buildAssessmentSession(questions, { sessionSeed: 'same-seed' }).map((q) => q.id).join(',');
    expect(a).toBe(b);
  });

  it('different seed gives different session order', () => {
    const a = buildAssessmentSession(questions, { sessionSeed: 'seed-1' }).map((q) => q.id).join(',');
    const b = buildAssessmentSession(questions, { sessionSeed: 'seed-2' }).map((q) => q.id).join(',');
    expect(a).not.toBe(b);
  });

  it('resumed session keeps same order', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'resume-seed' });
    const resumed = buildAssessmentSession(questions, { sessionSeed: 'resume-seed', sessionIds: session.map((q) => q.id) });
    expect(resumed.map((q) => q.id)).toEqual(session.map((q) => q.id));
  });

  it('keeps cognitive default-idk option last and preserves non-cognitive option order', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'options-seed' });
    for (const q of session.filter((item) => item.section === 'cognitive')) {
      expect(q.options[q.options.length - 1]?.value).toBe('default-idk');
      expect(q.options[q.options.length - 1]?.score).toBe(0);
    }

    const likertFromData = questions.find((q) => q.section === 'ocean');
    const likertFromSession = session.find((q) => q.id === likertFromData?.id);
    expect(likertFromSession?.options.map((o) => o.label)).toEqual(likertFromData?.options.map((o) => o.label));
  });

  it('label changes do not break default-idk placement', () => {
    const mutatedQuestions = questions.map((q) => {
      if (q.section !== 'cognitive') return q;
      return {
        ...q,
        options: q.options.map((o) => (o.value === 'default-idk' ? { ...o, label: 'Not sure' } : o))
      };
    });
    const session = buildAssessmentSession(mutatedQuestions, { sessionSeed: 'idk-value-seed' });
    for (const q of session.filter((item) => item.section === 'cognitive')) {
      expect(q.options[q.options.length - 1]?.value).toBe('default-idk');
      expect(q.options[q.options.length - 1]?.label).toBe('Not sure');
    }
  });

  it('preserves cognitive option score/value mapping after shuffle', () => {
    const baseCognitive = questions.find((q) => q.section === 'cognitive');
    const session = buildAssessmentSession(questions, { sessionSeed: 'score-seed' });
    const shuffled = session.find((q) => q.id === baseCognitive?.id);
    expect(shuffled).toBeTruthy();
    expect(new Set(shuffled?.options.map((o) => `${o.label}|${o.value}|${o.score}`))).toEqual(
      new Set(baseCognitive?.options.map((o) => `${o.label}|${o.value}|${o.score}`))
    );
  });

  it('contains no duplicate cognitive question IDs', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'dedupe-seed' });
    const cognitiveIds = session.filter((q) => q.section === 'cognitive').map((q) => q.id);
    expect(new Set(cognitiveIds).size).toBe(cognitiveIds.length);
  });

  it('samples 32-40 MBTI questions with all dichotomies represented and no duplicate MBTI IDs', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'mbti-coverage-seed' });
    const mbti = session.filter((q) => q.section === 'mbti');
    expect(mbti.length).toBeGreaterThanOrEqual(32);
    expect(mbti.length).toBeLessThanOrEqual(40);
    expect(new Set(mbti.map((q) => q.id)).size).toBe(mbti.length);
    expect(new Set(mbti.map((q) => q.scoringDomain))).toEqual(new Set(['ei', 'sn', 'tf', 'jp']));
  });
});
