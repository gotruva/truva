'use client';

import { useState, useMemo } from 'react';
import { RateProduct } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { AffiliateButton } from '@/components/AffiliateButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface YieldCalculatorProps {
  rates: RateProduct[];
}

export function YieldCalculator({ rates }: YieldCalculatorProps) {
  const [amount, setAmount] = useState<string>('100000');
  const [months, setMonths] = useState<number>(12);
  const [includeDefi, setIncludeDefi] = useState<boolean>(false);

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
    // If user's horizon is 3 months (90 days), we exclude products with 365-day lock-ins.
    const horizonDays = months * 30;
    filtered = filtered.filter(r => r.lockInDays === 0 || r.lockInDays <= horizonDays);

    // Score / Compute
    const computed = filtered.map(rate => {
      // Basic compound math approximation or simple interest
      // Assuming simple interest for MVP simplicity (Rates quoted are Annual Percentage Yield/Rate)
      const yearlyReturn = numAmount * rate.afterTaxRate;
      const totalReturn = (yearlyReturn / 12) * months;
      
      return {
        ...rate,
        projectedReturn: totalReturn
      };
    });

    return computed.sort((a, b) => b.projectedReturn - a.projectedReturn).slice(0, 3);
  }, [rates, amount, months, includeDefi]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
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
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-border/60 dark:border-white/10">
                  <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400 uppercase tracking-wider">Projected Output</span>
                  <span className="text-sm font-medium text-brand-textPrimary dark:text-gray-300">Total Return</span>
               </div>

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
                         formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Return']}
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
                      const percentDiff = index === 0 && topResults.length > 1 && topResults[1].projectedReturn > 0
                        ? ((result.projectedReturn - topResults[1].projectedReturn) / Math.abs(topResults[1].projectedReturn)) * 100
                        : 0;
                      
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
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${index === 0 ? 'bg-[#FFD700]' : index === 1 ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]'}`}>
                                  {index + 1}
                                </span>
                                <span className="font-semibold text-[15px] text-brand-textPrimary dark:text-gray-100">{result.provider}</span>
                                {index === 0 && percentDiff > 0 && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                    +{percentDiff.toFixed(0)}% better
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                  <span className="text-brand-textPrimary dark:text-gray-100 font-bold tabular-nums">+{formatCurrency(result.projectedReturn)}</span>
                                  <span className="text-[12px] font-medium text-brand-textSecondary dark:text-gray-500 ml-2">
                                    {(result.afterTaxRate * 100).toFixed(2)}%
                                  </span>
                              </div>
                           </div>
                           
                           {/* Horizontal Chart Bar */}
                           <div className="h-4 w-full bg-brand-border/50 dark:bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                              <motion.div 
                                className={`h-full rounded-full shadow-sm ${index === 0 ? 'bg-positive/90 dark:bg-positive' : index === 1 ? 'bg-brand-primary' : 'bg-brand-textSecondary/70'}`}
                                initial={{ width: '0%' }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
                              />
                           </div>
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
