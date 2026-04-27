import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'No Annual Fee Credit Card Facts Philippines | Truva',
  description:
    'Browse no-fee and low-fee credit card facts from the Truva card desk. Public score lists are locked until waiver rules are complete.',
  alternates: { canonical: '/credit-cards' },
};

export default function NoAnnualFeeCardsPage() {
  redirect('/credit-cards');
}
