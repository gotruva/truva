'use client';

import { cn } from '@/lib/utils';
import { Sparkles, Wallet, Zap, Plane, Star } from 'lucide-react';

const CATEGORIES = [
  { id: 'first-card', label: 'First Card', icon: Star, color: 'text-brand-primary bg-brand-primary/10' },
  { id: 'naffl', label: 'No Annual Fee', icon: Wallet, color: 'text-emerald-600 bg-emerald-500/10' },
  { id: 'cashback', label: 'Cashback', icon: Zap, color: 'text-amber-600 bg-amber-500/10' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'text-sky-600 bg-sky-500/10' },
  { id: 'rewards', label: 'Rewards', icon: Sparkles, color: 'text-violet-600 bg-violet-500/10' },
];

interface CreditCardCategoryChipsProps {
  activeId?: string;
  onSelect: (id: string) => void;
}

export function CreditCardCategoryChips({ activeId, onSelect }: CreditCardCategoryChipsProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-textSecondary dark:text-gray-400">
          Quick Browse
        </p>
        <div className="flex w-full justify-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={cn(
                  'group flex flex-col items-center space-y-3 rounded-2xl border p-4 transition-all hover:scale-105 active:scale-95 sm:min-w-[120px]',
                  isActive
                    ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                    : 'border-brand-border bg-white hover:border-brand-primary/30 dark:border-white/10 dark:bg-white/5'
                )}
              >
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-brand-primary text-white' : cn('group-hover:bg-brand-primary/20', cat.color)
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  'text-sm font-bold whitespace-nowrap transition-colors',
                  isActive ? 'text-brand-primary' : 'text-brand-textPrimary dark:text-white'
                )}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
