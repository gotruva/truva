import { RateProduct } from '@/types';
import { AffiliateButton } from './AffiliateButton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function RateTable({ rates }: { rates: RateProduct[] }) {
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
            <th className="p-4 py-5 font-semibold text-right">Gross Rate</th>
            <th className="p-4 py-5 font-semibold text-right">
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={<button className="inline-flex items-center gap-1.5 hover:text-brand-textPrimary dark:hover:text-gray-200 transition-colors cursor-help" />}
                  >
                    After-Tax Return
                    <AlertCircle className="w-4 h-4 text-brand-textSecondary/70 dark:text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] p-3 text-sm leading-relaxed text-left font-normal">
                    <p>
                      This is the <strong>effective rate</strong>—what you actually earn. It automatically deducts the 20% Philippine Final Withholding Tax (FWT) from standard bank interest.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="p-4 py-5 font-semibold">Conditions</th>
            <th className="p-4 py-5 font-semibold text-center">Lock-In</th>
            <th className="p-4 py-5 font-semibold text-center">Risk / PDIC</th>
            <th className="p-4 py-5 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border dark:divide-white/10">
          {rates.map((rate) => (
            <tr key={rate.id} className="h-16 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors group">
              <td className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img src={rate.logo} alt={rate.provider} className="w-7 h-7 object-contain" />
                </div>
                <div>
                    <div className="font-semibold text-brand-textPrimary dark:text-gray-100 text-[15px]">{rate.provider}</div>
                </div>
              </td>
              <td className="p-4 text-right tabular-nums text-brand-textPrimary dark:text-gray-100 text-[15px] font-medium">
                {(rate.grossRate * 100).toFixed(2)}%
              </td>
              <td className="p-4 text-right tabular-nums text-positive text-[16px] font-bold">
                {(rate.afterTaxRate * 100).toFixed(2)}%
              </td>
              <td className="p-4 text-sm text-brand-textSecondary dark:text-gray-400">
                <TooltipProvider delay={150}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button className="flex items-center gap-1.5 text-brand-primary dark:text-blue-400 hover:text-brand-primaryDark dark:hover:text-blue-300 transition-colors font-medium cursor-help" />
                      }
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">Conditions</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[320px] p-3 text-sm leading-relaxed" side="bottom">
                      <p>{rate.conditions}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
              <td className="p-4 text-center text-[14px] text-brand-textSecondary dark:text-gray-400 font-medium">
                {rate.lockInDays === 0 ? 'Liquid' : `${rate.lockInDays} days`}
              </td>
              <td className="p-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                   {rate.riskLevel === 'DeFi' ? (
                       <Badge variant="outline" className="text-[11px] text-defi border-defi/30 h-5 px-2 bg-defi/5">DeFi Risk</Badge>
                   ) : (
                       <Badge variant="outline" className="text-[11px] text-brand-textSecondary dark:text-gray-300 border-brand-border dark:border-white/20 h-5 px-2">{rate.riskLevel} Risk</Badge>
                   )}
                   {rate.pdic && (
                       <span className="flex items-center text-[11px] font-semibold text-positive uppercase tracking-wide">
                           <ShieldCheck className="w-3 h-3 mr-1" /> PDIC
                       </span>
                   )}
                </div>
              </td>
              <td className="p-4 flex justify-end">
                <AffiliateButton amount={rate.payoutAmount} url={rate.affiliateUrl} />
              </td>
            </tr>
          ))}
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
