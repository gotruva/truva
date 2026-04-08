'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, Sparkles, X } from 'lucide-react';
import { ComparisonState, QuickMatchAnswers, RateProduct } from '@/types';
import {
  getQuickMatchRecommendations,
  mapAnswersToFilters,
  summarizeAnswers,
} from '@/utils/quickMatchMapper';
import { QuickMatchWizard } from '@/components/QuickMatchWizard';

type TopSection = 'quick-match-wizard' | 'quick-match-results' | 'advanced-compare';

interface CompareHubProps {
  rates: RateProduct[];
  formattedDate?: string;
}

interface PersistedCompareHubState {
  topSection: TopSection;
  quickMatchAnswers: QuickMatchAnswers | null;
  comparisonState: ComparisonState;
}

const STORAGE_KEY = 'truva.compare-hub-state.v1';

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-[28px] border border-brand-border bg-white p-6 shadow-[0_16px_50px_rgba(17,24,39,0.06)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
      <div className="h-6 w-40 rounded-full bg-brand-border/70 dark:bg-white/10" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-brand-surface dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

function CompareSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-11 rounded-xl bg-white dark:bg-slate-900" />
      <div className="h-40 rounded-2xl bg-white dark:bg-slate-900" />
      <div className="h-56 rounded-2xl bg-white dark:bg-slate-900" />
    </div>
  );
}

const DynamicQuickMatchResults = dynamic(
  () => import('@/components/QuickMatchResults').then((mod) => mod.QuickMatchResults),
  { loading: () => <PanelSkeleton rows={2} /> }
);

const DynamicYieldCalculator = dynamic(
  () => import('@/components/YieldCalculator').then((mod) => mod.YieldCalculator),
  { loading: () => <PanelSkeleton rows={4} /> }
);

const DynamicRateSection = dynamic(
  () => import('@/components/RateSection').then((mod) => mod.RateSection),
  { loading: () => <CompareSectionSkeleton /> }
);

const DEFAULT_COMPARISON_STATE: ComparisonState = {
  amount: 100000,
  months: 12,
  liquidityFilter: 'all',
  payoutFilter: 'all',
  includePdicOnly: false,
};

function isTopSection(value: unknown): value is TopSection {
  return value === 'quick-match-wizard'
    || value === 'quick-match-results'
    || value === 'advanced-compare';
}

function isQuickMatchAnswers(value: unknown): value is QuickMatchAnswers {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.amount === 'number'
    && typeof candidate.purpose === 'string'
    && typeof candidate.timeline === 'string'
    && typeof candidate.lockFlexibility === 'string'
    && typeof candidate.payoutPreference === 'string'
    && typeof candidate.insurancePreference === 'string';
}

function normalizeComparisonState(value: unknown): ComparisonState {
  if (!value || typeof value !== 'object') return DEFAULT_COMPARISON_STATE;

  const candidate = value as Partial<ComparisonState>;

  return {
    amount: typeof candidate.amount === 'number' ? candidate.amount : DEFAULT_COMPARISON_STATE.amount,
    months: typeof candidate.months === 'number' ? candidate.months : DEFAULT_COMPARISON_STATE.months,
    liquidityFilter: candidate.liquidityFilter ?? DEFAULT_COMPARISON_STATE.liquidityFilter,
    payoutFilter: candidate.payoutFilter ?? DEFAULT_COMPARISON_STATE.payoutFilter,
    includePdicOnly: typeof candidate.includePdicOnly === 'boolean'
      ? candidate.includePdicOnly
      : DEFAULT_COMPARISON_STATE.includePdicOnly,
  };
}

function readPersistedState(): PersistedCompareHubState | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedCompareHubState>;
    const quickMatchAnswers = isQuickMatchAnswers(parsed.quickMatchAnswers) ? parsed.quickMatchAnswers : null;
    const topSection = isTopSection(parsed.topSection)
      ? parsed.topSection
      : 'quick-match-wizard';

    return {
      topSection: quickMatchAnswers ? topSection : (topSection === 'quick-match-results' ? 'quick-match-wizard' : topSection),
      quickMatchAnswers,
      comparisonState: normalizeComparisonState(parsed.comparisonState),
    };
  } catch {
    return null;
  }
}

