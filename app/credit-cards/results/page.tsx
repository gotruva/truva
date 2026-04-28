import type { Metadata } from 'next';
import { getCreditCards } from '@/lib/credit-cards';
import { CreditCardResults } from '@/components/credit-cards/CreditCardResults';
import type { CardMatchAnswers, GoalId, IncomeBracketId, SpendingCategory } from '@/lib/creditCardValue';
import { rankCards } from '@/lib/creditCardValue';
import { getEditorialFor } from '@/lib/credit-cards';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Credit Card Matches | Truva',
  description: 'See which Philippine credit cards fit your income, goal, and spending habits — ranked by how much money you actually keep per year.',
  robots: { index: false },
};

const VALID_GOALS = new Set<GoalId>(['no-annual-fee', 'cashback', 'travel', 'first-card', 'low-fee']);
const VALID_INCOMES = new Set<IncomeBracketId>(['15k', '21k', '30k', '31k', '50k', '51k', '100k']);
const VALID_SPENDING = new Set<SpendingCategory>(['groceries', 'dining', 'online', 'fuel', 'bills', 'travel']);

function parseAnswers(params: URLSearchParams): CardMatchAnswers {
  const goal     = params.get('goal') as GoalId;
  const income   = params.get('income') as IncomeBracketId;
  const spending = params.get('spending') as SpendingCategory;

  return {
    goal:     VALID_GOALS.has(goal)     ? goal     : 'cashback',
    income:   VALID_INCOMES.has(income) ? income   : '30k',
    spending: VALID_SPENDING.has(spending) ? spending : 'groceries',
  };
}

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function CreditCardResultsPage({ searchParams }: Props) {
  const params = new URLSearchParams(await searchParams);
  const answers = parseAnswers(params);

  const allCards = await getCreditCards();
  const ranked   = rankCards(allCards, answers);

  const rankedWithEditorial = ranked.map(entry => ({
    ...entry,
    editorial: getEditorialFor(entry.card, answers),
  }));

  return (
    <CreditCardResults
      answers={answers}
      ranked={rankedWithEditorial}
    />
  );
}
