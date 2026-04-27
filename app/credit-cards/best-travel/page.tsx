import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Travel Credit Card Facts Philippines',
  description:
    'Browse travel-relevant credit card facts from the Truva card desk. Travel score lists are locked until miles, lounge, FX, and protection data are complete.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestTravelCardsPage() {
  redirect('/credit-cards');
}
