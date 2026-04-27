import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Credit Card Desk Philippines',
  description:
    'Browse current Philippine credit card facts. Public score lists are locked until Truva has enough methodology-ready card data.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestCreditCardsPage() {
  redirect('/credit-cards');
}
