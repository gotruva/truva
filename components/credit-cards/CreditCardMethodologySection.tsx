'use client';

import { FileSearch, ShieldCheck, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';

const PILLARS = [
  {
    title: 'Fee Economics',
    desc: 'We weigh the annual fee against the ease of waiver and the basic value of the card.',
    icon: BarChart3,
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    title: 'Reward Value',
    desc: 'How much actual PHP value you get per peso spent, normalized across categories.',
    icon: ShieldCheck,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    title: 'Eligibility Fit',
    desc: 'Matches income requirements with the target user to ensure a realistic comparison.',
    icon: Users,
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    title: 'Issuer Trust',
    desc: 'Based on bank reputation, app stability, and customer service feedback.',
    icon: FileSearch,
    color: 'text-violet-500 bg-violet-500/10',
  },
];

export function CreditCardMethodologySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Our Methodology
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white md:text-4xl">
          How we score credit cards
        </h2>
        <p className="max-w-2xl text-lg text-brand-textSecondary dark:text-gray-400">
          Truva Value Scores are built on data, not bank partnerships. We use four key pillars to rank every card fairly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="group rounded-3xl border border-brand-border bg-white p-6 transition-all hover:border-brand-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
          >
            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${pillar.color}`}>
              <pillar.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-brand-textPrimary dark:text-white group-hover:text-brand-primary">
              {pillar.title}
            </h3>
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/methodology/credit-cards"
          className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-8 py-3 text-[15px] font-bold text-brand-textPrimary transition-all hover:bg-brand-surface dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <FileSearch className="h-4 w-4" />
          Read the full scoring methodology
        </Link>
      </div>
    </section>
  );
}
