import { LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrueValueScoreBadgeProps {
  className?: string;
  compact?: boolean;
  showReason?: boolean;
}

export function TrueValueScoreBadge({
  className,
  compact = false,
  showReason = false,
}: TrueValueScoreBadgeProps) {
  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200',
          compact ? 'text-[11px] font-semibold uppercase tracking-[0.18em]' : 'text-xs font-semibold',
        )}
        title="We only show a True Value Score when fees, rewards, income requirements, and source data are complete enough to compare fairly."
      >
        <LockKeyhole className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span>True Value Score</span>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-950/60 dark:text-gray-300">
          Coming later
        </span>
      </div>
      {showReason ? (
        <p className="max-w-sm text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
          Scores come later, after enough card details are complete and fair to compare.
        </p>
      ) : null}
    </div>
  );
}
