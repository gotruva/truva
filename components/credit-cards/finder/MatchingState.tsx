'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATCHING } from '@/lib/creditCardFinder/copy';

/**
 * Calm matching screen. Bullets animate in serially (0, 300, 700, 1100 ms).
 * Reduced motion: no spinner/pulse — render final state instantly (handoff §9).
 * Navigation timing (min 1.2s / max 2s) is owned by the parent flow.
 */
export function MatchingState() {
  const reduceMotion = useReducedMotion();
  const total = MATCHING.checkoffs.length;
  const [progress, setProgress] = useState(reduceMotion ? total : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const timers = [300, 700, 1100, 1500].map((ms, i) =>
      setTimeout(() => setProgress(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <div className="relative mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-white">
        {!reduceMotion && (
          <span className="absolute inset-0 animate-ping rounded-2xl bg-brand-primary/30" />
        )}
        <Sparkles className="relative h-7 w-7" />
      </div>

      <h2 className="mb-2.5 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
        {MATCHING.h2}
      </h2>
      <p className="mb-7 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
        {MATCHING.sub}
      </p>

      <ul className="flex flex-col gap-1">
        {MATCHING.checkoffs.map((bullet, i) => {
          const state =
            i < progress ? 'done' : i === progress ? 'doing' : 'todo';
          return (
            <li
              key={bullet}
              className="flex items-center gap-3 py-3"
              aria-live="polite"
            >
              <span
                className={cn(
                  'flex h-[22px] w-[22px] items-center justify-center rounded-full transition-colors',
                  state === 'done'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : state === 'doing'
                      ? 'ring-2 ring-brand-primary'
                      : 'ring-1 ring-brand-border dark:ring-white/15',
                )}
              >
                {state === 'done' && <Check className="h-3 w-3" />}
                {state === 'doing' && !reduceMotion && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-primary border-r-transparent" />
                )}
              </span>
              <span
                className={cn(
                  'text-[15px]',
                  state === 'todo'
                    ? 'text-brand-textSecondary dark:text-gray-500'
                    : 'font-medium text-brand-textPrimary dark:text-white',
                )}
              >
                {bullet}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
