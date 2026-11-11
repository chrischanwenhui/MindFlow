import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { dictionaries, type Language } from '../i18n';
import { OtherProducts, OTHER_PRODUCT_LINKS } from './OtherProducts';

describe('MindFlow cross-product discovery', () => {
  it('only links to verified public entry points, not private app routes', () => {
    expect(OTHER_PRODUCT_LINKS.map(x => x.url)).toEqual([
      'https://cashflow.eireneos.com/',
      'https://eireneos.com/'
    ]);
    for (const product of OTHER_PRODUCT_LINKS) {
      expect(product.url).toMatch(/^https:\/\//);
    }
    const html = renderToStaticMarkup(createElement(OtherProducts, { language: 'en' }));
    expect((html.match(/target="_blank"/g) ?? [])).toHaveLength(2);
    expect((html.match(/rel="noopener noreferrer"/g) ?? [])).toHaveLength(2);
    expect(html).toContain('Some products are private or still in development.');
    expect(html).not.toContain('advisor.eireneos.com');
    expect(html).not.toContain('retailflow.eireneos.com');
  });

  it('renders localized labels and honest availability disclosures in all six languages', () => {
    for (const language of Object.keys(dictionaries) as Language[]) {
      const dictionary = dictionaries[language];
      for (const key of [
        'relatedTitle', 'relatedIntro', 'relatedCashflowStatus', 'relatedCashflowDesc',
        'relatedCashflowCta', 'relatedPortfolioStatus', 'relatedPortfolioDesc',
        'relatedPortfolioCta', 'relatedDisclosure'
      ] as const) expect(dictionary[key].trim().length).toBeGreaterThan(4);
      const html = renderToStaticMarkup(createElement(OtherProducts, { language }));
      expect(html).toContain(dictionary.relatedTitle);
      expect(html).toContain(dictionary.relatedCashflowCta);
      expect(html).toContain(dictionary.relatedDisclosure);
      expect(html).toContain('<h2 class="other-products__title">');
    }
  });

  it('uses a nested heading when shown inside What We Provide', () => {
    const html = renderToStaticMarkup(createElement(OtherProducts, { language: 'en', headingLevel: 'h3' }));
    expect(html).toContain('<h3 class="other-products__title">');
    expect(html).toContain('class="other-products no-print"');
  });
});
