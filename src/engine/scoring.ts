import type { CognitiveDomain, Question, Section } from '../data/questions';

export type Answer = { questionId: string; value: string; score: number };

export type SignalStrength = 'low' | 'moderate' | 'strong';
export type MbtiDimension = 'E/I' | 'S/N' | 'T/F' | 'J/P';
type MbtiPole = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export interface DichotomyResult {
  dimension: MbtiDimension;
  dominantPole: MbtiPole;
  oppositePole: MbtiPole;
  scoreDominant: number;
  scoreOpposite: number;
  totalAnswers: number;
  margin: number;
  confidenceRatio: number;
  signalStrength: SignalStrength;
}

export interface MbtiScoreState {
  estimatedType: string;
  overallConfidence: SignalStrength;
  dimensions: DichotomyResult[];
}

export type ProfileReport = {
  executiveSummaryParts: {
    personalityTypeEstimate: string;
    topBigFive: string;
    topRiasec: string;
    topOperating: string;
    topCognitiveLabel: string;
  };
  confidenceLevel: 'Light signal' | 'Moderate signal' | 'Stronger signal';
  combinedInsightKeys: string[];
  cognitiveSignalLevel: 'light' | 'standard';
  topCognitiveLabel: string;
  personalityTypeEstimate: string;
  mbtiScoreState: MbtiScoreState;
  bigFiveScores: Record<string, number>;
  bigFiveNormalizedScores: Record<string, number>;
  bigFiveSignalStrength: Record<string, 'Low signal' | 'Moderate signal' | 'Strong signal'>;
  riasecScores: Record<string, number>;
  motivationPattern: string;
  stressPattern: string;
  leadershipPattern: string;
  workstylePattern: string;
  strengths: string[];
  blindSpots: string[];
  suggestedGrowthAreas: string[];
};


const STRONG_SIGNAL_DISTANCE_THRESHOLD = 25;
const MODERATE_SIGNAL_DISTANCE_THRESHOLD = 12;
const MIN_COMPLETION_FOR_ANY_SIGNAL = 0.5;
const MIN_COMPLETION_FOR_STRONG_SIGNAL = 1;


const hasOwn = <T extends object>(object: T, key: PropertyKey): key is keyof T =>
  Object.prototype.hasOwnProperty.call(object, key);

const COGNITIVE_DOMAIN_LABELS: Record<CognitiveDomain, string> = {
  pattern: 'pattern reasoning',
  verbal: 'verbal reasoning',
  numerical: 'numerical reasoning',
  spatial: 'spatial reasoning',
  memory: 'working memory'
};

const FALLBACK_PATTERNS = {
  motivation: 'Balanced Explorer',
  cognitive: 'pattern',
  stress: 'Balanced',
  leadership: 'Balanced',
  workstyle: 'Balanced'
} as const;

const MBTI_DIMENSIONS: { dimension: MbtiDimension; poles: [MbtiPole, MbtiPole] }[] = [
  { dimension: 'E/I', poles: ['E', 'I'] },
  { dimension: 'S/N', poles: ['S', 'N'] },
  { dimension: 'T/F', poles: ['T', 'F'] },
  { dimension: 'J/P', poles: ['J', 'P'] }
];
const SIGNAL_PRIORITY: Record<SignalStrength, number> = { low: 0, moderate: 1, strong: 2 };

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function getMbtiSignalStrength(confidenceRatio: number): SignalStrength {
  if (confidenceRatio >= 0.4) return 'strong';
  if (confidenceRatio >= 0.15) return 'moderate';
  return 'low';
}

function getLowestSignal(signals: SignalStrength[]): SignalStrength {
  return signals.reduce<SignalStrength>((lowest, signal) => (
    SIGNAL_PRIORITY[signal] < SIGNAL_PRIORITY[lowest] ? signal : lowest
  ), 'strong');
}

function buildMbtiScoreState(scores: Record<MbtiPole, number>): MbtiScoreState {
  const dimensions = MBTI_DIMENSIONS.map(({ dimension, poles }) => {
    const [poleA, poleB] = poles;
    const scoreA = scores[poleA];
    const scoreB = scores[poleB];
    const isADominant = scoreA >= scoreB;
    const dominantPole = isADominant ? poleA : poleB;
    const oppositePole = isADominant ? poleB : poleA;
    const scoreDominant = Math.max(scoreA, scoreB);
    const scoreOpposite = Math.min(scoreA, scoreB);
    const totalAnswers = scoreA + scoreB;
    const margin = Math.abs(scoreA - scoreB);
    // MBTI confidence uses margin ratio: C = abs(S_A - S_B) / (S_A + S_B).
    // If N = 0, C defaults to 0. C is rounded to two decimals before thresholding:
    // C >= 0.40 = strong, 0.15 <= C < 0.40 = moderate, C < 0.15 = low.
    const confidenceRatio = totalAnswers === 0 ? 0 : roundToTwoDecimals(margin / totalAnswers);

    return {
      dimension,
      dominantPole,
      oppositePole,
      scoreDominant,
      scoreOpposite,
      totalAnswers,
      margin,
      confidenceRatio,
      signalStrength: getMbtiSignalStrength(confidenceRatio)
    };
  });

  return {
    estimatedType: dimensions.map((dimension) => dimension.dominantPole).join(''),
    overallConfidence: getLowestSignal(dimensions.map((dimension) => dimension.signalStrength)),
    dimensions
  };
}

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

