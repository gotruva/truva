import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Cashback Credit Cards in the Philippines 2026',
  description:
    'Top cashback credit cards in the Philippines ranked by net peso value — factoring in earn rates, category caps, annual fees, and waiver realism.',
  alternates: { canonical: '/credit-cards/best-cashback' },
};

export default function BestCashbackCardsPage() {
  redirect('/credit-cards');
}
