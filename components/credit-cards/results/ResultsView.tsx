import { ChevronRight } from 'lucide-react';
import { RESULTS, PRIORITY_LEAD_SUB } from '@/lib/creditCardFinder/copy';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import type { ScoredCard, ResultRole } from '@/lib/creditCardFinder/rank';
import type { ApprovalAssessment } from '@/lib/creditCardFinder/detail';
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
  welcomePromo?: string;
  approval: ApprovalAssessment;
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

  // B3: lead with one confident pick, then lighter "other options".
  const [topEntry, ...otherEntries] = result.cards;
  const topMeta = ROLE_META[topEntry.role];

  // B4: lead section echoes the user's stated priority. Still honest — it
  // restates their own answer, not a claim about the card.
  const leadSub =
    answers.priority && PRIORITY_LEAD_SUB[answers.priority]
      ? PRIORITY_LEAD_SUB[answers.priority]
      : RESULTS.sections[0].sub;

  // B1: deep-link into the existing compare flow. The route needs 2–3 cards.
  const compareHref =
    result.cards.length >= 2
      ? `/credit-cards/compare/${result.cards
          .map((c) => encodeURIComponent(c.scored.card.normalized_card_key))
          .join('-vs-')}`
      : null;

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
        {/* B3: the top match leads, prominently. */}
        <ResultSection
          label={RESULTS.topMatchLabel}
          sub={leadSub}
          toneClass="text-brand-primary"
          prominent
        >
          <ResultCard
            scored={topEntry.scored}
            why={topEntry.why}
            watchOut={topEntry.watchOut}
            approval={topEntry.approval}
            welcomePromo={topEntry.welcomePromo}
            fitLabel={RESULTS.fitLabels[topMeta.idx]}
            fitTone={topMeta.fitTone}
            highlight
            fromQuery={fromQuery}
            rank={1}
            role={topEntry.role}
          />
        </ResultSection>

        {/* B3: remaining matches as lighter "other options". */}
        {otherEntries.length > 0 && (
          <div className="mb-4 mt-1 border-t border-dashed border-brand-border pt-5 dark:border-white/10">
            <h2 className="px-1 text-sm font-bold text-brand-textPrimary dark:text-white">
              {RESULTS.otherOptionsHeading}
            </h2>
            <p className="mt-0.5 px-1 text-xs text-brand-textSecondary dark:text-gray-400">
              {RESULTS.otherOptionsSub}
            </p>
          </div>
        )}

        {otherEntries.map((entry, i) => {
          const meta = ROLE_META[entry.role];
          return (
            <ResultSection
              key={entry.scored.card.id}
              label={RESULTS.sections[meta.idx].label}
              sub={RESULTS.sections[meta.idx].sub}
              toneClass={meta.toneClass}
            >
              <ResultCard
                scored={entry.scored}
                why={entry.why}
                watchOut={entry.watchOut}
                approval={entry.approval}
                welcomePromo={entry.welcomePromo}
                fitLabel={RESULTS.fitLabels[meta.idx]}
                fitTone={meta.fitTone}
                highlight={false}
                fromQuery={fromQuery}
                rank={i + 2}
                role={entry.role}
              />
            </ResultSection>
          );
        })}

        {compareHref && (
          <div className="mb-3 rounded-2xl border border-brand-primary/20 bg-brand-primaryLight/50 p-5 dark:border-brand-primary/25 dark:bg-brand-primary/10">
            <p className="text-[15px] font-bold text-brand-textPrimary dark:text-white">
              {RESULTS.compareHeading}
            </p>
            <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-300">
              {RESULTS.compareSub}
            </p>
            <TrackedLink
              href={compareHref}
              event="cc_results_compare_clicked"
              detail={{ count: result.cards.length }}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              {RESULTS.compareCta}
              <ChevronRight className="h-3.5 w-3.5" />
            </TrackedLink>
          </div>
        )}

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
