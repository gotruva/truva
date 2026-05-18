import Link from 'next/link';
import {
  AlertTriangle,
  ChevronRight,
  Info,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { FALLBACK } from '@/lib/creditCardFinder/copy';
import { AffiliateDisclosure } from '../shared/AffiliateDisclosure';

interface Props {
  editHref: string;
  beginnerHref: string;
  guideHref: string;
}

const ICONS = [Sparkles, Wallet, Shield];

export function NoMatchFallback({ editHref, beginnerHref, guideHref }: Props) {
  const hrefs = [editHref, beginnerHref, guideHref];

  return (
    <div className="mx-auto max-w-3xl px-4 py-2">
      <div className="rounded-2xl border border-brand-border bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle className="h-3 w-3" />
          {FALLBACK.eyebrow}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
          {FALLBACK.h2}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {FALLBACK.sub}
        </p>
      </div>

      <p className="mb-3 mt-6 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-textSecondary dark:text-gray-400">
        {FALLBACK.optionsHeading}
      </p>

      <div className="space-y-2.5">
        {FALLBACK.options.map((opt, i) => {
          const Icon = ICONS[i] ?? Sparkles;
          return (
            <Link
              key={opt.title}
              href={hrefs[i]}
              className="block rounded-2xl border border-brand-border bg-white p-4 transition-colors hover:border-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/15">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-textPrimary dark:text-white">
                    {opt.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                    {opt.body}
                  </p>
                </div>
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
                  {opt.cta}
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-dashed border-brand-border bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-textSecondary dark:text-gray-400" />
        <p className="text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
          <strong className="text-brand-textPrimary dark:text-gray-200">
            Why this happens:
          </strong>{' '}
          {FALLBACK.whyThisHappens}
        </p>
      </div>

      <AffiliateDisclosure size="footer" className="mt-5" />
    </div>
  );
}
