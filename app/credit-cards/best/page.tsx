import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Credit Cards in the Philippines 2026',
  description:
    'The top-ranked credit cards in the Philippines by True Value Score — scored on net peso value, fee structure, rewards quality, and approval fit.',
  alternates: { canonical: '/credit-cards/best' },
};

export default function BestCreditCardsPage() {
  redirect('/credit-cards');
}
