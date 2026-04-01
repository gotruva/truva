'use client';

import { RateProduct } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AffiliateButton } from './AffiliateButton';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { motion } from 'framer-motion';

export function RateCard({ rate }: { rate: RateProduct }) {
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
      </div>
      
      <div className="mb-4">
        <div className="text-[40px] font-bold text-positive tabular-nums leading-none tracking-tight">
          {(rate.afterTaxRate * 100).toFixed(2)}%
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
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-[15px] text-brand-textSecondary dark:text-gray-400 font-medium mt-1">
          ({(rate.grossRate * 100).toFixed(2)}% gross)
        </div>
      </div>

      <p className="text-sm text-brand-textPrimary dark:text-gray-200 mb-6 bg-white dark:bg-slate-800 p-3 rounded-md border border-brand-border dark:border-white/10 shadow-sm transition-colors duration-300">
        <strong className="block text-xs uppercase text-brand-textSecondary dark:text-gray-400 mb-1 tracking-wider">Conditions</strong>
        {rate.conditions}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="secondary" className="bg-brand-primaryLight text-brand-primary hover:bg-brand-primaryLight border-none font-medium">
          <Lock className="w-3 h-3 mr-1" />
          {rate.lockInDays === 0 ? 'Liquid' : `${rate.lockInDays}d lock`}
        </Badge>
        {rate.pdic && (
           <Badge variant="secondary" className="bg-[#E7F8F0] text-positive hover:bg-[#E7F8F0] border-none font-medium">
             <ShieldCheck className="w-3 h-3 mr-1" /> PDIC
           </Badge>
        )}
        <Badge variant="outline" className={`font-medium ${rate.riskLevel === 'DeFi' ? 'text-defi border-defi/40' : 'text-brand-textSecondary border-brand-border'}`}>
          <div className={`w-2 h-2 rounded-full mr-1.5 ${rate.riskLevel === 'DeFi' ? 'bg-defi' : 'bg-positive'}`} />
          {rate.riskLevel} Risk
        </Badge>
      </div>

      <AffiliateButton amount={rate.payoutAmount} url={rate.affiliateUrl} />
    </motion.div>
  );
}
