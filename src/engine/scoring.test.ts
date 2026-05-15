import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { scoreAssessment } from './scoring';

describe('scoreAssessment', () => {
  it('returns deterministic profile object', () => {
    const answers = questions.map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, answers);
    expect(profile.personalityTypeEstimate.length).toBe(4);
    expect(profile.strengths.length).toBeGreaterThan(0);
    expect(profile.cognitiveStyleSummary).toContain('non-diagnostic');
  });

  it('uses per-question cognitive domains for strongest domain', () => {
    const answers = questions
      .filter((q) => q.section === 'cognitive')
      .map((q) => ({ questionId: q.id, value: q.options[0].value, score: 0 }));

    const spatialQuestion = questions.find((q) => q.id === 'cog-spatial-1');
    if (!spatialQuestion) throw new Error('Expected cog-spatial-1 question to exist');

    answers.push({ questionId: spatialQuestion.id, value: 'spatial', score: 2 });

    const profile = scoreAssessment(questions, answers);
    expect(profile.cognitiveStyleSummary).toContain('spatial');
  });

  it('applies reverse scoring for OCEAN and prevents one-answer inflation', () => {
    const reverseQuestion = questions.find((q) => q.id === 'ocean-cons-3');
    const positiveQuestion = questions.find((q) => q.id === 'ocean-cons-1');
    if (!reverseQuestion || !positiveQuestion) throw new Error('Expected OCEAN questions missing');

    const profileWithReverseHigh = scoreAssessment(questions, [{ questionId: reverseQuestion.id, value: 'conscientiousness', score: 5 }]);
    const profileWithPositiveHigh = scoreAssessment(questions, [{ questionId: positiveQuestion.id, value: 'conscientiousness', score: 5 }]);

    expect(profileWithReverseHigh.bigFiveScores.conscientiousness).toBe(1);
    expect(profileWithPositiveHigh.bigFiveScores.conscientiousness).toBe(5);
    expect(profileWithPositiveHigh.bigFiveNormalizedScores.conscientiousness).toBeLessThan(100);
  });

  it('keeps normalized Big Five scores in bounds', () => {
    const oceanAnswers = questions
      .filter((q) => q.section === 'ocean')
      .map((q) => ({ questionId: q.id, value: q.options[4].value, score: q.options[4].score }));
    const profile = scoreAssessment(questions, oceanAnswers);
    for (const value of Object.values(profile.bigFiveNormalizedScores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("keeps cognitive 'I don't know' as zero and does not reverse cognitive", () => {
    const cognitiveQuestion = questions.find((q) => q.section === 'cognitive');
    if (!cognitiveQuestion) throw new Error('Expected cognitive question');
    const idk = cognitiveQuestion.options.find((o) => o.label === "I don't know");
    if (!idk) throw new Error("Expected I don't know option");

    const profile = scoreAssessment(questions, [{ questionId: cognitiveQuestion.id, value: idk.value, score: idk.score }]);
    expect(profile.cognitiveStyleSummary).toContain('pattern');
  });
});
