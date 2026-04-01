'use client';

import { useState } from 'react';
import { RateProduct, FilterCategory, LiquidityFilter } from '@/types';
import { RateTable } from './RateTable';
import { RateCard } from './RateCard';
import { FilterTabs } from './FilterTabs';
import { PreQualFlow, PreQualAnswers } from './PreQualFlow';
import { computeEffectiveRate } from '@/utils/yieldEngine';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RateSection({ rates }: { rates: RateProduct[] }) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [liquidityFilter, setLiquidityFilter] = useState<LiquidityFilter>('all');
  const [showPreQual, setShowPreQual] = useState(false);
  const [answers, setAnswers] = useState<PreQualAnswers | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);

  const filteredRates = rates.filter((r) => {
    if (filter !== 'all' && r.category !== filter) return false;
    
    if (liquidityFilter === 'liquid' && r.lockInDays > 0) return false;
    if (liquidityFilter === 'locked' && r.lockInDays === 0) return false;
    
    if (answers) {
      // Risk checking: If PDIC, must be PDIC. If Medium, hide DeFi. If DeFi, allow all.
      if (answers.risk === 'PDIC' && !r.pdic) return false;
      if (answers.risk === 'Medium' && r.riskLevel === 'DeFi') return false;

      // Lock-in checking: 
      // Liquid -> must be 0 days
      // Short -> up to 90 days
      if (answers.lockIn === 'Liquid' && r.lockInDays > 0) return false;
      if (answers.lockIn === 'Short' && r.lockInDays > 90) return false;
    }
    return true;
  });

  // Sort by effective rate on the user's amount (or ₱100k default)
  const sortAmount = answers?.amount ?? 100000;
  const sortedRates = [...filteredRates].sort((a, b) => {
    const rateA = computeEffectiveRate(sortAmount, a.tiers);
    const rateB = computeEffectiveRate(sortAmount, b.tiers);
    return rateB - rateA;
  });
  
  const displayedRates = (answers && !showAllCards) ? sortedRates.slice(0, 3) : sortedRates;

  return (
    <section>
      <FilterTabs 
        active={filter} 
        onChange={setFilter} 
        activeLiquidity={liquidityFilter}
        onLiquidityChange={setLiquidityFilter}
      />
      
      <div className="max-w-5xl mx-auto px-4 md:px-0">
        <RateTable rates={sortedRates} />
        
        <div className="md:hidden">
          {!showPreQual && !answers && (
            <button 
              onClick={() => setShowPreQual(true)}
              className="w-full flex items-center justify-between bg-brand-primaryLight border border-brand-primary/20 text-brand-primary p-4 rounded-xl mb-6 font-semibold shadow-sm"
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
                setShowAllCards(false);
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

          <AnimatePresence mode="popLayout">
            {displayedRates.map((rate, i) => (
              <motion.div
                key={rate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <RateCard rate={rate} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {answers && !showAllCards && sortedRates.length > 3 && (
            <Button 
               variant="outline" 
               className="w-full mt-2 mb-6"
               onClick={() => setShowAllCards(true)}
            >
               See all {sortedRates.length} matched options
            </Button>
          )}

          {displayedRates.length === 0 && (
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
