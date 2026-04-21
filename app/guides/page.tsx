import type { Metadata } from 'next';
import { BookOpen, Shield, CheckCircle2 } from 'lucide-react';
import { ArticleHubClient } from '@/components/editorial/ArticleHubClient';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getGuideArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Finance & Lifestyle Guides | Truva',
  description:
    'Understand the mechanics of Philippine finance. Guides on final withholding tax, PDIC insurance, time deposits, T-Bills, and more.',
  alternates: {
    canonical: '/guides',
  },
};

const TRUST_PILLS = [
  { icon: BookOpen, label: 'Plain-language guides' },
  { icon: Shield, label: 'PDIC & safety explained' },
  { icon: CheckCircle2, label: 'Tax math demystified' },
];

export default function GuidesPage() {
  const articles = getGuideArticles();
  const itemListJsonLd = buildItemListSchema(articles, BASE_URL);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <section className="bg-gradient-to-br from-amber-950 via-orange-900 to-slate-900 py-10 px-4 sm:py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
            Finance &amp; Lifestyle
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Money made simple.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-amber-100/70">
            No jargon. No fine print. Just clear guides on tax, PDIC insurance, and how every financial product actually works — so you can stop guessing and start deciding.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100 backdrop-blur-md"
              >
                <Icon className="h-3.5 w-3.5 text-amber-300" />
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
            featuredSlug="final-withholding-tax-explained"
            searchPlaceholder="Search guides..."
          />
        </div>
      </div>
    </div>
  );
}
