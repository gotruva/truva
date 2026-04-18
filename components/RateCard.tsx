'use client';

import { useState } from 'react';
import { RateProduct } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AffiliateButton } from './AffiliateButton';
import { Lock, ShieldCheck, AlertTriangle, Calendar, ChevronDown, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRate, formatPHP } from '@/utils/yieldEngine';
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
  const prefix = verbose ? 'Time Locked for ' : '';
  return `${prefix}${formatLockIn(days)}`;
}

function formatPayoutFrequency(freq: string): string {
  switch (freq) {
    case 'daily': return 'Daily';
    case 'monthly': return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'annually': return 'Annually';
    case 'at_maturity': return 'At Maturity';
    default: return freq;
  }
}

function getPeriodicPayout(amount: number, effectiveRate: number, freq: string): number {
  switch (freq) {
    case 'daily': return Math.round(amount * effectiveRate / 365);
    case 'monthly': return Math.round(amount * effectiveRate / 12);
    case 'quarterly': return Math.round(amount * effectiveRate / 4);
    case 'annually': return Math.round(amount * effectiveRate);
    default: return 0;
  }
}

function getPayoutPeriodLabel(freq: string): string {
  switch (freq) {
    case 'daily': return 'day';
    case 'monthly': return 'month';
    case 'quarterly': return 'quarter';
    case 'annually': return 'yr';
    default: return '';
  }
}

