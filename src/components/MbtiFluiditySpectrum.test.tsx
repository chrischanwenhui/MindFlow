import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MbtiFluiditySpectrum } from './MbtiFluiditySpectrum';
import { shouldRenderMbtiFluiditySpectrum } from '../App';
import type { DichotomyResult } from '../engine/scoring';

const dimensions: DichotomyResult[] = [
  {
    dimension: 'E/I',
    dominantPole: 'I',
    oppositePole: 'E',
    scoreDominant: 7,
    scoreOpposite: 6,
    totalAnswers: 13,
    margin: 1,
    confidenceRatio: 0.08,
    signalStrength: 'low'
  },
  {
    dimension: 'S/N',
    dominantPole: 'N',
    oppositePole: 'S',
    scoreDominant: 10,
    scoreOpposite: 7,
    totalAnswers: 17,
    margin: 3,
    confidenceRatio: 0.18,
    signalStrength: 'moderate'
  },
  {
    dimension: 'T/F',
    dominantPole: 'F',
    oppositePole: 'T',
    scoreDominant: 14,
    scoreOpposite: 6,
    totalAnswers: 20,
    margin: 8,
    confidenceRatio: 0.4,
    signalStrength: 'strong'
  },
  {
    dimension: 'J/P',
    dominantPole: 'J',
    oppositePole: 'P',
    scoreDominant: 13,
    scoreOpposite: 7,
    totalAnswers: 20,
    margin: 6,
    confidenceRatio: 0.3,
    signalStrength: 'moderate'
  }
];

describe('MbtiFluiditySpectrum', () => {
  it('renders 4 rows with normal MBTI dimension data', () => {
    const html = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={dimensions} />);

    expect(html.match(/mbti-fluidity-spectrum__card/g)).toHaveLength(4);
    expect(html).toContain('Energy &amp; Focus');
    expect(html).toContain('Information Style');
    expect(html).toContain('Decision Anchor');
    expect(html).toContain('Structure Preference');
  });

  it('renders a fluid/context-dependent label for low confidence with confidenceRatio 0', () => {
    const html = renderToStaticMarkup(
      <MbtiFluiditySpectrum dimensions={[{ ...dimensions[0], scoreDominant: 5, scoreOpposite: 5, confidenceRatio: 0 }]} />
    );

    expect(html).toContain('CONTEXT-DEPENDENT');
    expect(html).toContain('left:50%');
    expect(html).toContain('width:45%');
  });

  it('renders a clear lean label for a strong confidence right-side lean', () => {
    const html = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={[dimensions[2]]} />);

    expect(html).toContain('CLEAR LEAN');
    expect(html).toContain('Feeling');
    expect(html).toContain('lean toward Feeling');
  });

  it('does not render or crash when dimensions is empty', () => {
    const html = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={[]} />);

    expect(html).toBe('');
  });

  it('clamps invalid confidence ratios', () => {
    const highHtml = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={[{ ...dimensions[2], confidenceRatio: 2 }]} />);
    const lowHtml = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={[{ ...dimensions[3], confidenceRatio: -1 }]} />);

    expect(highHtml).toContain('data-ratio="1.00"');
    expect(highHtml).toContain('left:90%');
    expect(highHtml).toContain('width:12%');
    expect(lowHtml).toContain('data-ratio="0.00"');
    expect(lowHtml).toContain('left:50%');
    expect(lowHtml).toContain('width:45%');
  });

  it('does not render progress, meter, canvas, or svg elements', () => {
    const html = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={dimensions} />).toLowerCase();

    expect(html).not.toContain('<progress');
    expect(html).not.toContain('<meter');
    expect(html).not.toContain('<canvas');
    expect(html).not.toContain('<svg');
  });

  it('adds an aria-label to each row', () => {
    const html = renderToStaticMarkup(<MbtiFluiditySpectrum dimensions={dimensions} />);
    const rowMatches = html.match(/class="mbti-fluidity-spectrum__card"/g) ?? [];
    const ariaMatches = html.match(/class="mbti-fluidity-spectrum__card" role="group" aria-label="[^"]+"/g) ?? [];

    expect(rowMatches).toHaveLength(4);
    expect(ariaMatches).toHaveLength(4);
    expect(html).toContain('Confidence level');
  });

  it('is rendered by App.tsx only for English reports', () => {
    expect(shouldRenderMbtiFluiditySpectrum('en')).toBe(true);
    expect(shouldRenderMbtiFluiditySpectrum('zh')).toBe(false);
    expect(shouldRenderMbtiFluiditySpectrum('ms')).toBe(false);
    expect(shouldRenderMbtiFluiditySpectrum('ja')).toBe(false);
    expect(shouldRenderMbtiFluiditySpectrum('ko')).toBe(false);
    expect(shouldRenderMbtiFluiditySpectrum('th')).toBe(false);
  });
});
