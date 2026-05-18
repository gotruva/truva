import { ChevronRight } from 'lucide-react';
import { RESULTS } from '@/lib/creditCardFinder/copy';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import type { ScoredCard, ResultRole } from '@/lib/creditCardFinder/rank';
import { ResultsHeader } from './ResultsHeader';
import { ResultSection } from './ResultSection';
import { ResultCard } from './ResultCard';
import { NoMatchFallback } from './NoMatchFallback';
import { ResultsAnalytics } from './ResultsAnalytics';
import { AffiliateDisclosure } from '../shared/AffiliateDisclosure';
import { TrackedLink } from '../shared/TrackedLink';

export interface PreparedCard {
  scored: ScoredCard;
  role: ResultRole;
  why: string;
  watchOut: string;
}

const ROLE_META: Record<
  ResultRole,
  { idx: number; toneClass: string; fitTone: 'positive' | 'good' | 'neutral' }
> = {
  first: { idx: 0, toneClass: 'text-brand-primary', fitTone: 'positive' },
  'no-fee': {
    idx: 1,
    toneClass: 'text-emerald-600 dark:text-emerald-400',
    fitTone: 'good',
  },
  worth: {
    idx: 2,
    toneClass: 'text-brand-textSecondary dark:text-gray-400',
    fitTone: 'neutral',
  },
};

interface Props {
  answers: FinderAnswers;
  result: { kind: 'matched'; cards: PreparedCard[] } | { kind: 'fallback' };
  editHref: string;
  allHref: string;
  beginnerHref: string;
  guideHref: string;
  fromQuery: string;
}

export function ResultsView({
  answers,
  result,
  editHref,
  allHref,
  beginnerHref,
  guideHref,
  fromQuery,
}: Props) {
  if (result.kind === 'fallback') {
    // No matched header here — NoMatchFallback owns the honest header so we
    // never show "Here are cards that may fit you" above a no-match message.
    return (
      <div className="min-h-screen bg-brand-surface py-6 dark:bg-slate-950">
        <ResultsAnalytics kind="fallback" answers={answers} />
        <NoMatchFallback
          editHref={editHref}
          beginnerHref={beginnerHref}
          guideHref={guideHref}
        />
      </div>
    );
  }

  const topCard = result.cards[0]?.scored.card;

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
      <ResultsAnalytics
        kind="matched"
        answers={answers}
        resultCount={result.cards.length}
        topCardKey={topCard?.normalized_card_key}
        topBank={topCard?.bank}
      />
      <ResultsHeader answers={answers} editHref={editHref} />

      <div className="mx-auto max-w-3xl px-4 py-6">
        {result.cards.map((entry, idx) => {
          const meta = ROLE_META[entry.role];
          return (
            <ResultSection
              key={entry.scored.card.id}
              index={idx + 1}
              label={RESULTS.sections[meta.idx].label}
              sub={RESULTS.sections[meta.idx].sub}
              toneClass={meta.toneClass}
            >
              <ResultCard
                scored={entry.scored}
                why={entry.why}
                watchOut={entry.watchOut}
                fitLabel={RESULTS.fitLabels[meta.idx]}
                fitTone={meta.fitTone}
                highlight={entry.role === 'first'}
                fromQuery={fromQuery}
                rank={idx + 1}
                role={entry.role}
              />
            </ResultSection>
          );
        })}

        <AffiliateDisclosure size="card" className="mb-3" />

        <div className="rounded-2xl border border-brand-border bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-[15px] font-bold text-brand-textPrimary dark:text-white">
            {RESULTS.browseHeading}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-400">
            {RESULTS.browseSub}
          </p>
          <TrackedLink
            href={allHref}
            event="cc_results_browse_all_clicked"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {RESULTS.browseCta}
            <ChevronRight className="h-3.5 w-3.5" />
          </TrackedLink>
        </div>

        <p className="px-1 pb-2 pt-5 text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-500">
          {RESULTS.notAdvice}
        </p>
        <AffiliateDisclosure size="footer" />
      </div>
    </div>
  );
}
