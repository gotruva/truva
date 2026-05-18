import type { ReactNode } from 'react';

interface Props {
  index: number;
  label: string;
  sub: string;
  /** Tailwind text color class for the numbered label. */
  toneClass: string;
  children: ReactNode;
}

/** Numbered ranked-section banner wrapping a ResultCard (handoff §4). */
export function ResultSection({
  index,
  label,
  sub,
  toneClass,
  children,
}: Props) {
  return (
    <section className="mb-6">
      <div className="mb-2.5 px-1">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.1em] ${toneClass}`}
        >
          {index}. {label}
        </p>
        <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-400">
          {sub}
        </p>
      </div>
      {children}
    </section>
  );
}
