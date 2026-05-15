import type { Question } from '../data/questions';

export type Answer = { questionId: string; value: string; score: number };

export type ProfileReport = {
  personalityTypeEstimate: string;
  bigFiveScores: Record<string, number>;
  riasecScores: Record<string, number>;
  motivationPattern: string;
  cognitiveStyleSummary: string;
  strengths: string[];
  blindSpots: string[];
  suggestedGrowthAreas: string[];
};

export function scoreAssessment(questions: Question[], answers: Answer[]): ProfileReport {
  const mbti: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const bigFive: Record<string, number> = { open: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
  const riasec: Record<string, number> = { Realistic: 0, Investigative: 0, Artistic: 0, Social: 0, Enterprising: 0, Conventional: 0 };
  const motivations: Record<string, number> = {};
  const cognitive: Record<string, number> = { pattern: 0, verbal: 0, numerical: 0, spatial: 0 };

  const qMap = new Map(questions.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = qMap.get(answer.questionId);
    if (!question) continue;

    if (question.section === 'mbti' && mbti[answer.value] !== undefined) mbti[answer.value] += answer.score;
    if (question.section === 'ocean' && bigFive[answer.value] !== undefined) bigFive[answer.value] += answer.score;
    if (question.section === 'riasec' && riasec[answer.value] !== undefined) riasec[answer.value] += answer.score;
    if (question.section === 'motivation') motivations[answer.value] = (motivations[answer.value] ?? 0) + answer.score;
    if (question.section === 'cognitive') {
      if (answer.value === 'numerical') cognitive.numerical += answer.score;
      if (answer.value === 'verbal') cognitive.verbal += answer.score;
      if (answer.value === 'spatial') cognitive.spatial += answer.score;
      cognitive.pattern += answer.score;
    }
  }

  const personalityTypeEstimate = `${mbti.E >= mbti.I ? 'E' : 'I'}${mbti.S >= mbti.N ? 'S' : 'N'}${mbti.T >= mbti.F ? 'T' : 'F'}${mbti.J >= mbti.P ? 'J' : 'P'}`;
  const motivationPattern = Object.entries(motivations).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Balanced Explorer';
  const topCognitive = Object.entries(cognitive).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'pattern';

  return {
    personalityTypeEstimate,
    bigFiveScores: bigFive,
    riasecScores: riasec,
    motivationPattern,
    cognitiveStyleSummary: `You showed your strongest performance in ${topCognitive} reasoning in this non-diagnostic self-discovery exercise.`,
    strengths: ['Pattern recognition under structure', 'Reflective self-observation', 'Adaptable learning mindset'],
    blindSpots: ['May over-index on one problem style', 'Can rush ambiguous questions'],
    suggestedGrowthAreas: ['Practice slower reasoning in unfamiliar formats', 'Balance social and solo feedback loops', 'Review errors for strategy, not just accuracy']
  };
}
