import { describe, expect, it } from 'vitest';
import { scoreAssessment } from '../engine/scoring';
import { canViewPersonalReport } from '../engine/reportAccess';
import { SESSION_TARGET_COUNT } from '../engine/session';
import { fictionalSampleAnswers, fictionalSampleQuestions, fictionalSampleReport } from './sampleAssessment';

describe('fictional sample report', () => {
  it('is a complete synthetic assessment using a fixed 101-question session', () => {
    expect(fictionalSampleQuestions).toHaveLength(SESSION_TARGET_COUNT);
    expect(fictionalSampleAnswers).toHaveLength(SESSION_TARGET_COUNT);
    expect(canViewPersonalReport(fictionalSampleQuestions, fictionalSampleAnswers)).toBe(true);
    expect(new Set(fictionalSampleAnswers.map((answer) => answer.questionId)).size).toBe(SESSION_TARGET_COUNT);
  });

  it('has deterministic, non-empty, illustrative signals', () => {
    expect(scoreAssessment(fictionalSampleQuestions, fictionalSampleAnswers)).toEqual(fictionalSampleReport);
    expect(fictionalSampleReport.mbtiScoreState.estimatedType).toMatch(/^[EISNTFJP]{4}$/);
    expect(Object.values(fictionalSampleReport.bigFiveNormalizedScores).some((score) => score > 0)).toBe(true);
    expect(Object.values(fictionalSampleReport.riasecScores).some((score) => score > 0)).toBe(true);
    expect(fictionalSampleReport.confidenceLevel).not.toBe('Light signal');
  });

  it('does not require any browser storage or personal state to generate', () => {
    expect(fictionalSampleReport).toBeTruthy();
  });
});
