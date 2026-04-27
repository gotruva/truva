import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Premium Credit Card Facts Philippines',
  description:
    'Browse premium credit card facts from the Truva card desk. Premium score lists are locked until lounge, protection, and reward valuation are complete.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestPremiumCardsPage() {
  redirect('/credit-cards');
}
