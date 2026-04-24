'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calculator,
  ChevronDown,
  Info,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ComparisonState, RateProduct } from '@/types';
import { Input } from '@/components/ui/input';
import { AffiliateButton } from '@/components/AffiliateButton';
import { trackAffiliateProviderExpanded } from '@/lib/affiliate-analytics';
import {
  formatPHP,
  formatRate,
} from '@/utils/yieldEngine';
import { computeDualScenario } from '@/utils/yieldEngine';
import { resolveLogoSrc } from '@/lib/logo';
import { CalculationBreakdownDetails } from '@/components/CalculationBreakdown';

interface YieldCalculatorProps {
  rates: RateProduct[];
  comparisonState: ComparisonState;
  onComparisonStateChange: (updates: Partial<ComparisonState>) => void;
}

const LINE_COLORS = ['#12B76A', '#0052FF', '#94A3B8'];

function formatLockPeriod(days: number): string {
  const months = Math.round(days / 30.4375);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;

  const years = months / 12;
  if (years % 1 === 0) return `${years} year${years !== 1 ? 's' : ''}`;

  return `${years.toFixed(1)} years`;
}

export function YieldCalculator({
  rates,
  comparisonState,
  onComparisonStateChange,
}: YieldCalculatorProps) {
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!infoOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setInfoOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [infoOpen]);

  const horizonOptions = [
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
  ];

  const filteredRates = useMemo(() => {
    let filtered = rates;

    const horizonMap: Record<number, number> = {
      3: 91,
      6: 182,
      12: 365,
      24: 730,
    };
    const horizonDays = horizonMap[comparisonState.months] || comparisonState.months * 30;
    filtered = filtered.filter((rate) => rate.lockInDays === 0 || rate.lockInDays <= horizonDays);

    if (comparisonState.liquidityFilter === 'liquid') {
      filtered = filtered.filter((rate) => rate.lockInDays === 0);
    } else if (comparisonState.liquidityFilter === 'locked') {
      filtered = filtered.filter((rate) => rate.lockInDays > 0);
    }

    if (comparisonState.payoutFilter === 'monthly') {
      filtered = filtered.filter((rate) => ['daily', 'monthly', 'quarterly'].includes(rate.payoutFrequency));
    } else if (comparisonState.payoutFilter === 'at_maturity') {
      filtered = filtered.filter((rate) => ['at_maturity', 'annually'].includes(rate.payoutFrequency));
    }

    if (comparisonState.includePdicOnly) {
      filtered = filtered.filter((rate) => rate.pdic);
    }

    return filtered;
  }, [
    comparisonState.includePdicOnly,
    comparisonState.liquidityFilter,
    comparisonState.months,
    comparisonState.payoutFilter,
    rates,
  ]);

  const topResults = useMemo(() => {
    const amount = comparisonState.amount;
    if (amount <= 0) return [];

    return filteredRates
      .map((rate) => {
        const dual = computeDualScenario(amount, rate, comparisonState.months);

        return {
          ...rate,
          projectedReturn: dual.withConditions.return,
          effectiveRate: dual.withConditions.effectiveRate,
          dual,
        };
      })
      .sort((left, right) => right.projectedReturn - left.projectedReturn)
      .slice(0, 3);
  }, [comparisonState.amount, comparisonState.months, filteredRates]);

  const chartData = useMemo(() => {
    const amount = comparisonState.amount;
    if (topResults.length === 0 || amount <= 0) return [];

    const isShortTerm = comparisonState.months <= 6;
    if (isShortTerm) {
      const totalWeeks = Math.round((comparisonState.months / 12) * 52);
      return Array.from({ length: totalWeeks + 1 }, (_, week) => {
        const t = week / 52;
        const point: Record<string, string | number> = { label: week === 0 ? 'Start' : `Week ${week}` };
        topResults.forEach((result, index) => {
          point[`result_${index}`] = Math.round(amount * result.effectiveRate * t);
        });
        return point;
      });
    }

    return Array.from({ length: comparisonState.months + 1 }, (_, month) => {
      const t = month / 12;
      const point: Record<string, string | number> = { label: month === 0 ? 'Start' : `Month ${month}` };
      topResults.forEach((result, index) => {
        point[`result_${index}`] = Math.round(amount * result.effectiveRate * t);
      });
      return point;
    });
  }, [comparisonState.amount, comparisonState.months, topResults]);

  const xAxisInterval = comparisonState.months <= 6
    ? Math.ceil(Math.round((comparisonState.months / 12) * 52) / 6)
    : Math.ceil(comparisonState.months / 6);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onComparisonStateChange({
      amount: value ? parseInt(value, 10) : 0,
    });
  };

  const liquidityHelp = (
    <div ref={infoRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Explain cash access filters"
        onClick={() => setInfoOpen((current) => !current)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-brand-textSecondary transition-colors hover:text-brand-textPrimary dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {infoOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-max max-w-[280px] -translate-x-1/2 rounded-md border border-gray-200 bg-white p-3 text-left leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100">
          <span>
            Liquid means you can take your money out anytime. Time Locked means you commit it for a fixed period before you can access it freely.
          </span>
        </div>
      )}
    </div>
  );

  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl border border-brand-border bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300 dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] lg:p-10">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-brand-primaryLight/30 blur-[80px] dark:bg-brand-primaryDark/10" />

      <div className="relative z-10 flex w-full flex-col gap-12 px-4 lg:flex-row lg:px-0">
        <div className="flex w-full flex-col justify-center lg:w-[45%]">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primaryLight/60 px-3.5 py-1.5 text-[13px] font-bold text-brand-primary shadow-[0_0_15px_rgba(0,82,255,0.15)] dark:bg-brand-primary/20 dark:text-blue-300">
            <Calculator className="h-4 w-4" />
            Savings Calculator
          </div>

          <h2 className="text-gradient-premium mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">
            See how much <br className="hidden lg:block" />you could earn.
          </h2>

          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                How much are you saving?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-brand-textSecondary dark:text-gray-400">PHP</span>
                <Input
                  type="text"
                  value={new Intl.NumberFormat('en-US').format(comparisonState.amount || 0)}
                  onChange={handleAmountChange}
                  onBlur={() => {
                    sendGAEvent({ event: 'calculator_amount_updated', value: comparisonState.amount });
                  }}
                  className="h-14 rounded-xl border-brand-border bg-brand-surface pl-16 text-xl font-bold shadow-inner focus-visible:ring-brand-primary dark:border-white/20 dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                How long can you leave it there?
              </label>
              <div className="grid grid-cols-4 gap-2 rounded-xl border border-brand-border bg-brand-surface p-1.5 dark:border-white/10 dark:bg-slate-950">
                {horizonOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onComparisonStateChange({ months: option.value });
                      sendGAEvent({ event: 'calculator_months_clicked', value: option.value });
                    }}
                    className={`rounded-lg py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                      comparisonState.months === option.value
                        ? 'border border-brand-border bg-white text-brand-primary shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-blue-400'
                        : 'text-brand-textSecondary hover:bg-white hover:text-brand-textPrimary dark:text-gray-500 dark:hover:bg-slate-900 dark:hover:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5 border-t border-brand-border pt-4 dark:border-white/10">
              <div>
                <div className="mb-2.5 flex items-center gap-1.5">
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                    Cash Access
                  </label>
                  {liquidityHelp}
                </div>
                <div className="flex w-full rounded-xl border border-brand-border bg-brand-surface p-1.5 dark:border-white/10 dark:bg-slate-950 sm:w-fit">
                  <button
                    onClick={() => {
                      onComparisonStateChange({ liquidityFilter: 'all' });
                      sendGAEvent({ event: 'calculator_liquidity_clicked', filter: 'all' });
                    }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:flex-none ${
                      comparisonState.liquidityFilter === 'all'
                        ? 'border border-brand-border/50 bg-white text-brand-primary shadow-sm dark:bg-slate-800 dark:text-blue-400'
                        : 'text-brand-textSecondary hover:bg-white hover:text-brand-textPrimary dark:text-gray-500 dark:hover:bg-slate-900 dark:hover:text-gray-300'
                    }`}
                  >
                    All Options
                  </button>
                  <button
                    onClick={() => {
                      onComparisonStateChange({ liquidityFilter: 'liquid' });
                      sendGAEvent({ event: 'calculator_liquidity_clicked', filter: 'liquid' });
                    }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:flex-none ${
                      comparisonState.liquidityFilter === 'liquid'
                        ? 'border border-brand-border/50 bg-white text-brand-primary shadow-sm dark:bg-slate-800 dark:text-blue-400'
                        : 'text-brand-textSecondary hover:bg-white hover:text-brand-textPrimary dark:text-gray-500 dark:hover:bg-slate-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Liquid Only
                  </button>
                  <button
                    onClick={() => {
                      onComparisonStateChange({ liquidityFilter: 'locked' });
                      sendGAEvent({ event: 'calculator_liquidity_clicked', filter: 'locked' });
                    }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:flex-none ${
                      comparisonState.liquidityFilter === 'locked'
                        ? 'border border-brand-border/50 bg-white text-brand-primary shadow-sm dark:bg-slate-800 dark:text-blue-400'
                        : 'text-brand-textSecondary hover:bg-white hover:text-brand-textPrimary dark:text-gray-500 dark:hover:bg-slate-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Time Locked
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center lg:w-[55%]">
          <div className="flex h-full flex-col rounded-2xl border border-brand-border bg-[#F8F9FB] p-6 dark:border-white/10 dark:bg-slate-950 lg:p-8">
            <div className="mb-4 flex flex-col gap-3 border-b border-brand-border/60 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] font-bold uppercase tracking-widest text-brand-textSecondary dark:text-gray-400">
                Estimated After-Tax Earnings
              </span>
            </div>

            {hasMounted && topResults.length > 0 && chartData.length > 0 && (
              <div className="mb-6 h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={180} minWidth={0}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#888' }}
                      dy={8}
                      interval={xAxisInterval}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₱${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                      tick={{ fontSize: 11, fill: '#888' }}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      formatter={(value) => typeof value === 'number' ? formatPHP(value) : 'N/A'}
                    />
                    {topResults.map((result, index) => (
                      <Line
                        key={result.id}
                        type="monotone"
                        dataKey={`result_${index}`}
                        name={result.provider}
                        stroke={LINE_COLORS[index]}
                        strokeWidth={index === 0 ? 2.5 : 2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex flex-1 flex-col justify-center gap-6">
              <AnimatePresence mode="popLayout">
                {topResults.map((result, index) => {
                  const maxReturn = topResults[0] ? topResults[0].projectedReturn : 1;
                  const percentage = Math.max((result.projectedReturn / maxReturn) * 100, 2);

                  let badgeElement = null;
                  if (index > 0 && topResults[0].projectedReturn > 0) {
                    const disadvantage = ((result.projectedReturn - topResults[0].projectedReturn) / Math.abs(topResults[0].projectedReturn)) * 100;
                    if (disadvantage < 0) {
                      badgeElement = (
                        <span className="ml-2 inline-flex items-center rounded border border-red-200 bg-red-100/80 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
                          {disadvantage.toFixed(0)}% vs top
                        </span>
                      );
                    }
                  }

                  const conditionBadge = result.dual.hasConditions ? (
                    <span className="ml-1 inline-flex items-center rounded border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-400">
                      <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                      Conditions
                    </span>
                  ) : null;

                  const lockBadge = result.lockInDays > 0 ? (
                    <span className="ml-1 inline-flex items-center rounded border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-400">
                      <Lock className="mr-0.5 h-2.5 w-2.5" />
                      Locked {formatLockPeriod(result.lockInDays)}
                    </span>
                  ) : null;

                  return (
                    <motion.div
                      layout
                      key={result.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="relative"
                    >
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                            index === 0 ? 'bg-[#FFD700]' : index === 1 ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white">
                            <img src={resolveLogoSrc(result.logo)} alt={result.provider} className="h-7 w-7 object-contain" />
                          </div>
                          <span className="text-[16px] font-bold text-brand-textPrimary dark:text-gray-100">{result.provider}</span>
                          <span className="ml-1 text-[14px] font-semibold text-brand-textSecondary dark:text-gray-400">{result.name}</span>
                          {badgeElement}
                          {conditionBadge}
                          {lockBadge}
                        </div>
                        <div className="text-right">
                          <span className="text-[16px] font-extrabold tabular-nums text-brand-textPrimary dark:text-gray-100">
                            +{formatPHP(result.projectedReturn)}
                          </span>
                          <span className="ml-2 text-[14px] font-bold text-brand-textSecondary dark:text-gray-500">
                            {formatRate(result.effectiveRate)}
                          </span>
                        </div>
                      </div>

                      {result.dual.hasConditions && result.dual.conditionBoost > 0 && (
                        <div className="mb-2 flex items-center gap-2 text-[11px]">
                          <span className="text-brand-textSecondary dark:text-gray-500">
                            Without conditions:{' '}
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {formatPHP(result.dual.withoutConditions.return)}
                            </span>{' '}
                            ({formatRate(result.dual.withoutConditions.effectiveRate)})
                          </span>
                        </div>
                      )}

                      <div className="flex h-4 w-full overflow-hidden rounded-full bg-brand-border/50 shadow-inner dark:bg-white/5">
                        <motion.div
                          className={`h-full rounded-full shadow-sm ${
                            index === 0 ? 'bg-positive/90 dark:bg-positive' : index === 1 ? 'bg-brand-primary' : 'bg-brand-textSecondary/70'
                          }`}
                          initial={{ width: '0%' }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
                        />
                      </div>

                      <button
                        onClick={() => {
                          const isExpanding = expandedResultId !== result.id;
                          setExpandedResultId(isExpanding ? result.id : null);
                          if (isExpanding) {
                            if (result.category === 'banks') {
                              trackAffiliateProviderExpanded(result.provider, 'yield_calculator');
                            }
                            sendGAEvent({ event: 'calculator_more_info_clicked', bank: result.provider });
                          }
                        }}
                        className="group/detail mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-2 text-[13px] font-bold text-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary hover:text-white hover:shadow-md hover:shadow-brand-primary/20 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white"
                        aria-expanded={expandedResultId === result.id}
                        aria-label={`Click for more info about ${result.provider}`}
                      >
                        <Info className="h-4 w-4" />
                        <span>Click for more info</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedResultId === result.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedResultId === result.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 space-y-3 rounded-xl border border-brand-border/60 bg-white p-3.5 shadow-inner dark:border-white/10 dark:bg-slate-900">
                              <div>
                                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                                  Rate Tiers (After Tax)
                                </h4>
                                <div className="space-y-1.5">
                                  {result.tiers.map((tier, tierIndex) => (
                                    <div key={tierIndex} className="flex items-center justify-between text-[14px]">
                                      <span className="font-medium text-brand-textSecondary dark:text-gray-400">
                                        {tier.maxBalance !== null
                                          ? `₱${tier.minBalance.toLocaleString()} - ₱${tier.maxBalance.toLocaleString()}`
                                          : `₱${tier.minBalance.toLocaleString()}+`}
                                      </span>
                                      <span className="font-bold tabular-nums text-brand-textPrimary dark:text-gray-200">
                                        {formatRate(tier.afterTaxRate)}
                                        <span className="ml-1.5 font-normal text-brand-textSecondary dark:text-gray-500">
                                          ({formatRate(tier.grossRate)} gross)
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {result.conditions.length > 0 && result.conditions.some((condition) => condition.type !== 'none') && (
                                <div className="border-t border-brand-border/40 pt-2 dark:border-white/5">
                                  <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                                    Conditions to Qualify
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {result.conditions.filter((condition) => condition.type !== 'none').map((condition, conditionIndex) => (
                                      <li key={conditionIndex} className="flex items-start gap-2 text-[13px] leading-relaxed text-brand-textPrimary dark:text-gray-300">
                                        <span className="mt-0.5 shrink-0 text-amber-500">-</span>
                                        <span>
                                          {condition.description}
                                          {condition.expiresAt && (
                                            <span className="ml-1 text-[11px] font-semibold text-red-500">(Expires {condition.expiresAt})</span>
                                          )}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {(result.conditions.length === 0 || result.conditions.every((condition) => condition.type === 'none')) && result.tiers.length <= 1 && (
                                <p className="flex items-center gap-1.5 text-[13px] font-medium text-positive">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  No conditions. Flat rate applies to any deposit amount.
                                </p>
                              )}

                              <div className="flex flex-wrap gap-3 border-t border-brand-border/40 pt-2 text-[11px] text-brand-textSecondary dark:border-white/5 dark:text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  {result.lockInDays === 0 ? 'Liquid - withdraw anytime' : `${formatLockPeriod(result.lockInDays)} lock-in`}
                                </span>
                                {result.pdic && (
                                  <span className="flex items-center gap-1 font-medium text-positive">
                                    <ShieldCheck className="h-3 w-3" /> PDIC Insured
                                  </span>
                                )}
                              </div>

                              <CalculationBreakdownDetails
                                amount={comparisonState.amount}
                                months={comparisonState.months}
                                product={result}
                              />

                              <div className="border-t border-brand-border/40 pt-2 dark:border-white/5">
                                <AffiliateButton
                                  amount={result.payoutAmount}
                                  productId={result.id}
                                  provider={result.provider}
                                  category={result.category}
                                  placement="yield_calculator"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {topResults.length === 0 && (
                <div className="py-12 text-center text-brand-textSecondary dark:text-gray-500">
                  Enter an amount greater than 0 to compare bank options.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
