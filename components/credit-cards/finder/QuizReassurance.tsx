import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REASSURANCE } from '@/lib/creditCardFinder/copy';

/**
 * Reassurance card reused on landing and every quiz screen. On mobile it
 * sticks to the bottom edge with a soft fade so it stays visible while the
 * choices scroll.
 */
export function QuizReassurance({ sticky = false }: { sticky?: boolean }) {
  return (
    <div
      className={cn(
        sticky &&
          'sticky bottom-0 bg-gradient-to-b from-transparent via-white/80 to-white pt-3 dark:via-slate-950/80 dark:to-slate-950',
      )}
    >
      <div className="flex items-start gap-2.5 rounded-xl border border-brand-border bg-brand-surface px-3.5 py-3 dark:border-white/10 dark:bg-white/5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {REASSURANCE}
        </p>
      </div>
    </div>
  );
}
