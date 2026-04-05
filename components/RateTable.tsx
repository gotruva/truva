'use client';

import React, { useState, useMemo } from 'react';
import { RateProduct } from '@/types';
import { AffiliateButton } from './AffiliateButton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, ShieldCheck, ChevronDown, AlertTriangle, Calendar, Lock, Building2, Wallet, Trophy, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeEffectiveRate, computeReturn, formatRate, formatPHP } from '@/utils/yieldEngine';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';
import { resolveLogoSrc } from '@/lib/logo';

/* ─── Helpers ─── */

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
    case 'daily': return 'Daily';
    case 'monthly': return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'annually': return 'Annually';
    case 'at_maturity': return 'At Maturity';
  }
}

function InsurerBadge({ insurer }: { insurer: string }) {
  if (insurer === 'PDIC') {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold text-positive uppercase tracking-wide">
        <ShieldCheck className="w-3 h-3 mr-0.5" /> PDIC
      </span>
    );
  }
  if (insurer === 'Bureau of Treasury' || insurer === 'Pag-IBIG Fund') {
    const label = insurer === 'Bureau of Treasury' ? 'BTr' : 'Pag-IBIG';
    return (
      <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
        <Building2 className="w-3 h-3 mr-0.5" /> {label}
      </span>
    );
  }
  return (
    <span className="text-[11px] text-brand-textSecondary dark:text-gray-500 font-medium">Not Insured</span>
  );
}

