import type { EditorialCta } from '@/types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InArticleCTAProps {
  kicker?: string;
  title: string;
  description: string;
  primaryCta: EditorialCta;
  secondaryCta?: EditorialCta;
}

export function InArticleCTA({
  kicker = 'Put this into action',
  title,
  description,
  primaryCta,
  secondaryCta,
}: InArticleCTAProps) {
  return (
    <section className="my-10 overflow-hidden rounded-[1.75rem] border border-brand-primary/15 bg-[linear-gradient(135deg,_rgba(0,82,255,0.08),_rgba(45,212,191,0.08))] p-6 shadow-[0_24px_80px_-52px_rgba(0,82,255,0.55)] dark:border-brand-primary/20 dark:bg-[linear-gradient(135deg,_rgba(0,82,255,0.14),_rgba(45,212,191,0.08))] sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            {kicker}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            {title}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={primaryCta.href}
            className="cta-link inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white no-underline shadow-lg shadow-brand-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-brand-primaryDark"
          >
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="cta-link inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary no-underline transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:border-brand-primary/30"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
