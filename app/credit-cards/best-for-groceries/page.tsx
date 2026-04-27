import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Credit Cards for Groceries in the Philippines 2026',
  description:
    'Top grocery credit cards in the Philippines — ranked by cashback and points earn rates at supermarkets, with real annual-fee math included.',
  alternates: { canonical: '/credit-cards/best-for-groceries' },
};

export default function BestForGroceriesPage() {
  redirect('/credit-cards');
}
