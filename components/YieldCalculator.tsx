'use client';

import { useState, useMemo } from 'react';
import { RateProduct, LiquidityFilter } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Calculator, AlertTriangle, ShieldCheck, ChevronDown, Lock, Info } from 'lucide-react';
import { AffiliateButton } from '@/components/AffiliateButton';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  computeDualScenario,
  formatPHP,
  formatRate,
} from '@/utils/yieldEngine';
import { resolveLogoSrc } from '@/lib/logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface YieldCalculatorProps {
  rates: RateProduct[];
}

const LINE_COLORS = ['#12B76A', '#0052FF', '#94A3B8'];

function formatLockPeriod(days: number): string {
  const months = Math.round(days / 30.4375);
  if (months < 12) return `${months}mo`;
  const years = months / 12;
  if (years % 1 === 0) return `${years}yr`;
  return `${years.toFixed(1)}yr`;
}

export function YieldCalculator({ rates }: YieldCalculatorProps) {
  const [amount, setAmount] = useState<string>('100000');
  const [months, setMonths] = useState<number>(12);
  const includeDefi = false;
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [liquidityFilter, setLiquidityFilter] = useState<LiquidityFilter>('all');

  const HORIZON_OPTIONS = [
    { label: '3 Mo', value: 3 },
    { label: '6 Mo', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
  ];

  const filteredRates = useMemo(() => {
    let filtered = rates;
    
    // Risk filter
    if (!includeDefi) {
      filtered = filtered.filter(r => r.category !== 'defi');
    }

    // Lock-in filter
    // Map standard durations to exact bank/bond terms (e.g. 1 Year -> 365 days)
    const horizonMap: Record<number, number> = {
      3: 91,    // covers 91-day T-bill and 90-day TDs
      6: 182,   // covers 182-day T-bill
      12: 365,  // covers 364-day T-bill and 365-day TDs
      24: 730
    };
    const horizonDays = horizonMap[months] || months * 30;
    filtered = filtered.filter(r => r.lockInDays === 0 || r.lockInDays <= horizonDays);
    
    if (liquidityFilter === 'liquid') {
      filtered = filtered.filter(r => r.lockInDays === 0);
    } else if (liquidityFilter === 'locked') {
      filtered = filtered.filter(r => r.lockInDays > 0);
    }
    
    return filtered;
  }, [rates, months, includeDefi, liquidityFilter]);

  const topResults = useMemo(() => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) return [];

    // Compute blended returns with dual-scenario
    const computed = filteredRates.map(rate => {
      const dual = computeDualScenario(numAmount, rate, months);

      return {
        ...rate,
        projectedReturn: dual.withConditions.return,
        effectiveRate: dual.withConditions.effectiveRate,
        dual,
      };
    });

    return computed.sort((a, b) => b.projectedReturn - a.projectedReturn).slice(0, 3);
  }, [filteredRates, amount, months]);

  const chartData = useMemo(() => {
    if (topResults.length === 0) return [];
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    if (numAmount <= 0) return [];

    const isShortTerm = months <= 6;
    if (isShortTerm) {
      const totalWeeks = Math.round((months / 12) * 52);
      return Array.from({ length: totalWeeks + 1 }, (_, w) => {
        const t = w / 52;
        const point: Record<string, string | number> = { label: w === 0 ? 'Start' : `Wk ${w}` };
        topResults.forEach((r, idx) => { point[`result_${idx}`] = Math.round(numAmount * r.effectiveRate * t); });
        return point;
      });
    } else {
      return Array.from({ length: months + 1 }, (_, m) => {
        const t = m / 12;
        const point: Record<string, string | number> = { label: m === 0 ? 'Start' : `Mo ${m}` };
        topResults.forEach((r, idx) => { point[`result_${idx}`] = Math.round(numAmount * r.effectiveRate * t); });
        return point;
      });
    }
  }, [topResults, amount, months]);

  const xAxisInterval = months <= 6
    ? Math.ceil(Math.round((months / 12) * 52) / 6)
    : Math.ceil(months / 6);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const liquidityHelp = (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Explain cash access filters"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-brand-textSecondary transition-colors hover:text-brand-textPrimary dark:text-gray-400 dark:hover:text-gray-100"
            />
          }
        >
          <Info className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] border border-gray-200 bg-white p-3 text-left leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100">
          <span>
            Liquid means you can take your money out anytime. Time Locked means you commit it for a fixed period before you can access it freely.
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <section className="bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-2xl p-6 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mb-12 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primaryLight/30 dark:bg-brand-primaryDark/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-12 relative z-10 w-full px-4 lg:px-0">
        
        {/* Left: Input Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primaryLight/60 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-400 text-sm font-semibold mb-6 w-fit border border-brand-primary/10">
              <Calculator className="w-4 h-4" />
              Earnings Calculator
           </div>
           
           <h2 className="text-3xl font-bold text-brand-textPrimary dark:text-gray-100 mb-8 tracking-tight">
             See exactly how much <br className="hidden lg:block"/>you could earn.
           </h2>

           <div className="space-y-8">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-brand-textSecondary dark:text-gray-400 mb-3 uppercase tracking-wider">
                  Initial Deposit
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-brand-textSecondary dark:text-gray-400">₱</span>
                  <Input 
                    type="text" 
                    value={new Intl.NumberFormat('en-US').format(parseFloat(amount) || 0)}
                    onChange={handleAmountChange}
                    className="pl-9 h-14 text-xl font-bold bg-brand-surface dark:bg-slate-950 border-brand-border dark:border-white/20 rounded-xl shadow-inner focus-visible:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Time Horizon Slider Tabs */}
              <div>
                <label className="block text-sm font-semibold text-brand-textSecondary dark:text-gray-400 mb-3 uppercase tracking-wider">
                  Investment Duration
                </label>
                <div className="grid grid-cols-4 gap-2 bg-brand-surface dark:bg-slate-950 p-1.5 rounded-xl border border-brand-border dark:border-white/10">
                   {HORIZON_OPTIONS.map(opt => (
                     <button
                       key={opt.value}
                       onClick={() => setMonths(opt.value)}
                       className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                         months === opt.value 
                          ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border dark:border-white/10' 
                          : 'text-brand-textSecondary dark:text-gray-500 hover:bg-white dark:hover:bg-slate-900 hover:text-brand-textPrimary dark:hover:text-gray-300'
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="pt-4 border-t border-brand-border dark:border-white/10 space-y-5">
                
                {/* Liquidity Toggle */}
                <div>
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                      Cash Access
                    </label>
                    {liquidityHelp}
                  </div>
                  <div className="flex bg-brand-surface dark:bg-slate-950 p-1.5 rounded-xl border border-brand-border dark:border-white/10 w-full sm:w-fit">
                    <button
                      onClick={() => setLiquidityFilter('all')}
                      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                        liquidityFilter === 'all'
                          ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border/50'
                          : 'text-brand-textSecondary hover:bg-white dark:hover:bg-slate-900 hover:text-brand-textPrimary dark:hover:text-gray-300'
                      }`}
                    >
                      All Options
                    </button>
                    <button
                      onClick={() => setLiquidityFilter('liquid')}
                      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                        liquidityFilter === 'liquid'
                          ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border/50'
                          : 'text-brand-textSecondary hover:bg-white dark:hover:bg-slate-900 hover:text-brand-textPrimary dark:hover:text-gray-300'
                      }`}
                    >
                      Liquid Only
                    </button>
                    <button
                      onClick={() => setLiquidityFilter('locked')}
                      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                        liquidityFilter === 'locked'
                          ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border/50'
                          : 'text-brand-textSecondary hover:bg-white dark:hover:bg-slate-900 hover:text-brand-textPrimary dark:hover:text-gray-300'
                      }`}
                    >
                      Time Locked
                    </button>
                  </div>
                </div>

              </div>
           </div>
        </div>

        {/* Right: Results Dashboard */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
            <div className="bg-[#F8F9FB] dark:bg-slate-950 border border-brand-border dark:border-white/10 rounded-2xl p-6 lg:p-8 h-full flex flex-col">
                {/* Header with scenario toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-brand-border/60 dark:border-white/10 gap-3">
                  <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400 uppercase tracking-wider">Estimated Earnings</span>
                  
                </div>

                {/* RECHARTS LINE CHART */}
                {topResults.length > 0 && chartData.length > 0 && (
                  <div className="w-full h-[180px] mb-6">
                    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={8} interval={xAxisInterval} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} tick={{ fontSize: 11, fill: '#888' }} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          formatter={(value) => typeof value === 'number' ? formatPHP(value) : 'N/A'}
                        />
                        {topResults.map((result, idx) => (
                          <Line
                            key={result.id}
                            type="monotone"
                            dataKey={`result_${idx}`}
                            name={result.provider}
                            stroke={LINE_COLORS[idx]}
                            strokeWidth={idx === 0 ? 2.5 : 2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col gap-6 justify-center">
                  <AnimatePresence mode='popLayout'>
                     {topResults.map((result, index) => {
                       const maxReturn = topResults[0] ? topResults[0].projectedReturn : 1;
                       const percentage = Math.max((result.projectedReturn / maxReturn) * 100, 2);
                       
                       // Badge: show disadvantage vs top for #2 and #3
                       let badgeElement = null;
                       if (index > 0 && topResults[0].projectedReturn > 0) {
                         const disadvantage = ((result.projectedReturn - topResults[0].projectedReturn) / Math.abs(topResults[0].projectedReturn)) * 100;
                         if (disadvantage < 0) {
                           badgeElement = (
                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                               {disadvantage.toFixed(0)}% vs top
                             </span>
                           );
                         }
                       }

                       const conditionBadge = result.dual.hasConditions ? (
                         <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                           <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                           Conditions
                         </span>
                       ) : null;
                       
                       const lockBadge = result.lockInDays > 0 ? (
                         <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                           <Lock className="w-2.5 h-2.5 mr-0.5" />
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
                            <div className="flex items-center justify-between mb-2.5">
                               <div className="flex items-center gap-2 flex-wrap">
                                 <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${index === 0 ? 'bg-[#FFD700]' : index === 1 ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]'}`}>
                                   {index + 1}
                                 </span>
                                 <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white">
                                   <img src={resolveLogoSrc(result.logo)} alt={result.provider} className="h-6 w-6 object-contain" />
                                 </div>
                                 <span className="font-semibold text-[15px] text-brand-textPrimary dark:text-gray-100">{result.provider}</span>
                                 <span className="text-[13px] font-medium text-brand-textSecondary dark:text-gray-400 ml-1">{result.name}</span>
                                 {badgeElement}
                                 {conditionBadge}
                                 {lockBadge}
                               </div>
                               <div className="text-right">
                                   <span className="text-brand-textPrimary dark:text-gray-100 font-bold tabular-nums">+{formatPHP(result.projectedReturn)}</span>
                                   <span className="text-[12px] font-medium text-brand-textSecondary dark:text-gray-500 ml-2">
                                     {formatRate(result.effectiveRate)}
                                   </span>
                               </div>
                            </div>

                            {/* Dual scenario comparison line */}
                            {result.dual.hasConditions && result.dual.conditionBoost > 0 && (
                              <div className="flex items-center gap-2 mb-2 text-[11px]">
                                <span className="text-brand-textSecondary dark:text-gray-500">
                                  Without conditions: <span className="font-semibold text-amber-600 dark:text-amber-400">{formatPHP(result.dual.withoutConditions.return)}</span> ({formatRate(result.dual.withoutConditions.effectiveRate)})
                                </span>
                              </div>
                            )}
                            
                            {/* Horizontal Chart Bar */}
                            <div className="h-4 w-full bg-brand-border/50 dark:bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                               <motion.div 
                                 className={`h-full rounded-full shadow-sm ${index === 0 ? 'bg-positive/90 dark:bg-positive' : index === 1 ? 'bg-brand-primary' : 'bg-brand-textSecondary/70'}`}
                                 initial={{ width: '0%' }}
                                 animate={{ width: `${percentage}%` }}
                                 transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
                               />
                            </div>

                            {/* Expandable condition & tier details */}
                            <button
                              onClick={() => setExpandedResultId(expandedResultId === result.id ? null : result.id)}
                              className="inline-flex items-center gap-1.5 mt-3 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1.5 text-[12px] font-semibold text-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary hover:text-white hover:shadow-md hover:shadow-brand-primary/20 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white group/detail"
                              aria-expanded={expandedResultId === result.id}
                              aria-label={`Click for more info about ${result.provider}`}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Click for more info</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedResultId === result.id ? 'rotate-180' : ''}`} />
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
                                  <div className="mt-2 p-3.5 bg-white dark:bg-slate-900 border border-brand-border/60 dark:border-white/10 rounded-xl space-y-3 shadow-inner">
                                    {/* Rate tiers */}
                                    <div>
                                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Rate Tiers (After Tax)</h4>
                                      <div className="space-y-1">
                                        {result.tiers.map((tier, i) => (
                                          <div key={i} className="flex items-center justify-between text-[13px]">
                                            <span className="text-brand-textSecondary dark:text-gray-400">
                                              {tier.maxBalance !== null 
                                                ? `₱${tier.minBalance.toLocaleString()} – ₱${tier.maxBalance.toLocaleString()}`
                                                : `₱${tier.minBalance.toLocaleString()}+`
                                              }
                                            </span>
                                            <span className="font-semibold text-brand-textPrimary dark:text-gray-200 tabular-nums">
                                              {formatRate(tier.afterTaxRate)}
                                              <span className="text-brand-textSecondary dark:text-gray-500 font-normal ml-1">({formatRate(tier.grossRate)} gross)</span>
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Conditions */}
                                    {result.conditions.length > 0 && result.conditions.some(c => c.type !== 'none') && (
                                      <div className="pt-2 border-t border-brand-border/40 dark:border-white/5">
                                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Conditions to Qualify</h4>
                                        <ul className="space-y-1.5">
                                          {result.conditions.filter(c => c.type !== 'none').map((cond, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[13px] text-brand-textPrimary dark:text-gray-300 leading-relaxed">
                                              <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                                              <span>
                                                {cond.description}
                                                {cond.expiresAt && (
                                                  <span className="ml-1 text-[11px] text-red-500 font-semibold">(Expires {cond.expiresAt})</span>
                                                )}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* No conditions message */}
                                    {(result.conditions.length === 0 || result.conditions.every(c => c.type === 'none')) && result.tiers.length <= 1 && (
                                      <p className="text-[13px] text-positive font-medium flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        No conditions. Flat rate applies to any deposit amount.
                                      </p>
                                    )}

                                    {/* Product metadata row */}
                                    <div className="pt-2 border-t border-brand-border/40 dark:border-white/5 flex flex-wrap gap-3 text-[11px] text-brand-textSecondary dark:text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        {result.lockInDays === 0 ? 'Liquid — withdraw anytime' : `${formatLockPeriod(result.lockInDays)} lock-in`}
                                      </span>
                                      {result.pdic && (
                                        <span className="flex items-center gap-1 text-positive font-medium">
                                          <ShieldCheck className="w-3 h-3" /> PDIC Insured
                                        </span>
                                      )}
                                    </div>

                                    {/* Open Account CTA */}
                                    <div className="pt-2 border-t border-brand-border/40 dark:border-white/5">
                                      <AffiliateButton amount={result.payoutAmount} url={result.affiliateUrl} />
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
                    <div className="text-center py-12 text-brand-textSecondary dark:text-gray-500">
                       Enter an amount greater than 0 to view recommendations.
                    </div>
                  )}
                </div>
                
            </div>
        </div>

      </div>
    </section>
  );
}
