import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best First Credit Cards in the Philippines 2026',
  description:
    'Best starter credit cards in the Philippines for beginners — low income requirements, low fees, and straightforward rewards with no redemption traps.',
  alternates: { canonical: '/credit-cards/best-first-card' },
};

export default function BestFirstCardPage() {
  redirect('/credit-cards');
}
