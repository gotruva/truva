'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Target, Wallet } from 'lucide-react';
import { ComparisonState, RateProduct } from '@/types';
import { RateTable } from './RateTable';
import { BankCard } from './RateCard';
import { FilterTabs } from './FilterTabs';
import { PreQualFlow, PreQualAnswers } from './PreQualFlow';
import { computeEffectiveRate, computeReturn } from '@/utils/yieldEngine';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RateSectionProps {
  rates: RateProduct[];
  comparisonState: ComparisonState;
  onComparisonStateChange: (updates: Partial<ComparisonState>) => void;
  recommendedIds?: string[];
}

export function RateSection({
  rates,
  comparisonState,
  onComparisonStateChange,
  recommendedIds = [],
}: RateSectionProps) {
  const [showPreQual, setShowPreQual] = useState(false);
  const [answers, setAnswers] = useState<PreQualAnswers | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const numAmount = comparisonState.amount || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onComparisonStateChange({
      amount: value ? parseInt(value, 10) : 0,
    });
  };

  const monthOptions = [
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
  ];

  const filteredRates = rates.filter((rate) => {
    const horizonMap: Record<number, number> = { 3: 91, 6: 182, 12: 365, 24: 730 };
    const horizonDays = horizonMap[comparisonState.months] ?? comparisonState.months * 30;
    if (rate.lockInDays > 0 && rate.lockInDays > horizonDays) return false;

    if (comparisonState.liquidityFilter === 'liquid') {
      if (rate.lockInDays > 0) return false;
      if (rate.category !== 'banks') return false;
    }
    if (comparisonState.liquidityFilter === 'locked') {
      if (rate.lockInDays === 0) return false;
      if (rate.category !== 'banks') return false;
    }
    if (comparisonState.payoutFilter === 'monthly' && !['daily', 'monthly', 'quarterly'].includes(rate.payoutFrequency)) return false;
    if (comparisonState.payoutFilter === 'at_maturity' && !['at_maturity', 'annually'].includes(rate.payoutFrequency)) return false;
    if (comparisonState.includePdicOnly && !rate.pdic) return false;

    if (answers) {
      if (answers.risk === 'PDIC' && !rate.pdic) return false;
      if (answers.lockIn === 'Liquid' && rate.lockInDays > 0) return false;
      if (answers.lockIn === 'Short' && rate.lockInDays > 90) return false;
    }

    return true;
  });

  const sortAmount = (answers?.amount ?? numAmount) || 100000;
  const sortedRates = [...filteredRates].sort((rateA, rateB) => {
    const effectiveRateA = computeEffectiveRate(sortAmount, rateA);
    const effectiveRateB = computeEffectiveRate(sortAmount, rateB);
    return effectiveRateB - effectiveRateA;
  });

  const bankGroups = useMemo(() => {
    const groupMap = new Map<string, RateProduct[]>();

    for (const rate of sortedRates) {
      const existing = groupMap.get(rate.provider) || [];
      existing.push(rate);
      groupMap.set(rate.provider, existing);
    }

    const groups = [];
    for (const [provider, products] of groupMap) {
      const enriched = products.map((product) => ({
        ...product,
        effectiveRate: computeEffectiveRate(numAmount, product),
        projectedReturn: computeReturn(numAmount, product, comparisonState.months),
      }));
      enriched.sort((left, right) => right.effectiveRate - left.effectiveRate);

      const best = enriched[0];
      groups.push({
        provider,
        logo: best.logo,
        bestEffectiveRate: best.effectiveRate,
        bestReturn: best.projectedReturn,
        products: enriched,
        insurer: best.insurer,
      });
    }

    groups.sort((left, right) => right.bestEffectiveRate - left.bestEffectiveRate);
    return groups;
  }, [comparisonState.months, numAmount, sortedRates]);

  const formattedAmount = numAmount > 0
    ? `₱${numAmount.toLocaleString('en-PH')}`
    : '₱100,000';

  return (
    <section>
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        {/* Results header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Ranked by Net Return
            </h2>
            <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
              {bankGroups.length} provider{bankGroups.length !== 1 ? 's' : ''} compared
            </p>
          </div>

        </div>

        <div className="hidden md:block">
          <FilterTabs
            activeLiquidity={comparisonState.liquidityFilter}
            onLiquidityChange={(liquidityFilter) => onComparisonStateChange({ liquidityFilter })}
          />
        </div>

        <RateTable
          rates={sortedRates}
          amount={comparisonState.amount}
          months={comparisonState.months}
          onAmountChange={(amount) => onComparisonStateChange({ amount })}
          onMonthsChange={(months) => onComparisonStateChange({ months })}
          recommendedIds={recommendedIds}
        />

        <div className="md:hidden">
          {false && !showPreQual && !answers && (
            <button
              onClick={() => setShowPreQual(true)}
              className="mb-4 w-full rounded-2xl border border-brand-primary/20 bg-brand-primaryLight p-4 text-left text-brand-primary shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <div className="font-semibold leading-tight">Get a personalized recommendation</div>
                    <div className="mt-1 text-xs font-medium text-brand-primary/75">
                      Answer a few questions and we&apos;ll sort the strongest matches first.
                    </div>
                  </div>
                </div>
                <span className="text-xl leading-none">&rarr;</span>
              </div>
            </button>
          )}

          {showPreQual && (
            <div className="mb-4">
              <PreQualFlow
                onComplete={(nextAnswers) => {
                  setAnswers(nextAnswers);
                  setShowPreQual(false);
                  onComparisonStateChange({ amount: nextAnswers.amount });
                }}
                onCancel={() => setShowPreQual(false)}
              />
            </div>
          )}

          {answers && !showPreQual && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-brand-textPrimary dark:text-gray-100">
                  <Target className="h-4 w-4 text-brand-primary" /> Top Matches
                </h3>
                <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-400">
                  Based on PHP {answers.amount.toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnswers(null)}
                className="h-8 border border-brand-border shadow-none dark:border-white/10"
              >
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            </div>
          )}

          <FilterTabs
            activeLiquidity={comparisonState.liquidityFilter}
            onLiquidityChange={(liquidityFilter) => onComparisonStateChange({ liquidityFilter })}
          />

          <div className="mb-4 rounded-xl border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-brand-primary" />
              <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400">Your deposit amount</span>
            </div>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-brand-textSecondary dark:text-gray-400">PHP</span>
              <Input
                type="text"
                value={new Intl.NumberFormat('en-US').format(numAmount)}
                onChange={handleAmountChange}
                className="h-11 rounded-lg border-brand-border bg-brand-surface pl-12 text-lg font-bold shadow-inner focus-visible:ring-brand-primary dark:border-white/20 dark:bg-slate-950"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-brand-border bg-brand-surface p-1 dark:border-white/10 dark:bg-slate-950">
              {monthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onComparisonStateChange({ months: option.value })}
                  className={`rounded-md py-1.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                    comparisonState.months === option.value
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-brand-textSecondary hover:bg-white hover:text-brand-textPrimary dark:text-gray-500 dark:hover:bg-slate-900 dark:hover:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {bankGroups.map((group, index) => (
              <motion.div
                key={group.provider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <BankCard
                  provider={group.provider}
                  logo={group.logo}
                  products={group.products}
                  bestEffectiveRate={group.bestEffectiveRate}
                  bestReturn={group.bestReturn}
                  rank={index + 1}
                  amount={numAmount}
                  months={comparisonState.months}
                  insurer={group.insurer}
                  isExpanded={expandedCard === group.provider}
                  onToggle={() => setExpandedCard((current) => current === group.provider ? null : group.provider)}
                  isRecommended={group.products.some((product) => recommendedIds.includes(product.id))}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {bankGroups.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-brand-textSecondary dark:text-gray-400"
            >
              No options match your criteria. Try adjusting the filters.
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
