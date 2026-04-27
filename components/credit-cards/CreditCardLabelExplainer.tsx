'use client';

import { Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEES = [
  {
    title: 'Annual Fee',
    desc: 'The cost of owning the card for a year. Many cards offer NAFFL (No Annual Fee For Life) as a promo or for certain tiers.',
    tip: 'Look for NAFFL or cards with easy waiver conditions (e.g., spend ₱100k/year).',
  },
  {
    title: 'Interest Rate',
    desc: 'The monthly charge on unpaid balances. In the Philippines, this is usually capped at 3% per month by the BSP.',
    tip: 'Avoid this entirely by paying your statement in full every month.',
  },
  {
    title: 'Foreign Transaction Fee',
    desc: 'The fee charged when you use your card abroad or for online purchases in foreign currency.',
    tip: 'Range is typically 1.7% to 3.5%. Travelers should look for cards below 2%.',
  },
  {
    title: 'Late Payment Fee',
    desc: 'Charged if you miss the payment due date. Usually a fixed amount (e.g., ₱1,000) or a percentage of the overdue amount.',
    tip: 'Set up auto-debit or calendar alerts to never miss a due date.',
  },
];

export function CreditCardLabelExplainer() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface/30 p-8 dark:border-white/10 dark:bg-white/5 md:p-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-bold text-brand-primary">
              <HelpCircle className="h-4 w-4" />
              Understanding the "Label"
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white md:text-4xl">
              Don't let the fine print surprise you
            </h2>
            <p className="text-lg leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Credit card fees can be confusing. We break down the most common ones so you know exactly what you're signing up for.
            </p>
            
            <div className="space-y-8 pt-4">
              {FEES.map((fee) => (
                <div key={fee.title} className="group flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-brand-border group-hover:ring-brand-primary/30 dark:bg-white/10 dark:ring-white/10">
                    <Info className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-brand-textPrimary dark:text-white">{fee.title}</h3>
                    <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">{fee.desc}</p>
                    <div className="rounded-lg bg-brand-primary/5 px-3 py-2 text-xs font-medium text-brand-primary dark:bg-brand-primary/10">
                      <strong>Pro tip:</strong> {fee.tip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:pl-12">
            {/* Visual "Label" representation */}
            <div className="w-full max-w-sm rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b-8 border-slate-900 pb-2 mb-4 dark:border-slate-800">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Fee Facts</h3>
                <p className="text-xs font-bold text-slate-700 dark:text-gray-400">Based on standard PH bank terms</p>
              </div>
              
              <div className="space-y-3">
                <LabelRow label="Monthly Interest" value="3.0%" isBold />
                <div className="h-2 bg-slate-900 dark:bg-slate-800" />
                <LabelRow label="Annual Fee" value="₱2,500" detail="May be waived" />
                <LabelRow label="Late Fee" value="₱1,000" />
                <LabelRow label="FX Fee" value="2.5%" detail="Average" />
                <LabelRow label="Cash Advance" value="₱200" detail="Per transaction" />
                
                <div className="h-4 bg-slate-900 dark:bg-slate-800 mt-6" />
                <p className="text-[10px] leading-tight text-slate-500 mt-2 dark:text-gray-500 italic">
                  * Values shown are illustrative averages. Always check the Specific Terms & Conditions of your chosen bank.
                </p>
              </div>
            </div>
            
            {/* Decorative background blobs */}
            <div className="absolute -z-10 h-64 w-64 rounded-full bg-brand-primary/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LabelRow({ label, value, detail, isBold }: { label: string; value: string; detail?: string; isBold?: boolean }) {
  return (
    <div className="flex flex-col border-b border-slate-200 py-1 dark:border-slate-800">
      <div className="flex items-end justify-between">
        <span className={cn("text-sm uppercase font-black tracking-tight", isBold ? "text-base" : "text-slate-900 dark:text-white")}>
          {label}
        </span>
        <span className={cn("font-black tabular-nums", isBold ? "text-xl" : "text-slate-900 dark:text-white")}>
          {value}
        </span>
      </div>
      {detail && <span className="text-[10px] font-bold text-slate-500 uppercase">{detail}</span>}
    </div>
  );
}
