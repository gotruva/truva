import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Travel Credit Cards in the Philippines 2026',
  description:
    'Top travel credit cards in the Philippines ranked by miles value, lounge access, FX fees, and protection coverage.',
  alternates: { canonical: '/credit-cards/best-travel' },
};

export default function BestTravelCardsPage() {
  redirect('/credit-cards');
}
