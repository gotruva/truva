'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CreditCardHero } from './CreditCardHero';
import { CreditCardMatchWidget } from './CreditCardMatchWidget';
import { CreditCardCatalog } from './CreditCardCatalog';
import { CreditCardVisual } from './CreditCardVisual';
import { CreditCardLabelExplainer } from './CreditCardLabelExplainer';
import { CreditCardMethodologySection } from './CreditCardMethodologySection';
import { EducationalGuidesSection } from './EducationalGuidesSection';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import editorial from '@/lib/creditCardEditorial';
import {
  rankCards,
  type CardScore,
  type GoalId,
  type IncomeBracketId,
  type SpendingCategory,
} from '@/lib/creditCardValue';
import type { CreditCard as CreditCardType } from '@/types';

// Maps quiz goal → catalog quick-pill ID
const GOAL_TO_PILL: Record<GoalId, string> = {
  'no-annual-fee': 'naffl',
  cashback: 'cashback',
  travel: 'travel',
  'first-card': 'first-card',
  'low-fee': 'first-card',
};

// Default spending category per goal (used in ranking)
const GOAL_TO_SPENDING: Record<GoalId, SpendingCategory> = {
  'no-annual-fee': 'groceries',
  cashback: 'groceries',
  travel: 'travel',
  'first-card': 'groceries',
  'low-fee': 'groceries',
};

type MatchedCard = { card: CreditCardType } & CardScore;

function formatFee(card: CreditCardType): string {
  if (card.naffl || card.annual_fee_recurring === 0) return 'No yearly fee';
  if (card.annual_fee_recurring) return `₱${card.annual_fee_recurring.toLocaleString('en-PH')}/yr`;
  return 'Confirm with bank';
}

function formatMinIncome(card: CreditCardType): string {
  if (card.min_income_monthly) return `₱${card.min_income_monthly.toLocaleString('en-PH')}/mo`;
  if (card.min_income_annual) return `₱${Math.round(card.min_income_annual / 12).toLocaleString('en-PH')}/mo`;
  return 'No public data';
}

export function CreditCardClientPage({ cards }: { cards: CreditCardType[] }) {
  const [quizGoal, setQuizGoal] = useState<GoalId | null>(null);
  const [quizIncome, setQuizIncome] = useState<IncomeBracketId | null>(null);
  const [activePill, setActivePill] = useState('all');

  const matchedCards = useMemo<MatchedCard[]>(() => {
    if (!quizGoal || !quizIncome) return [];
    return rankCards(cards, {
      goal: quizGoal,
      income: quizIncome,
      spending: GOAL_TO_SPENDING[quizGoal],
    }).slice(0, 3);
  }, [cards, quizGoal, quizIncome]);

  function handleGoalSelect(goal: GoalId) {
    setQuizGoal(goal);
    setQuizIncome(null);
  }

  function handleIncomeSelect(income: IncomeBracketId) {
    setQuizIncome(income);
    if (quizGoal) {
      setActivePill(GOAL_TO_PILL[quizGoal] ?? 'all');
    }
  }

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <CreditCardHero cards={cards} />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Breadcrumbs items={[{ label: 'Credit Cards', href: '/credit-cards' }]} />
      </div>

      {/* Match widget + inline results */}
      <section className="bg-brand-surface/30 dark:bg-white/5 py-12">
        <div className="mx-auto max-w-3xl text-center px-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Find your best match
          </h2>
          <p className="mt-3 text-base text-brand-textSecondary dark:text-gray-400">
            Answer two questions — your top cards appear right here.
          </p>
        </div>

        <CreditCardMatchWidget
          goal={quizGoal}
          income={quizIncome}
          onGoalSelect={handleGoalSelect}
          onIncomeSelect={handleIncomeSelect}
        />

        {/* Inline matched results — no page navigation */}
        <AnimatePresence>
          {matchedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-3xl px-4 mt-8 space-y-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary text-center">
                Your top matches
              </p>

              <div className="space-y-3">
                {matchedCards.map(({ card, matchPct, eligible }) => {
                  const ed = editorial[card.normalized_card_key];
                  return (
                    <div
                      key={card.id}
                      className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row"
                    >
                      <div className="w-full shrink-0 sm:w-36">
                        <CreditCardVisual card={card} />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-brand-textSecondary dark:text-gray-400">
                              {card.bank}
                            </p>
                            <h3 className="text-base font-bold text-brand-textPrimary dark:text-white">
                              {card.card_name}
                            </h3>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              eligible
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                            }`}
                          >
                            {matchPct}% match
                          </span>
                        </div>

                        {!eligible && (
                          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                            Income requirement may be higher than your selected range — confirm with the bank.
                          </p>
                        )}

                        {ed?.why && (
                          <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                            {ed.why}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-textSecondary dark:text-gray-400">
                          <span>
                            <span className="font-semibold text-brand-textPrimary dark:text-white">
                              {formatFee(card)}
                            </span>
                            {' · '}yearly fee
                          </span>
                          <span>
                            <span className="font-semibold text-brand-textPrimary dark:text-white">
                              {formatMinIncome(card)}
                            </span>
                            {' · '}min income
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/credit-cards/reviews/${card.normalized_card_key}`}
                            className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-primary/10 px-4 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20 dark:bg-brand-primary/15"
                          >
                            See details
                          </Link>
                          <a
                            href={card.source_url}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
                          >
                            Apply
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <a
                  href="#cards"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
                >
                  See all {cards.length} cards below
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Full catalog — pill syncs with quiz goal */}
      <div className="bg-[#F8F9FB] py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4">
          <CreditCardCatalog cards={cards} initialPill={activePill} key={activePill} />
        </div>
      </div>

      {/* Label / fee explainer */}
      <CreditCardLabelExplainer />

      {/* Methodology */}
      <div className="bg-brand-surface/30 dark:bg-white/5">
        <CreditCardMethodologySection />
      </div>

      {/* Editorial guides */}
      <EducationalGuidesSection />

      {/* Partner Disclosure */}
      <section className="mx-auto max-w-7xl px-4 py-16 border-t border-brand-border dark:border-white/10">
        <div className="rounded-3xl bg-slate-900 p-8 text-center text-white dark:bg-slate-800 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Partner Disclosure</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Truva is free for everyone. We may earn a referral fee from some of the banks listed on
            this page when you apply through our links. This does not change the data we show or how
            we score products. Our mission is to provide accurate, plain-English comparison data for
            Filipinos.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/methodology/editorial-integrity"
              className="text-sm font-semibold underline underline-offset-4 transition-colors hover:text-brand-primary"
            >
              Read our Editorial Integrity
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              href="/terms"
              className="text-sm font-semibold underline underline-offset-4 transition-colors hover:text-brand-primary"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <div className="border-t border-brand-border bg-white dark:border-white/10 dark:bg-slate-950">
        <NewsletterSignup />
      </div>
    </div>
  );
}
