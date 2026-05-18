import { cn } from '@/lib/utils';

interface Props {
  /** zero-based current step */
  stepIndex: number;
  total: number;
  questionTitle: string;
}

/**
 * Segmented progress + step pill. Announces the current question to screen
 * readers via a visually-hidden polite live region (handoff §9).
 */
export function QuizProgress({ stepIndex, total, questionTitle }: Props) {
  const secondsLeft = Math.max(20, 90 - stepIndex * 20);

  return (
    <div className="px-1">
      <p className="sr-only" aria-live="polite">
        Question {stepIndex + 1} of {total}: {questionTitle}
      </p>

      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
          Question {stepIndex + 1} of {total}
        </span>
        <span className="text-[11px] text-brand-textSecondary dark:text-gray-400">
          ~{secondsLeft} sec left
        </span>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= stepIndex
                ? 'bg-brand-primary'
                : 'bg-brand-surface ring-1 ring-inset ring-brand-border dark:bg-white/5 dark:ring-white/10',
            )}
          />
        ))}
      </div>
    </div>
  );
}
