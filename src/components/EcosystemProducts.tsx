import type { Language } from '../i18n';
import { ECOSYSTEM_PORTFOLIO_URL, ECOSYSTEM_PRODUCTS } from '../data/ecosystemCatalog';
import { ecosystemCopy } from '../i18n/ecosystem';

interface Props { language: Language }

export function EcosystemProducts({ language }: Props) {
  const copy = ecosystemCopy[language];
  return (
    <section className="card ecosystem-products no-print" aria-labelledby="ecosystem-products-title">
      <p className="ecosystem-products__eyebrow">Eirene Stack</p>
      <h2 id="ecosystem-products-title">{copy.heading}</h2>
      <p className="ecosystem-products__introduction">{copy.introduction}</p>
      <div className="ecosystem-products__grid">
        {ECOSYSTEM_PRODUCTS.map(product => {
          const label = copy.cards[product.id];
          return (
            <article className="ecosystem-product" key={product.id}>
              <p className="ecosystem-product__status">{label.status}</p>
              <h3>{product.name}</h3>
              <p className="ecosystem-product__description">{label.description}</p>
              <a
                className="ecosystem-product__link"
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label.action} — ${product.name} (${copy.leavingNotice})`}
              >
                {label.action}<span aria-hidden="true"> ↗</span>
              </a>
            </article>
          );
        })}
      </div>
      <a className="ecosystem-products__browse" href={ECOSYSTEM_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
        {copy.browse}<span aria-hidden="true"> ↗</span>
      </a>
      <p className="ecosystem-products__notice">{copy.leavingNotice}</p>
    </section>
  );
}

/** Discreet discovery link on non-assessment screens; never inserted into questions. */
export function EcosystemProductLink({ language }: Props) {
  const copy = ecosystemCopy[language];
  return (
    <aside className="ecosystem-products-teaser no-print" aria-label={copy.compactHeading}>
      <strong>{copy.compactHeading}</strong>
      <p>{copy.compactDescription}</p>
      <div className="ecosystem-products-teaser__links">
        <a href={ECOSYSTEM_PRODUCTS[0].url} target="_blank" rel="noopener noreferrer">{copy.cards.cashFlow.action} <span aria-hidden="true">↗</span></a>
        <a href={ECOSYSTEM_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">{copy.browse} <span aria-hidden="true">↗</span></a>
      </div>
    </aside>
  );
}
