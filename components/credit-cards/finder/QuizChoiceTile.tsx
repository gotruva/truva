'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptionIcon } from './optionIcons';

interface Props {
  id: string;
  label: string;
  subtle?: boolean;
  selected: boolean;
  /** roving tabindex within the radiogroup */
  tabIndex: number;
  onSelect: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
}

/**
 * A single choice. Renders as <button role="radio"> so it works with the
 * parent role="radiogroup" and keyboard. ≥56px hit target. "Subtle" options
 * ("Prefer not to say" / "I'm not sure") are de-emphasised but never penalised.
 */
export const QuizChoiceTile = forwardRef<HTMLButtonElement, Props>(
  function QuizChoiceTile(
    { id, label, subtle, selected, tabIndex, onSelect, onKeyDown },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        tabIndex={tabIndex}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={cn(
          'flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
          'active:scale-[0.99]',
          selected
            ? 'border-brand-primary bg-brand-primaryLight ring-2 ring-brand-primary/20 dark:bg-brand-primary/15'
            : subtle
              ? 'border-brand-border bg-brand-surface hover:border-brand-primary/30 dark:border-white/10 dark:bg-white/5'
              : 'border-brand-border bg-white hover:border-brand-primary/30 dark:border-white/10 dark:bg-white/5',
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
            selected
              ? 'bg-brand-primary text-white'
              : subtle
                ? 'border border-dashed border-brand-border bg-white text-brand-textSecondary dark:bg-white/5'
                : 'bg-brand-surface text-brand-textSecondary dark:bg-white/5',
          )}
        >
          <OptionIcon id={id} className="h-4 w-4" />
        </span>

        <span
          className={cn(
            'flex-1 text-[15px]',
            selected
              ? 'font-bold text-brand-textPrimary dark:text-white'
              : subtle
                ? 'font-medium text-brand-textSecondary dark:text-gray-400'
                : 'font-semibold text-brand-textPrimary dark:text-white',
          )}
        >
          {label}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-brand-primary bg-brand-primary text-white'
              : 'border-brand-border bg-transparent dark:border-white/20',
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </span>
      </button>
    );
  },
);
