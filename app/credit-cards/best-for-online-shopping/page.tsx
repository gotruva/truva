import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Online Shopping Credit Card Facts Philippines | Truva',
  description:
    'Browse online-shopping credit card facts from the Truva card desk. Category score lists are locked until reward and fee data are complete.',
  alternates: { canonical: '/credit-cards' },
};

export default function BestForOnlineShoppingPage() {
  redirect('/credit-cards');
}
