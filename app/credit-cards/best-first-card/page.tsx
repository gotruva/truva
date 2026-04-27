import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Starter Credit Card Facts Philippines | Truva',
  description:
    'Browse starter-card facts from the Truva card desk. Income matching is locked until minimum income data is populated.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestFirstCardPage() {
  redirect('/credit-cards');
}
