import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import { ArticleHubClient } from '@/components/editorial/ArticleHubClient';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getGuideArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Investing in the Philippines | Truva',
  description:
    'Money market funds, T-Bills, UITFs, and time deposits explained. Make smarter investing decisions in the Philippines with real after-tax math.',
  alternates: {
    canonical: '/investing',
  },
};

const TRUST_PILLS = [
  { icon: Zap, label: 'Liquid 1–5 days' },
  { icon: Shield, label: 'Not PDIC-insured' },
  { icon: TrendingUp, label: 'Net yield after fees' },
];

export default function InvestingPage() {
  const articles = getGuideArticles();
  const itemListJsonLd = buildItemListSchema(articles, BASE_URL);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <section className="bg-gradient-to-br from-emerald-950 via-green-900 to-slate-900 py-10 px-4 sm:py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
            Investing
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Put your money to work.
            <span className="mt-1 block bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              Smarter returns, clearly explained.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-100/70">
            From money market funds to T-Bills to UITFs — understand every option before you commit a peso.
          </p>
          <div className="mt-6">
            <Link
              href="/banking/money-market-funds"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30"
            >
              Compare money market funds
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-md"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-300" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-brand-surface dark:bg-slate-950 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ArticleHubClient
            articles={articles}
            featuredSlug="how-time-deposits-t-bills-uitfs-work"
            searchPlaceholder="Search investing guides..."
          />
        </div>
      </div>
    </div>
  );
}
