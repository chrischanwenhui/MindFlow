import type { DichotomyResult, ProfileReport, SignalStrength } from '../engine/scoring';
import { joinWithOxfordComma } from './textFormatters';

export interface SynthesisSection {
  heading: string;
  body: string;
}

export interface ExecutiveSummary {
  primaryWorkstyle: SynthesisSection;
  cognitiveStyle: SynthesisSection;
  operationalDrive: SynthesisSection;
  strengthZone: SynthesisSection;
  watchArea: SynthesisSection;
  optimizationStrategy: SynthesisSection;
  disclaimer: string;
}

interface FrictionFragment {
  trigger: string;
  impact: string;
  mitigation: string;
}

interface OptimizationFragment {
  environment: string;
  leveragePoint: string;
  teamAlignment: string;
}

type BigFiveKey = 'open' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

const MBTI_STYLE_DESCRIPTORS: Record<string, string> = {
  I: 'reflective',
  E: 'externally engaged',
  S: 'practical',
  N: 'conceptual',
  T: 'principle-led',
  F: 'values-aware',
  J: 'structured',
  P: 'adaptive'
};

const BIG_FIVE_OPERATIONAL_FRAGMENTS: Record<BigFiveKey, { high: string; low: string; neutral: string }> = {
  open: {
    high: 'conceptual exploration',
    low: 'practical focus',
    neutral: 'balanced idea testing'
  },
  conscientiousness: {
    high: 'structured follow-through',
    low: 'flexible prioritization',
    neutral: 'steady prioritization'
  },
  extraversion: {
    high: 'active external engagement',
    low: 'focused independent momentum',
    neutral: 'situational collaboration'
  },
  agreeableness: {
    high: 'collaborative alignment',
    low: 'direct tradeoff evaluation',
    neutral: 'measured stakeholder awareness'
  },
  neuroticism: {
    high: 'early risk detection',
    low: 'composed pressure management',
    neutral: 'balanced risk awareness'
  }
};

const RIASEC_OPERATIONAL_FRAGMENTS: Record<string, string> = {
  Realistic: 'hands-on environments where ideas can become tangible output',
  Investigative: 'environments that reward analysis, research, and careful problem framing',
  Artistic: 'open-ended environments where originality can be shaped into a coherent direction',
  Social: 'collaborative environments where guidance and trust-building matter',
  Enterprising: 'persuasive environments where decisions, influence, and momentum are visible',
  Conventional: 'organized environments where accuracy, sequence, and dependable systems matter'
};

const COGNITIVE_STYLE_FRAGMENTS: Record<string, string> = {
  pattern: 'pattern recognition and conceptual linking',
  verbal: 'language-based reasoning and clear explanation',
  numerical: 'quantitative comparison and structured evidence review',
  spatial: 'visual mapping and mentally rotating information',
  memory: 'holding details in mind while checking them against the task'
};

const FRICTION_FRAGMENTS: Record<string, FrictionFragment> = {
  structured: {
    trigger: 'environments that change priorities without enough context or sequencing',
    impact: 'feel harder to convert into confident next steps',
    mitigation: 'protect a short planning window and clarify the smallest useful definition of done'
  },
  exploratory: {
    trigger: 'environments that require premature closure before the problem has been explored',
    impact: 'lead to ideas feeling compressed or under-tested',
    mitigation: 'focus on separating discovery time from decision time'
  },
  collaborative: {
    trigger: 'environments that isolate decisions from the people affected by them',
    impact: 'result in lower trust, slower alignment, or missed context',
    mitigation: 'ensure key stakeholders have a clear moment to contribute constraints and feedback'
  },
  independent: {
    trigger: 'environments that require constant availability or rapid context switching',
    impact: 'feel mentally expensive and reduce depth of focus',
    mitigation: 'protect uninterrupted work blocks and define when collaboration is most useful'
  },
  practical: {
    trigger: 'environments that keep work abstract for too long without visible application',
    impact: 'make momentum feel harder to sustain',
    mitigation: 'focus on turning broad ideas into prototypes, examples, or concrete next actions'
  },
  balanced: {
    trigger: 'environments that rely on one operating mode for every problem',
    impact: 'lead to unnecessary friction when the task calls for a different rhythm',
    mitigation: 'match the work mode to the moment: explore, decide, execute, then review'
  }
};

