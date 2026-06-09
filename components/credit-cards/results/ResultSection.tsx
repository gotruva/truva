import type { ReactNode } from 'react';

interface Props {
  /** Optional rank prefix ("1. "). Omitted in the B3 top-match / other-options layout. */
  index?: number;
  label: string;
  sub: string;
  /** Tailwind text color class for the label. */
  toneClass: string;
  /** Larger, bolder label for the lead "top match" section (B3). */
  prominent?: boolean;
  children: ReactNode;
}

/** Section banner wrapping a ResultCard (handoff §4; B3 top-match emphasis). */
export function ResultSection({
  index,
  label,
  sub,
  toneClass,
  prominent = false,
  children,
}: Props) {
  return (
    <section className="mb-6">
      <div className="mb-2.5 px-1">
        <p
          className={
            prominent
              ? `text-sm font-extrabold uppercase tracking-[0.12em] ${toneClass}`
              : `text-[11px] font-bold uppercase tracking-[0.1em] ${toneClass}`
          }
        >
          {index != null ? `${index}. ` : ''}
          {label}
        </p>
        <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-400">
          {sub}
        </p>
      </div>
      {children}
    </section>
  );
}
