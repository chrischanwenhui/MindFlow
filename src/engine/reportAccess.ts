import type { Question } from '../data/questions';
import type { Answer } from './scoring';

/**
 * Only answers that match a question's current option value AND score count.
 * A duplicate response for the same question is not treated as completion.
 */
export function getNextUnansweredQuestionIndex(questions: Question[], answers: Answer[]): number | null {
  if (questions.length === 0) return 0;
  if (new Set(questions.map((question) => question.id)).size !== questions.length) return 0;

  const byQuestion = new Map<string, Answer[]>();
  for (const answer of answers) {
    const matches = byQuestion.get(answer.questionId) ?? [];
    matches.push(answer);
    byQuestion.set(answer.questionId, matches);
  }

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const responses = byQuestion.get(question.id) ?? [];
    if (
      responses.length !== 1
      || !Number.isFinite(responses[0].score)
      || !question.options.some((option) => option.value === responses[0].value && option.score === responses[0].score)
    ) {
      return index;
    }
  }

  return null;
}

export function canViewPersonalReport(questions: Question[], answers: Answer[]): boolean {
  return questions.length > 0 && getNextUnansweredQuestionIndex(questions, answers) === null;
}
