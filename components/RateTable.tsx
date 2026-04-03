'use client';

import React, { useState } from 'react';
import { RateProduct } from '@/types';
import { AffiliateButton } from './AffiliateButton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, ShieldCheck, ChevronDown, AlertTriangle, Calendar, Lock, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { computeEffectiveRate, formatRate } from '@/utils/yieldEngine';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';

function InsurerCell({ insurer }: { insurer: string }) {
  if (insurer === 'PDIC') {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center text-[11px] font-semibold text-positive uppercase tracking-wide">
          <ShieldCheck className="w-3 h-3 mr-1" /> PDIC
        </span>
        <span className="text-[10px] text-brand-textSecondary dark:text-gray-500">₱1M Covered</span>
      </div>
    );
  }
  if (insurer === 'Bureau of Treasury' || insurer === 'Pag-IBIG Fund') {
    const label = insurer === 'Bureau of Treasury' ? 'BTr' : 'Pag-IBIG';
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          <Building2 className="w-3 h-3 mr-1" /> {label}
        </span>
        <span className="text-[10px] text-brand-textSecondary dark:text-gray-500">Gov't Guaranteed</span>
      </div>
    );
  }
  return (
    <span className="text-[11px] text-brand-textSecondary dark:text-gray-500 font-medium">Not Insured</span>
  );
}

export function RateTable({ rates }: { rates: RateProduct[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Default reference amount for effective rate (₱100k)
  const referenceAmount = 100000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="hidden md:block overflow-x-auto rounded-xl border border-brand-border dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm mb-12 transition-colors duration-300"
    >
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#F9FAFB] dark:bg-slate-950 border-b border-brand-border dark:border-white/10 text-[13px] font-semibold text-brand-textSecondary dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
          <tr>
            <th className="p-4 py-5 font-semibold">Product</th>
            <th className="p-4 py-5 font-semibold text-right">Headline Rate</th>
            <th className="p-4 py-5 font-semibold text-right">
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={<button className="inline-flex items-center gap-1.5 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors cursor-help" />}
                  >
                    Effective Rate
                    <AlertCircle className="w-4 h-4 text-brand-textSecondary/70 dark:text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] p-3 text-sm leading-relaxed text-left font-normal">
                    <p>
                      The <strong>effective rate</strong> is the blended after-tax yield on a ₱100,000 deposit. For tiered products, this accounts for rate caps and balance limits — showing what you <em>actually</em> earn, not just the headline.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="p-4 py-5 font-semibold">Product Name</th>
            <th className="p-4 py-5 font-semibold text-center">Lock-In</th>
            <th className="p-4 py-5 font-semibold text-center">Insurer</th>
            <th className="p-4 py-5 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border dark:divide-white/10">
          {rates.map((rate) => {
            const headlineAfterTax = rate.taxExempt
              ? calcTaxExempt(rate.headlineRate)
              : calcAfterTaxPhp(rate.headlineRate);
            const effectiveRate = computeEffectiveRate(referenceAmount, rate.tiers, rate.taxExempt);
            const gapPP = (headlineAfterTax - effectiveRate) * 100;
            const isOverstated = gapPP > 0.5;

            return (
              <React.Fragment key={rate.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === rate.id ? null : rate.id)}
                  className="h-16 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                      <img src={rate.logo} alt={rate.provider} className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <div className="font-semibold text-brand-textPrimary dark:text-gray-100 text-[15px]">{rate.provider}</div>
                    </div>
                  </td>
                  <td className="p-4 text-right tabular-nums text-brand-textPrimary dark:text-gray-100 text-[15px] font-medium">
                    {(headlineAfterTax * 100).toFixed(2)}%
                    <span className="block text-[11px] text-brand-textSecondary dark:text-gray-500 font-normal">
                      ({(rate.headlineRate * 100).toFixed(2)}% gross)
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`tabular-nums text-[16px] font-bold ${isOverstated ? 'text-amber-600 dark:text-amber-400' : 'text-positive'}`}>
                        {formatRate(effectiveRate)}
                      </span>
                      {isOverstated && (
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger render={<button className="cursor-help" />}>
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px] p-3 text-sm leading-relaxed text-left font-normal">
                              <p>
                                The headline rate is <strong>{gapPP.toFixed(1)}pp higher</strong> than the effective blended rate on ₱{referenceAmount.toLocaleString()}. This bank uses tiered rates or conditions.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-brand-textSecondary dark:text-gray-300">
                    {rate.name}
                  </td>
                  <td className="p-4 text-center">
                    {rate.lockInDays === 0 ? (
                      <span className="text-[14px] text-brand-textSecondary dark:text-gray-400 font-medium">Liquid</span>
                    ) : (
                      <div className="flex justify-center">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger render={<button className="cursor-help" />}>
                              <Badge variant="outline" className="text-[12px] font-bold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 py-0.5">
                                <Lock className="w-3 h-3 mr-1" /> {rate.lockInDays} Days
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[240px] p-3 text-sm text-left font-normal border-amber-200 dark:border-amber-900">
                              <p>Funds are locked for <strong>{rate.lockInDays} days</strong>. Early withdrawal typically results in lost interest and/or penalties.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <InsurerCell insurer={rate.insurer} />
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <AffiliateButton amount={rate.payoutAmount} url={rate.affiliateUrl} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expandedId === rate.id ? null : rate.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-brand-textSecondary"
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${expandedId === rate.id ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedId === rate.id && (
                    <tr>
                      <td colSpan={7} className="p-0 border-b-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 py-4 bg-brand-surface/50 dark:bg-slate-900/50 border-y border-brand-border/50 dark:border-white/5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Tier breakdown */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Rate Tiers</h4>
                                <div className="space-y-1.5">
                                  {rate.tiers.map((tier, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <span className="text-brand-textSecondary dark:text-gray-400">
                                        {tier.maxBalance !== null
                                          ? `₱${tier.minBalance.toLocaleString()} – ₱${tier.maxBalance.toLocaleString()}`
                                          : `₱${tier.minBalance.toLocaleString()}+`
                                        }
                                      </span>
                                      <span className="font-semibold text-brand-textPrimary dark:text-gray-200 tabular-nums">
                                        {formatRate(rate.taxExempt ? calcTaxExempt(tier.grossRate) : calcAfterTaxPhp(tier.grossRate))}
                                        <span className="text-brand-textSecondary dark:text-gray-500 font-normal ml-1">
                                          ({formatRate(tier.grossRate)} gross)
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Conditions */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Conditions</h4>
                                {rate.conditions.length > 0 && rate.conditions.some(c => c.type !== 'none') ? (
                                  <ul className="space-y-1">
                                    {rate.conditions.filter(c => c.type !== 'none').map((cond, i) => (
                                      <li key={i} className="text-sm text-brand-textPrimary dark:text-gray-300 flex items-start gap-1.5">
                                        <span className="text-amber-500 mt-0.5">•</span>
                                        <span>
                                          {cond.description}
                                          {cond.expiresAt && (
                                            <span className="ml-1 text-[11px] text-red-500 font-semibold">(Expires {cond.expiresAt})</span>
                                          )}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-brand-textPrimary dark:text-gray-300">No conditions. Flat rate applies to any balance.</p>
                                )}
                              </div>

                              {/* Verified date */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Verification</h4>
                                <div className="flex items-center gap-1.5 text-sm text-brand-textSecondary dark:text-gray-400">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Last verified: {rate.lastVerified}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
          {rates.length === 0 && (
              <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-textSecondary dark:text-gray-400">
                      No rates found for this category.
                  </td>
              </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
