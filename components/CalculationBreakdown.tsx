'use client';

import { ChevronDown } from 'lucide-react';
import { getCalculationBreakdown, formatPHP, formatRate } from '@/utils/yieldEngine';
import { RateProduct } from '@/types';

interface CalculationScenarioCardProps {
  label: string;
  taxLabel: string;
  lines: ReturnType<typeof getCalculationBreakdown>['primary']['lines'];
  effectiveRate: number;
  projectedReturn: number;
}

function CalculationScenarioCard({
  label,
  taxLabel,
  lines,
  effectiveRate,
  projectedReturn,
}: CalculationScenarioCardProps) {
  return (
    <div className="rounded-xl border border-brand-border/60 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
          {label}
        </div>
        <div className="text-[11px] text-brand-textSecondary dark:text-gray-500">
          {taxLabel}
        </div>
      </div>

      <div className="space-y-2">
        {lines.map((line) => (
          <div
            key={`${line.label}-${line.amount}-${line.grossRate}`}
            className="rounded-lg bg-brand-surface/70 px-3 py-2 text-[12px] dark:bg-slate-950"
          >
            <div className="font-medium text-brand-textPrimary dark:text-gray-200">{line.label}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-brand-textSecondary dark:text-gray-400">
              <span>Deposit slice: {formatPHP(line.amount)}</span>
              <span>Gross rate: {formatRate(line.grossRate)}</span>
              <span>After tax: {formatRate(line.afterTaxRate)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 border-t border-brand-border/50 pt-3 text-[12px] dark:border-white/10 sm:grid-cols-2">
        <div>
          <div className="text-brand-textSecondary dark:text-gray-500">Effective after-tax rate</div>
          <div className="text-sm font-bold text-brand-textPrimary dark:text-gray-100">{formatRate(effectiveRate)}</div>
        </div>
        <div>
          <div className="text-brand-textSecondary dark:text-gray-500">Projected return</div>
          <div className="text-sm font-bold text-positive">+{formatPHP(projectedReturn)}</div>
        </div>
      </div>
    </div>
  );
}

interface CalculationBreakdownDetailsProps {
  amount: number;
  months: number;
  product: RateProduct;
  defaultOpen?: boolean;
}

export function CalculationBreakdownDetails({
  amount,
  months,
  product,
  defaultOpen = false,
}: CalculationBreakdownDetailsProps) {
  const breakdown = getCalculationBreakdown(amount, product, months);

  return (
    <details
      className="rounded-xl border border-brand-border/60 bg-brand-primaryLight/20 p-3 dark:border-white/10 dark:bg-slate-950"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-semibold text-brand-primary dark:text-blue-400">
        <span>How this is calculated</span>
        <ChevronDown className="h-4 w-4" />
      </summary>
      <div className="mt-3 space-y-3">
        <div className="text-[12px] text-brand-textSecondary dark:text-gray-400">
          Deposit used: <span className="font-semibold text-brand-textPrimary dark:text-gray-100">{formatPHP(breakdown.amount)}</span>
          {' '}over {breakdown.months} month{breakdown.months > 1 ? 's' : ''}
        </div>
        <CalculationScenarioCard {...breakdown.primary} />
        {breakdown.base && <CalculationScenarioCard {...breakdown.base} />}
      </div>
    </details>
  );
}