function LockBadge({ days, verbose = false }: { days: number; verbose?: boolean }) {
  if (days === 0) {
    return <span className="text-[13px] text-brand-textSecondary dark:text-gray-400 font-medium">Withdraw Anytime</span>;
  }
  return (
    <Badge variant="outline" className="text-[11px] font-bold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 py-0">
      <Lock className="w-3 h-3 mr-0.5" /> {formatLockLabel(days, verbose)}
    </Badge>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-yellow-400 to-amber-500 shadow-sm"><Trophy className="w-3.5 h-3.5" /></span>;
  if (rank === 2) return <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-gray-300 to-gray-400 shadow-sm">2</span>;
  if (rank === 3) return <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-amber-600 to-amber-700 shadow-sm">3</span>;
  return <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-brand-textSecondary dark:text-gray-500 bg-gray-100 dark:bg-slate-800">{rank}</span>;
}

type SortCol = 'provider' | 'rate' | 'effective' | 'return' | null;

/* ─── Types ─── */

interface BankGroup {
  provider: string;
  logo: string;
  bestProduct: RateProduct;
  bestEffectiveRate: number;
  bestReturn: number;
  products: Array<RateProduct & { effectiveRate: number; projectedReturn: number }>;
  insurer: string;
}

/* ─── Component ─── */

export function RateTable({ rates, recommendedIds = [] }: { rates: RateProduct[]; recommendedIds?: string[] }) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [tableAmount, setTableAmount] = useState<string>('100000');
  const [tableMonths, setTableMonths] = useState<number>(12);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const numAmount = parseFloat(tableAmount.replace(/,/g, '')) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setTableAmount(val);
  };

  const MONTH_OPTIONS = [
    { label: '3 Mo', value: 3 },
    { label: '6 Mo', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
  ];

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'provider' ? 'asc' : 'desc');
    }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-brand-primary" />
      : <ChevronDown className="w-3.5 h-3.5 text-brand-primary" />;
  }

  // Group products by provider and find best product per bank
  const bankGroups: BankGroup[] = useMemo(() => {
    const groupMap = new Map<string, RateProduct[]>();
    for (const rate of rates) {
      const existing = groupMap.get(rate.provider) || [];
      existing.push(rate);
      groupMap.set(rate.provider, existing);
    }

    const groups: BankGroup[] = [];
    for (const [provider, products] of groupMap) {
      const enriched = products.map(p => {
        const effectiveRate = computeEffectiveRate(numAmount, p);
        const projectedReturn = computeReturn(numAmount, p, tableMonths);
        return { ...p, effectiveRate, projectedReturn };
      });

      // Sort products within group: highest effective rate first
      enriched.sort((a, b) => b.effectiveRate - a.effectiveRate);

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

    // Default sort: best effective rate descending
    groups.sort((a, b) => b.bestEffectiveRate - a.bestEffectiveRate);

    // Apply user sort
    if (sortCol === 'provider') {
      groups.sort((a, b) => sortDir === 'asc'
        ? a.provider.localeCompare(b.provider)
        : b.provider.localeCompare(a.provider));
    } else if (sortCol === 'rate') {
      groups.sort((a, b) => sortDir === 'asc'
        ? a.bestProduct.headlineRate - b.bestProduct.headlineRate
        : b.bestProduct.headlineRate - a.bestProduct.headlineRate);
    } else if (sortCol === 'effective') {
      groups.sort((a, b) => sortDir === 'asc'
        ? a.bestEffectiveRate - b.bestEffectiveRate
        : b.bestEffectiveRate - a.bestEffectiveRate);
    } else if (sortCol === 'return') {
      groups.sort((a, b) => sortDir === 'asc'
        ? a.bestReturn - b.bestReturn
        : b.bestReturn - a.bestReturn);
    }

    return groups;
  }, [rates, numAmount, tableMonths, sortCol, sortDir]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="hidden md:block rounded-xl border border-brand-border dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm mb-12 transition-colors duration-300 overflow-hidden"
    >
      {/* ─── Amount Input Bar ─── */}
      <div className="bg-gradient-to-r from-brand-primary/5 via-brand-primaryLight/40 to-brand-primary/5 dark:from-blue-950/40 dark:via-slate-900 dark:to-blue-950/40 border-b border-brand-border dark:border-white/10 px-6 py-5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary dark:text-gray-400 whitespace-nowrap">
              <Wallet className="w-4 h-4 text-brand-primary" />
              Your deposit:
            </div>
            <div className="relative max-w-[220px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-brand-textSecondary dark:text-gray-400">₱</span>
              <Input
                type="text"
                value={new Intl.NumberFormat('en-US').format(numAmount)}
                onChange={handleAmountChange}
                className="pl-7 h-10 text-base font-bold bg-white dark:bg-slate-950 border-brand-border dark:border-white/20 rounded-lg shadow-inner focus-visible:ring-brand-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400 whitespace-nowrap">Duration:</span>
            <div className="flex bg-white dark:bg-slate-950 p-1 rounded-lg border border-brand-border dark:border-white/10">
              {MONTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTableMonths(opt.value)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                    tableMonths === opt.value
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-brand-textSecondary dark:text-gray-500 hover:bg-brand-surface dark:hover:bg-slate-900 hover:text-brand-textPrimary dark:hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Table Header ─── */}
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#F9FAFB] dark:bg-slate-950 border-b border-brand-border dark:border-white/10 text-[12px] font-semibold text-brand-textSecondary dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
          <tr>
            <th className="p-4 py-3.5 font-semibold w-12"></th>
            <th className="p-4 py-3.5 font-semibold">
              <button
                onClick={() => handleSort('provider')}
                className="inline-flex items-center gap-1 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors"
              >
                Bank / Provider <SortIcon col="provider" />
              </button>
            </th>
            <th className="p-4 py-3.5 font-semibold text-right">
              <button
                onClick={() => handleSort('rate')}
                className="inline-flex items-center gap-1 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors ml-auto"
              >
                Marketed Rate <SortIcon col="rate" />
              </button>
            </th>
            <th className="p-4 py-3.5 font-semibold text-right">
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => handleSort('effective')}
                        className="inline-flex items-center gap-1 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors ml-auto"
                      />
                    }
                  >
                    After Tax Rate
                    <AlertCircle className="w-3.5 h-3.5 text-brand-textSecondary/70 dark:text-gray-400" />
                    <SortIcon col="effective" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] p-3 text-sm leading-relaxed text-left font-normal bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10 shadow-lg">
                    <p>
                      The effective after-tax rate you&apos;d actually earn on ₱{numAmount.toLocaleString()} — accounting for balance tiers and 20% withholding tax.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="p-4 py-3.5 font-semibold text-right">
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => handleSort('return')}
                        className="inline-flex items-center gap-1 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors ml-auto"
                      />
                    }
                  >
                    Projected Return
                    <SortIcon col="return" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] p-3 text-sm leading-relaxed text-left font-normal bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10 shadow-lg">
                    <p>
                      How much interest you&apos;d earn on ₱{numAmount.toLocaleString()} over {tableMonths} month{tableMonths > 1 ? 's' : ''}, after 20% tax.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="p-4 py-3.5 font-semibold text-center">Deposit Locked</th>
            <th className="p-4 py-3.5 font-semibold text-center">Interest Paid</th>
            <th className="p-4 py-3.5 font-semibold text-center">Insured By</th>
            <th className="p-4 py-3.5 font-semibold w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border dark:divide-white/10">
          {bankGroups.map((group, groupIndex) => {
            const isExpanded = expandedProvider === group.provider;
            const best = group.bestProduct;
            const headlineGross = best.headlineRate;
            const isRecommended = group.products.some(p => recommendedIds.includes(p.id));

            return (
              <React.Fragment key={group.provider}>
                {/* ─── Bank Summary Row ─── */}
                <tr
                  onClick={() => setExpandedProvider(isExpanded ? null : group.provider)}
                  className={`h-[72px] transition-colors group cursor-pointer ${
                    isExpanded
                      ? 'bg-brand-primaryLight/30 dark:bg-blue-950/20'
                      : 'hover:bg-brand-surface dark:hover:bg-slate-800'
                  } ${groupIndex < 3 ? 'border-l-2 border-l-transparent' : ''}`}
                  style={groupIndex === 0 ? { borderLeftColor: '#FFD700' } : groupIndex === 1 ? { borderLeftColor: '#C0C0C0' } : groupIndex === 2 ? { borderLeftColor: '#CD7F32' } : {}}
                >
                  {/* Rank */}
                  <td className="pl-4 pr-1">
                    <RankBadge rank={groupIndex + 1} />
                  </td>

                  {/* Bank name + logo */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        <img src={resolveLogoSrc(group.logo)} alt={group.provider} className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-brand-textPrimary dark:text-gray-100 text-[15px] leading-tight">{group.provider}</span>
                          {isRecommended && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-positive/10 text-positive border border-positive/20 whitespace-nowrap">
                              ★ Quick Match
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-brand-textSecondary dark:text-gray-500 mt-0.5">
                          {group.products.length} product{group.products.length > 1 ? 's' : ''} compared
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Best headline rate */}
                  <td className="p-4 text-right">
                    <div className="text-[15px] font-semibold tabular-nums text-brand-textPrimary dark:text-gray-100">
                      {(headlineGross * 100).toFixed(2)}%
                    </div>
                    <div className="text-[11px] text-brand-textSecondary dark:text-gray-500 mt-0.5">
                      gross
                    </div>
                  </td>

                  {/* Effective after-tax */}
                  <td className="p-4 text-right">
                    <div className={`text-[18px] font-bold tabular-nums ${groupIndex === 0 ? 'text-positive' : 'text-brand-textPrimary dark:text-gray-100'}`}>
                      {formatRate(group.bestEffectiveRate)}
                    </div>
                    <div className="text-[11px] text-positive font-medium mt-0.5">
                      after tax
                    </div>
                  </td>

                  {/* Projected return */}
                  <td className="p-4 text-right">
                    {numAmount > 0 ? (
                      <>
                        <div className="text-[15px] font-bold tabular-nums text-brand-textPrimary dark:text-gray-100">
                          +{formatPHP(group.bestReturn)}
                        </div>
                        <div className="text-[11px] text-brand-textSecondary dark:text-gray-500 mt-0.5">
                          in {tableMonths} mo
                        </div>
                      </>
                    ) : (
                      <span className="text-[13px] text-brand-textSecondary dark:text-gray-500">—</span>
                    )}
                  </td>

                  {/* Lock-in for best product */}
                  <td className="p-4 text-center">
                    <LockBadge days={best.lockInDays} />
                  </td>

                  {/* Payout frequency */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[12px] font-medium text-brand-textSecondary dark:text-gray-400">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {formatPayoutFrequency(best.payoutFrequency)}
                    </div>
                  </td>

                  {/* Insurer */}
                  <td className="p-4 text-center">
                    <InsurerBadge insurer={group.insurer} />
                  </td>

                  {/* Expand chevron */}
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
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                </tr>

                {/* ─── Expanded Product Details ─── */}
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
                          <div className="bg-[#F8FAFB] dark:bg-slate-950/60 border-t border-brand-border/40 dark:border-white/5">
                            {group.products.map((product, pIndex) => {
                              const isBest = pIndex === 0;
                              const tierCount = product.tiers.length;
                              const hasConditions = product.conditions.length > 0 && product.conditions.some(c => c.type !== 'none');
                              return (
                                <div
                                  key={product.id}
                                  className={`px-6 py-4 flex items-start gap-4 transition-colors ${
                                    pIndex < group.products.length - 1 ? 'border-b border-brand-border/30 dark:border-white/5' : ''
                                  } ${isBest ? 'bg-positive/5 dark:bg-positive/5' : 'hover:bg-white/60 dark:hover:bg-slate-900/40'}`}
                                >
                                  {/* Product info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-[14px] text-brand-textPrimary dark:text-gray-100">
                                        {product.name}
                                      </span>
                                      {isBest && (
                                        <Badge className="bg-positive/10 text-positive border-positive/20 text-[10px] font-bold py-0">
                                          Best for ₱{numAmount.toLocaleString()}
                                        </Badge>
                                      )}
                                      <LockBadge days={product.lockInDays} verbose />
                                      <span className="inline-flex items-center gap-1 text-[11px] text-brand-textSecondary dark:text-gray-500 font-medium">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        Interest Paid: {formatPayoutFrequency(product.payoutFrequency)}
                                      </span>
                                    </div>

                                    {/* Tier breakdown */}
                                    {tierCount > 1 && (
                                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                        {product.tiers.map((tier, i) => {
                                          const tierAfterTax = product.taxExempt
                                            ? calcTaxExempt(tier.grossRate)
                                            : calcAfterTaxPhp(tier.grossRate);
                                          const isLastTier = i === product.tiers.length - 1;
                                          const isActiveThreshold = product.tierType === 'threshold' &&
                                            (numAmount >= tier.minBalance && (tier.maxBalance === null || numAmount <= tier.maxBalance || (isLastTier && numAmount >= tier.minBalance)));

                                          return (
                                            <span
                                              key={i}
                                              className={`text-[12px] tabular-nums ${
                                                isActiveThreshold
                                                  ? 'text-positive font-bold'
                                                  : 'text-brand-textSecondary dark:text-gray-500'
                                              }`}
                                            >
                                              {tier.maxBalance !== null
                                                ? `₱${tier.minBalance.toLocaleString()}–₱${tier.maxBalance.toLocaleString()}`
                                                : `₱${tier.minBalance.toLocaleString()}+`
                                              }: {(tier.grossRate * 100).toFixed(1)}%{' '}
                                              <span className="text-[11px]">→ {(tierAfterTax * 100).toFixed(2)}%</span>
                                              {isActiveThreshold && <span className="ml-1 text-[10px]">✓ your tier</span>}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Conditions */}
                                    {hasConditions && (
                                      <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 px-2 py-1">
                                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                        <span className="text-[11px] text-red-700 dark:text-red-400 font-semibold leading-snug">
                                          Rate requires conditions: {product.conditions.filter(c => c.type !== 'none').map(c => c.description).join('; ')}
                                        </span>
                                      </div>
                                    )}

                                    {/* No conditions — clean message */}
                                    {!hasConditions && tierCount <= 1 && (
                                      <p className="mt-1.5 text-[11px] text-positive font-medium flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> No conditions — flat rate on any amount
                                      </p>
                                    )}
                                  </div>

                                  {/* Mini calculator result */}
                                  <div className="text-right shrink-0 min-w-[160px]">
                                    <div className="text-[16px] font-bold tabular-nums text-brand-textPrimary dark:text-gray-100">
                                      {formatRate(product.effectiveRate)}
                                      <span className="text-[11px] font-medium text-brand-textSecondary dark:text-gray-500 ml-1">after tax</span>
                                    </div>
                                    {numAmount > 0 && (
                                      <div className="text-[13px] font-semibold text-positive tabular-nums mt-0.5">
                                        +{formatPHP(product.projectedReturn)}
                                        <span className="text-[11px] font-normal text-brand-textSecondary dark:text-gray-500 ml-1">
                                          / {tableMonths}mo
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* CTA */}
                                  <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                                    <AffiliateButton amount={product.payoutAmount} url={product.affiliateUrl} />
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
