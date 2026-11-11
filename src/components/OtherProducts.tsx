import { t, type Language } from '../i18n';

type ProductLink = {
  name: string;
  url: string;
  descriptionKey: 'relatedCashflowDesc' | 'relatedPortfolioDesc';
  statusKey: 'relatedCashflowStatus' | 'relatedPortfolioStatus';
  actionKey: 'relatedCashflowCta' | 'relatedPortfolioCta';
};

export const OTHER_PRODUCT_LINKS: readonly ProductLink[] = [
  {
    name: 'Cash Flow',
    url: 'https://cashflow.eireneos.com/',
    descriptionKey: 'relatedCashflowDesc',
    statusKey: 'relatedCashflowStatus',
    actionKey: 'relatedCashflowCta'
  },
  {
    name: 'EireneOS',
    url: 'https://eireneos.com/',
    descriptionKey: 'relatedPortfolioDesc',
    statusKey: 'relatedPortfolioStatus',
    actionKey: 'relatedPortfolioCta'
  }
];

/** Links to confirmed public entry points only; private apps are never linked directly. */
export function OtherProducts({ language, headingLevel = 'h2' }: {
  language: Language;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const ProductHeading = headingLevel === 'h2' ? 'h3' : 'h4';

  return (
    <section className="other-products no-print" aria-label={t(language, 'relatedTitle')}>
      <Heading className="other-products__title">{t(language, 'relatedTitle')}</Heading>
      <p className="other-products__intro">{t(language, 'relatedIntro')}</p>
      <div className="other-products__grid">
        {OTHER_PRODUCT_LINKS.map(product => (
          <article className="other-products__item" key={product.name}>
            <span className="other-products__status">{t(language, product.statusKey)}</span>
            <ProductHeading className="other-products__name">{product.name}</ProductHeading>
            <p className="other-products__description">{t(language, product.descriptionKey)}</p>
            <a className="other-products__link" href={product.url} target="_blank" rel="noopener noreferrer">
              {t(language, product.actionKey)}
            </a>
          </article>
        ))}
      </div>
      <p className="other-products__footnote">{t(language, 'relatedDisclosure')}</p>
    </section>
  );
}