function getStrengthFromNormalizedDistance(normalized: number): 'Low signal' | 'Moderate signal' | 'Strong signal' {
  const distanceFromMidpoint = Math.abs(normalized - 50);
  if (distanceFromMidpoint >= STRONG_SIGNAL_DISTANCE_THRESHOLD) return 'Strong signal';
  if (distanceFromMidpoint >= MODERATE_SIGNAL_DISTANCE_THRESHOLD) return 'Moderate signal';
  return 'Low signal';
}

function getBigFiveSignalStrength(answeredCount: number, totalCount: number, normalized: number): 'Low signal' | 'Moderate signal' | 'Strong signal' {
  if (answeredCount === 0) return 'Low signal';

  const completionRatio = totalCount > 0 ? answeredCount / totalCount : 0;
  const scoreStrength = getStrengthFromNormalizedDistance(normalized);

  // Partial assessments should not appear overconfident.
  if (completionRatio < MIN_COMPLETION_FOR_ANY_SIGNAL) return 'Low signal';

  if (completionRatio < MIN_COMPLETION_FOR_STRONG_SIGNAL) {
    return scoreStrength === 'Strong signal' ? 'Moderate signal' : 'Low signal';
  }

  return scoreStrength;
}

function getConfidenceLevel(answered: number, total: number, consistencySignals: number): ProfileReport['confidenceLevel'] {
  const completionRatio = total > 0 ? answered / total : 0;
  if (completionRatio < 0.55) return 'Light signal';
  if (completionRatio < 0.85) return 'Moderate signal';
  if (consistencySignals < 3) return 'Moderate signal';
  return 'Stronger signal';
}

function getTopSectionValue(questions: Question[], answersById: Map<string, Answer>, section: Section): string {
  const counts: Record<string, number> = {};

  for (const question of questions) {
    if (question.section !== section) continue;
    const answer = answersById.get(question.id);
    if (!answer) continue;
    counts[answer.value] = (counts[answer.value] ?? 0) + answer.score;
  }

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'balanced';
}

