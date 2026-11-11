import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AssessmentCategoryIcon, type AssessmentCategoryIconKind } from './AssessmentCategoryIcon';

const kinds: AssessmentCategoryIconKind[] = [
  'personality', 'career', 'cognitive', 'growth', 'motivation', 'learning'
];

describe('landing category icon consistency', () => {
  it('renders six decorative, monochromatic SVG icons without emoji', () => {
    for (const kind of kinds) {
      const markup = renderToStaticMarkup(createElement(AssessmentCategoryIcon, { kind }));
      expect(markup).toContain('<svg');
      expect(markup).toContain('stroke="currentColor"');
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).toContain('focusable="false"');
      expect(markup).not.toMatch(/[🧭💼🧠🌱🔍📚]/u);
    }
  });
});
