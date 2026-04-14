'use client';

import { useCallback, useState } from 'react';
import type { ComparisonState, RateProduct } from '@/types';
import { RateSection } from '@/components/RateSection';

const DEFAULT_COMPARISON_STATE: ComparisonState = {
  amount: 100000,
  months: 12,
  liquidityFilter: 'all',
  payoutFilter: 'all',
  includePdicOnly: false,
};

interface BankingRateDeskProps {
  rates: RateProduct[];
}

export function BankingRateDesk({ rates }: BankingRateDeskProps) {
  const [comparisonState, setComparisonState] = useState<ComparisonState>(DEFAULT_COMPARISON_STATE);

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

