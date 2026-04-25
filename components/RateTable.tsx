'use client';
/* eslint-disable @next/next/no-img-element -- local logo tiles are fixed-size decorative assets */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Lock,
  ShieldCheck,
  Trophy,
  Wallet,
} from 'lucide-react';
import { RateProduct } from '@/types';
import { AffiliateButton } from './AffiliateButton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { trackAffiliateProviderExpanded } from '@/lib/affiliate-analytics';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { computeEffectiveGrossRate, computeEffectiveRate, computeReturn, formatPHP, formatRate } from '@/utils/yieldEngine';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';
import { resolveLogoSrc } from '@/lib/logo';
import { CalculationBreakdownDetails } from '@/components/CalculationBreakdown';

function formatLockIn(days: number): string {
  if (days === 0) return 'Withdraw Anytime';

  const months = Math.round(days / 30.4375);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;

  const years = months / 12;
  if (years % 1 === 0) return `${years} year${years !== 1 ? 's' : ''}`;

  return `${years.toFixed(1)} years`;
}

function formatLockLabel(days: number, verbose = false): string {
  if (days === 0) return 'Withdraw Anytime';
  const prefix = verbose ? 'Time Locked for ' : 'Locked ';
  return `${prefix}${formatLockIn(days)}`;
}

function formatPayoutFrequency(freq: RateProduct['payoutFrequency']): string {
  switch (freq) {
    case 'daily':
      return 'Daily';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'annually':
      return 'Annually';
    case 'at_maturity':
      return 'At Maturity';
    default:
      return freq;
  }
}

function InsurerBadge({ insurer }: { insurer: string }) {
  if (insurer === 'PDIC') {
    return (
      <span className="glow-pdic inline-flex items-center rounded-full border border-positive/20 bg-positive/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-positive">
        <div className="mr-1.5 relative flex h-1.5 w-1.5">
          <span className="animate-pulse-status absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive"></span>
        </div>
        PDIC
      </span>
    );
  }

  if (insurer === 'Bureau of Treasury' || insurer === 'Pag-IBIG Fund') {
    const label = insurer === 'Bureau of Treasury' ? 'BTr' : 'Pag-IBIG';
    return (
      <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        <Building2 className="mr-0.5 h-3 w-3" /> {label}
      </span>
    );
  }

  return (
    <span className="text-[11px] font-medium text-brand-textSecondary dark:text-gray-500">Not Insured</span>
  );
}

