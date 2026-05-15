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
});
