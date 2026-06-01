import type { CSSProperties } from 'react';
import type { DichotomyResult } from '../engine/scoring';

interface MbtiFluiditySpectrumProps {
  dimensions?: DichotomyResult[];
}

type SpectrumSide = 'left' | 'right' | 'center';
type SpectrumConfig = {
  dimension: DichotomyResult['dimension'];
  title: string;
  leftPole: DichotomyResult['dominantPole'];
  rightPole: DichotomyResult['dominantPole'];
  leftLabel: string;
  rightLabel: string;
};

const SPECTRUM_CONFIGS: SpectrumConfig[] = [
  {
    dimension: 'E/I',
    title: 'Energy & Focus',
    leftPole: 'I',
    rightPole: 'E',
    leftLabel: 'Introversion',
    rightLabel: 'Extraversion'
  },
  {
    dimension: 'S/N',
    title: 'Information Style',
    leftPole: 'S',
    rightPole: 'N',
    leftLabel: 'Sensing',
    rightLabel: 'Intuition'
  },
  {
    dimension: 'T/F',
    title: 'Decision Anchor',
    leftPole: 'T',
    rightPole: 'F',
    leftLabel: 'Thinking',
    rightLabel: 'Feeling'
  },
  {
    dimension: 'J/P',
    title: 'Structure Preference',
    leftPole: 'J',
    rightPole: 'P',
    leftLabel: 'Judging / Structure',
    rightLabel: 'Perceiving / Adaptability'
  }
];

function clampRatio(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, 1));
}

function getDominantSide(dimension: DichotomyResult, config: SpectrumConfig, ratio: number): SpectrumSide {
  const hasEqualScores = dimension.scoreDominant === dimension.scoreOpposite;
  if (ratio === 0 || (dimension.signalStrength === 'low' && hasEqualScores)) return 'center';
  if (dimension.dominantPole === config.leftPole) return 'left';
  if (dimension.dominantPole === config.rightPole) return 'right';
  return 'center';
}

function getSignalLabel(dimension: DichotomyResult, side: SpectrumSide): string {
  if (side === 'center' || dimension.signalStrength === 'low') return 'CONTEXT-DEPENDENT';
  if (dimension.signalStrength === 'moderate') return 'CONTEXTUAL LEAN';
  return 'CLEAR LEAN';
}

function getLeanLabel(side: SpectrumSide, config: SpectrumConfig): string {
  if (side === 'left') return config.leftLabel;
  if (side === 'right') return config.rightLabel;
  return `${config.leftLabel} and ${config.rightLabel}`;
}

function getInsightSentence(config: SpectrumConfig, side: SpectrumSide, signalStrength: DichotomyResult['signalStrength']): string {
  if (side === 'center' || signalStrength === 'low') {
    if (config.dimension === 'E/I') return 'You draw energy adaptively from both solitary focus and collaborative environments.';
    if (config.dimension === 'S/N') return 'Your information style may shift between practical detail and broader patterns by context.';
    if (config.dimension === 'T/F') return 'Your decision anchor may flex between logical clarity and people-centered impact.';
    return 'Your structure preference may adapt between planned closure and flexible exploration.';
  }

  if (config.dimension === 'E/I') {
    return side === 'left'
      ? 'Your response pattern shows a clearer lean toward reflective focus and independent recharge.'
      : 'Your response pattern shows a clearer lean toward outward energy and collaborative momentum.';
  }
  if (config.dimension === 'S/N') {
    return side === 'left'
      ? 'Your response pattern shows a clearer lean toward concrete observation and practical detail.'
      : 'Your response pattern shows a clearer lean toward pattern-seeing and possibility-focused interpretation.';
  }
  if (config.dimension === 'T/F') {
    return side === 'left'
      ? 'Your response pattern shows a clearer lean toward principles, logic, and analytical consistency.'
      : 'Your response pattern shows a clearer lean toward values, empathy, and relational impact.';
  }
  return side === 'left'
    ? 'Your response pattern shows a clearer lean toward plans, structure, and timely closure.'
    : 'Your response pattern shows a clearer lean toward adaptability, openness, and responsive pacing.';
}

function getAriaLabel(config: SpectrumConfig, signalLabel: string, side: SpectrumSide, ratio: number): string {
  const confidencePercent = Math.round(ratio * 100);
  const leanDescription = side === 'center'
    ? `a fluid lean between ${config.leftLabel} and ${config.rightLabel}`
    : `a lean toward ${getLeanLabel(side, config)}`;

  return `${config.title} spectrum. ${signalLabel.toLowerCase()} signal with ${leanDescription}. Confidence level ${confidencePercent} percent.`;
}

export function MbtiFluiditySpectrum({ dimensions }: MbtiFluiditySpectrumProps) {
  if (!dimensions?.length) return null;

  const dimensionsByName = new Map(dimensions.map((dimension) => [dimension.dimension, dimension]));
  const rows = SPECTRUM_CONFIGS.map((config) => {
    const dimension = dimensionsByName.get(config.dimension);
    if (!dimension) return null;

    const ratio = clampRatio(dimension.confidenceRatio);
    const dominantSide = getDominantSide(dimension, config, ratio);
    const shiftMagnitude = ratio * 40;
    const centerPosition = dominantSide === 'left' ? 50 - shiftMagnitude : dominantSide === 'right' ? 50 + shiftMagnitude : 50;
    const pillWidth = 45 - ratio * 33;
    const signalLabel = getSignalLabel(dimension, dominantSide);
    const insight = getInsightSentence(config, dominantSide, dimension.signalStrength);
    const ariaLabel = getAriaLabel(config, signalLabel, dominantSide, ratio);
    const pillStyle: CSSProperties = {
      left: `${centerPosition}%`,
      width: `${pillWidth}%`,
      opacity: 0.58 + ratio * 0.32,
      boxShadow: `0 10px ${22 - ratio * 8}px rgba(24, 111, 128, ${0.12 + ratio * 0.12})`,
      transform: 'translateX(-50%)'
    };

    return (
      <div className="mbti-fluidity-spectrum__card" role="group" aria-label={ariaLabel} key={config.dimension}>
        <div className="mbti-fluidity-spectrum__header">
          <div>
            <div className="mbti-fluidity-spectrum__eyebrow">{config.dimension}</div>
            <div className="mbti-fluidity-spectrum__title">{config.title}</div>
          </div>
          <div className="mbti-fluidity-spectrum__signal">{signalLabel}</div>
        </div>
        <div className="mbti-fluidity-spectrum__group">
          <div className="mbti-fluidity-spectrum__poles" aria-hidden="true">
            <div>{config.leftPole} — {config.leftLabel}</div>
            <div>{config.rightPole} — {config.rightLabel}</div>
          </div>
          <div className="mbti-fluidity-spectrum__track" aria-hidden="true" data-ratio={ratio.toFixed(2)}>
            <div className="mbti-fluidity-spectrum__centerline" />
            <div className="mbti-fluidity-spectrum__pill" style={pillStyle} />
          </div>
        </div>
        <div className="mbti-fluidity-spectrum__insight">{insight}</div>
      </div>
    );
  }).filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <div className="mbti-fluidity-spectrum" aria-label="MBTI fluidity spectrum">
      <div className="mbti-fluidity-spectrum__intro">
        <div className="mbti-fluidity-spectrum__kicker">Fluidity Spectrum</div>
        <div>These dimensions show a center of gravity for current preference leans, not a fixed identity.</div>
      </div>
      <div className="mbti-fluidity-spectrum__stack">{rows}</div>
    </div>
  );
}
