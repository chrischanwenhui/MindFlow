import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { buildAssessmentSession, SESSION_TARGET_COUNT } from './session';
import { canViewPersonalReport, getNextUnansweredQuestionIndex, inspectAssessmentAccess } from './reportAccess';
import { scoreAssessment, type Answer } from './scoring';

const session = buildAssessmentSession(questions, { sessionSeed: 'report-gate-audit' });
const complete: Answer[] = session.map((q) => ({
  questionId: q.id,
  value: q.options[0].value,
  score: q.options[0].score
}));

describe('personal report completion and canonical scoring gate', () => {
  it('accepts the complete current 101-question session', () => {
    expect(session.length).toBe(SESSION_TARGET_COUNT);
    expect(canViewPersonalReport(session, complete)).toBe(true);
    expect(inspectAssessmentAccess(session, complete).status).toBe('complete');
    expect(inspectAssessmentAccess(session, complete).canonicalAnswers).toEqual(complete);
    expect(getNextUnansweredQuestionIndex(session, complete)).toBeNull();
  });

  it('rejects a complete but seed-inconsistent session before scoring', () => {
    expect(canViewPersonalReport(session, complete, 'report-gate-audit')).toBe(true);
    expect(canViewPersonalReport(session, complete, 'different-seed')).toBe(false);
    expect(inspectAssessmentAccess(session, complete, 'different-seed').status).toBe('invalid-session');
  });

  it('rejects a truncated session even when every retained question is answered (F01)', () => {
    expect(canViewPersonalReport([session[0]], [complete[0]])).toBe(false);
    expect(canViewPersonalReport(session.slice(0, -1), complete.slice(0, -1))).toBe(false);
    expect(inspectAssessmentAccess([session[0]], [complete[0]]).status).toBe('invalid-session');
  });

  it('rejects duplicated session IDs without claiming completion (F03)', () => {
    const corrupted = [...session];
    corrupted[7] = corrupted[6];
    const access = inspectAssessmentAccess(corrupted, complete);
    expect(access.status).toBe('invalid-session');
    expect(access.nextIndex).toBeNull();
    expect(canViewPersonalReport(corrupted, complete)).toBe(false);
  });

  it('resumes at first missing answer rather than trusting answer count', () => {
    expect(getNextUnansweredQuestionIndex(session, complete.slice(1))).toBe(0);
    expect(getNextUnansweredQuestionIndex(session, complete.slice(0, -1))).toBe(session.length - 1);
    expect(inspectAssessmentAccess(session, []).status).toBe('incomplete');
  });

  it('rejects duplicate, foreign, mismatched and non-finite responses', () => {
    const invalid: Answer[][] = [
      [...complete, complete[0]],
      [...complete, { questionId: 'foreign-id', value: 'x', score: 2 }],
      [{ ...complete[0], value: 'malformed' }, ...complete.slice(1)],
      [{ ...complete[0], score: 999 }, ...complete.slice(1)],
      [{ ...complete[0], score: Number.NaN }, ...complete.slice(1)]
    ];
    for (const sample of invalid) {
      expect(inspectAssessmentAccess(session, sample).status).toBe('invalid-answers');
      expect(canViewPersonalReport(session, sample)).toBe(false);
    }
  });

  it('returns only valid canonical answers for scoring, never extra duplicates', () => {
    const tampered = [...complete, complete[0]];
    const access = inspectAssessmentAccess(session, tampered);
    expect(access.canonicalAnswers.length).toBe(SESSION_TARGET_COUNT - 1);
    expect(access.canonicalAnswers.some((answer) => answer.questionId === complete[0].questionId)).toBe(false);
    const observed = scoreAssessment(session, access.canonicalAnswers);
    const expected = scoreAssessment(session, complete.slice(1));
    expect(observed).toEqual(expected);
  });
});
