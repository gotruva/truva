import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Premium Credit Cards in the Philippines 2026',
  description:
    'Top premium credit cards in the Philippines — signature and infinite tier cards ranked by lounge value, protection shield, and whether the annual fee is justified.',
  alternates: { canonical: '/credit-cards/best-premium' },
};

export default function BestPremiumCardsPage() {
  redirect('/credit-cards');
}
