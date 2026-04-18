import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrueValueScoreBadgeProps {
  className?: string;
  compact?: boolean;
}

export function TrueValueScoreBadge({ className, compact = false }: TrueValueScoreBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15',
        compact ? 'text-[11px] font-semibold uppercase tracking-[0.18em]' : 'text-xs font-semibold',
        className
      )}
    >
      <Gauge className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span>True Value Score</span>
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary dark:bg-slate-950/60">
        Coming soon
      </span>
    </div>
  );
}
