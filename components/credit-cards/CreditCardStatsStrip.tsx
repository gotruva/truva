'use client';

import { useMemo } from 'react';
import { BarChart2, Clock, CreditCard, Landmark } from 'lucide-react';
import { estimateAnnualValue, BROWSE_DEFAULT_INCOME, BROWSE_DEFAULT_CATEGORY } from '@/lib/creditCardValue';
import type { CreditCard as CreditCardType } from '@/types';

export function CreditCardStatsStrip({ cards }: { cards: CreditCardType[] }) {
  const stats = useMemo(() => {
    const banks = new Set(cards.map((c) => c.bank)).size;
    const total = cards.length;
    const avgAnnual =
      total > 0
        ? cards.reduce(
            (sum, c) =>
              sum + estimateAnnualValue(c, BROWSE_DEFAULT_INCOME, BROWSE_DEFAULT_CATEGORY).netAnnual,
            0,
          ) / total
        : 0;
    return { banks, total, avgAnnual };
  }, [cards]);

  const tiles = [
    {
      icon: Landmark,
      value: String(stats.banks),
      label: 'PH banks covered',
    },
    {
      icon: CreditCard,
      value: String(stats.total),
      label: 'cards compared',
    },
    {
      icon: BarChart2,
      value: '₱' + Math.round(stats.avgAnnual).toLocaleString('en-PH'),
      label: 'avg. value / year',
    },
    {
      icon: Clock,
      value: '30 sec',
      label: 'to find your match',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-brand-border bg-white px-4 py-5 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                <Icon className="h-4.5 w-4.5 h-[1.125rem] w-[1.125rem]" />
              </div>
              <p className="text-xl font-black tabular-nums text-brand-textPrimary dark:text-white">
                {tile.value}
              </p>
              <p className="text-xs text-brand-textSecondary dark:text-gray-400">{tile.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
