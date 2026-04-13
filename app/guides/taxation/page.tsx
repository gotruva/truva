import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, FileText } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getGuideArticlesBySlugs, getGuideArticle } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Taxation and laws guides',
  description: 'Understand the tax rules that change your after-tax return in the Philippines.',
  alternates: {
    canonical: '/guides/taxation',
  },
};

export default function TaxationGuidePage() {
  const featuredArticle = getGuideArticle('final-withholding-tax-explained');
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
        title="Taxation and laws"
        description="Start here when you want to understand the tax rule before comparing the rate itself."
        breadcrumbItems={[
          { label: 'Guides', href: '/guides' },
          { label: 'Taxation', href: '/guides/taxation' },
        ]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {featuredArticle && <ArticleCard article={featuredArticle} />}

          <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              What to do next
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Turn the tax rule into a better decision
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Once you understand the withholding tax, move into the live rate desk or the calculator so
              you can compare net return instead of marketing copy.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
              >
                <Calculator className="h-4 w-4" />
                Open calculator
              </Link>
              <Link
                href="/banking/rates/best-digital-bank-philippines"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                Read the flagship guide
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
              Related mechanics that affect after-tax decisions
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
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              The goal here is simple: show the rule first, then show the rate. That keeps the comparison
              honest and makes the rest of the site easier to trust.
            </p>
          </div>
        </section>
      </SectionHub>
    </>
  );
}
