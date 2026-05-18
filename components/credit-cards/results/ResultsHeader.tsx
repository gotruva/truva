import Link from 'next/link';
import {
  ANSWER_CHIP_LABELS,
  CHIP_QUESTION_LABELS,
  RESULTS,
} from '@/lib/creditCardFinder/copy';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';

interface Props {
  answers: FinderAnswers;
  editHref: string;
}

const ORDER: (keyof FinderAnswers)[] = [
  'first',
  'income',
  'spend',
  'priority',
  'avoid',
];

export function ResultsHeader({ answers, editHref }: Props) {
  const chips = ORDER.filter((k) => answers[k]).map((k) => ({
    q: CHIP_QUESTION_LABELS[k],
    a: ANSWER_CHIP_LABELS[answers[k] as string] ?? String(answers[k]),
  }));

  return (
    <div className="border-b border-brand-border bg-white px-4 pb-6 pt-2 dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            {RESULTS.h1}
          </h1>
          <Link
            href={editHref}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Edit answers
          </Link>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {RESULTS.sub}
        </p>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c.q}
                className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <span className="text-brand-textSecondary/70 dark:text-gray-500">
                  {c.q}:{' '}
                </span>
                {c.a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
