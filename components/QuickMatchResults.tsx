'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, AlertTriangle, ArrowRight, RotateCcw,
  Sparkles, Trophy, CheckCircle2, Calendar, Banknote, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RateProduct, QuickMatchAnswers } from '@/types';
import { mapAnswersToFilters } from '@/utils/quickMatchMapper';
import {
  computeEffectiveRate, computeReturn, computeDualScenario,
  formatRate, formatPHP,
} from '@/utils/yieldEngine';
import { resolveLogoSrc } from '@/lib/logo';
import { AffiliateButton } from '@/components/AffiliateButton';

interface QuickMatchResultsProps {
  rates: RateProduct[];
  answers: QuickMatchAnswers;
  onSeeFullComparison: (recommendedIds: string[]) => void;
  onAdjustAnswers: () => void;
}

interface TopProduct extends RateProduct {
  effectiveRate: number;
  projectedReturn: number;
  dual: ReturnType<typeof computeDualScenario>;
}

/* ── Helpers ── */

function formatLockPeriod(days: number): string {
  if (days === 0) return 'Liquid — withdraw anytime';
  const months = Math.round(days / 30.4375);
  if (months < 12) return `${months}-month lock-in`;
  const yrs = months / 12;
  return `${yrs % 1 === 0 ? yrs : yrs.toFixed(1)}-year lock-in`;
}

function formatPayout(freq: RateProduct['payoutFrequency']): string {
  const map: Record<RateProduct['payoutFrequency'], string> = {
    daily: 'Daily', monthly: 'Monthly', quarterly: 'Quarterly',
    annually: 'Annually', at_maturity: 'At maturity',
  };
  return map[freq];
}

function getTradeoffs(product: RateProduct): string[] {
  const out: string[] = [];
  const spending = product.conditions.find(c => c.type === 'spending');
  if (spending) out.push(`Requires ₱${(spending.requiredMonthlySpend ?? 0).toLocaleString('en-PH')}/mo spend to unlock top rate`);
  const promo = product.conditions.find(c => c.type === 'promo' && c.expiresAt);
  if (promo) out.push(`Promo rate expires ${promo.expiresAt}`);
  return out;
}

/** Build a list of reasons tied directly to the user's answers */
function buildReasons(product: TopProduct, answers: QuickMatchAnswers): string[] {
  const reasons: string[] = [];

  // --- Rate highlight ---
  reasons.push(`${formatRate(product.effectiveRate > 0 ? product.effectiveRate : product.baseRate.afterTaxRate)} after-tax effective rate`);

  // --- Lock-in match ---
  if (answers.lockFlexibility === 'no-lock' && product.lockInDays === 0) {
    reasons.push('Fully liquid — matches your need to access funds anytime');
  } else if (answers.lockFlexibility === 'yes-lock' && product.lockInDays > 0) {
    reasons.push(`${formatLockPeriod(product.lockInDays)} lets you capture a higher fixed rate`);
  } else if (answers.lockFlexibility === 'maybe' && product.lockInDays === 0) {
    reasons.push('No lock-in — you keep the flexibility option open');
  } else if (answers.lockFlexibility === 'maybe' && product.lockInDays > 0) {
    reasons.push(`${formatLockPeriod(product.lockInDays)} — worth locking for the rate boost`);
  }

  // --- Insurance match ---
  if (product.pdic) {
    reasons.push('PDIC-insured up to ₱500,000 per depositor');
  } else if (product.insurer === 'Bureau of Treasury') {
    reasons.push('Backed by the Philippine Bureau of Treasury — sovereign guarantee');
  } else if (product.insurer === 'Pag-IBIG Fund') {
    reasons.push('Backed by Pag-IBIG Fund');
  }

  // --- Payout preference match ---
  if (answers.payoutPreference === 'monthly' && ['daily', 'monthly'].includes(product.payoutFrequency)) {
    reasons.push('Interest credited monthly — matches your payout preference');
  } else if (answers.payoutPreference === 'at-maturity' && ['at_maturity', 'annually'].includes(product.payoutFrequency)) {
    reasons.push('Pays at maturity so your money can keep compounding until the end of the term');
  } else {
    reasons.push(`Interest paid ${formatPayout(product.payoutFrequency).toLowerCase()}`);
  }

  // --- Purpose match ---
  if (answers.purpose === 'emergency' && product.lockInDays === 0) {
    reasons.push('Ideal emergency fund — liquid and insured');
  } else if (answers.purpose === 'monthly-income' && ['daily', 'monthly'].includes(product.payoutFrequency)) {
    reasons.push('Regular interest payouts fit your goal for monthly income');
  } else if (answers.purpose === 'long-term' && product.lockInDays > 180) {
    reasons.push('Long lock-in aligns with your long-term savings goal');
  }

  // Deduplicate while preserving order, cap at 4
  const seen = new Set<string>();
  return reasons.filter(r => { if (seen.has(r)) return false; seen.add(r); return true; }).slice(0, 4);
}

