import { describe, expect, it } from 'vitest';
import { questions, type Question } from '../data/questions';
import { en } from '../i18n/en';
import { scoreAssessment, type Answer } from './scoring';


const mbtiTestQuestions: Question[] = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'].map((pole) => ({
  id: `mbti-${pole}`,
  section: 'mbti',
  prompt: `Choose ${pole}`,
  options: [{ label: pole, value: pole, score: 1 }],
  scoringDomain: pole,
  groupLabel: 'MBTI Preference'
}));

function mbtiAnswer(pole: string, score: number): Answer {
  return { questionId: `mbti-${pole}`, value: pole, score };
}

function renderMbtiBestFit(type: string, confidence: string): string {
  return en.mbtiBestFitTemplate
    .replace('{personalityTypeEstimate}', type)
    .replace('{confidenceLevel}', confidence);
}

describe('scoreAssessment', () => {
  it('returns deterministic profile object', () => {
    const answers = questions.map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, answers);
    expect(profile.personalityTypeEstimate.length).toBe(4);
    expect(profile.strengths.length).toBeGreaterThan(0);
    expect(profile.executiveSummaryParts.topCognitiveLabel.length).toBeGreaterThan(0);
    expect(profile.combinedInsightKeys.length).toBeGreaterThan(0);
  });
  it('uses non-absolute wording in executive summary and avoids IQ phrasing', () => {
    const answers = questions.map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, answers);
    expect(profile).not.toHaveProperty('executiveSummary');
    expect(profile).not.toHaveProperty('confidenceNote');
    expect(profile).not.toHaveProperty('combinedInsights');
    expect(profile).not.toHaveProperty('cognitiveStyleSummary');
  });

  it('uses per-question cognitive domains for strongest domain', () => {
    const answers = questions
      .filter((q) => q.section === 'cognitive')
      .map((q) => ({ questionId: q.id, value: q.options[0].value, score: 0 }));

    const spatialQuestion = questions.find((q) => q.id === 'cog-spatial-1');
    if (!spatialQuestion) throw new Error('Expected cog-spatial-1 question to exist');

    answers.push({ questionId: spatialQuestion.id, value: 'spatial', score: 2 });

    const profile = scoreAssessment(questions, answers);
    expect(profile.topCognitiveLabel).toContain('spatial');
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
    expect(profile.topCognitiveLabel).toContain('pattern');
    expect(profile.cognitiveSignalLevel).toBe('light');
  });
  it('keeps RIASEC scoring unchanged', () => {
    const riasecQuestion = questions.find((q) => q.section === 'riasec');
    if (!riasecQuestion) throw new Error('Expected RIASEC question');
    const option = riasecQuestion.options[1];
    const profile = scoreAssessment(questions, [{ questionId: riasecQuestion.id, value: option.value, score: option.score }]);
    expect(profile.riasecScores[option.value]).toBe(option.score);
  });

  it('keeps confidence conservative for partial responses', () => {
    const partialAnswers = questions.slice(0, 20).map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, partialAnswers);
    expect(profile.confidenceLevel).toMatch(/Light signal|Moderate signal/);
    expect(profile.confidenceLevel).not.toBe('Stronger signal');
  });
  it('returns at least two combined insights when enough data exists', () => {
    const answers = questions.map((q) => ({ questionId: q.id, value: q.options[0].value, score: q.options[0].score }));
    const profile = scoreAssessment(questions, answers);
    expect(profile.combinedInsightKeys.length).toBeGreaterThanOrEqual(2);
  });
  it('derives combined insights from stable answer values, not display label casing', () => {
    const consAnswers = questions
      .filter((q) => q.section === 'ocean' && q.scoringDomain === 'conscientiousness')
      .map((q) => ({
        questionId: q.id,
        value: 'conscientiousness',
        score: q.scoringDirection === 'reverse' ? 1 : 5
      }));
    const workstylePlanfirst = questions.find((q) => q.id === 'mslw-workstyle-1');
    if (!workstylePlanfirst) throw new Error('Expected workstyle question');

    const profile = scoreAssessment(questions, [
      ...consAnswers,
      { questionId: workstylePlanfirst.id, value: 'planfirst', score: 2 }
    ]);
    expect(profile.combinedInsightKeys).toContain('combinedInsightMilestones');
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
    expect(profile.topCognitiveLabel).toContain('memory');
    expect(profile.bigFiveScores.open).toBe(1);
  });



  describe('mbtiScoreState', () => {
    it('reports low signal for a narrow MBTI margin', () => {
      const profile = scoreAssessment(mbtiTestQuestions, [
        mbtiAnswer('E', 11), mbtiAnswer('I', 9),
        mbtiAnswer('S', 14), mbtiAnswer('N', 6),
        mbtiAnswer('T', 14), mbtiAnswer('F', 6),
        mbtiAnswer('J', 14), mbtiAnswer('P', 6)
      ]);

      const energy = profile.mbtiScoreState.dimensions.find((dimension) => dimension.dimension === 'E/I');
      expect(energy?.confidenceRatio).toBe(0.1);
      expect(energy?.signalStrength).toBe('low');
    });

    it('reports moderate signal for a medium MBTI margin', () => {
      const profile = scoreAssessment(mbtiTestQuestions, [mbtiAnswer('E', 13), mbtiAnswer('I', 7)]);
      const energy = profile.mbtiScoreState.dimensions.find((dimension) => dimension.dimension === 'E/I');
      expect(energy?.confidenceRatio).toBe(0.3);
      expect(energy?.signalStrength).toBe('moderate');
    });

    it('reports strong signal for a wide MBTI margin', () => {
      const profile = scoreAssessment(mbtiTestQuestions, [mbtiAnswer('E', 14), mbtiAnswer('I', 6)]);
      const energy = profile.mbtiScoreState.dimensions.find((dimension) => dimension.dimension === 'E/I');
      expect(energy?.confidenceRatio).toBe(0.4);
      expect(energy?.signalStrength).toBe('strong');
    });

    it('returns low signal instead of crashing when MBTI evidence total is zero', () => {
      const profile = scoreAssessment(mbtiTestQuestions, []);
      expect(profile.mbtiScoreState.dimensions).toHaveLength(4);
      expect(profile.mbtiScoreState.dimensions.every((dimension) => dimension.confidenceRatio === 0)).toBe(true);
      expect(profile.mbtiScoreState.dimensions.every((dimension) => dimension.signalStrength === 'low')).toBe(true);
      expect(profile.mbtiScoreState.overallConfidence).toBe('low');
    });

    it('uses the lowest dimensional signal for overall MBTI confidence', () => {
      const profile = scoreAssessment(mbtiTestQuestions, [
        mbtiAnswer('E', 14), mbtiAnswer('I', 6),
        mbtiAnswer('S', 13), mbtiAnswer('N', 7),
        mbtiAnswer('T', 11), mbtiAnswer('F', 9),
        mbtiAnswer('J', 16), mbtiAnswer('P', 4)
      ]);
      expect(profile.mbtiScoreState.dimensions.map((dimension) => dimension.signalStrength)).toEqual([
        'strong', 'moderate', 'low', 'strong'
      ]);
      expect(profile.mbtiScoreState.overallConfidence).toBe('low');
    });

    it('still generates a best-fit estimated type when one dimension has low signal', () => {
      const profile = scoreAssessment(mbtiTestQuestions, [
        mbtiAnswer('I', 11), mbtiAnswer('E', 9),
        mbtiAnswer('N', 14), mbtiAnswer('S', 6),
        mbtiAnswer('F', 14), mbtiAnswer('T', 6),
        mbtiAnswer('P', 14), mbtiAnswer('J', 6)
      ]);
      expect(profile.mbtiScoreState.estimatedType).toBe('INFP');
      expect(profile.personalityTypeEstimate).toBe('INFP');
    });

    it('uses safer report wording that avoids "You are" certainty', () => {
      const output = renderMbtiBestFit('INFP', en.mbtiModerateSignal.toLowerCase());
      expect(output).toContain('current response pattern leans INFP');
      expect(output).not.toMatch(/\bYou are\b/i);
      expect(output).not.toMatch(/definitely/i);
    });
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
