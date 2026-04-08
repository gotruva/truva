'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RateProduct, QuickMatchAnswers } from '@/types';
import {
  getQuickMatchRecommendations,
  mapAnswersToFilters,
  type QuickMatchRecommendation,
} from '@/utils/quickMatchMapper';
import { formatPHP, formatRate } from '@/utils/yieldEngine';
import { resolveLogoSrc } from '@/lib/logo';
import { AffiliateButton } from '@/components/AffiliateButton';
import { CalculationBreakdownDetails } from '@/components/CalculationBreakdown';

interface QuickMatchResultsProps {
  rates: RateProduct[];
  answers: QuickMatchAnswers;
  onSeeFullComparison: () => void;
  onAdjustAnswers: () => void;
}

type TopProduct = QuickMatchRecommendation;

function formatLockPeriod(days: number): string {
  if (days === 0) return 'Liquid - withdraw anytime';

  const months = Math.round(days / 30.4375);
  if (months < 12) return `${months}-month lock-in`;

  const years = months / 12;
  return `${years % 1 === 0 ? years : years.toFixed(1)}-year lock-in`;
}

function formatPayout(freq: RateProduct['payoutFrequency']): string {
  const map: Record<RateProduct['payoutFrequency'], string> = {
    daily: 'Daily',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annually: 'Annually',
    at_maturity: 'At maturity',
  };

  return map[freq];
}

function getTradeoffs(product: RateProduct): string[] {
  const tradeoffs: string[] = [];
  const spending = product.conditions.find((condition) => condition.type === 'spending');
  const promo = product.conditions.find((condition) => condition.type === 'promo' && condition.expiresAt);

  if (spending) {
    tradeoffs.push(`Requires PHP ${(spending.requiredMonthlySpend ?? 0).toLocaleString('en-PH')}/month spend to unlock the top rate`);
  }

  if (promo) {
    tradeoffs.push(`Promo rate expires ${promo.expiresAt}`);
  }

  return tradeoffs;
}

function buildReasons(product: TopProduct, answers: QuickMatchAnswers): string[] {
  const reasons: string[] = [];

  reasons.push(`${formatRate(product.effectiveRate > 0 ? product.effectiveRate : product.baseRate.afterTaxRate)} after-tax effective rate`);

  if (answers.lockFlexibility === 'no-lock' && product.lockInDays === 0) {
    reasons.push('Fully liquid and matches your need to access funds anytime');
  } else if (answers.lockFlexibility === 'yes-lock' && product.lockInDays > 0) {
    reasons.push(`${formatLockPeriod(product.lockInDays)} helps you capture a higher fixed rate`);
  } else if (answers.lockFlexibility === 'maybe' && product.lockInDays === 0) {
    reasons.push('No lock-in keeps your flexibility open');
  } else if (answers.lockFlexibility === 'maybe' && product.lockInDays > 0) {
    reasons.push(`${formatLockPeriod(product.lockInDays)} is the tradeoff for the higher return`);
  }

  if (product.pdic) {
    reasons.push('PDIC-insured up to PHP 1,000,000 per depositor');
  } else if (product.insurer === 'Bureau of Treasury') {
    reasons.push('Backed by the Philippine Bureau of Treasury');
  } else if (product.insurer === 'Pag-IBIG Fund') {
    reasons.push('Backed by Pag-IBIG Fund');
  }

  if (answers.payoutPreference === 'monthly' && ['daily', 'monthly'].includes(product.payoutFrequency)) {
    reasons.push('Interest credits regularly and matches your payout preference');
  } else if (answers.payoutPreference === 'at-maturity' && ['at_maturity', 'annually'].includes(product.payoutFrequency)) {
    reasons.push('Pays at maturity so the return can keep compounding until the end');
  } else {
    reasons.push(`Interest paid ${formatPayout(product.payoutFrequency).toLowerCase()}`);
  }

  if (answers.purpose === 'emergency' && product.lockInDays === 0) {
    reasons.push('Strong fit for an emergency fund because it stays liquid');
  } else if (answers.purpose === 'monthly-income' && ['daily', 'monthly'].includes(product.payoutFrequency)) {
    reasons.push('Regular interest payouts fit your goal for monthly income');
  } else if (answers.purpose === 'long-term' && product.lockInDays > 180) {
    reasons.push('Longer lock-in matches a long-term savings goal');
  }

  const seen = new Set<string>();
  return reasons.filter((reason) => {
    if (seen.has(reason)) return false;
    seen.add(reason);
    return true;
  }).slice(0, 4);
}

