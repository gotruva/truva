import type { Metadata } from 'next';
import { getCreditCards, getEditorialFor } from '@/lib/credit-cards';
import {
  selectFinderResults,
  deriveWatchOut,
  answersToQuery,
  parseFinderAnswers,
} from '@/lib/creditCardFinder/rank';
import { ResultsView, type PreparedCard } from '@/components/credit-cards/results/ResultsView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cards that may fit you | Truva',
  description:
    'Credit cards that may fit your income, spending, and goals — based on your answers and available card details. Bank approval is still required.',
  robots: { index: false },
};

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function CreditCardResultsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const answers = parseFinderAnswers(sp);
  const query = answersToQuery(answers);

  const allCards = await getCreditCards();
  const selection = selectFinderResults(allCards, answers);

  const editHref = '/credit-cards?step=1';
  const allHref = '/credit-cards/all';
  const beginnerHref = '/credit-cards/all?filter=beginner';
  const guideHref = '/guides';

  const result =
    selection.kind === 'matched'
      ? {
          kind: 'matched' as const,
          cards: selection.sections.map<PreparedCard>((scored) => {
            const editorial = getEditorialFor(scored.card);
            return {
              scored,
              why: editorial.why,
              watchOut: deriveWatchOut(scored.card, editorial),
            };
          }),
        }
      : ({ kind: 'fallback' } as const);

  return (
    <ResultsView
      answers={answers}
      result={result}
      editHref={editHref}
      allHref={allHref}
      beginnerHref={beginnerHref}
      guideHref={guideHref}
      fromQuery={query}
    />
  );
}
