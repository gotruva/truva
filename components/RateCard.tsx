'use client';

import { RateProduct } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AffiliateButton } from './AffiliateButton';
import { Lock, ShieldCheck, AlertCircle, AlertTriangle, Calendar, Building2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { formatRate } from '@/utils/yieldEngine';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';

export function RateCard({ rate }: { rate: RateProduct }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const bestAfterTax = rate.taxExempt
    ? calcTaxExempt(rate.headlineRate)
    : calcAfterTaxPhp(rate.headlineRate);
  const baseAfterTax = rate.taxExempt
    ? calcTaxExempt(rate.baseRate.grossRate)
    : calcAfterTaxPhp(rate.baseRate.grossRate);
  const hasMultipleTiers = rate.tiers.length > 1;
  const hasConditions = rate.conditions.length > 0 && rate.conditions.some(c => c.type !== 'none');
  const headlineOverstated = hasMultipleTiers || hasConditions;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-brand-surface dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-lg p-5 mb-4 block md:hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="relative w-10 h-10 overflow-hidden rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-white flex items-center justify-center shadow-sm">
              <img src={rate.logo} alt={rate.provider} className="w-8 h-8 object-contain" />
           </div>
           <div>
             <span className="block font-semibold text-brand-textPrimary dark:text-gray-100 text-lg leading-tight">{rate.provider}</span>
           </div>
        </div>
        {/* Last verified date */}
        <div className="flex items-center gap-1 text-[10px] text-brand-textSecondary dark:text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Verified {rate.lastVerified}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[40px] font-bold text-positive tabular-nums leading-none tracking-tight">
          {(bestAfterTax * 100).toFixed(2)}%
        </div>
        <div className="text-[13px] font-semibold text-brand-textSecondary dark:text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
          After Tax
          <TooltipProvider delay={150}>
            <Tooltip>
              <TooltipTrigger render={<button className="cursor-help text-brand-textSecondary/70 dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors" />}>
                <AlertCircle className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px] p-3 text-sm leading-relaxed text-left font-normal normal-case tracking-normal">
                <p>
                  The <strong>effective rate</strong> is what you actually earn after deducting the 20% Philippine Final Withholding Tax (FWT).
                  {rate.taxExempt && ' This product is tax-exempt — no FWT applies.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-[15px] text-brand-textSecondary dark:text-gray-400 font-medium mt-1">
          ({(rate.headlineRate * 100).toFixed(2)}% gross)
        </div>

        {/* Overstated rate warning */}
        {headlineOverstated && (
          <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-snug">
              {hasMultipleTiers
                ? `Rate applies up to ${rate.tiers[0].maxBalance ? `₱${(rate.tiers[0].maxBalance).toLocaleString()}` : 'cap'}. Base rate: ${formatRate(baseAfterTax)}`
                : `Requires conditions. Base rate: ${formatRate(baseAfterTax)}`
              }
            </span>
          </div>
        )}
      </div>

      {/* Expandable Conditions & Tiers */}
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full bg-brand-surface dark:bg-slate-800 p-3 rounded-lg border border-brand-border dark:border-white/10 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/80"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
              {hasMultipleTiers ? 'Rate Tiers & Conditions' : 'Review Conditions'}
            </span>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-brand-textSecondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </motion.div>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 mt-2 bg-white dark:bg-slate-900 border border-brand-border dark:border-white/5 rounded-lg shadow-inner space-y-3">
                {/* Tier breakdown */}
                {rate.tiers.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Rate Tiers</h4>
                    <div className="space-y-1.5">
                      {rate.tiers.map((tier, i) => (
                        <div key={i} className="flex items-center justify-between text-[13px] text-brand-textPrimary dark:text-gray-300">
                          <span>
                            {tier.maxBalance !== null
                              ? `₱${tier.minBalance.toLocaleString()} – ₱${tier.maxBalance.toLocaleString()}`
                              : `₱${tier.minBalance.toLocaleString()}+`
                            }
                          </span>
                          <span className="font-semibold tabular-nums text-positive">
                            {formatRate(rate.taxExempt ? calcTaxExempt(tier.grossRate) : calcAfterTaxPhp(tier.grossRate))}{' '}
                            <span className="text-brand-textSecondary font-normal">({formatRate(tier.grossRate)} gross)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {rate.conditions.length > 0 && rate.conditions.some(c => c.type !== 'none') && (
                  <div className="pt-2 border-t border-brand-border/50 dark:border-white/5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-2">Conditions</h4>
                    <ul className="space-y-1">
                      {rate.conditions.filter(c => c.type !== 'none').map((cond, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-brand-textPrimary dark:text-gray-300 leading-relaxed">
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
                  </div>
                )}

                {/* Fallback for products with no special conditions */}
                {rate.conditions.length === 0 && rate.tiers.length <= 1 && (
                  <p className="text-[13px] text-brand-textPrimary dark:text-gray-300">
                    Flat rate with no special conditions. What you see is what you get.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {rate.lockInDays === 0 ? (
          <Badge variant="secondary" className="bg-brand-primaryLight text-brand-primary hover:bg-brand-primaryLight border-none font-medium">
            <Lock className="w-3 h-3 mr-1" /> Liquid
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold">
            <Lock className="w-3 h-3 mr-1" /> Locked {rate.lockInDays}d
          </Badge>
        )}

        {/* Insurer badge */}
        {rate.insurer === 'PDIC' && (
          <Badge variant="secondary" className="bg-[#E7F8F0] text-positive hover:bg-[#E7F8F0] border-none font-medium">
            <ShieldCheck className="w-3 h-3 mr-1" /> PDIC
          </Badge>
        )}
        {(rate.insurer === 'Bureau of Treasury' || rate.insurer === 'Pag-IBIG Fund') && (
          <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-50 border-none font-medium">
            <Building2 className="w-3 h-3 mr-1" />
            {rate.insurer === 'Bureau of Treasury' ? 'BTr Guaranteed' : 'Pag-IBIG Guaranteed'}
          </Badge>
        )}
        {rate.insurer === 'Not Insured' && (
          <Badge variant="outline" className="text-brand-textSecondary dark:text-gray-400 border-brand-border dark:border-white/20 font-medium">
            Not Insured
          </Badge>
        )}
      </div>

      <AffiliateButton amount={rate.payoutAmount} url={rate.affiliateUrl} />
    </motion.div>
  );
}