const RANK_STYLES = [
  'bg-gradient-to-br from-yellow-400 to-amber-500',
  'bg-gradient-to-br from-gray-300 to-gray-400',
  'bg-gradient-to-br from-amber-600 to-amber-700',
];

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${RANK_STYLES[rank - 1] ?? 'bg-gray-300'}`}>
      {rank === 1
        ? <Trophy className="h-3.5 w-3.5 text-white" />
        : <span className="text-[11px] font-bold text-white">{rank}</span>}
    </span>
  );
}

function RecommendationCard({
  product,
  answers,
  rank,
  amount,
  months,
}: {
  product: TopProduct;
  answers: QuickMatchAnswers;
  rank: number;
  amount: number;
  months: number;
}) {
  const reasons = buildReasons(product, answers);
  const tradeoffs = getTradeoffs(product);
  const isTop = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (rank - 1) * 0.1 }}
      className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900 ${
        isTop
          ? 'border-2 border-brand-primary shadow-md shadow-brand-primary/10 dark:border-blue-500/60'
          : 'border border-brand-border dark:border-white/10'
      }`}
    >
      {isTop && (
        <div className="flex items-center gap-2 bg-brand-primary px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Best Match for You</span>
        </div>
      )}

      <div className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <RankBadge rank={rank} />
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm dark:border-white/10">
            <img src={resolveLogoSrc(product.logo)} alt={product.provider} className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-bold leading-tight text-brand-textPrimary dark:text-gray-100">{product.provider}</div>
            <div className="mt-0.5 text-[12px] text-brand-textSecondary dark:text-gray-400">{product.name}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className={`text-2xl font-bold tabular-nums ${isTop ? 'text-positive' : 'text-brand-textPrimary dark:text-gray-100'}`}>
              {formatRate(product.effectiveRate)}
            </div>
            <div className="text-[11px] text-brand-textSecondary dark:text-gray-500">after tax / yr</div>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-slate-950">
          <div className="mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] text-brand-textSecondary dark:text-gray-400">
              <Banknote className="h-3.5 w-3.5" />
              You earn in {months < 12 ? `${months} months` : `${months / 12} year${months > 12 ? 's' : ''}`}
            </span>
            <span className="text-lg font-bold tabular-nums text-brand-textPrimary dark:text-gray-100">
              +{formatPHP(product.projectedReturn)}
            </span>
          </div>
          {product.dual.hasConditions && product.dual.conditionBoost > 0 && (
            <div className="mt-1 border-t border-brand-border pt-1 text-[11px] text-brand-textSecondary dark:border-white/10 dark:text-gray-500">
              Without conditions:{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {formatPHP(product.dual.withoutConditions.return)}
              </span>{' '}
              ({formatRate(product.dual.withoutConditions.effectiveRate)})
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {product.pdic && (
            <span className="inline-flex items-center gap-1 rounded-full border border-positive/25 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-positive dark:bg-green-950/20">
              <ShieldCheck className="h-3 w-3" /> PDIC Insured
            </span>
          )}
          {product.insurer === 'Bureau of Treasury' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-300/30 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-400">
              <ShieldCheck className="h-3 w-3" /> Gov&apos;t Backed
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-border px-2.5 py-1 text-[11px] font-semibold text-brand-textSecondary dark:border-white/10 dark:text-gray-400">
            <Lock className="h-3 w-3" /> {product.lockInDays === 0 ? 'Liquid' : formatLockPeriod(product.lockInDays)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-border px-2.5 py-1 text-[11px] font-semibold text-brand-textSecondary dark:border-white/10 dark:text-gray-400">
            <Calendar className="h-3 w-3" /> {formatPayout(product.payoutFrequency)}
          </span>
        </div>

        {product.tiers.length > 1 && (
          <div className="mb-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500">
              Rate Tiers (After Tax)
            </div>
            <div className="space-y-1">
              {product.tiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-textSecondary dark:text-gray-400">
                    {tier.maxBalance !== null
                      ? `PHP ${tier.minBalance.toLocaleString()} - PHP ${tier.maxBalance.toLocaleString()}`
                      : `PHP ${tier.minBalance.toLocaleString()}+`}
                  </span>
                  <span className="font-semibold tabular-nums text-brand-textPrimary dark:text-gray-200">
                    {formatRate(tier.afterTaxRate)}
                    <span className="ml-1 text-[11px] font-normal text-brand-textSecondary dark:text-gray-500">
                      ({formatRate(tier.grossRate)} gross)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500">
            Why this fits you
          </div>
          <div className="space-y-1.5">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-2 text-[13px] text-brand-textPrimary dark:text-gray-300">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {product.conditions.some((condition) => condition.type !== 'none') && (
          <div className="mb-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500">
              Conditions to qualify
            </div>
            <div className="space-y-1">
              {product.conditions.filter((condition) => condition.type !== 'none').map((condition, index) => (
                <div key={index} className="flex items-start gap-2 text-[12px] text-brand-textSecondary dark:text-gray-400">
                  <Clock className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                  <span>
                    {condition.description}
                    {condition.expiresAt && (
                      <span className="ml-1 text-[11px] font-semibold text-red-500">(expires {condition.expiresAt})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tradeoffs.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {tradeoffs.map((tradeoff, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-[12px] text-amber-700 dark:border-amber-800/30 dark:bg-amber-950/30 dark:text-amber-400"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{tradeoff}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <CalculationBreakdownDetails
            amount={amount}
            months={months}
            product={product}
            defaultOpen={isTop}
          />
        </div>

        <AffiliateButton amount={product.payoutAmount} productId={product.id} />
      </div>
    </motion.div>
  );
}

const PURPOSE_LABELS: Record<QuickMatchAnswers['purpose'], string> = {
  emergency: 'Emergency fund',
  'short-term': 'Short-term savings',
  'idle-cash': 'Growing idle cash',
  'long-term': 'Long-term savings',
  'monthly-income': 'Monthly income',
};

const TIMELINE_LABELS: Record<QuickMatchAnswers['timeline'], string> = {
  anytime: 'Anytime',
  '3mo': '3 months',
  '3-6mo': '3 to 6 months',
  '6-12mo': '6 to 12 months',
  '1yr+': '1 year+',
};

export function QuickMatchResults({ rates, answers, onSeeFullComparison, onAdjustAnswers }: QuickMatchResultsProps) {
  const filters = useMemo(() => mapAnswersToFilters(answers), [answers]);
  const topProducts = useMemo<TopProduct[]>(
    () => getQuickMatchRecommendations(rates, answers),
    [rates, answers]
  );

  if (topProducts.length === 0) {
    return (
      <div className="py-12 text-center text-brand-textSecondary dark:text-gray-400">
        <p className="mb-4">No bank options match your criteria.</p>
        <Button variant="outline" onClick={onAdjustAnswers}>Adjust my answers</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-brand-primary/20 bg-brand-primaryLight p-4 dark:border-blue-500/20 dark:bg-blue-500/10 sm:items-center">
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-primary dark:text-blue-400" />
            <span className="text-sm font-bold text-brand-primary dark:text-blue-400">Your top 3 matches</span>
          </div>
          <p className="text-xs text-brand-textSecondary dark:text-gray-400">
            {PURPOSE_LABELS[answers.purpose]} | PHP {answers.amount.toLocaleString('en-PH')} | {TIMELINE_LABELS[answers.timeline]}
          </p>
        </div>
        <button
          onClick={onAdjustAnswers}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-primary underline-offset-2 hover:underline dark:text-blue-400"
        >
          <RotateCcw className="h-3 w-3" /> Adjust answers
        </button>
      </div>

      <div className="mb-6 space-y-4">
        {topProducts.map((product, index) => (
          <RecommendationCard
            key={product.id}
            product={product}
            answers={answers}
            rank={index + 1}
            amount={answers.amount}
            months={filters.months}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onSeeFullComparison}
          className="flex-1 h-12 gap-2 bg-brand-primary font-semibold text-white hover:bg-brand-primaryDark"
        >
          See full comparison <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={onAdjustAnswers}
          className="h-12 gap-1.5 border-brand-border dark:border-white/10 dark:text-gray-300"
        >
          <RotateCcw className="h-4 w-4" /> Adjust my answers
        </Button>
      </div>
    </div>
  );
}
