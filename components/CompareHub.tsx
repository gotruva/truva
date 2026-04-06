'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calculator, X } from 'lucide-react';
import { RateProduct, QuickMatchAnswers } from '@/types';
import { mapAnswersToFilters, summarizeAnswers } from '@/utils/quickMatchMapper';
import { QuickMatchWizard } from '@/components/QuickMatchWizard';
import { QuickMatchResults } from '@/components/QuickMatchResults';
import { YieldCalculator } from '@/components/YieldCalculator';
import { RateSection } from '@/components/RateSection';

type TopSection = 'quick-match-wizard' | 'quick-match-results' | 'advanced-compare';

interface CompareHubProps {
  rates: RateProduct[];
  formattedDate?: string;
}

export function CompareHub({ rates, formattedDate }: CompareHubProps) {
  const [topSection, setTopSection] = useState<TopSection>('quick-match-wizard');
  const [quickMatchAnswers, setQuickMatchAnswers] = useState<QuickMatchAnswers | null>(null);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [prefillKey, setPrefillKey] = useState(0);

  const isQuickMatchTab = topSection !== 'advanced-compare';

  const handleWizardComplete = (answers: QuickMatchAnswers) => {
    setQuickMatchAnswers(answers);
    setTopSection('quick-match-results');
    // Seed the table below with the answers
    setPrefillKey(k => k + 1);
  };

  const handleSeeFullComparison = (ids: string[]) => {
    setRecommendedIds(ids);
    setTopSection('advanced-compare');
    setTimeout(() => {
      document.getElementById('compare-hub-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleAdjustAnswers = () => {
    setTopSection('quick-match-wizard');
  };

  const handleQuickMatchTab = () => {
    setTopSection(quickMatchAnswers ? 'quick-match-results' : 'quick-match-wizard');
  };

  const handleAdvancedTab = () => {
    setTopSection('advanced-compare');
  };

  const prefill = quickMatchAnswers ? mapAnswersToFilters(quickMatchAnswers) : undefined;

  return (
    <div>
      {/* ── Centered tab bar ── */}
      <div id="compare-hub-top" className="flex justify-center px-4 mb-8">
        <div className="flex gap-1 p-1 bg-brand-surface dark:bg-slate-950 border border-brand-border dark:border-white/10 rounded-xl w-full sm:w-auto">
          <button
            onClick={handleQuickMatchTab}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isQuickMatchTab
                ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border/50 dark:border-white/10'
                : 'text-brand-textSecondary dark:text-gray-500 hover:text-brand-textPrimary dark:hover:text-gray-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Find My Best Rate
          </button>
          <button
            onClick={handleAdvancedTab}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              !isQuickMatchTab
                ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border/50 dark:border-white/10'
                : 'text-brand-textSecondary dark:text-gray-500 hover:text-brand-textPrimary dark:hover:text-gray-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Compare All Banks
          </button>
        </div>
      </div>

      {/* ── Top section: Quick Match OR Calculator — one at a time ── */}
      <AnimatePresence mode="wait">

        {topSection === 'quick-match-wizard' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 mb-10"
          >
            <QuickMatchWizard
              onComplete={handleWizardComplete}
              onSkip={handleAdvancedTab}
              initialAnswers={quickMatchAnswers ?? undefined}
            />
          </motion.div>
        )}

        {topSection === 'quick-match-results' && quickMatchAnswers && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 mb-10"
          >
            <QuickMatchResults
              rates={rates}
              answers={quickMatchAnswers}
              onSeeFullComparison={handleSeeFullComparison}
              onAdjustAnswers={handleAdjustAnswers}
            />
          </motion.div>
        )}

        {topSection === 'advanced-compare' && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Context strip — only when prefilled from Quick Match */}
            {quickMatchAnswers && (
              <div className="mx-4 mb-4 flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-primaryLight dark:bg-blue-500/10 border border-brand-primary/20 dark:border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-brand-primary dark:text-blue-400 font-medium min-w-0">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="truncate">{summarizeAnswers(quickMatchAnswers)}</span>
                </div>
                <button
                  onClick={() => { setQuickMatchAnswers(null); setRecommendedIds([]); setPrefillKey(k => k + 1); }}
                  className="shrink-0 text-brand-textSecondary dark:text-gray-500 hover:text-brand-textPrimary dark:hover:text-gray-300 transition-colors"
                  aria-label="Clear prefill"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <YieldCalculator
              key={`calc-${prefillKey}`}
              rates={rates}
              prefill={prefill ? {
                amount: prefill.amount,
                months: prefill.months,
                liquidityFilter: prefill.liquidityFilter,
              } : undefined}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Always visible: rate comparison table ── */}
      <div id="deposit-rates" className="px-4 mt-4">
        <div className="max-w-3xl mb-8">
          <h2 className="text-2xl font-bold text-brand-textPrimary dark:text-gray-100">Compare bank rates in one place</h2>
          {formattedDate && (
            <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-2 flex items-center gap-1.5">
              <span className="text-positive font-semibold">✓</span>
              Rates last checked and verified on {formattedDate}
            </p>
          )}
        </div>
        <RateSection
          key={`rates-${prefillKey}`}
          rates={rates}
          prefill={prefill ? {
            amount: prefill.amount,
            months: prefill.months,
            liquidityFilter: prefill.liquidityFilter,
            payoutFilter: prefill.payoutFilter,
            includePdicOnly: prefill.includePdicOnly,
          } : undefined}
          recommendedIds={recommendedIds}
        />
      </div>
    </div>
  );
}
