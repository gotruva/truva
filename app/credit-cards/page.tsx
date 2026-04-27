import type { Metadata } from 'next';
import { getCreditCards } from '@/lib/credit-cards';
import { CreditCardClientPage } from '@/components/credit-cards/CreditCardClientPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Compare Credit Cards in the Philippines | Truva',
  description:
    'Find the best credit cards for your income and spending. Compare annual fees, rewards, interest, and requirements in plain English.',
  alternates: {
    canonical: '/credit-cards',
  },
};

export default async function CreditCardsPage() {
  const cards = await getCreditCards();

  return <CreditCardClientPage cards={cards} />;
}
