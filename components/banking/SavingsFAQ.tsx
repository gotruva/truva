'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { FAQ_ITEMS } from './faq-data';
export type { FaqItem } from './faq-data';

function FaqAccordion({
  item,
  index,
  onOpen,
}: {
  item: FaqItem;
  index: number;
  onOpen: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) onOpen(index);
  }

  return (
    <div className="border-b border-brand-border dark:border-white/10 last:border-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-brand-textPrimary dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-sm"
      >
        <span>{item.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-brand-textSecondary transition-transform duration-200 dark:text-white/50 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-brand-textSecondary dark:text-white/70">
          {item.a}
        </p>
      )}
    </div>
  );
}

export function SavingsFAQ({ onFaqOpened }: { onFaqOpened?: (index: number) => void }) {
  return (
    <section aria-labelledby="faq-heading" className="space-y-4">
      <h2
        id="faq-heading"
        className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white"
      >
        Common questions
      </h2>
      <div className="rounded-2xl border border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.03] divide-y-0 px-5">
        {FAQ_ITEMS.map((item, i) => (
          <FaqAccordion
            key={i}
            item={item}
            index={i}
            onOpen={onFaqOpened ?? (() => {})}
          />
        ))}
      </div>
    </section>
  );
}
