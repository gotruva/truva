import type { Metadata } from 'next';
import { getCreditCards } from '@/lib/credit-cards';
import { SavedCardsView } from '@/components/credit-cards/saved/SavedCardsView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your saved cards | Truva',
  description:
    'The credit cards you saved to revisit. Stored only on this device — no account needed.',
  robots: { index: false },
};

export default async function SavedCardsPage() {
  const cards = await getCreditCards();
  return <SavedCardsView cards={cards} />;
}
