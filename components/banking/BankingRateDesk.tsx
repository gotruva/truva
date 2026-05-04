'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ComparisonState, RateProduct } from '@/types';
import { RateSection } from '@/components/RateSection';

const DEFAULT_COMPARISON_STATE: ComparisonState = {
  amount: 100000,
  months: 12,
  liquidityFilter: 'all',
  payoutFilter: 'all',
  includePdicOnly: false,
};

const STORAGE_KEY = 'truva.compare-hub-state.v1';
const HUB_STATE_EVENT = 'truva:hub-state-update';

function readStoredComparisonState(): Partial<ComparisonState> | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { comparisonState?: Partial<ComparisonState> };
    const state = parsed.comparisonState;
    if (!state || typeof state !== 'object') return null;

    return {
      amount: typeof state.amount === 'number' ? state.amount : undefined,
      months: typeof state.months === 'number' ? state.months : undefined,
      liquidityFilter: state.liquidityFilter,
      payoutFilter: state.payoutFilter,
      includePdicOnly: typeof state.includePdicOnly === 'boolean' ? state.includePdicOnly : undefined,
    };
  } catch {
    return null;
  }
}

interface BankingRateDeskProps {
  rates: RateProduct[];
}

export function BankingRateDesk({ rates }: BankingRateDeskProps) {
  const [comparisonState, setComparisonState] = useState<ComparisonState>(DEFAULT_COMPARISON_STATE);

  useEffect(() => {
    const applyStoredState = () => {
      const stored = readStoredComparisonState();
      if (!stored) return;
      setComparisonState((current) => ({ ...current, ...stored }));
    };

    applyStoredState();
    window.addEventListener(HUB_STATE_EVENT, applyStoredState);
    window.addEventListener('storage', applyStoredState);

    return () => {
      window.removeEventListener(HUB_STATE_EVENT, applyStoredState);
      window.removeEventListener('storage', applyStoredState);
    };
  }, []);

  const handleComparisonStateChange = useCallback((updates: Partial<ComparisonState>) => {
    setComparisonState((current) => ({ ...current, ...updates }));
  }, []);

  return (
    <RateSection
      rates={rates}
      comparisonState={comparisonState}
      onComparisonStateChange={handleComparisonStateChange}
    />
  );
}
