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
    title: 'Savings & Deposits',
    description: 'Compare savings accounts, time deposits, calculators, and practical guides.',
    href: '/banking',
    methodologyHref: '/about',
    editorialIntegrityHref: '/about',
    icon: Landmark,
    status: 'live',
  },
  {
    id: 'credit-cards',
    title: 'Credit Cards',
    description: 'Compare cashback, rewards, annual fees, and review pages before you apply.',
    href: '/credit-cards',
    methodologyHref: '/about',
    editorialIntegrityHref: '/about',
    icon: CreditCard,
    status: 'coming-soon',
  },
];
