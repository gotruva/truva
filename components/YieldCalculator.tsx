'use client';

import { useState, useMemo } from 'react';
import { RateProduct } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Calculator, AlertTriangle, ShieldCheck, ChevronDown, Lock, Info } from 'lucide-react';
import { AffiliateButton } from '@/components/AffiliateButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import {
  computeBlendedReturn,
  computeEffectiveRate,
  computeDualScenario,
  formatPHP,
  formatRate,
} from '@/utils/yieldEngine';

interface YieldCalculatorProps {
  rates: RateProduct[];
}

type ScenarioMode = 'best' | 'base';

export function YieldCalculator({ rates }: YieldCalculatorProps) {
  const [amount, setAmount] = useState<string>('100000');
  const [months, setMonths] = useState<number>(12);
  const [includeDefi, setIncludeDefi] = useState<boolean>(false);
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>('best');
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  const HORIZON_OPTIONS = [
    { label: '3 Mo', value: 3 },
    { label: '6 Mo', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
  ];

  const topResults = useMemo(() => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) return [];

    let filtered = rates;
    
    // Risk filter
    if (!includeDefi) {
      filtered = filtered.filter(r => r.category !== 'defi');
    }

    // Lock-in filter
    const horizonDays = months * 30;
    filtered = filtered.filter(r => r.lockInDays === 0 || r.lockInDays <= horizonDays);

    // Compute blended returns with dual-scenario
    const computed = filtered.map(rate => {
      const dual = computeDualScenario(numAmount, rate, months);
      const projectedReturn = scenarioMode === 'best'
        ? dual.withConditions.return
        : dual.withoutConditions.return;
      const effectiveRate = scenarioMode === 'best'
        ? dual.withConditions.effectiveRate
        : dual.withoutConditions.effectiveRate;

      return {
        ...rate,
        projectedReturn,
        effectiveRate,
        dual,
      };
    });

    return computed.sort((a, b) => b.projectedReturn - a.projectedReturn).slice(0, 3);
  }, [rates, amount, months, includeDefi, scenarioMode]);

  // Check if any product in the full dataset has conditions (not just top 3)
  const hasAnyConditions = useMemo(() => {
    return rates.some(r => r.conditions.length > 0 && r.conditions.some(c => c.type !== 'none'));
  }, [rates]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-2xl p-6 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mb-12 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primaryLight/30 dark:bg-brand-primaryDark/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-12 relative z-10 w-full px-4 lg:px-0">
        
        {/* Left: Input Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primaryLight/60 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-400 text-sm font-semibold mb-6 w-fit border border-brand-primary/10">
              <Calculator className="w-4 h-4" />
              Yield Calculator
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
                       className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                         months === opt.value 
                          ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-sm border border-brand-border dark:border-white/10' 
                          : 'text-brand-textSecondary dark:text-gray-500 hover:text-brand-textPrimary dark:hover:text-gray-300'
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="pt-4 border-t border-brand-border dark:border-white/10">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="block text-[15px] font-semibold text-brand-textPrimary dark:text-gray-200">Include Crypto/DeFi Yields</span>
                    <span className="block text-sm text-brand-textSecondary dark:text-gray-500 mt-0.5">Higher risk, variable rates via USDC</span>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeDefi ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <input 
                       type="checkbox" 
                       className="sr-only" 
                       checked={includeDefi} 
                       onChange={(e) => setIncludeDefi(e.target.checked)} 
                    />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeDefi ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
           </div>
        </div>

        {/* Right: Results Dashboard */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
            <div className="bg-[#F8F9FB] dark:bg-slate-950 border border-brand-border dark:border-white/10 rounded-2xl p-6 lg:p-8 h-full flex flex-col">
                {/* Header with scenario toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-brand-border/60 dark:border-white/10 gap-3">
                  <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400 uppercase tracking-wider">Projected Output</span>
                  
                  {/* Option C: Scenario Toggle */}
                  {hasAnyConditions && (
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-brand-border dark:border-white/10 p-0.5 shadow-sm">
                      <button
                        onClick={() => setScenarioMode('best')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          scenarioMode === 'best'
                            ? 'bg-positive/10 text-positive shadow-sm border border-positive/20'
                            : 'text-brand-textSecondary hover:text-brand-textPrimary'
                        }`}
                      >
                        Best Case
                      </button>
                      <button
                        onClick={() => setScenarioMode('base')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          scenarioMode === 'base'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-800/50'
                            : 'text-brand-textSecondary hover:text-brand-textPrimary'
                        }`}
                      >
                        No Conditions Met
                      </button>
                    </div>
                  )}
                </div>

                {/* Scenario explanation */}
                {hasAnyConditions && (
                  <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg mb-4 text-xs leading-relaxed ${
                    scenarioMode === 'best'
                      ? 'bg-positive/5 text-positive border border-positive/10'
                      : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30'
                  }`}>
                    {scenarioMode === 'best' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Best Case:</strong> Assumes all spending/deposit conditions are met. This shows the maximum yield each bank offers.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Base Rate:</strong> What you earn if you don&apos;t meet any spending or deposit conditions. This is the guaranteed minimum yield.</span>
                      </>
                    )}
                  </div>
                )}

                {/* RECHARTS VISUALIZATION */}
                {topResults.length > 0 && (
                  <div className="w-full h-[180px] mb-6">
                    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                      <BarChart data={topResults} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                        <XAxis dataKey="provider" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`} tick={{ fontSize: 12, fill: '#888' }} />
                        <RechartsTooltip 
                          cursor={{fill: 'rgba(0,0,0,0.02)'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value) => [formatPHP(Number(value) || 0), 'Return']}
                        />
                        <Bar dataKey="projectedReturn" radius={[4, 4, 0, 0]}>
                          {topResults.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#12B76A' : index === 1 ? '#0052FF' : '#94A3B8'} />
                          ))}
                        </Bar>
                      </BarChart>
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

                       // Condition badge if this product has conditions
                       const conditionBadge = result.dual.hasConditions && scenarioMode === 'best' ? (
                         <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                           <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                           Conditions
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
                                 <span className="font-semibold text-[15px] text-brand-textPrimary dark:text-gray-100">{result.provider}</span>
                                 {badgeElement}
                                 {conditionBadge}
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
                                  {scenarioMode === 'best' ? (
                                    <>Without conditions: <span className="font-semibold text-amber-600 dark:text-amber-400">{formatPHP(result.dual.withoutConditions.return)}</span> ({formatRate(result.dual.withoutConditions.effectiveRate)})</>
                                  ) : (
                                    <>With conditions met: <span className="font-semibold text-positive">{formatPHP(result.dual.withConditions.return)}</span> ({formatRate(result.dual.withConditions.effectiveRate)})</>
                                  )}
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
                              className="flex items-center gap-1.5 mt-2.5 text-[12px] font-medium text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors group/detail"
                              aria-expanded={expandedResultId === result.id}
                              aria-label={`View conditions and rate tiers for ${result.provider}`}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>View conditions & rate tiers</span>
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
                                        {result.lockInDays === 0 ? 'Liquid — withdraw anytime' : `${result.lockInDays}-day lock-in`}
                                      </span>
                                      {result.pdic && (
                                        <span className="flex items-center gap-1 text-positive font-medium">
                                          <ShieldCheck className="w-3 h-3" /> PDIC Insured
                                        </span>
                                      )}
                                      <span>Verified: {result.lastVerified}</span>
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
