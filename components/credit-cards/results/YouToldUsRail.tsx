import {
  ANSWER_CHIP_LABELS,
  CHIP_QUESTION_LABELS,
  DETAIL,
} from '@/lib/creditCardFinder/copy';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';

const ORDER: (keyof FinderAnswers)[] = [
  'first',
  'income',
  'spend',
  'priority',
  'avoid',
];

/**
 * "You told us" chip rail for the detail page. Answers arrive via URL params
 * (?from=finder&first=...), so this stays a server component — no
 * localStorage read in server code (Mardil amendment 5).
 */
export function YouToldUsRail({ answers }: { answers: FinderAnswers }) {
  const chips = ORDER.filter((k) => answers[k]).map((k) => ({
    q: CHIP_QUESTION_LABELS[k],
    a: ANSWER_CHIP_LABELS[answers[k] as string] ?? String(answers[k]),
  }));

  if (chips.length === 0) return null;

  return (
    <section className="rounded-[1.4rem] border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-textSecondary dark:text-gray-400">
        {DETAIL.youToldUs}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c.q}
            className="rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
          >
            <span className="text-brand-textSecondary/70 dark:text-gray-500">
              {c.q}:{' '}
            </span>
            {c.a}
          </span>
        ))}
      </div>
    </section>
  );
}
