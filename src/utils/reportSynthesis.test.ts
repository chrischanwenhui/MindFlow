import { describe, expect, it } from 'vitest';
import type { DichotomyResult, MbtiScoreState, ProfileReport, SignalStrength } from '../engine/scoring';
import { generateExecutiveSummary } from './reportSynthesis';

const dimensions = (
  estimatedType: string,
  signalStrength: SignalStrength,
  confidenceRatio: number
): DichotomyResult[] => {
  const pairs = [
    ['E/I', estimatedType[0] as DichotomyResult['dominantPole'], estimatedType[0] === 'E' ? 'I' : 'E'],
    ['S/N', estimatedType[1] as DichotomyResult['dominantPole'], estimatedType[1] === 'S' ? 'N' : 'S'],
    ['T/F', estimatedType[2] as DichotomyResult['dominantPole'], estimatedType[2] === 'T' ? 'F' : 'T'],
    ['J/P', estimatedType[3] as DichotomyResult['dominantPole'], estimatedType[3] === 'J' ? 'P' : 'J']
  ] as const;

  return pairs.map(([dimension, dominantPole, oppositePole]) => ({
    dimension,
    dominantPole,
    oppositePole,
    scoreDominant: signalStrength === 'low' ? 5 : 9,
    scoreOpposite: signalStrength === 'low' ? 5 : 1,
    totalAnswers: 10,
    margin: signalStrength === 'low' ? 0 : 8,
    confidenceRatio,
    signalStrength
  }));
};

function mbtiState(estimatedType: string, overallConfidence: SignalStrength): MbtiScoreState {
  const ratio = overallConfidence === 'strong' ? 0.8 : overallConfidence === 'moderate' ? 0.25 : 0;
  return {
    estimatedType,
    overallConfidence,
    dimensions: dimensions(estimatedType, overallConfidence, ratio)
  };
}

function createReport(overrides: Partial<ProfileReport> = {}): ProfileReport {
  return {
    executiveSummaryParts: {
      personalityTypeEstimate: 'INTJ',
      topBigFive: 'conscientiousness',
      topRiasec: 'Investigative',
      topOperating: 'planfirst',
      topCognitiveLabel: 'pattern reasoning'
    },
    confidenceLevel: 'Stronger signal',
    combinedInsightKeys: [],
    cognitiveSignalLevel: 'standard',
    topCognitiveLabel: 'pattern reasoning',
    personalityTypeEstimate: 'INTJ',
    mbtiScoreState: mbtiState('INTJ', 'strong'),
    bigFiveScores: {
      open: 18,
      conscientiousness: 22,
      extraversion: 8,
      agreeableness: 14,
      neuroticism: 7
    },
    bigFiveNormalizedScores: {
      open: 70,
      conscientiousness: 86,
      extraversion: 34,
      agreeableness: 58,
      neuroticism: 30
    },
    bigFiveSignalStrength: {
      open: 'Moderate signal',
      conscientiousness: 'Strong signal',
      extraversion: 'Moderate signal',
      agreeableness: 'Low signal',
      neuroticism: 'Moderate signal'
    },
    riasecScores: {
      Realistic: 2,
      Investigative: 8,
      Artistic: 3,
      Social: 1,
      Enterprising: 0,
      Conventional: 5
    },
    motivationPattern: 'Mastery',
    stressPattern: 'Balanced',
    leadershipPattern: 'Balanced',
    workstylePattern: 'Planfirst',
    strengths: [],
    blindSpots: [],
    suggestedGrowthAreas: [],
    ...overrides
  };
}

function allSectionText(report: ProfileReport): string {
  const summary = generateExecutiveSummary(report);
  return [
    summary.primaryWorkstyle.body,
    summary.cognitiveStyle.body,
    summary.operationalDrive.body,
    summary.strengthZone.body,
    summary.watchArea.body,
    summary.optimizationStrategy.body
  ].join(' ');
}

function operationalDriveText(report: ProfileReport): string {
  return generateExecutiveSummary(report).operationalDrive.body;
}

const RANDOM_BIG_FIVE_FRAGMENTS = [
  'conceptual exploration',
  'practical focus',
  'structured follow-through',
  'flexible prioritization',
  'active external engagement',
  'focused independent momentum',
  'collaborative alignment',
  'direct tradeoff evaluation',
  'early risk detection',
  'composed pressure management'
];

