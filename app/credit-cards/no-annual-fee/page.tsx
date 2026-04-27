import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best No Annual Fee Credit Cards in the Philippines 2026',
  description:
    'True no-annual-fee credit cards in the Philippines — verified NAFFL cards with no hidden spend thresholds or first-year-only waivers.',
  alternates: { canonical: '/credit-cards/no-annual-fee' },
};

export default function NoAnnualFeeCardsPage() {
  redirect('/credit-cards');
}
