'use client';

import { CreditCard as CardIcon, Plane, Wallet, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GoalId, IncomeBracketId } from '@/lib/creditCardValue';

interface Props {
  goal: GoalId | null;
  income: IncomeBracketId | null;
  onGoalSelect: (goal: GoalId) => void;
  onIncomeSelect: (income: IncomeBracketId) => void;
}

const GOALS: Array<{ id: GoalId; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'no-annual-fee', label: 'No Annual Fee', sub: 'Keep the card free forever', icon: Wallet },
  { id: 'cashback',      label: 'Cashback',      sub: 'Get money back on every spend', icon: Zap },
  { id: 'travel',        label: 'Travel & Miles', sub: 'Earn points for flights & hotels', icon: Plane },
  { id: 'first-card',    label: 'My First Card',  sub: 'Easy approval for beginners', icon: CardIcon },
];

const INCOMES: Array<{ id: IncomeBracketId; label: string; sub: string }> = [
  { id: '15k',  label: '₱15,000+/mo', sub: 'Entry-level cards' },
  { id: '31k',  label: '₱30,000+/mo', sub: 'Mid-tier cards' },
  { id: '51k',  label: '₱50,000+/mo', sub: 'Premium cards' },
  { id: '100k', label: '₱100,000+/mo', sub: 'Elite & Infinite' },
];

export function CreditCardMatchWidget({ goal, income, onGoalSelect, onIncomeSelect }: Props) {
  return (
    <div id="match" className="scroll-mt-24 mx-auto max-w-3xl px-4">
      <div className="rounded-[2rem] border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white/5 p-6 md:p-8 space-y-8">

        {/* Q1: Goal */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Step 1</p>
            <h2 className="mt-1 text-xl font-bold text-brand-textPrimary dark:text-white">
              What matters most to you?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map(({ id, label, sub, icon: Icon }) => {
              const active = goal === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onGoalSelect(id)}
                  className={cn(
                    'flex flex-col items-start rounded-2xl border p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                    active
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary dark:bg-brand-primary/10'
                      : 'border-brand-border bg-white hover:border-brand-primary/30 dark:border-white/10 dark:bg-white/5',
                  )}
                >
                  <div className={cn(
                    'mb-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                    active
                      ? 'bg-brand-primary text-white'
                      : 'bg-brand-surface text-brand-textSecondary dark:bg-white/5',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-brand-textPrimary dark:text-white">{label}</span>
                  <span className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-400">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q2: Income — unlocks after goal is picked */}
        <div className={cn('space-y-4 transition-opacity duration-300', goal ? 'opacity-100' : 'opacity-40 pointer-events-none')}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Step 2</p>
            <h2 className="mt-1 text-xl font-bold text-brand-textPrimary dark:text-white">
              What is your monthly income?
            </h2>
            <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
              Banks use this to decide which cards you qualify for.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {INCOMES.map(({ id, label, sub }) => {
              const active = income === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => goal && onIncomeSelect(id)}
                  className={cn(
                    'flex flex-col items-start rounded-2xl border p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                    active
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary dark:bg-brand-primary/10'
                      : 'border-brand-border bg-white hover:border-brand-primary/30 dark:border-white/10 dark:bg-white/5',
                  )}
                >
                  <span className="text-sm font-bold text-brand-textPrimary dark:text-white">{label}</span>
                  <span className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-400">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