export function scoreAssessment(questions: Question[], answers: Answer[]): ProfileReport {
  const mbti: Record<MbtiPole, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const bigFive: Record<string, number> = { open: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
  const riasec: Record<string, number> = { Realistic: 0, Investigative: 0, Artistic: 0, Social: 0, Enterprising: 0, Conventional: 0 };
  const motivations: Record<string, number> = {};
  const stress: Record<string, number> = {};
  const leadership: Record<string, number> = {};
  const workstyle: Record<string, number> = {};
  const cognitive: Record<CognitiveDomain, number> = { pattern: 0, verbal: 0, numerical: 0, spatial: 0, memory: 0 };
  const bigFiveContributions: Record<string, { score: number; max: number; count: number; total: number }> = {
    open: { score: 0, max: 0, count: 0, total: 0 },
    conscientiousness: { score: 0, max: 0, count: 0, total: 0 },
    extraversion: { score: 0, max: 0, count: 0, total: 0 },
    agreeableness: { score: 0, max: 0, count: 0, total: 0 },
    neuroticism: { score: 0, max: 0, count: 0, total: 0 }
  };
  for (const question of questions) {
    if (question.section !== 'ocean' || !question.scoringDomain || !bigFiveContributions[question.scoringDomain]) continue;
    const scores = question.options.map((option) => option.score);
    bigFiveContributions[question.scoringDomain].max += Math.max(...scores);
    bigFiveContributions[question.scoringDomain].total += 1;
  }

  const qMap = new Map(questions.map((q) => [q.id, q]));
  const answersById = new Map(answers.map((answer) => [answer.questionId, answer]));

  for (const answer of answers) {
    const question = qMap.get(answer.questionId);
    if (!question) continue;

    const effectiveScore = getEffectiveScore(question, answer);
    if (question.section === 'mbti' && hasOwn(mbti, answer.value)) {
      mbti[answer.value] += effectiveScore;
    }
    if (question.section === 'ocean' && hasOwn(bigFive, answer.value)) {
      bigFive[answer.value] += effectiveScore;
      bigFiveContributions[answer.value].score += effectiveScore;
      bigFiveContributions[answer.value].count += 1;
    }
    if (question.section === 'riasec' && hasOwn(riasec, answer.value)) {
      riasec[answer.value] += effectiveScore;
    }
    if (question.section === 'motivation') motivations[answer.value] = (motivations[answer.value] ?? 0) + answer.score;
    if (question.section === 'stress') stress[answer.value] = (stress[answer.value] ?? 0) + answer.score;
    if (question.section === 'leadership') leadership[answer.value] = (leadership[answer.value] ?? 0) + answer.score;
    if (question.section === 'workstyle') workstyle[answer.value] = (workstyle[answer.value] ?? 0) + answer.score;
    if (question.section === 'cognitive' && question.cognitiveDomain) {
      cognitive[question.cognitiveDomain] += answer.score;
    }
  }

  const mbtiScoreState = buildMbtiScoreState(mbti);
  const personalityTypeEstimate = mbtiScoreState.estimatedType;
  const motivationPattern = getTopSignal(motivations, FALLBACK_PATTERNS.motivation);
  const topCognitive = getTopSignal(cognitive, FALLBACK_PATTERNS.cognitive) as CognitiveDomain;
  const topCognitiveLabel = COGNITIVE_DOMAIN_LABELS[topCognitive] ?? COGNITIVE_DOMAIN_LABELS.pattern;
  const cognitiveAnsweredCount = answers.filter((answer) => qMap.get(answer.questionId)?.section === 'cognitive').length;
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
      return [trait, getBigFiveSignalStrength(values.count, values.total, normalized)];
    })
  ) as ProfileReport['bigFiveSignalStrength'];
  const answeredCount = answers.length;
  const totalCount = questions.length;
  const topBigFive = Object.entries(bigFiveNormalizedScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'open';
  const topRiasec = Object.entries(riasec).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Investigative';
  const topOperating = [motivationPattern, workstylePattern, leadershipPattern, stressPattern].find((value) => value !== 'Balanced') ?? motivationPattern;
  const consistencySignals = [
    bigFiveSignalStrength[topBigFive] === 'Strong signal',
    riasec[topRiasec] > 0,
    cognitiveAnsweredCount >= 10
  ].filter(Boolean).length;
  const confidenceLevel = getConfidenceLevel(answeredCount, totalCount, consistencySignals);
  const topWorkstyleValue = getTopSectionValue(questions, answersById, 'workstyle');
  const topStressValue = getTopSectionValue(questions, answersById, 'stress');
  const topLeadershipValue = getTopSectionValue(questions, answersById, 'leadership');
  const combinedInsightKeys = [
    topBigFive === 'conscientiousness' && ['planfirst', 'sequence', 'agendas', 'createstructure', 'systems'].includes(topWorkstyleValue)
      ? 'combinedInsightMilestones'
      : null,
    topRiasec === 'Investigative' && topBigFive === 'open'
      ? 'combinedInsightInvestigativeOpen'
      : null,
    topBigFive === 'neuroticism' && topStressValue === 'control'
      ? 'combinedInsightStressControl'
      : null,
    topRiasec === 'Social' && ['coachquestions', 'barriers', 'alignconstraints', 'buildtrust', 'mutual'].includes(topLeadershipValue)
      ? 'combinedInsightSocialFacilitative'
      : null,
    'combinedInsightWorkflowAdjustments',
    'combinedInsightCrossDomainReview'
  ].filter((item): item is string => Boolean(item)).slice(0, 5);
  const cognitiveSignalLevel: ProfileReport['cognitiveSignalLevel'] = cognitiveAnsweredCount < 10 ? 'light' : 'standard';

  return {
    executiveSummaryParts: {
      personalityTypeEstimate,
      topBigFive,
      topRiasec,
      topOperating,
      topCognitiveLabel
    },
    confidenceLevel,
    combinedInsightKeys,
    cognitiveSignalLevel,
    topCognitiveLabel,
    personalityTypeEstimate,
    mbtiScoreState,
    bigFiveScores: bigFive,
    bigFiveNormalizedScores,
    bigFiveSignalStrength,
    riasecScores: riasec,
    motivationPattern,
    stressPattern,
    leadershipPattern,
    workstylePattern,
    strengths: ['Pattern recognition under structure', 'Reflective self-observation', 'Adaptable learning mindset'],
    blindSpots: ['May over-index on one problem style', 'Can rush ambiguous questions'],
    suggestedGrowthAreas: ['Practice slower reasoning in unfamiliar formats', 'Balance social and solo feedback loops', 'Review errors for strategy, not just accuracy']
  };
}
