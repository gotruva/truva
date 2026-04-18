import { CreditCard, HandCoins, Landmark, type LucideIcon } from 'lucide-react';

export type ProductNavigationStatus = 'live' | 'preview' | 'coming-soon';

export interface ProductNavigationItem {
  id: string;
  title: string;
  description: string;
  href?: string;
  methodologyHref?: string;
  editorialIntegrityHref?: string;
  icon: LucideIcon;
  status: ProductNavigationStatus;
}

export const PRODUCT_NAVIGATION_ITEMS: ProductNavigationItem[] = [
  {
    id: 'banking',
    title: 'Banking',
    description: 'Compare savings and time deposit rates, calculators, and practical guides.',
    href: '/banking',
    methodologyHref: '/methodology/banking',
    editorialIntegrityHref: '/methodology/editorial-integrity',
    icon: Landmark,
    status: 'live',
  },
  {
    id: 'credit-cards',
    title: 'Credit Cards',
    description: 'Compare cashback, rewards, annual fees, and review pages before you apply.',
    href: '/credit-cards',
    methodologyHref: '/methodology/credit-cards',
    editorialIntegrityHref: '/methodology/editorial-integrity',
    icon: CreditCard,
    status: 'live',
  },
  {
    id: 'loans',
    title: 'Loans',
    description: 'Planned hub for effective rates, approval timelines, and borrower tradeoffs.',
    href: '/loans',
    methodologyHref: '/methodology/loans',
    editorialIntegrityHref: '/methodology/editorial-integrity',
    icon: HandCoins,
    status: 'preview',
  },
];
