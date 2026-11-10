import { questions, type Question, type QuestionOption } from './questions';
import { scoreAssessment, type Answer } from '../engine/scoring';
import { buildAssessmentSession } from '../engine/session';

/**
 * A fixed, fictional example. Do not connect this fixture to localStorage,
 * live session state, real responses, or a random runtime session seed.
 */
export const FICTIONAL_SAMPLE_SEED = 'mindflow-fictional-example-v1';
export const fictionalSampleQuestions = buildAssessmentSession(questions, {
  sessionSeed: FICTIONAL_SAMPLE_SEED
});

function chooseFictionalOption(question: Question, index: number): QuestionOption {
  if (question.section === 'mbti') {
    const preference: Record<string, string> = { ei: 'I', sn: 'N', tf: 'T', jp: 'J' };
    return question.options.find((option) => option.value === preference[question.scoringDomain ?? ''])
      ?? question.options[0];
  }

  if (question.section === 'ocean') {
    const desired: Record<string, number> = {
      open: 5,
      conscientiousness: 4,
      extraversion: 3,
      agreeableness: 4,
      neuroticism: 2
    };
    const target = desired[question.scoringDomain ?? ''] ?? 3;
    const rawScore = question.scoringDirection === 'reverse' ? 6 - target : target;
    return question.options.find((option) => option.score === rawScore) ?? question.options[0];
  }

  if (question.section === 'riasec') {
    for (const value of ['Investigative', 'Social', 'Conventional', 'Artistic', 'Realistic', 'Enterprising']) {
      const match = question.options.find((option) => option.value === value);
      if (match) return match;
    }
  }

  if (question.section === 'cognitive') {
    // Mix successful and unsuccessful synthetic answers for an illustrative, non-perfect profile.
    const possibleAnswers = question.options.filter((option) => option.value !== 'default-idk');
    const preferredScore = index % 4 === 0 ? 0 : 2;
    return possibleAnswers.find((option) => option.score === preferredScore)
      ?? possibleAnswers[0]
      ?? question.options[0];
  }

  // Stable, structured preferences across fictional motivation/workstyle prompts.
  return question.options[0];
}

export const fictionalSampleAnswers: Answer[] = fictionalSampleQuestions.map((question, index) => {
  const option = chooseFictionalOption(question, index);
  return { questionId: question.id, value: option.value, score: option.score };
});

export const fictionalSampleReport = scoreAssessment(fictionalSampleQuestions, fictionalSampleAnswers);
