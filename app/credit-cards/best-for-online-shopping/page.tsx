import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Credit Cards for Online Shopping in the Philippines 2026',
  description:
    'Top online shopping credit cards in the Philippines — cashback and points on Shopee, Lazada, and overseas purchases, with FX fee and acceptance network in view.',
  alternates: { canonical: '/credit-cards/best-for-online-shopping' },
};

export default function BestForOnlineShoppingPage() {
  redirect('/credit-cards');
}