/* ── Rank badge ── */
const RANK_STYLES = [
  'bg-gradient-to-br from-yellow-400 to-amber-500',
  'bg-gradient-to-br from-gray-300 to-gray-400',
  'bg-gradient-to-br from-amber-600 to-amber-700',
];

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${RANK_STYLES[rank - 1] ?? 'bg-gray-300'}`}>
      {rank === 1
        ? <Trophy className="w-3.5 h-3.5 text-white" />
        : <span className="text-[11px] font-bold text-white">{rank}</span>}
    </span>
  );
}

/* ── Full recommendation card (same layout for all 3) ── */
function RecommendationCard({
  product, answers, rank, months,
}: {
  product: TopProduct;
  answers: QuickMatchAnswers;
  rank: number;
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
      className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm transition-colors ${
        isTop
          ? 'border-2 border-brand-primary dark:border-blue-500/60 shadow-md shadow-brand-primary/10'
          : 'border border-brand-border dark:border-white/10'
      }`}
    >
      {/* Top banner for #1 */}
      {isTop && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-primary">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Best Match for You</span>
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <RankBadge rank={rank} />
          <div className="w-11 h-11 rounded-xl border border-brand-border dark:border-white/10 bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            <img src={resolveLogoSrc(product.logo)} alt={product.provider} className="w-8 h-8 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[16px] text-brand-textPrimary dark:text-gray-100 leading-tight">{product.provider}</div>
            <div className="text-[12px] text-brand-textSecondary dark:text-gray-400 mt-0.5">{product.name}</div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl font-bold tabular-nums ${isTop ? 'text-positive' : 'text-brand-textPrimary dark:text-gray-100'}`}>
              {formatRate(product.effectiveRate)}
            </div>
            <div className="text-[11px] text-brand-textSecondary dark:text-gray-500">after tax / yr</div>
          </div>
        </div>

        {/* Earnings projection box */}
        <div className="bg-brand-surface dark:bg-slate-950 border border-brand-border dark:border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] text-brand-textSecondary dark:text-gray-400 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              You earn in {months < 12 ? `${months} months` : `${months / 12} year${months > 12 ? 's' : ''}`}
            </span>
            <span className="text-lg font-bold text-brand-textPrimary dark:text-gray-100 tabular-nums">
              +{formatPHP(product.projectedReturn)}
            </span>
          </div>
          {product.dual.hasConditions && product.dual.conditionBoost > 0 && (
            <div className="text-[11px] text-brand-textSecondary dark:text-gray-500 mt-1 pt-1 border-t border-brand-border dark:border-white/10">
              Without conditions: <span className="font-semibold text-amber-600 dark:text-amber-400">{formatPHP(product.dual.withoutConditions.return)}</span>
              {' '}({formatRate(product.dual.withoutConditions.effectiveRate)})
            </div>
          )}
        </div>

        {/* Meta chips row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.pdic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-positive bg-green-50 dark:bg-green-950/20 border border-positive/25">
              <ShieldCheck className="w-3 h-3" /> PDIC Insured
            </span>
          )}
          {product.insurer === 'Bureau of Treasury' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-300/30 dark:border-blue-500/20">
              <ShieldCheck className="w-3 h-3" /> Gov't Backed
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-brand-textSecondary dark:text-gray-400 border border-brand-border dark:border-white/10">
            <Lock className="w-3 h-3" /> {product.lockInDays === 0 ? 'Liquid' : formatLockPeriod(product.lockInDays)}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-brand-textSecondary dark:text-gray-400 border border-brand-border dark:border-white/10">
            <Calendar className="w-3 h-3" /> {formatPayout(product.payoutFrequency)}
          </span>
        </div>

        {/* Rate tiers (if more than 1) */}
        {product.tiers.length > 1 && (
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500 mb-2">Rate Tiers (After Tax)</div>
            <div className="space-y-1">
              {product.tiers.map((tier, i) => (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-textSecondary dark:text-gray-400">
                    {tier.maxBalance !== null
                      ? `₱${tier.minBalance.toLocaleString()} – ₱${tier.maxBalance.toLocaleString()}`
                      : `₱${tier.minBalance.toLocaleString()}+`}
                  </span>
                  <span className="font-semibold text-brand-textPrimary dark:text-gray-200 tabular-nums">
                    {formatRate(tier.afterTaxRate)}
                    <span className="text-brand-textSecondary dark:text-gray-500 font-normal ml-1 text-[11px]">
                      ({formatRate(tier.grossRate)} gross)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why it fits — answer-aware */}
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500 mb-2">Why this fits you</div>
          <div className="space-y-1.5">
            {reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] text-brand-textPrimary dark:text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-positive shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions (if any) */}
        {product.conditions.some(c => c.type !== 'none') && (
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500 mb-2">Conditions to qualify</div>
            <div className="space-y-1">
              {product.conditions.filter(c => c.type !== 'none').map((cond, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-brand-textSecondary dark:text-gray-400">
                  <Clock className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    {cond.description}
                    {cond.expiresAt && (
                      <span className="ml-1 text-[11px] text-red-500 font-semibold">(expires {cond.expiresAt})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tradeoffs */}
        {tradeoffs.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {tradeoffs.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}

        <AffiliateButton amount={product.payoutAmount} url={product.affiliateUrl} />
      </div>
    </motion.div>
  );
}

/* ── Main export ── */

const PURPOSE_LABELS: Record<QuickMatchAnswers['purpose'], string> = {
  'emergency': 'Emergency fund',
  'short-term': 'Short-term savings',
  'idle-cash': 'Growing idle cash',
  'long-term': 'Long-term savings',
  'monthly-income': 'Monthly income',
};

const TIMELINE_LABELS: Record<QuickMatchAnswers['timeline'], string> = {
  anytime: 'Anytime', '3mo': '3 months',
  '3-6mo': '3–6 months', '6-12mo': '6–12 months', '1yr+': '1 year+',
};

export function QuickMatchResults({ rates, answers, onSeeFullComparison, onAdjustAnswers }: QuickMatchResultsProps) {
  const filters = useMemo(() => mapAnswersToFilters(answers), [answers]);

  const topProducts = useMemo<TopProduct[]>(() => {
    let filtered = rates.filter(r => {
      if (r.category !== 'banks') return false;
      if (filters.includePdicOnly && !r.pdic) return false;

      const horizonMap: Record<number, number> = { 3: 91, 6: 182, 12: 365, 24: 730 };
      const horizonDays = horizonMap[filters.months] ?? filters.months * 30;
      if (r.lockInDays > 0 && r.lockInDays > horizonDays) return false;

      if (filters.liquidityFilter === 'liquid' && r.lockInDays > 0) return false;
      if (filters.liquidityFilter === 'locked' && r.lockInDays === 0) return false;
      if (filters.payoutFilter === 'monthly' && !['daily', 'monthly', 'quarterly'].includes(r.payoutFrequency)) return false;
      if (filters.payoutFilter === 'at_maturity' && !['at_maturity', 'annually'].includes(r.payoutFrequency)) return false;

      return true;
    });

    // Graceful fallback — relax payout/liquidity if too few results
    if (filtered.length < 3) {
      filtered = rates.filter(r => {
        if (r.category !== 'banks') return false;
        if (filters.includePdicOnly && !r.pdic) return false;
        return true;
      });
    }

    return filtered
      .map(r => ({
        ...r,
        effectiveRate: computeEffectiveRate(filters.amount, r),
        projectedReturn: computeReturn(filters.amount, r, filters.months),
        dual: computeDualScenario(filters.amount, r, filters.months),
      }))
      .sort((a, b) => b.projectedReturn - a.projectedReturn)
      .slice(0, 3);
  }, [rates, filters]);

  const recommendedIds = topProducts.map(p => p.id);

  if (topProducts.length === 0) {
    return (
      <div className="text-center py-12 text-brand-textSecondary dark:text-gray-400">
        <p className="mb-4">No bank options match your criteria.</p>
        <Button variant="outline" onClick={onAdjustAnswers}>Adjust my answers</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Summary bar */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 p-4 bg-brand-primaryLight dark:bg-blue-500/10 border border-brand-primary/20 dark:border-blue-500/20 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="w-4 h-4 text-brand-primary dark:text-blue-400" />
            <span className="text-sm font-bold text-brand-primary dark:text-blue-400">Your top 3 matches</span>
          </div>
          <p className="text-xs text-brand-textSecondary dark:text-gray-400">
            {PURPOSE_LABELS[answers.purpose]} · ₱{answers.amount.toLocaleString('en-PH')} · {TIMELINE_LABELS[answers.timeline]}
          </p>
        </div>
        <button
          onClick={onAdjustAnswers}
          className="text-xs font-semibold text-brand-primary dark:text-blue-400 hover:underline underline-offset-2 shrink-0 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Adjust answers
        </button>
      </div>

      {/* All 3 cards — same full layout */}
      <div className="space-y-4 mb-6">
        {topProducts.map((product, i) => (
          <RecommendationCard
            key={product.id}
            product={product}
            answers={answers}
            rank={i + 1}
            months={filters.months}
          />
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => onSeeFullComparison(recommendedIds)}
          className="flex-1 h-12 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold gap-2"
        >
          See full comparison <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={onAdjustAnswers}
          className="h-12 border-brand-border dark:border-white/10 dark:text-gray-300 gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Adjust my answers
        </Button>
      </div>
    </div>
  );
}