export function CompareHub({ rates, formattedDate }: CompareHubProps) {
  const [topSection, setTopSection] = useState<TopSection>('quick-match-wizard');
  const [quickMatchAnswers, setQuickMatchAnswers] = useState<QuickMatchAnswers | null>(null);
  const [comparisonState, setComparisonState] = useState<ComparisonState>(DEFAULT_COMPARISON_STATE);
  const skipNextPersistRef = useRef(false);
  const quickMatchAnswersRef = useRef<QuickMatchAnswers | null>(null);

  const isQuickMatchTab = topSection !== 'advanced-compare';

  useEffect(() => {
    quickMatchAnswersRef.current = quickMatchAnswers;
  }, [quickMatchAnswers]);

  const recommendedIds = useMemo(
    () => quickMatchAnswers ? getQuickMatchRecommendations(rates, quickMatchAnswers).map((product) => product.id) : [],
    [rates, quickMatchAnswers]
  );

  const clearStoredState = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const skipNextPersist = useCallback(() => {
    skipNextPersistRef.current = true;
    clearStoredState();
  }, [clearStoredState]);

  const handleHashNavigation = useCallback((hash: string) => {
    if (typeof window === 'undefined') return;

    if (hash === '#deposit-rates') {
      setTopSection('advanced-compare');
      window.setTimeout(() => {
        document.getElementById('deposit-rates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    if (hash === '#calculator') {
      setTopSection(quickMatchAnswersRef.current ? 'quick-match-results' : 'quick-match-wizard');
      window.setTimeout(() => {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, []);

  useEffect(() => {
    const persisted = readPersistedState();

    if (persisted) {
      setTopSection(persisted.topSection);
      setQuickMatchAnswers(persisted.quickMatchAnswers);
      setComparisonState(persisted.comparisonState);
      quickMatchAnswersRef.current = persisted.quickMatchAnswers;
    }

    handleHashNavigation(window.location.hash);

    const onHashChange = () => handleHashNavigation(window.location.hash);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [handleHashNavigation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    const payload: PersistedCompareHubState = {
      topSection,
      quickMatchAnswers,
      comparisonState,
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [comparisonState, quickMatchAnswers, topSection]);

  const handleComparisonStateChange = useCallback((updates: Partial<ComparisonState>) => {
    setComparisonState((current) => ({
      ...current,
      ...updates,
    }));
  }, []);

  const handleWizardComplete = useCallback((answers: QuickMatchAnswers) => {
    quickMatchAnswersRef.current = answers;
    setQuickMatchAnswers(answers);
    setComparisonState({
      ...DEFAULT_COMPARISON_STATE,
      ...mapAnswersToFilters(answers),
    });
    setTopSection('quick-match-results');
  }, []);

  const handleSeeFullComparison = useCallback(() => {
    setTopSection('advanced-compare');
    window.setTimeout(() => {
      document.getElementById('compare-hub-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const handleAdjustAnswers = useCallback(() => {
    skipNextPersist();
    setTopSection('quick-match-wizard');
  }, [skipNextPersist]);

  const handleQuickMatchTab = useCallback(() => {
    setTopSection(quickMatchAnswers ? 'quick-match-results' : 'quick-match-wizard');
  }, [quickMatchAnswers]);

  const handleAdvancedTab = useCallback(() => {
    setTopSection('advanced-compare');
  }, []);

  const handleClearPrefill = useCallback(() => {
    skipNextPersist();
    quickMatchAnswersRef.current = null;
    setQuickMatchAnswers(null);
    setComparisonState(DEFAULT_COMPARISON_STATE);
    setTopSection('advanced-compare');
  }, [skipNextPersist]);

  return (
    <div>
      <div id="compare-hub-top" className="mb-8 flex scroll-mt-28 justify-center px-4">
        <div className="flex w-full gap-1 rounded-xl border border-brand-border bg-brand-surface p-1 dark:border-white/10 dark:bg-slate-950 sm:w-auto">
          <button
            onClick={handleQuickMatchTab}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-3 text-center text-xs font-semibold leading-tight transition-all duration-200 sm:flex-none sm:flex-row sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm ${
              isQuickMatchTab
                ? 'border border-brand-border/50 bg-white text-brand-primary shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-blue-400'
                : 'text-brand-textSecondary hover:text-brand-textPrimary dark:text-gray-500 dark:hover:text-gray-300'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">Best Match</span>
            <span className="hidden sm:inline">Find My Best Rate</span>
          </button>
          <button
            onClick={handleAdvancedTab}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-3 text-center text-xs font-semibold leading-tight transition-all duration-200 sm:flex-none sm:flex-row sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm ${
              !isQuickMatchTab
                ? 'border border-brand-border/50 bg-white text-brand-primary shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-blue-400'
                : 'text-brand-textSecondary hover:text-brand-textPrimary dark:text-gray-500 dark:hover:text-gray-300'
            }`}
          >
            <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">All Banks</span>
            <span className="hidden sm:inline">Compare All Banks</span>
          </button>
        </div>
      </div>

      {topSection === 'quick-match-wizard' && (
        <div className="mb-10 px-4">
          <QuickMatchWizard
            onComplete={handleWizardComplete}
            onSkip={handleAdvancedTab}
            initialAnswers={quickMatchAnswers ?? undefined}
          />
        </div>
      )}

      {topSection === 'quick-match-results' && quickMatchAnswers && (
        <div className="mb-10 px-4">
          <DynamicQuickMatchResults
            rates={rates}
            answers={quickMatchAnswers}
            onSeeFullComparison={handleSeeFullComparison}
            onAdjustAnswers={handleAdjustAnswers}
          />
        </div>
      )}

      {topSection === 'advanced-compare' && (
        <div>
          {quickMatchAnswers && (
            <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-xl border border-brand-primary/20 bg-brand-primaryLight px-4 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="min-w-0 text-sm font-medium text-brand-primary dark:text-blue-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span className="truncate">{summarizeAnswers(quickMatchAnswers)}</span>
                </div>
              </div>
              <button
                onClick={handleClearPrefill}
                className="shrink-0 text-brand-textSecondary transition-colors hover:text-brand-textPrimary dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Clear prefill"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <DynamicYieldCalculator
            rates={rates}
            comparisonState={comparisonState}
            onComparisonStateChange={handleComparisonStateChange}
          />
        </div>
      )}

      <div id="deposit-rates" className="mt-4 scroll-mt-28 px-4">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-brand-textPrimary dark:text-gray-100">Compare bank rates in one place</h2>
          {formattedDate && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-textSecondary dark:text-gray-400">
              <span className="font-semibold text-positive">✓</span>
              Rates last checked and verified on {formattedDate}
            </p>
          )}
        </div>
        <DynamicRateSection
          rates={rates}
          comparisonState={comparisonState}
          onComparisonStateChange={handleComparisonStateChange}
          recommendedIds={recommendedIds}
        />
      </div>
    </div>
  );
}
