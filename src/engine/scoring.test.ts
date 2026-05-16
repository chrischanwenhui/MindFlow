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
    expect(profile.executiveSummary).toContain('Your response pattern suggests');
  });
  it('uses non-absolute wording in executive summary and avoids IQ phrasing', () => {
    const answers = questions.map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, answers);
    expect(profile.executiveSummary).not.toContain('You are definitely');
    expect(profile.executiveSummary).not.toContain('Your IQ');
    expect(profile.executiveSummary).not.toContain('diagnosed');
    expect(profile.cognitiveStyleSummary).not.toContain('IQ score');
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
    const reverseQuestion = questions.find((q) => q.id === 'ocean-cons-5');
    const positiveQuestion = questions.find((q) => q.id === 'ocean-cons-1');
    if (!reverseQuestion || !positiveQuestion) throw new Error('Expected OCEAN questions missing');

    const profileWithReverseHigh = scoreAssessment(questions, [{ questionId: reverseQuestion.id, value: 'conscientiousness', score: 5 }]);
    const profileWithPositiveHigh = scoreAssessment(questions, [{ questionId: positiveQuestion.id, value: 'conscientiousness', score: 5 }]);

    expect(profileWithReverseHigh.bigFiveScores.conscientiousness).toBe(1);
    expect(profileWithPositiveHigh.bigFiveScores.conscientiousness).toBe(5);
    expect(profileWithPositiveHigh.bigFiveNormalizedScores.conscientiousness).toBeLessThan(40);
    expect(profileWithPositiveHigh.bigFiveNormalizedScores.conscientiousness).toBeGreaterThan(0);
  });

  it('gives high normalized score when all answers in a trait are high after reverse adjustment', () => {
    const traitQuestions = questions.filter((q) => q.section === 'ocean' && q.scoringDomain === 'conscientiousness');
    const answers = traitQuestions.map((q) => ({
      questionId: q.id,
      value: 'conscientiousness',
      score: q.scoringDirection === 'reverse' ? 1 : 5
    }));
    const profile = scoreAssessment(questions, answers);
    expect(profile.bigFiveNormalizedScores.conscientiousness).toBeGreaterThanOrEqual(90);
    expect(profile.bigFiveNormalizedScores.conscientiousness).toBeLessThanOrEqual(100);
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
    expect(profile.cognitiveStyleSummary).toContain('light signal');
  });
  it('keeps confidence conservative for partial responses', () => {
    const partialAnswers = questions.slice(0, 20).map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, partialAnswers);
    expect(profile.confidenceNote).toContain('Confidence:');
    expect(profile.confidenceLevel).not.toBe('Stronger signal');
  });
  it('returns at least two combined insights when enough data exists', () => {
    const answers = questions.map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, answers);
    expect(profile.combinedInsights.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps memory scoring unchanged and isolated from ocean reverse logic', () => {
    const memoryQuestion = questions.find((q) => q.id === 'cog-memory-1');
    const oceanReverse = questions.find((q) => q.id === 'ocean-open-5');
    if (!memoryQuestion || !oceanReverse) throw new Error('Expected memory and ocean reverse questions');
    const correctMemoryOption = memoryQuestion.options.find((o) => o.score === 2);
    if (!correctMemoryOption) throw new Error('Expected correct memory option');
    const profile = scoreAssessment(questions, [
      { questionId: memoryQuestion.id, value: correctMemoryOption.value, score: correctMemoryOption.score },
      { questionId: oceanReverse.id, value: 'open', score: 5 }
    ]);
    expect(profile.cognitiveStyleSummary).toContain('memory');
    expect(profile.bigFiveScores.open).toBe(1);
  });


  describe('bigFiveSignalStrength', () => {
    const openTraitQuestions = questions.filter((q) => q.section === 'ocean' && q.scoringDomain === 'open');

    const createAnswers = (selectedQuestions = openTraitQuestions) =>
      selectedQuestions.map((q) => ({
        questionId: q.id,
        value: 'open',
        score: q.scoringDirection === 'reverse' ? 1 : 5
      }));

    it('keeps partial assessments conservative even with extreme normalized scores', () => {
      const answered = openTraitQuestions.slice(0, 2);
      const profile = scoreAssessment(questions, createAnswers(answered));
      expect(profile.bigFiveSignalStrength.open).toBe('Low signal');
    });

    it('reports moderate signal for near-complete but not complete Big Five evidence', () => {
      const answered = openTraitQuestions.slice(0, Math.max(1, openTraitQuestions.length - 1));
      const profile = scoreAssessment(questions, createAnswers(answered));
      expect(profile.bigFiveSignalStrength.open).toBe('Moderate signal');
    });

    it('reports strong signal only when completion and normalized score strength are both high', () => {
      const profile = scoreAssessment(questions, createAnswers());
      expect(profile.bigFiveSignalStrength.open).toBe('Strong signal');
    });
  });
});
