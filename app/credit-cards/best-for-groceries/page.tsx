import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Grocery Credit Card Facts Philippines | Truva',
  description:
    'Browse grocery-relevant credit card facts from the Truva card desk. Category score lists are locked until reward valuation is ready.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestForGroceriesPage() {
  redirect('/credit-cards');
}
