import type { Question } from '../data/questions';
import type { Answer } from './scoring';
import { getSessionIntegrityIssues, inspectAnswers } from './sessionIntegrity';

export type AssessmentAccess = {
  status: 'invalid-session' | 'invalid-answers' | 'incomplete' | 'complete';
  nextIndex: number | null;
  canonicalAnswers: Answer[];
  reasons: string[];
};

/**
 * Structural integrity and answer validity are one gate. The canonical
 * answers returned here MUST also be the only answers sent into scoring.
 */
export function inspectAssessmentAccess(questions: Question[], answers: Answer[], sessionSeed?: string): AssessmentAccess {
  const sessionIssues = getSessionIntegrityIssues(questions, sessionSeed);
  const inspected = inspectAnswers(questions, answers);
  if (sessionIssues.length) {
    return { status: 'invalid-session', nextIndex: null, canonicalAnswers: [], reasons: sessionIssues };
  }
  if (!inspected.clean) {
    return {
      status: 'invalid-answers',
      nextIndex: inspected.nextIndex,
      canonicalAnswers: inspected.canonicalAnswers,
      reasons: [...new Set(inspected.invalidQuestionIds)]
    };
  }
  return {
    status: inspected.nextIndex === null ? 'complete' : 'incomplete',
    nextIndex: inspected.nextIndex,
    canonicalAnswers: inspected.canonicalAnswers,
    reasons: []
  };
}

export function getNextUnansweredQuestionIndex(questions: Question[], answers: Answer[], sessionSeed?: string): number | null {
  const inspected = inspectAssessmentAccess(questions, answers, sessionSeed);
  // Do not signal "complete" for malformed sessions. Only the explicit
  // status === 'complete' value grants report access.
  return inspected.status === 'complete' ? null : inspected.nextIndex ?? 0;
}

export function canViewPersonalReport(questions: Question[], answers: Answer[], sessionSeed?: string): boolean {
  return inspectAssessmentAccess(questions, answers, sessionSeed).status === 'complete';
}
