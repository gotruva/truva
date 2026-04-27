'use client';

import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const GUIDES = [
  {
    title: 'Credit Card 101: How it works',
    desc: 'New to credit? Start here to understand statements, due dates, and billing cycles.',
    href: '/guides/credit-cards-basics',
  },
  {
    title: 'How to get your first credit card',
    desc: 'Practical tips on getting approved by Philippine banks, even with no credit history.',
    href: '/guides/getting-approved-ph',
  },
  {
    title: 'Maximizing your credit card rewards',
    desc: 'Learn how to turn your daily spending into free flights, cashback, and shopping points.',
    href: '/guides/maximizing-rewards',
  },
];

export function EducationalGuidesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col items-start space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <BookOpen className="h-3 w-3" />
          Learn & Master
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
          Level up your financial lifestyle
        </h2>
        <p className="max-w-2xl text-brand-textSecondary dark:text-gray-400">
          Our expert-written guides help you master your money and get the most out of your cards.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.title}
            href={guide.href}
            className="group flex flex-col justify-between rounded-3xl border border-brand-border bg-white p-6 transition-all hover:border-brand-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <h3 className="mb-3 text-lg font-bold text-brand-textPrimary dark:text-white group-hover:text-brand-primary transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
                {guide.desc}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-brand-primary">
              Read guide
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