/* ─── Single product row inside expanded card ─── */
function ProductRow({ product, amount, months, isBest }: {
  product: RateProduct & { effectiveRate: number; projectedReturn: number };
  amount: number;
  months: number;
  isBest: boolean;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const hasConditions = product.conditions.length > 0 && product.conditions.some(c => c.type !== 'none');
  const tierCount = product.tiers.length;

  return (
    <div className={`p-3.5 transition-colors ${isBest ? 'bg-positive/5' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[15px] text-brand-textPrimary dark:text-gray-100 leading-tight">
              {product.name}
            </span>
            {isBest && (
              <Badge className="bg-positive/10 text-positive border-positive/20 text-[10px] font-bold py-0.5 px-2">
                Best
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {product.lockInDays === 0 ? (
              <span className="text-[11px] text-brand-textSecondary dark:text-gray-500 font-medium">Withdraw Anytime</span>
            ) : (
              <Badge variant="outline" className="text-[10px] font-bold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 py-0">
                <Lock className="w-2.5 h-2.5 mr-0.5" /> {formatLockLabel(product.lockInDays, true)}
              </Badge>
            )}
            <span className="text-[11px] text-brand-textSecondary dark:text-gray-500 flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" /> {formatPayoutFrequency(product.payoutFrequency)}
            </span>
            {hasConditions && (
              <span className="inline-flex items-center text-[10px] text-red-600 dark:text-red-400 font-semibold">
                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Rate has requirements
              </span>
            )}
            {product.limits?.maxDepositPerProduct && (
              <Badge variant="outline" className="text-[10px] font-bold text-blue-700 dark:text-blue-400 border-blue-400/30 bg-blue-50 dark:bg-blue-950/20 py-0">
                Max ₱{product.limits.maxDepositPerProduct.toLocaleString()} per Time Deposit
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 pl-3">
          <div className="text-[18px] font-extrabold tabular-nums text-brand-textPrimary dark:text-gray-100">
            {formatRate(product.effectiveRate)}
          </div>
          {amount > 0 && (
            <div className="text-[13px] font-bold text-positive tabular-nums">
              +{formatPHP(product.projectedReturn)}
            </div>
          )}
        </div>
      </div>

      {/* Expandable detail */}
      <button
        onClick={() => setShowDetail(!showDetail)}
        className="inline-flex items-center gap-1.5 mt-2.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1.5 text-[11px] font-semibold text-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary hover:text-white hover:shadow-md hover:shadow-brand-primary/20 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white"
      >
        <span>{showDetail ? 'Hide extra info' : 'Click for more info'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-brand-border/30 dark:border-white/5 space-y-2">
              {/* Tier breakdown */}
              {tierCount > 1 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-1">
                    {product.tierType === 'flat'
                      ? 'Flat Rate'
                      : product.tierType === 'threshold'
                        ? 'Rate by Deposit Amount'
                        : 'How Your Balance Earns'}
                  </h4>
                  <div className="space-y-0.5">
                    {product.tiers.map((tier, i) => {
                      const tierAfterTax = product.taxExempt
                        ? calcTaxExempt(tier.grossRate)
                        : calcAfterTaxPhp(tier.grossRate);
                      const isLastTier = i === product.tiers.length - 1;
                      const isActiveTier = product.tierType === 'threshold' &&
                        (amount >= tier.minBalance && (tier.maxBalance === null || amount <= tier.maxBalance || (isLastTier && amount >= tier.minBalance)));

                      return (
                        <div key={i} className={`flex items-center justify-between text-[12px] ${
                          isActiveTier ? 'text-positive font-bold' : 'text-brand-textSecondary dark:text-gray-500'
                        }`}>
                          <span>
                            {tier.maxBalance !== null
                              ? `₱${tier.minBalance.toLocaleString()}–₱${tier.maxBalance.toLocaleString()}`
                              : `₱${tier.minBalance.toLocaleString()}+`
                            }
                          </span>
                          <span className="tabular-nums">
                            {(tier.grossRate * 100).toFixed(1)}% → {(tierAfterTax * 100).toFixed(2)}%
                            {isActiveTier && <span className="ml-1 text-[11px] font-bold">✓ your tier</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {hasConditions && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 px-3 py-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> To earn this rate, you must:
                  </h4>
                  <ul className="space-y-0.5">
                    {product.conditions.filter(c => c.type !== 'none').map((cond, i) => (
                      <li key={i} className="text-[11px] text-red-800 dark:text-red-300 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-red-500 mt-0.5 shrink-0">•</span>
                        <span>{cond.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasConditions && tierCount <= 1 && (
                <p className="text-[11px] text-positive font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> No conditions — flat rate on any amount
                </p>
              )}

              {amount > 0 && (
                <CalculationBreakdownDetails
                  amount={amount}
                  months={months}
                  product={product}
                />
              )}

              {/* Payout Schedule */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400 mb-1">Interest Payout</h4>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-brand-textSecondary dark:text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatPayoutFrequency(product.payoutFrequency)}
                  </span>
                  {amount > 0 && product.payoutFrequency !== 'at_maturity' ? (
                    <span className="font-semibold text-brand-textPrimary dark:text-gray-200 tabular-nums">
                      ~{formatPHP(getPeriodicPayout(amount, product.effectiveRate, product.payoutFrequency))} / {getPayoutPeriodLabel(product.payoutFrequency)}
                    </span>
                  ) : amount > 0 ? (
                    <span className="font-semibold text-positive tabular-nums">
                      +{formatPHP(product.projectedReturn)} after {months} month{months !== 1 ? 's' : ''}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-end pt-1">
                <div onClick={(e) => e.stopPropagation()}>
                  <AffiliateButton amount={product.payoutAmount} productId={product.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Grouped Bank Card ─── */

interface BankCardProps {
  provider: string;
  logo: string;
  products: Array<RateProduct & { effectiveRate: number; projectedReturn: number }>;
  bestEffectiveRate: number;
  bestReturn: number;
  rank: number;
  amount: number;
  months: number;
  insurer: string;
  isExpanded: boolean;
  onToggle: () => void;
  isRecommended?: boolean;
}

export function BankCard({ provider, logo, products, bestEffectiveRate, bestReturn, rank, amount, months, insurer, isExpanded, onToggle, isRecommended }: BankCardProps) {

  const best = products[0];
  const headlineGross = best.headlineRate;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-xl mb-3 overflow-hidden shadow-sm transition-all ${
        rank <= 3
          ? 'border-brand-primary/20 dark:border-blue-800/30'
          : 'border-brand-border dark:border-white/10'
      }`}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left transition-colors duration-200 hover:bg-brand-surface/70 dark:hover:bg-slate-800/60"
      >
        {/* Rank + Logo */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          {rank <= 3 ? (
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md ${
              rank === 1 ? 'glow-rank-1 bg-gradient-to-br from-yellow-400 via-amber-400 to-amber-500' :
              rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
              'bg-gradient-to-br from-amber-600 to-amber-700'
            }`}>
              {rank === 1 ? <Trophy className="w-3.5 h-3.5" /> : rank}
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-brand-textSecondary bg-gray-100 dark:bg-slate-800">{rank}</span>
          )}
          <div className="w-10 h-10 rounded-lg border border-brand-border dark:border-white/10 bg-white shadow-sm flex items-center justify-center overflow-hidden">
            <img src={resolveLogoSrc(logo)} alt={provider} className="w-7 h-7 object-contain" />
          </div>
        </div>

        {/* Bank info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-brand-textPrimary dark:text-gray-100 text-[18px] leading-tight">{provider}</span>
                {best.category === 'defi' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                    <div className="relative flex h-1 w-1">
                      <span className="animate-pulse-status-blue absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex h-1 w-1 rounded-full bg-blue-500"></span>
                    </div>
                    LIVE
                  </span>
                )}
                {isRecommended && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/5 text-brand-primary border border-brand-primary/20 whitespace-nowrap">
                    ★ Quick Match
                  </span>
                )}
              </div>
              <div className="text-[13px] font-medium text-brand-textSecondary dark:text-gray-500 mt-0.5">
                {products.length} product{products.length > 1 ? 's' : ''} compared · <InsurerLabel insurer={insurer} />
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
              isExpanded
                ? 'border-brand-primary/20 bg-brand-primary text-white shadow-sm shadow-brand-primary/20 dark:bg-blue-500'
                : 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300'
            }`}>
              <span>{isExpanded ? 'Hide' : 'More'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </span>
          </div>

          {/* Rate display */}
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-[11px] text-brand-textSecondary dark:text-gray-500 font-medium">
                Highest listed rate: {(headlineGross * 100).toFixed(2)}% gross
              </div>
              <div className={`text-[32px] font-extrabold tabular-nums leading-none tracking-tight ${rank === 1 ? 'text-positive' : 'text-brand-textPrimary dark:text-gray-100'}`}>
                {formatRate(bestEffectiveRate)}
              </div>
              <div className="text-[12px] font-bold text-brand-textSecondary dark:text-gray-400 mt-1">
                net after tax · {best.lockInDays === 0 ? 'withdraw anytime' : `time locked for ${formatLockIn(best.lockInDays)}`}
              </div>
            </div>
            {amount > 0 && (
              <div className="text-right">
                <div className="text-[18px] font-bold text-positive tabular-nums">+{formatPHP(bestReturn)}</div>
                <div className="text-[12px] font-medium text-brand-textSecondary dark:text-gray-500">estimated over {months} month{months !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Expanded product list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-brand-border/40 dark:border-white/5 divide-y divide-brand-border/30 dark:divide-white/5">
              {products.map((product, i) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  amount={amount}
                  months={months}
                  isBest={i === 0}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Helper ─── */
function InsurerLabel({ insurer }: { insurer: string }) {
  if (insurer === 'PDIC') return (
    <span className="inline-flex items-center gap-1.5 font-bold text-positive">
      <div className="relative flex h-1.5 w-1.5">
        <span className="animate-pulse-status absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive"></span>
      </div>
      PDIC Insured
    </span>
  );
  if (insurer === 'Bureau of Treasury') return <span className="text-blue-600 dark:text-blue-400 font-bold">Gov&apos;t Guaranteed</span>;
  if (insurer === 'Pag-IBIG Fund') return <span className="text-blue-600 dark:text-blue-400 font-bold">Pag-IBIG Guaranteed</span>;
  return <span>Not Insured</span>;
}

/* ─── Legacy single card export for backward compat ─── */
export function RateCard({ rate }: { rate: RateProduct }) {
  const bestAfterTax = rate.taxExempt
    ? calcTaxExempt(rate.headlineRate)
    : calcAfterTaxPhp(rate.headlineRate);

  return (
    <div className="bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-lg p-5 mb-4 block md:hidden shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-md border border-brand-border dark:border-white/10 bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
          <img src={resolveLogoSrc(rate.logo)} alt={rate.provider} className="w-7 h-7 object-contain" />
        </div>
        <div>
          <span className="block font-semibold text-brand-textPrimary dark:text-gray-100 text-lg leading-tight">{rate.provider}</span>
          <span className="block text-[12px] text-brand-textSecondary dark:text-gray-500">{rate.name}</span>
        </div>
      </div>
      <div className="text-[32px] font-bold text-positive tabular-nums leading-none">
        {(bestAfterTax * 100).toFixed(2)}%
      </div>
      <div className="text-[12px] text-brand-textSecondary dark:text-gray-500 mt-1">after tax</div>
      <div className="mt-4">
        <AffiliateButton amount={rate.payoutAmount} productId={rate.id} />
      </div>
    </div>
  );
}
