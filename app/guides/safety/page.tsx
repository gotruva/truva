import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getGuideArticle, getGuideArticlesBySlugs } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Insurance and safety guides',
  description: 'Learn how deposit protection works before you decide how much to keep in one bank.',
  alternates: {
    canonical: '/guides/safety',
  },
};

export default function SafetyGuidePage() {
  const featuredArticle = getGuideArticle('pdic-insurance-guide');
  const supportingArticles = getGuideArticlesBySlugs(['how-time-deposits-t-bills-uitfs-work']);
  const itemListJsonLd = buildItemListSchema(
    [featuredArticle, ...supportingArticles].filter(Boolean) as NonNullable<typeof featuredArticle>[],
    BASE_URL
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Insurance and safety"
        description="Use this section when you want the safety boundary before you chase the highest rate."
        breadcrumbItems={[
          { label: 'Guides', href: '/guides' },
          { label: 'Safety', href: '/guides/safety' },
        ]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {featuredArticle && <ArticleCard article={featuredArticle} />}

          <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Safety rule
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Coverage comes before yield
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Use the PDIC limit to decide how much can stay in one bank. Once the balance is safe, compare
              the rate and product mechanics.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/banking/compare/best-digital-bank-100k-250k-500k"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
              >
                <Sparkles className="h-4 w-4" />
                Compare by balance
              </Link>
              <Link
                href="/banking/rates/best-digital-bank-philippines"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                Read the rate guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Supporting reading
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Product mechanics that affect safety decisions
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {supportingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="compact" />
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              The point is not to avoid risk entirely. The point is to understand the limit so you can keep the
              part that needs protection inside the insured boundary.
            </p>
          </div>
        </section>
      </SectionHub>
    </>
  );
}
