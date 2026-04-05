'use client';

import { useState, useMemo } from 'react';
import { RateProduct, FilterCategory, LiquidityFilter, PayoutFilter } from '@/types';
import { RateTable } from './RateTable';
import { BankCard } from './RateCard';
import { FilterTabs } from './FilterTabs';
import { PreQualFlow, PreQualAnswers } from './PreQualFlow';
import { computeEffectiveRate, computeReturn, formatPHP } from '@/utils/yieldEngine';
import { Input } from '@/components/ui/input';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RateSection({ rates }: { rates: RateProduct[] }) {
  const [filter, setFilter] = useState<FilterCategory>('banks');
  const [liquidityFilter, setLiquidityFilter] = useState<LiquidityFilter>('all');
  const [payoutFilter, setPayoutFilter] = useState<PayoutFilter>('all');
  const [showPreQual, setShowPreQual] = useState(false);
  const [answers, setAnswers] = useState<PreQualAnswers | null>(null);

  // Independent amount state for the rate section (mobile)
  const [mobileAmount, setMobileAmount] = useState<string>('100000');
  const [mobileMonths, setMobileMonths] = useState<number>(12);
  const numMobileAmount = parseFloat(mobileAmount.replace(/,/g, '')) || 0;

  const handleMobileAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMobileAmount(val);
  };

  const MONTH_OPTIONS = [
    { label: '3 Mo', value: 3 },
    { label: '6 Mo', value: 6 },
    { label: '1 Yr', value: 12 },
    { label: '2 Yr', value: 24 },
  ];

  const filteredRates = rates.filter((r) => {
    if (filter !== 'all' && r.category !== filter) return false;
    if (liquidityFilter === 'liquid' && r.lockInDays > 0) return false;
    if (liquidityFilter === 'locked' && r.lockInDays === 0) return false;
    if (payoutFilter === 'monthly' && !['daily', 'monthly', 'quarterly'].includes(r.payoutFrequency)) return false;
    if (payoutFilter === 'at_maturity' && !['at_maturity', 'annually'].includes(r.payoutFrequency)) return false;

    if (answers) {
      if (answers.risk === 'PDIC' && !r.pdic) return false;
      if (answers.risk === 'Medium' && r.riskLevel === 'DeFi') return false;
      if (answers.lockIn === 'Liquid' && r.lockInDays > 0) return false;
      if (answers.lockIn === 'Short' && r.lockInDays > 90) return false;
    }
    return true;
  });

  // Sort by effective rate on the user's amount (or ₱100k default)
  const sortAmount = (answers?.amount ?? numMobileAmount) || 100000;
  const sortedRates = [...filteredRates].sort((a, b) => {
    const rateA = computeEffectiveRate(sortAmount, a);
    const rateB = computeEffectiveRate(sortAmount, b);
    return rateB - rateA;
  });

  // Group products by provider for mobile cards
  const bankGroups = useMemo(() => {
    const groupMap = new Map<string, RateProduct[]>();
    for (const rate of sortedRates) {
      const existing = groupMap.get(rate.provider) || [];
      existing.push(rate);
      groupMap.set(rate.provider, existing);
    }

    const groups = [];
    for (const [provider, products] of groupMap) {
      const enriched = products.map(p => ({
        ...p,
        effectiveRate: computeEffectiveRate(numMobileAmount, p),
        projectedReturn: computeReturn(numMobileAmount, p, mobileMonths),
      }));
      enriched.sort((a, b) => b.effectiveRate - a.effectiveRate);

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

    groups.sort((a, b) => b.bestEffectiveRate - a.bestEffectiveRate);
    return groups;
  }, [sortedRates, numMobileAmount, mobileMonths]);

  return (
    <section>
      <FilterTabs
        active={filter}
        onChange={setFilter}
        activeLiquidity={liquidityFilter}
        onLiquidityChange={setLiquidityFilter}
        activePayoutFilter={payoutFilter}
        onPayoutFilterChange={setPayoutFilter}
      />
      
      <div className="max-w-5xl mx-auto px-4 md:px-0">
        <RateTable rates={sortedRates} />
        
        {/* ─── Mobile View ─── */}
        <div className="md:hidden">
          {/* Mobile amount input bar */}
          <div className="bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400">Your deposit amount</span>
            </div>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-brand-textSecondary dark:text-gray-400">₱</span>
              <Input
                type="text"
                value={new Intl.NumberFormat('en-US').format(numMobileAmount)}
                onChange={handleMobileAmountChange}
                className="pl-7 h-11 text-lg font-bold bg-brand-surface dark:bg-slate-950 border-brand-border dark:border-white/20 rounded-lg shadow-inner focus-visible:ring-brand-primary"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5 bg-brand-surface dark:bg-slate-950 p-1 rounded-lg border border-brand-border dark:border-white/10">
              {MONTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMobileMonths(opt.value)}
                  className={`py-1.5 text-[13px] font-semibold rounded-md transition-all ${
                    mobileMonths === opt.value
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-brand-textSecondary dark:text-gray-500 hover:text-brand-textPrimary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {!showPreQual && !answers && (
            <button 
              onClick={() => setShowPreQual(true)}
              className="w-full flex items-center justify-between bg-brand-primaryLight border border-brand-primary/20 text-brand-primary p-4 rounded-xl mb-4 font-semibold shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Get a personalized recommendation
              </div>
              <span className="text-xl leading-none">&rarr;</span>
            </button>
          )}

          {showPreQual && (
            <PreQualFlow 
              onComplete={(ans) => {
                setAnswers(ans);
                setShowPreQual(false);
                setMobileAmount(ans.amount.toString());
              }} 
              onCancel={() => setShowPreQual(false)} 
            />
          )}

          {answers && !showPreQual && (
            <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-brand-border">
               <div>
                 <h3 className="font-bold text-brand-textPrimary dark:text-gray-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-primary" /> Top Matches
                 </h3>
                 <p className="text-xs text-brand-textSecondary mt-1">Based on ₱{answers.amount.toLocaleString()}</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => setAnswers(null)} className="h-8 shadow-none border border-brand-border">
                 <X className="w-3 h-3 mr-1" /> Clear
               </Button>
            </div>
          )}

          {/* Grouped bank cards */}
          <AnimatePresence mode="popLayout">
            {bankGroups.map((group, i) => (
              <motion.div
                key={group.provider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <BankCard
                  provider={group.provider}
                  logo={group.logo}
                  products={group.products}
                  bestEffectiveRate={group.bestEffectiveRate}
                  bestReturn={group.bestReturn}
                  rank={i + 1}
                  amount={numMobileAmount}
                  months={mobileMonths}
                  insurer={group.insurer}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {bankGroups.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="text-center text-brand-textSecondary dark:text-gray-400 py-8"
            >
              No options match your criteria. Try adjusting the filters.
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
