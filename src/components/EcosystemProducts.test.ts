import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { dictionaries, type Language } from '../i18n';
import { ECOSYSTEM_PORTFOLIO_URL, ECOSYSTEM_PRODUCTS } from '../data/ecosystemCatalog';
import { ecosystemCopy } from '../i18n/ecosystem';
import { EcosystemProducts, EcosystemProductLink } from './EcosystemProducts';

const languages = Object.keys(dictionaries) as Language[];

describe('Eirene Stack product discovery', () => {
  it('only treats the public Cash Flow app as directly usable', () => {
    expect(ECOSYSTEM_PRODUCTS.filter(p => p.availability === 'public').map(p => p.id)).toEqual(['cashFlow']);
    expect(ECOSYSTEM_PRODUCTS.map(p => p.id)).toEqual(['cashFlow', 'advisorFlow', 'retailFlow', 'eireneFall']);
    expect(ECOSYSTEM_PRODUCTS[0].url).toBe('https://cashflow.eireneos.com/');
    expect(ECOSYSTEM_PRODUCTS.every(p => p.url.startsWith('https://'))).toBe(true);
    expect(ECOSYSTEM_PORTFOLIO_URL).toBe('https://eireneos.com/#products');
  });

  it('has complete six-language copy and honest private/development labels', () => {
    expect(Object.keys(ecosystemCopy).sort()).toEqual([...languages].sort());
    for (const language of languages) {
      const copy = ecosystemCopy[language];
      for (const value of [copy.heading, copy.introduction, copy.browse, copy.leavingNotice, copy.compactHeading, copy.compactDescription]) {
        expect(value.trim().length).toBeGreaterThan(5);
      }
      expect(Object.keys(copy.cards).sort()).toEqual(ECOSYSTEM_PRODUCTS.map(p => p.id).sort());
      for (const product of ECOSYSTEM_PRODUCTS) {
        const item = copy.cards[product.id];
        expect(item.status.trim()).not.toBe('');
        expect(item.action.trim().length).toBeGreaterThan(3);
        expect(item.description.trim().length).toBeGreaterThan(10);
      }
      expect(copy.cards.cashFlow.status).not.toBe(copy.cards.advisorFlow.status);
      expect(copy.cards.cashFlow.status).not.toBe(copy.cards.retailFlow.status);
      expect(copy.cards.cashFlow.status).not.toBe(copy.cards.eireneFall.status);
    }
  });

  it('renders four product cards and safe external links across all languages', () => {
    for (const language of languages) {
      const html = renderToStaticMarkup(createElement(EcosystemProducts, { language }));
      const copy = ecosystemCopy[language];
      expect(html).toContain(copy.heading);
      expect((html.match(/class="ecosystem-product"/g) ?? [])).toHaveLength(4);
      expect((html.match(/target="_blank"/g) ?? [])).toHaveLength(5);
      expect((html.match(/rel="noopener noreferrer"/g) ?? [])).toHaveLength(5);
      for (const product of ECOSYSTEM_PRODUCTS) {
        expect(html).toContain(product.name);
        expect(html).toContain(product.url.replace(/&/g, '&amp;'));
        expect(html).toContain(copy.cards[product.id].status);
        expect(html).toContain(copy.cards[product.id].action);
      }
      expect(html).toContain('class="ecosystem-products__notice"');
      expect(html).toContain('no-print');
    }
  });

  it('renders compact links without assessment controls', () => {
    for (const language of languages) {
      const html = renderToStaticMarkup(createElement(EcosystemProductLink, { language }));
      expect(html).toContain('ecosystem-products-teaser no-print');
      expect(html).toContain(ecosystemCopy[language].compactHeading);
      expect((html.match(/target="_blank"/g) ?? [])).toHaveLength(2);
      expect(html).not.toContain('Start Questions');
      expect(html).not.toContain('Restart');
    }
  });
});
