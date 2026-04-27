import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Cashback Credit Card Facts Philippines',
  description:
    'Browse cashback credit card facts from the Truva card desk. Public score lists are locked until reward valuation and score inputs are ready.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestCashbackCardsPage() {
  redirect('/credit-cards');
}