const OPTIMIZATION_FRAGMENTS: Record<string, OptimizationFragment> = {
  structured: {
    environment: 'environments that provide clear priorities, ownership, and room for thoughtful preparation',
    leveragePoint: 'translating ambiguity into sequence, criteria, and visible progress',
    teamAlignment: 'establishing shared expectations before execution accelerates'
  },
  exploratory: {
    environment: 'environments that welcome thoughtful exploration before committing to a narrow answer',
    leveragePoint: 'connecting ideas, patterns, and emerging possibilities into usable direction',
    teamAlignment: 'partnering with teammates who can pressure-test scope and timing'
  },
  collaborative: {
    environment: 'environments that value trust, context, and shared ownership of outcomes',
    leveragePoint: 'building alignment between human needs, constraints, and next actions',
    teamAlignment: 'facilitating clear conversations around expectations, risks, and support'
  },
  independent: {
    environment: 'environments that protect focus while still offering purposeful checkpoints',
    leveragePoint: 'developing depth before bringing recommendations back to the group',
    teamAlignment: 'sharing concise decision notes so others can engage without constant interruption'
  },
  practical: {
    environment: 'environments that connect plans to tangible output, evidence, and implementation',
    leveragePoint: 'turning broad direction into experiments, prototypes, or operational routines',
    teamAlignment: 'grounding collaboration in examples, constraints, and visible next steps'
  },
  balanced: {
    environment: 'environments that allow the work mode to shift with the problem',
    leveragePoint: 'choosing when to explore broadly, organize details, and move into execution',
    teamAlignment: 'naming the current phase so collaborators know whether to ideate, decide, or deliver'
  }
};

const DISCLAIMER = 'This is a reflective signal, not a clinical assessment or fixed identity.';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getConfidenceLabel(signal: SignalStrength | undefined): string {
  if (signal === 'strong') return 'strong';
  if (signal === 'moderate') return 'moderate';
  return 'early';
}

function getEstimatedType(report: ProfileReport): string {
  const type = report.mbtiScoreState?.estimatedType || report.personalityTypeEstimate || report.executiveSummaryParts?.personalityTypeEstimate;
  return /^[EISNTFJP]{4}$/.test(type) ? type : 'balanced';
}

function getDimensionSignals(report: ProfileReport): DichotomyResult[] {
  return Array.isArray(report.mbtiScoreState?.dimensions) ? report.mbtiScoreState.dimensions : [];
}

function getStrongDimensions(dimensions: DichotomyResult[]): DichotomyResult[] {
  return dimensions.filter((dimension) => dimension.signalStrength === 'strong');
}

function getLowDimensions(dimensions: DichotomyResult[]): DichotomyResult[] {
  return dimensions.filter((dimension) => dimension.signalStrength === 'low');
}

function getMbtiDescriptors(type: string): string[] {
  if (type === 'balanced') return ['balanced', 'context-responsive'];
  return type.split('').map((letter) => MBTI_STYLE_DESCRIPTORS[letter]).filter(Boolean).slice(0, 3);
}

function getTopEntry(record: Record<string, number> | undefined): [string, number] | null {
  const entries = Object.entries(record ?? {}).filter(([, value]) => isFiniteNumber(value));
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted[0] ?? null;
}

function getTopRiasec(report: ProfileReport): string | null {
  const top = getTopEntry(report.riasecScores);
  if (!top || top[1] <= 0) return null;
  const values = Object.values(report.riasecScores ?? {}).filter(isFiniteNumber);
  const uniqueScores = new Set(values);
  if (uniqueScores.size <= 1) return null;
  return top[0];
}

function getTopCognitiveKey(label: string | undefined): string | null {
  const normalized = (label ?? '').toLowerCase();
  return Object.keys(COGNITIVE_STYLE_FRAGMENTS).find((key) => normalized.includes(key)) ?? null;
}

function getTopBigFiveFragment(report: ProfileReport): string {
  const top = getTopEntry(report.bigFiveNormalizedScores);
  if (!top) return 'balanced self-management';
  const [trait, value] = top;
  if (!(trait in BIG_FIVE_OPERATIONAL_FRAGMENTS)) return 'balanced self-management';
  const fragments = BIG_FIVE_OPERATIONAL_FRAGMENTS[trait as BigFiveKey];
  if (value >= 62) return fragments.high;
  if (value <= 38) return fragments.low;
  return fragments.neutral;
}

function getPrimaryMode(report: ProfileReport): keyof typeof FRICTION_FRAGMENTS {
  const topRiasec = getTopRiasec(report);
  const topOcean = getTopEntry(report.bigFiveNormalizedScores);
  const type = getEstimatedType(report);
  const isIntroverted = type.startsWith('I');

  if (topRiasec === 'Social' || topRiasec === 'Enterprising') return 'collaborative';
  if (topRiasec === 'Realistic' || topRiasec === 'Conventional') return 'practical';
  if (topOcean?.[0] === 'conscientiousness' && topOcean[1] >= 62) return 'structured';
  if (topOcean?.[0] === 'open' && topOcean[1] >= 62) return 'exploratory';
  if (isIntroverted) return 'independent';
  return 'balanced';
}

function hasIntroversionCollaborationContrast(report: ProfileReport): boolean {
  const type = getEstimatedType(report);
  const topRiasec = getTopRiasec(report);
  return type.startsWith('I') && (topRiasec === 'Social' || topRiasec === 'Enterprising');
}

