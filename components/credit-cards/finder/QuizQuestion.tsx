'use client';

import { useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestionDef } from '@/lib/creditCardFinder/questions';
import { QuizProgress } from './QuizProgress';
import { QuizReassurance } from './QuizReassurance';
import { QuizChoiceTile } from './QuizChoiceTile';

interface Props {
  question: QuizQuestionDef;
  stepIndex: number;
  total: number;
  selectedId: string | null;
  onSelect: (optionId: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function QuizQuestion({
  question,
  stepIndex,
  total,
  selectedId,
  onSelect,
  onBack,
  onSkip,
}: Props) {
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // Q1/Q2 → Cancel (leave finder); Q3+ → Skip (record null, no penalty).
  const canSkip = stepIndex >= 2;

  const focusTile = (i: number) => {
    const n = question.options.length;
    const idx = (i + n) % n;
    tileRefs.current[idx]?.focus();
  };

  const handleKeyDown =
    (i: number): React.KeyboardEventHandler<HTMLButtonElement> =>
    (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        focusTile(i + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        focusTile(i - 1);
      }
    };

  const activeIndex = Math.max(
    0,
    question.options.findIndex((o) => o.id === selectedId),
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col px-4 pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between py-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-xl text-brand-textPrimary transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:text-white dark:hover:bg-white/10"
          aria-label="Go back one step"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-brand-textSecondary dark:text-gray-400">
          Card finder
        </span>
        <button
          type="button"
          onClick={canSkip ? onSkip : onBack}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-textSecondary transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:text-gray-400 dark:hover:bg-white/10"
        >
          {canSkip ? 'Skip' : 'Cancel'}
        </button>
      </div>

      <QuizProgress
        stepIndex={stepIndex}
        total={total}
        questionTitle={question.title}
      />

      {/* Question */}
      <div className="flex-1 pt-6">
        <h2
          className={cn(
            'text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white',
            question.helper ? 'mb-2' : 'mb-5',
          )}
        >
          {question.title}
        </h2>
        {question.helper && (
          <p className="mb-5 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
            {question.helper}
          </p>
        )}

        <div
          role="radiogroup"
          aria-label={question.title}
          className="flex flex-col gap-2.5"
        >
          {question.options.map((o, i) => (
            <QuizChoiceTile
              key={o.id}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              id={o.id}
              label={o.label}
              subtle={o.subtle}
              selected={selectedId === o.id}
              tabIndex={i === activeIndex ? 0 : -1}
              onSelect={() => onSelect(o.id)}
              onKeyDown={handleKeyDown(i)}
            />
          ))}
        </div>
      </div>

      <div className="pt-5">
        <QuizReassurance sticky />
      </div>
    </div>
  );
}
