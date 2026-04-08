'use client';

import { useCallback, useState } from 'react';
import { ComparisonState, RateProduct } from '@/types';
import { YieldCalculator } from '@/components/YieldCalculator';

interface CalculatorPageClientProps {
  rates: RateProduct[];
}

const DEFAULT_COMPARISON_STATE: ComparisonState = {
  amount: 100000,
  months: 12,
  liquidityFilter: 'all',
  payoutFilter: 'all',
  includePdicOnly: false,
};

export function CalculatorPageClient({ rates }: CalculatorPageClientProps) {
  const [comparisonState, setComparisonState] = useState<ComparisonState>(DEFAULT_COMPARISON_STATE);

  const handleComparisonStateChange = useCallback((updates: Partial<ComparisonState>) => {
    setComparisonState((current) => ({
      ...current,
      ...updates,
    }));
  }, []);

  return (
    <YieldCalculator
      rates={rates}
      comparisonState={comparisonState}
      onComparisonStateChange={handleComparisonStateChange}
    />
  );
}