describe('generateExecutiveSummary', () => {
  it('uses strong preference-style wording for a high-confidence MBTI profile', () => {
    const summary = generateExecutiveSummary(createReport());

    expect(summary.primaryWorkstyle.body).toMatch(/strong/i);
    expect(summary.primaryWorkstyle.body).toMatch(/strongest preference signals/i);
  });

  it('uses fluidity or adaptive wording for a low-confidence MBTI profile', () => {
    const report = createReport({
      confidenceLevel: 'Light signal',
      mbtiScoreState: mbtiState('INFP', 'low'),
      personalityTypeEstimate: 'INFP'
    });
    const summary = generateExecutiveSummary(report);

    expect(summary.primaryWorkstyle.body).toMatch(/adaptive|fluidity/i);
  });

  it('includes all four MBTI descriptors in the primary workstyle sentence', () => {
    const intjSummary = generateExecutiveSummary(createReport({
      mbtiScoreState: mbtiState('INTJ', 'strong'),
      personalityTypeEstimate: 'INTJ'
    }));
    const infpSummary = generateExecutiveSummary(createReport({
      mbtiScoreState: mbtiState('INFP', 'low'),
      personalityTypeEstimate: 'INFP'
    }));

    expect(intjSummary.primaryWorkstyle.body).toContain('reflective, conceptual, principle-led, and structured');
    expect(infpSummary.primaryWorkstyle.body).toContain('reflective, conceptual, values-aware, and adaptive');
  });

  it('handles flat or zero score data without undefined or NaN output', () => {
    const report = createReport({
      confidenceLevel: 'Light signal',
      cognitiveSignalLevel: 'light',
      topCognitiveLabel: '',
      mbtiScoreState: mbtiState('INTJ', 'low'),
      bigFiveScores: {},
      bigFiveNormalizedScores: {},
      bigFiveSignalStrength: {},
      riasecScores: {
        Realistic: 0,
        Investigative: 0,
        Artistic: 0,
        Social: 0,
        Enterprising: 0,
        Conventional: 0
      }
    });

    expect(() => generateExecutiveSummary(report)).not.toThrow();
    expect(allSectionText(report)).not.toMatch(/undefined|NaN/);
  });

  it('uses balanced Big Five fallback when all normalized scores are zero', () => {
    const report = createReport({
      bigFiveNormalizedScores: {
        open: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
      }
    });
    const text = operationalDriveText(report);

    expect(text).toContain('balanced self-management');
    RANDOM_BIG_FIVE_FRAGMENTS.forEach((fragment) => expect(text).not.toContain(fragment));
  });

  it('uses balanced Big Five fallback when all normalized scores are flat at the midpoint', () => {
    const report = createReport({
      bigFiveNormalizedScores: {
        open: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50
      }
    });
    const text = operationalDriveText(report);

    expect(text).toContain('balanced self-management');
    RANDOM_BIG_FIVE_FRAGMENTS.forEach((fragment) => expect(text).not.toContain(fragment));
  });

  it('keeps meaningful top Big Five trait wording when a clear top trait exists', () => {
    const report = createReport({
      bigFiveNormalizedScores: {
        open: 84,
        conscientiousness: 58,
        extraversion: 42,
        agreeableness: 50,
        neuroticism: 35
      }
    });

    expect(operationalDriveText(report)).toContain('conceptual exploration');
  });

  it('keeps generated narrative sections free of banned absolute or clinical phrases', () => {
    const text = allSectionText(createReport());

    [
      'You are',
      'You definitely',
      'This means',
      'Your biggest weakness',
      'You should be a',
      'diagnosis',
      'diagnostic',
      'medical',
      'IQ',
      'disorder',
      'fixed identity'
    ].forEach((phrase) => {
      expect(text).not.toContain(phrase);
    });
  });

  it('includes the required reflective disclaimer separately from narrative sections', () => {
    const summary = generateExecutiveSummary(createReport());

    expect(summary.disclaimer).toBe('This is a reflective signal, not a clinical assessment or fixed identity.');
  });

  it('externalizes potential friction as an environment mismatch', () => {
    const summary = generateExecutiveSummary(createReport());

    expect(summary.watchArea.body).toContain('possible friction point');
    expect(summary.watchArea.body).toContain('environments that');
    expect(summary.watchArea.body).toContain('the mismatch can');
  });

  it('returns practical action wording in the optimization strategy', () => {
    const summary = generateExecutiveSummary(createReport());

    expect(summary.optimizationStrategy.body).toContain('highest point of leverage');
    expect(summary.optimizationStrategy.body).toMatch(/translating|connecting|building|developing|turning|choosing/);
    expect(summary.optimizationStrategy.body).toMatch(/establishing|partnering|facilitating|sharing|grounding|naming/);
  });

  it('is deterministic for the same input', () => {
    const report = createReport();

    expect(generateExecutiveSummary(report)).toEqual(generateExecutiveSummary(report));
  });
});
