import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { RESULTS } from '@/lib/creditCardFinder/copy';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import type { ScoredCard } from '@/lib/creditCardFinder/rank';
import { ResultsHeader } from './ResultsHeader';
import { ResultSection } from './ResultSection';
import { ResultCard } from './ResultCard';
import { NoMatchFallback } from './NoMatchFallback';
import { AffiliateDisclosure } from '../shared/AffiliateDisclosure';

export interface PreparedCard {
  scored: ScoredCard;
  why: string;
  watchOut: string;
}

interface Props {
  answers: FinderAnswers;
  result: { kind: 'matched'; cards: PreparedCard[] } | { kind: 'fallback' };
  editHref: string;
  allHref: string;
  beginnerHref: string;
  guideHref: string;
  fromQuery: string;
}

const TONE_CLASS = [
  'text-brand-primary',
  'text-emerald-600 dark:text-emerald-400',
  'text-brand-textSecondary dark:text-gray-400',
];
const FIT_TONE = ['positive', 'good', 'neutral'] as const;

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
    return (
      <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
        <ResultsHeader answers={answers} editHref={editHref} />
        <div className="py-4">
          <NoMatchFallback
            editHref={editHref}
            beginnerHref={beginnerHref}
            guideHref={guideHref}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
      <ResultsHeader answers={answers} editHref={editHref} />

      <div className="mx-auto max-w-3xl px-4 py-6">
        {result.cards.map((entry, idx) => (
          <ResultSection
            key={entry.scored.card.id}
            index={idx + 1}
            label={RESULTS.sections[idx]?.label ?? RESULTS.sections[2].label}
            sub={RESULTS.sections[idx]?.sub ?? RESULTS.sections[2].sub}
            toneClass={TONE_CLASS[idx] ?? TONE_CLASS[2]}
          >
            <ResultCard
              scored={entry.scored}
              why={entry.why}
              watchOut={entry.watchOut}
              fitLabel={RESULTS.fitLabels[idx] ?? RESULTS.fitLabels[2]}
              fitTone={FIT_TONE[idx] ?? 'neutral'}
              highlight={idx === 0}
              fromQuery={fromQuery}
            />
          </ResultSection>
        ))}

        <AffiliateDisclosure size="card" className="mb-3" />

        <div className="rounded-2xl border border-brand-border bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-[15px] font-bold text-brand-textPrimary dark:text-white">
            {RESULTS.browseHeading}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-400">
            {RESULTS.browseSub}
          </p>
          <Link
            href={allHref}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {RESULTS.browseCta}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="px-1 pb-2 pt-5 text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-500">
          {RESULTS.notAdvice}
        </p>
        <AffiliateDisclosure size="footer" />
      </div>
    </div>
  );
}
