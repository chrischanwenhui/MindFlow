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
    const session = buildAssessmentSession(questions, { sessionSeed: 'score-seed' });
    const shuffled = session.find((q) => q.section === 'cognitive');
    expect(shuffled).toBeTruthy();
    const baseCognitive = questions.find((q) => q.id === shuffled?.id);
    expect(new Set(shuffled?.options.map((o) => `${o.label}|${o.value}|${o.score}`))).toEqual(
      new Set(baseCognitive?.options.map((o) => `${o.label}|${o.value}|${o.score}`))
    );
  });

  it('contains no duplicate cognitive question IDs', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'dedupe-seed' });
    const cognitiveIds = session.filter((q) => q.section === 'cognitive').map((q) => q.id);
    expect(new Set(cognitiveIds).size).toBe(cognitiveIds.length);
  });

  it('ramps cognitive difficulty and avoids long numerical streaks while keeping domain coverage', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'cognitive-ramp-seed' });
    const cognitive = session.filter((q) => q.section === 'cognitive');
    const firstHardIndex = cognitive.findIndex((q) => q.difficulty === 'hard');
    const firstMediumIndex = cognitive.findIndex((q) => q.difficulty === 'medium');
    expect(firstMediumIndex).toBeGreaterThanOrEqual(0);
    expect(firstHardIndex).toBeGreaterThan(firstMediumIndex);

    let consecutiveNumerical = 0;
    for (const q of cognitive) {
      if (q.cognitiveDomain === 'numerical') consecutiveNumerical += 1;
      else consecutiveNumerical = 0;
      expect(consecutiveNumerical).toBeLessThanOrEqual(2);
    }

    expect(new Set(cognitive.map((q) => q.cognitiveDomain))).toEqual(new Set(['pattern', 'verbal', 'numerical', 'spatial', 'memory']));
  });


  it('keeps deterministic memory sampling and immediate metadata stable for the same seed', () => {
    const a = buildAssessmentSession(questions, { sessionSeed: 'memory-stability-seed' })
      .filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory')
      .map((q) => ({
        id: q.id,
        memoryPhase: q.memoryPhase,
        revealSeconds: q.revealSeconds,
        options: q.options.map((o) => `${o.label}:${o.score}`)
      }));
    const b = buildAssessmentSession(questions, { sessionSeed: 'memory-stability-seed' })
      .filter((q) => q.section === 'cognitive' && q.cognitiveDomain === 'memory')
      .map((q) => ({
        id: q.id,
        memoryPhase: q.memoryPhase,
        revealSeconds: q.revealSeconds,
        options: q.options.map((o) => `${o.label}:${o.score}`)
      }));

    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(b);
    expect(a.every((q) => q.memoryPhase === 'immediate')).toBe(true);
  });

  it('samples 32-40 MBTI questions with all dichotomies represented and no duplicate MBTI IDs', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'mbti-coverage-seed' });
    const mbti = session.filter((q) => q.section === 'mbti');
    expect(mbti.length).toBeGreaterThanOrEqual(32);
    expect(mbti.length).toBeLessThanOrEqual(40);
    expect(new Set(mbti.map((q) => q.id)).size).toBe(mbti.length);
    expect(new Set(mbti.map((q) => q.scoringDomain))).toEqual(new Set(['ei', 'sn', 'tf', 'jp']));
  });

  it('same seed gives same MBTI option order for the same question', () => {
    const sessionA = buildAssessmentSession(questions, { sessionSeed: 'mbti-order-seed' });
    const sessionB = buildAssessmentSession(questions, { sessionSeed: 'mbti-order-seed' });
    const qA = sessionA.find((q) => q.section === 'mbti');
    const qB = sessionB.find((q) => q.id === qA?.id);
    expect(qA?.options.map((o) => o.value)).toEqual(qB?.options.map((o) => o.value));
  });

  it('different seeds can vary MBTI option order', () => {
    const sessionA = buildAssessmentSession(questions, { sessionSeed: 'mbti-order-seed-a' });
    const sessionB = buildAssessmentSession(questions, { sessionSeed: 'mbti-order-seed-b' });
    const mbtiA = sessionA.filter((q) => q.section === 'mbti');
    const varied = mbtiA.some((qA) => {
      const qB = sessionB.find((q) => q.id === qA.id);
      return qB && qA.options.map((o) => o.value).join('|') !== qB.options.map((o) => o.value).join('|');
    });
    expect(varied).toBe(true);
  });

  it('preserves MBTI option label/value/score set after reorder', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'mbti-set-seed' });
    const mbti = session.find((q) => q.section === 'mbti');
    if (!mbti) throw new Error('Expected MBTI question');
    const source = questions.find((q) => q.id === mbti.id);
    expect(new Set(mbti.options.map((o) => `${o.label}|${o.value}|${o.score}`))).toEqual(
      new Set(source?.options.map((o) => `${o.label}|${o.value}|${o.score}`))
    );
  });

  it('keeps MBTI scoring attached to option values after reorder', () => {
    const session = buildAssessmentSession(questions, { sessionSeed: 'mbti-score-seed' });
    const mbti = session.find((q) => q.section === 'mbti');
    if (!mbti) throw new Error('Expected MBTI question');
    const source = questions.find((q) => q.id === mbti.id);
    for (const option of mbti.options) {
      const sourceOption = source?.options.find((o) => o.value === option.value);
      expect(sourceOption?.score).toBe(option.score);
      expect(sourceOption?.label).toBe(option.label);
    }
  });
});
