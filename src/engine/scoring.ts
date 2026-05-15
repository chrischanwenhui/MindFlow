import type { CognitiveDomain, Question } from '../data/questions';

export type Answer = { questionId: string; value: string; score: number };

export type ProfileReport = {
  personalityTypeEstimate: string;
  bigFiveScores: Record<string, number>;
  bigFiveNormalizedScores: Record<string, number>;
  bigFiveSignalStrength: Record<string, 'Low signal' | 'Moderate signal' | 'Strong signal'>;
  riasecScores: Record<string, number>;
  motivationPattern: string;
  cognitiveStyleSummary: string;
  stressPattern: string;
  leadershipPattern: string;
  workstylePattern: string;
  strengths: string[];
  blindSpots: string[];
  suggestedGrowthAreas: string[];
};


const FALLBACK_PATTERNS = {
  motivation: 'Balanced Explorer',
  cognitive: 'pattern',
  stress: 'Balanced',
  leadership: 'Balanced',
  workstyle: 'Balanced'
} as const;

function getTopSignal(record: Record<string, number>, fallback: string): string {
  return Object.entries(record).sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function isLikertQuestion(question: Question): boolean {
  const scores = question.options.map((option) => option.score);
  return scores.length === 5 && [1, 2, 3, 4, 5].every((score) => scores.includes(score));
}

function getEffectiveScore(question: Question, answer: Answer): number {
  if (question.section === 'ocean' && question.scoringDirection === 'reverse' && isLikertQuestion(question)) {
    return 6 - answer.score;
  }
  return answer.score;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreAssessment(questions: Question[], answers: Answer[]): ProfileReport {
  const mbti: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const bigFive: Record<string, number> = { open: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
  const riasec: Record<string, number> = { Realistic: 0, Investigative: 0, Artistic: 0, Social: 0, Enterprising: 0, Conventional: 0 };
  const motivations: Record<string, number> = {};
  const stress: Record<string, number> = {};
  const leadership: Record<string, number> = {};
  const workstyle: Record<string, number> = {};
  const cognitive: Record<CognitiveDomain, number> = { pattern: 0, verbal: 0, numerical: 0, spatial: 0, memory: 0 };
  const bigFiveContributions: Record<string, { score: number; max: number; count: number }> = {
    open: { score: 0, max: 0, count: 0 },
    conscientiousness: { score: 0, max: 0, count: 0 },
    extraversion: { score: 0, max: 0, count: 0 },
    agreeableness: { score: 0, max: 0, count: 0 },
    neuroticism: { score: 0, max: 0, count: 0 }
  };
  for (const question of questions) {
    if (question.section !== 'ocean' || !question.scoringDomain || !bigFiveContributions[question.scoringDomain]) continue;
    const scores = question.options.map((option) => option.score);
    bigFiveContributions[question.scoringDomain].max += Math.max(...scores);
  }

  const qMap = new Map(questions.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = qMap.get(answer.questionId);
    if (!question) continue;

    const effectiveScore = getEffectiveScore(question, answer);
    if (question.section === 'mbti' && mbti[answer.value] !== undefined) mbti[answer.value] += effectiveScore;
    if (question.section === 'ocean' && bigFive[answer.value] !== undefined) {
      bigFive[answer.value] += effectiveScore;
      bigFiveContributions[answer.value].score += effectiveScore;
      bigFiveContributions[answer.value].count += 1;
    }
    if (question.section === 'riasec' && riasec[answer.value] !== undefined) riasec[answer.value] += effectiveScore;
    if (question.section === 'motivation') motivations[answer.value] = (motivations[answer.value] ?? 0) + answer.score;
    if (question.section === 'stress') stress[answer.value] = (stress[answer.value] ?? 0) + answer.score;
    if (question.section === 'leadership') leadership[answer.value] = (leadership[answer.value] ?? 0) + answer.score;
    if (question.section === 'workstyle') workstyle[answer.value] = (workstyle[answer.value] ?? 0) + answer.score;
    if (question.section === 'cognitive' && question.cognitiveDomain) {
      cognitive[question.cognitiveDomain] += answer.score;
    }
  }

  const personalityTypeEstimate = `${mbti.E >= mbti.I ? 'E' : 'I'}${mbti.S >= mbti.N ? 'S' : 'N'}${mbti.T >= mbti.F ? 'T' : 'F'}${mbti.J >= mbti.P ? 'J' : 'P'}`;
  const motivationPattern = getTopSignal(motivations, FALLBACK_PATTERNS.motivation);
  const topCognitive = getTopSignal(cognitive, FALLBACK_PATTERNS.cognitive);
  const stressPattern = getTopSignal(stress, FALLBACK_PATTERNS.stress);
  const leadershipPattern = getTopSignal(leadership, FALLBACK_PATTERNS.leadership);
  const workstylePattern = getTopSignal(workstyle, FALLBACK_PATTERNS.workstyle);
  const bigFiveNormalizedScores = Object.fromEntries(
    Object.entries(bigFiveContributions).map(([trait, values]) => {
      const normalized = values.max > 0 ? (values.score / values.max) * 100 : 0;
      return [trait, clampPercent(normalized)];
    })
  );
  const bigFiveSignalStrength = Object.fromEntries(
    Object.entries(bigFiveContributions).map(([trait, values]) => {
      const normalized = bigFiveNormalizedScores[trait] ?? 0;
      if (values.count <= 2 || normalized <= 50) return [trait, 'Low signal'];
      if (values.count <= 4) return [trait, 'Moderate signal'];
      return [trait, 'Strong signal'];
    })
  ) as ProfileReport['bigFiveSignalStrength'];

  return {
    personalityTypeEstimate,
    bigFiveScores: bigFive,
    bigFiveNormalizedScores,
    bigFiveSignalStrength,
    riasecScores: riasec,
    motivationPattern,
    cognitiveStyleSummary: `Your strongest cognitive-style reasoning signal appeared in ${topCognitive}. This is an estimated, non-diagnostic reflection for self-discovery.`,
    stressPattern,
    leadershipPattern,
    workstylePattern,
    strengths: ['Pattern recognition under structure', 'Reflective self-observation', 'Adaptable learning mindset'],
    blindSpots: ['May over-index on one problem style', 'Can rush ambiguous questions'],
    suggestedGrowthAreas: ['Practice slower reasoning in unfamiliar formats', 'Balance social and solo feedback loops', 'Review errors for strategy, not just accuracy']
  };
}