function LockBadge({ days, verbose = false }: { days: number; verbose?: boolean }) {
  if (days === 0) {
    return <span className="text-[13px] font-medium text-brand-textSecondary dark:text-gray-400">Withdraw Anytime</span>;
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-500/30 bg-amber-50 py-0 text-[11px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
    >
      <Lock className="mr-0.5 h-3 w-3" /> {formatLockLabel(days, verbose)}
    </Badge>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="glow-rank-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-amber-500 text-[12px] font-bold text-white shadow-md ring-2 ring-white/50">
        <Trophy className="h-4 w-4" />
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-[11px] font-bold text-white shadow-sm">
        2
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-[11px] font-bold text-white shadow-sm">
        3
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-brand-textSecondary dark:bg-slate-800 dark:text-gray-500">
      {rank}
    </span>
  );
}

type SortCol = 'provider' | 'rate' | 'effective' | 'return' | null;

interface BankGroup {
  provider: string;
  logo: string;
  bestProduct: RateProduct;
  bestEffectiveRate: number;
  bestReturn: number;
  products: Array<RateProduct & { effectiveRate: number; projectedReturn: number }>;
  insurer: string;
}

interface RateTableProps {
  rates: RateProduct[];
  amount: number;
  months: number;
  onAmountChange: (amount: number) => void;
  onMonthsChange: (months: number) => void;
  recommendedIds?: string[];
}

function SortIcon({
  col,
  sortCol,
  sortDir,
}: {
  col: SortCol;
  sortCol: SortCol;
  sortDir: 'asc' | 'desc';
}) {
  if (sortCol !== col) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;

  return sortDir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-brand-primary" />
    : <ChevronDown className="h-3.5 w-3.5 text-brand-primary" />;
}

export function RateTable({
  rates,
  amount,
  months,
  onAmountChange,
  recommendedIds = [],
}: RateTableProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showGross, setShowGross] = useState(false);

  const numAmount = amount || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onAmountChange(value ? parseInt(value, 10) : 0);
  };

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortCol(col);
    setSortDir(col === 'provider' ? 'asc' : 'desc');
  }

  const bankGroups: BankGroup[] = useMemo(() => {
    const groupMap = new Map<string, RateProduct[]>();

    for (const rate of rates) {
      const existing = groupMap.get(rate.provider) || [];
      existing.push(rate);
      groupMap.set(rate.provider, existing);
    }

    const groups: BankGroup[] = [];
    for (const [provider, products] of groupMap) {
      const enriched = products.map((product) => {
        const effectiveRate = computeEffectiveRate(numAmount, product);
        const projectedReturn = computeReturn(numAmount, product, months);
        return { ...product, effectiveRate, projectedReturn };
      });

      enriched.sort((left, right) => right.effectiveRate - left.effectiveRate);

      const best = enriched[0];
      groups.push({
        provider,
        logo: best.logo,
        bestProduct: best,
        bestEffectiveRate: best.effectiveRate,
        bestReturn: best.projectedReturn,
        products: enriched,
        insurer: best.insurer,
      });
    }

    groups.sort((left, right) => right.bestEffectiveRate - left.bestEffectiveRate);

    if (sortCol === 'provider') {
      groups.sort((left, right) => sortDir === 'asc'
        ? left.provider.localeCompare(right.provider)
        : right.provider.localeCompare(left.provider));
    } else if (sortCol === 'rate') {
      groups.sort((left, right) => sortDir === 'asc'
        ? left.bestProduct.headlineRate - right.bestProduct.headlineRate
        : right.bestProduct.headlineRate - left.bestProduct.headlineRate);
    } else if (sortCol === 'effective') {
      groups.sort((left, right) => sortDir === 'asc'
        ? left.bestEffectiveRate - right.bestEffectiveRate
        : right.bestEffectiveRate - left.bestEffectiveRate);
    } else if (sortCol === 'return') {
      groups.sort((left, right) => sortDir === 'asc'
        ? left.bestReturn - right.bestReturn
        : right.bestReturn - left.bestReturn);
    }

    return groups;
  }, [months, numAmount, rates, sortCol, sortDir]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12 hidden overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-slate-900 md:block"
    >
      <div className="border-b border-brand-border bg-gradient-to-r from-brand-primary/5 via-brand-primaryLight/40 to-brand-primary/5 px-6 py-5 dark:border-white/10 dark:from-blue-950/40 dark:via-slate-900 dark:to-blue-950/40">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex min-w-[280px] flex-1 items-center gap-3">
            <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-brand-textSecondary dark:text-gray-400">
              <Wallet className="h-4 w-4 text-brand-primary" />
              Your deposit:
            </div>
            <div className="relative max-w-[220px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-brand-textSecondary dark:text-gray-400">PHP</span>
              <Input
                type="text"
                value={new Intl.NumberFormat('en-US').format(numAmount)}
                onChange={handleAmountChange}
                className="h-10 rounded-lg border-brand-border bg-white pl-12 text-base font-bold shadow-inner focus-visible:ring-brand-primary dark:border-white/20 dark:bg-slate-950"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400">View:</span>
            <div className="flex rounded-lg border border-brand-border bg-white p-1 dark:border-white/10 dark:bg-slate-950">
              <button
                onClick={() => setShowGross(false)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  !showGross
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-textSecondary hover:bg-brand-surface dark:text-gray-500'
                }`}
              >
                After-tax return
              </button>
              <button
                onClick={() => setShowGross(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  showGross
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-textSecondary hover:bg-brand-surface dark:text-gray-500'
                }`}
              >
                Gross vs Net
              </button>
            </div>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse text-left">
        <thead className="border-b border-brand-border bg-[#F9FAFB] text-[12px] font-semibold uppercase tracking-wider text-brand-textSecondary transition-colors duration-300 dark:border-white/10 dark:bg-slate-950 dark:text-gray-400">
          <tr>
            <th className="w-12 p-4 py-3.5 font-semibold" />
            <th className="p-4 py-3.5 font-semibold">
              <button
                onClick={() => handleSort('provider')}
                className="inline-flex items-center gap-1 transition-colors hover:text-brand-textPrimary dark:hover:text-gray-200"
              >
                Bank / Provider <SortIcon col="provider" sortCol={sortCol} sortDir={sortDir} />
              </button>
            </th>
            {showGross && (
              <th className="p-4 py-3.5 text-right font-semibold">
                <button
                  onClick={() => handleSort('rate')}
                  className="ml-auto inline-flex items-center gap-1 transition-colors hover:text-brand-textPrimary dark:hover:text-gray-200"
                >
                  Marketed Rate <SortIcon col="rate" sortCol={sortCol} sortDir={sortDir} />
                </button>
              </th>
            )}
            <th className="p-4 py-3.5 text-right font-semibold">
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <button
                        onClick={() => handleSort('effective')}
                        className="ml-auto inline-flex items-center gap-1 transition-colors hover:text-brand-textPrimary dark:hover:text-gray-200"
                      />
                    )}
                  >
                    After-tax return
                    <AlertCircle className="h-3.5 w-3.5 text-brand-textSecondary/70 dark:text-gray-400" />
                    <SortIcon col="effective" sortCol={sortCol} sortDir={sortDir} />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[300px] border border-gray-200 bg-white p-3 text-left text-sm font-normal leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100"
                  >
                    <p>
                      Your after-tax return is what you actually keep on ₱{numAmount.toLocaleString()}
                      {' '}after the 20% Final Withholding Tax is applied.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="p-4 py-3.5 text-right font-semibold">
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <button
                        onClick={() => handleSort('return')}
                        className="ml-auto inline-flex items-center gap-1 transition-colors hover:text-brand-textPrimary dark:hover:text-gray-200"
                      />
                    )}
                  >
                    Projected Return
                    <SortIcon col="return" sortCol={sortCol} sortDir={sortDir} />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[280px] border border-gray-200 bg-white p-3 text-left text-sm font-normal leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100"
                  >
                    <p>
                      How much interest you&apos;d earn on PHP {numAmount.toLocaleString()} over {months} month{months > 1 ? 's' : ''}, after tax.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="p-4 py-3.5 text-center font-semibold">Deposit Locked</th>
            <th className="p-4 py-3.5 text-center font-semibold">Interest Paid</th>
            <th className="p-4 py-3.5 text-center font-semibold">Insured By</th>
            <th className="w-12 p-4 py-3.5 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border dark:divide-white/10">
          {bankGroups.map((group, groupIndex) => {
            const isExpanded = expandedProvider === group.provider;
            const best = group.bestProduct;
            const headlineGross = computeEffectiveGrossRate(numAmount, best);
            const isRecommended = group.products.some((product) => recommendedIds.includes(product.id));

            return (
              <React.Fragment key={group.provider}>
                <tr
                  onClick={() => {
                    const nextProvider = isExpanded ? null : group.provider;
                    setExpandedProvider(nextProvider);
                    if (nextProvider && group.bestProduct.category === 'banks') {
                      trackAffiliateProviderExpanded(group.provider, 'rate_table_expanded');
                    }
                  }}
                  className={`group h-[72px] cursor-pointer transition-colors ${
                    isExpanded
                      ? 'bg-brand-primaryLight/30 dark:bg-blue-950/20'
                      : 'hover:bg-brand-surface dark:hover:bg-slate-800'
                  } ${groupIndex < 3 ? 'border-l-2 border-l-transparent' : ''}`}
                  style={
                    groupIndex === 0 ? { borderLeftColor: '#FFD700' }
                      : groupIndex === 1 ? { borderLeftColor: '#C0C0C0' }
                        : groupIndex === 2 ? { borderLeftColor: '#CD7F32' }
                          : {}
                  }
                >
                  <td className="pl-4 pr-1">
                    <RankBadge rank={groupIndex + 1} />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white">
                        {group.logo ? (
                          <img src={resolveLogoSrc(group.logo)} alt={group.provider} className="h-7 w-7 object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-primary/10 font-bold text-brand-primary text-base">
                            {group.provider.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[16px] font-bold leading-tight text-brand-textPrimary dark:text-gray-100">{group.provider}</span>
                          {group.products[0].category === 'defi' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              <div className="relative flex h-1.5 w-1.5">
                                <span className="animate-pulse-status-blue absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              </div>
                              LIVE
                            </span>
                          )}
                          {isRecommended && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-brand-primary">
                              ★ Quick Match
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[13px] font-medium text-brand-textSecondary dark:text-gray-500">
                          {group.products.length} product{group.products.length > 1 ? 's' : ''} compared
                        </div>
                      </div>
                    </div>
                  </td>

                  {showGross && (
                    <td className="p-4 text-right">
                      <div className="text-[15px] font-semibold tabular-nums text-brand-textPrimary dark:text-gray-100">
                        {(headlineGross * 100).toFixed(2)}%
                      </div>
                      <div className="mt-0.5 text-[11px] text-brand-textSecondary dark:text-gray-500">gross</div>
                    </td>
                  )}

                  <td className="p-4 text-right">
                    <div className={`text-[18px] font-bold tabular-nums ${groupIndex === 0 ? 'text-positive' : 'text-brand-textPrimary dark:text-gray-100'}`}>
                      {formatRate(group.bestEffectiveRate)}
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium text-positive">
                      {showGross ? 'net return' : 'net'}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    {numAmount > 0 ? (
                      <>
                        <div className="text-[16px] font-bold tabular-nums text-brand-textPrimary dark:text-gray-100">
                          +{formatPHP(group.bestReturn)}
                        </div>
                        <div className="mt-0.5 text-[12px] font-medium text-brand-textSecondary dark:text-gray-500">
                          in {months} month{months !== 1 ? 's' : ''}
                        </div>
                      </>
                    ) : (
                      <span className="text-[13px] text-brand-textSecondary dark:text-gray-500">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <LockBadge days={best.lockInDays} />
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[12px] font-medium text-brand-textSecondary dark:text-gray-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatPayoutFrequency(best.payoutFrequency)}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <InsurerBadge insurer={group.insurer} />
                  </td>

                  <td className="pr-4">
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                        isExpanded
                          ? 'border-brand-primary/20 bg-brand-primary text-white shadow-sm shadow-brand-primary/20 dark:bg-blue-500'
                          : 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary hover:-translate-y-0.5 hover:bg-brand-primary hover:text-white hover:shadow-md hover:shadow-brand-primary/20 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white'
                      }`}
                      aria-label={`Expand ${group.provider} products`}
                    >
                      <span>{isExpanded ? 'Hide' : 'More'}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                </tr>

                <AnimatePresence>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-brand-border/40 bg-[#F8FAFB] dark:border-white/5 dark:bg-slate-950/60">
                            {group.products.map((product, productIndex) => {
                              const isBest = productIndex === 0;
                              const tierCount = product.tiers.length;
                              const hasConditions = product.conditions.length > 0 && product.conditions.some((condition) => condition.type !== 'none');

                              return (
                                <div
                                  key={product.id}
                                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                                    productIndex < group.products.length - 1 ? 'border-b border-brand-border/30 dark:border-white/5' : ''
                                  } ${isBest ? 'bg-positive/5 dark:bg-positive/5' : 'hover:bg-white/60 dark:hover:bg-slate-900/40'}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[14px] font-semibold text-brand-textPrimary dark:text-gray-100">
                                        {product.name}
                                      </span>
                                      {isBest && (
                                        <Badge className="border-positive/20 bg-positive/10 py-1 px-2 text-[11px] font-bold text-positive shadow-none">
                                          Best for PHP {numAmount.toLocaleString()}
                                        </Badge>
                                      )}
                                      <LockBadge days={product.lockInDays} verbose />
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-textSecondary dark:text-gray-500">
                                        <Calendar className="h-3 w-3 shrink-0" />
                                        Interest Paid: {formatPayoutFrequency(product.payoutFrequency)}
                                      </span>
                                      {product.limits?.maxDepositPerProduct && (
                                        <Badge variant="outline" className="border-blue-400/30 bg-blue-50 py-0 text-[10px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                                          Max ₱{product.limits.maxDepositPerProduct.toLocaleString()} per Time Deposit
                                        </Badge>
                                      )}
                                    </div>

                                    {tierCount > 1 && (
                                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                        {product.tiers.map((tier, tierIndex) => {
                                          const tierAfterTax = product.taxExempt
                                            ? calcTaxExempt(tier.grossRate)
                                            : calcAfterTaxPhp(tier.grossRate);
                                          const isLastTier = tierIndex === product.tiers.length - 1;
                                          const isActiveThreshold = product.tierType === 'threshold'
                                            && numAmount >= tier.minBalance
                                            && (tier.maxBalance === null || numAmount <= tier.maxBalance || (isLastTier && numAmount >= tier.minBalance));

                                          return (
                                            <span
                                              key={tierIndex}
                                              className={`text-[12px] tabular-nums ${
                                                isActiveThreshold
                                                  ? 'font-bold text-positive'
                                                  : 'text-brand-textSecondary dark:text-gray-500'
                                              }`}
                                            >
                                              {tier.maxBalance !== null
                                                ? `PHP ${tier.minBalance.toLocaleString()}-PHP ${tier.maxBalance.toLocaleString()}`
                                                : `PHP ${tier.minBalance.toLocaleString()}+`}
                                              : {(tier.grossRate * 100).toFixed(1)}%{' '}
                                              <span className="text-[11px]">→ {(tierAfterTax * 100).toFixed(2)}%</span>
                                              {isActiveThreshold && <span className="ml-1 text-[10px]">✓ your tier</span>}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {hasConditions && (
                                      <div className="mt-1.5 flex items-start gap-1.5 rounded-md border border-red-200/60 bg-red-50 px-2 py-1 dark:border-red-800/30 dark:bg-red-950/20">
                                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                                        <span className="text-[11px] font-semibold leading-snug text-red-700 dark:text-red-400">
                                          Rate requires conditions: {product.conditions.filter((condition) => condition.type !== 'none').map((condition) => condition.description).join('; ')}
                                        </span>
                                      </div>
                                    )}

                                    {!hasConditions && tierCount <= 1 && !product.limits && (
                                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-positive">
                                        <ShieldCheck className="h-3 w-3" /> No conditions - flat rate on any amount
                                      </p>
                                    )}

                                    {numAmount > 0 && (
                                      <div className="mt-3 max-w-[520px]">
                                        <CalculationBreakdownDetails
                                          amount={numAmount}
                                          months={months}
                                          product={product}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-[160px] shrink-0 text-right">
                                    <div className="text-[16px] font-bold tabular-nums text-brand-textPrimary dark:text-gray-100">
                                      {formatRate(product.effectiveRate)}
                                      <span className="ml-1 text-[11px] font-medium text-brand-textSecondary dark:text-gray-500">
                                        net return
                                      </span>
                                    </div>
                                    {numAmount > 0 && (
                                      <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-positive">
                                        +{formatPHP(product.projectedReturn)}
                                        <span className="ml-1 text-[11px] font-normal text-brand-textSecondary dark:text-gray-500">
                                          / {months} month{months !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
                                    <AffiliateButton
                                      amount={product.payoutAmount}
                                      productId={product.id}
                                      provider={product.provider}
                                      category={product.category}
                                      placement="rate_table_expanded"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
          {bankGroups.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-brand-textSecondary dark:text-gray-400">
                No rates found for this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
