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
});
