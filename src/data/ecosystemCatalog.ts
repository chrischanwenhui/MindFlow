export const ECOSYSTEM_PRODUCTS = [
  { id: 'cashFlow', name: 'Cash Flow', url: 'https://cashflow.eireneos.com/', availability: 'public' },
  { id: 'advisorFlow', name: 'Advisor Flow', url: 'https://eireneos.com/advisor-flow/', availability: 'private' },
  { id: 'retailFlow', name: 'Retail Flow', url: 'https://eireneos.com/#products', availability: 'private' },
  { id: 'eireneFall', name: 'EireneFall', url: 'https://eireneos.com/eirene-fall/#current-slice', availability: 'development' }
] as const;
export const ECOSYSTEM_PORTFOLIO_URL = 'https://eireneos.com/#products';
export type EcosystemProductId = (typeof ECOSYSTEM_PRODUCTS)[number]['id'];