function buildPrimaryWorkstyle(report: ProfileReport): SynthesisSection {
  const type = getEstimatedType(report);
  const confidence = getConfidenceLabel(report.mbtiScoreState?.overallConfidence);
  const dimensions = getDimensionSignals(report);
  const strongDimensions = getStrongDimensions(dimensions);
  const lowDimensions = getLowDimensions(dimensions);
  const descriptors = joinWithOxfordComma(getMbtiDescriptors(type));
  const typePhrase = type === 'balanced' ? 'a balanced preference pattern' : type;

  const strengthSentence = strongDimensions.length > 0
    ? `The strongest preference signals appear around ${joinWithOxfordComma(strongDimensions.map((dimension) => dimension.dimension))}, which gives this estimate a clearer center of gravity.`
    : 'The current signal is still emerging, so the estimate is best treated as a directional starting point.';
  const fluidSentence = lowDimensions.length > 0 || confidence === 'early'
    ? 'Lower-signal dimensions are better read as adaptive range and situational fluidity rather than as a gap.'
    : 'The stronger pattern suggests a stable preference signal while still leaving room for context and role demands.';

  return {
    heading: 'Primary Workstyle Estimate',
    body: `Your current response pattern leans ${typePhrase} with ${confidence} confidence, suggesting a ${descriptors} workstyle. ${strengthSentence} ${fluidSentence}`
  };
}

function buildCognitiveStyle(report: ProfileReport): SynthesisSection {
  const cognitiveKey = getTopCognitiveKey(report.topCognitiveLabel);
  const toolPhrase = cognitiveKey ? COGNITIVE_STYLE_FRAGMENTS[cognitiveKey] : 'careful problem framing and flexible reasoning';
  const signalQualifier = report.cognitiveSignalLevel === 'light' ? 'an early signal' : 'a useful signal';

  return {
    heading: 'Cognitive / Information Processing Style',
    body: `Your cognitive-style responses point toward ${toolPhrase} as ${signalQualifier} in how information may be processed. This is most useful as a reflection on preferred problem-solving tools, not as a ranking of ability.`
  };
}

function buildOperationalDrive(report: ProfileReport): SynthesisSection {
  const operationalFragments = [getTopBigFiveFragment(report)];
  const topRiasec = getTopRiasec(report);
  if (topRiasec) operationalFragments.push(RIASEC_OPERATIONAL_FRAGMENTS[topRiasec] ?? `${topRiasec.toLowerCase()} interest signals`);
  const workstyle = report.workstylePattern && report.workstylePattern !== 'Balanced' ? `${report.workstylePattern.toLowerCase()} workstyle cues` : 'balanced workstyle cues';
  operationalFragments.push(workstyle);

  const contrast = hasIntroversionCollaborationContrast(report)
    ? ' Interestingly, while your response pattern suggests internal processing and quiet decompression, your interest signals may still point toward collaborative or persuasive environments. This can indicate that leadership or networking functions as a focused skill rather than a constant social baseline.'
    : '';

  return {
    heading: 'Operational Drive',
    body: `Your operational signals point toward ${joinWithOxfordComma(operationalFragments)}. These signals suggest the work may feel most engaging when motivation, task structure, and visible outcomes can reinforce one another.${contrast}`
  };
}

function buildStrengthZone(report: ProfileReport): SynthesisSection {
  const mode = getPrimaryMode(report);
  const environment = OPTIMIZATION_FRAGMENTS[mode].environment;
  const cognitiveKey = getTopCognitiveKey(report.topCognitiveLabel);
  const cognitivePhrase = cognitiveKey ? COGNITIVE_STYLE_FRAGMENTS[cognitiveKey] : 'careful reflection';

  return {
    heading: 'Strength Zone',
    body: `This profile typically performs well when ${environment.replace(/^environments that /, '')}. You may find a productive strength zone where ${cognitivePhrase}, meaningful context, and clear ownership of outcomes meet.`
  };
}

function buildWatchArea(report: ProfileReport): SynthesisSection {
  const mode = getPrimaryMode(report);
  const fragment = FRICTION_FRAGMENTS[mode];

  return {
    heading: 'Watch Area / Potential Friction',
    body: `Because your operational drive is distinct, a possible friction point may show up in ${fragment.trigger}. In these scenarios, the mismatch can ${fragment.impact}. To navigate this, ${fragment.mitigation}.`
  };
}

function buildOptimizationStrategy(report: ProfileReport): SynthesisSection {
  const mode = getPrimaryMode(report);
  const fragment = OPTIMIZATION_FRAGMENTS[mode];

  return {
    heading: 'Optimization Strategy',
    body: `You operate at your peak in ${fragment.environment}. Rather than spreading your energy evenly, your highest point of leverage lies in ${fragment.leveragePoint}. When coordinating with others, you can maximize your impact by ${fragment.teamAlignment}.`
  };
}

export function generateExecutiveSummary(report: ProfileReport): ExecutiveSummary {
  return {
    primaryWorkstyle: buildPrimaryWorkstyle(report),
    cognitiveStyle: buildCognitiveStyle(report),
    operationalDrive: buildOperationalDrive(report),
    strengthZone: buildStrengthZone(report),
    watchArea: buildWatchArea(report),
    optimizationStrategy: buildOptimizationStrategy(report),
    disclaimer: DISCLAIMER
  };
}
