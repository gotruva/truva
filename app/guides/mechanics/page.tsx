import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, Clock3 } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getGuideArticle, getGuideArticlesBySlugs } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Product mechanics guides',
  description: 'Understand time deposits, T-Bills, and UITFs before you decide where to park cash.',
  alternates: {
    canonical: '/guides/mechanics',
  },
};

export default function MechanicsGuidePage() {
  const featuredArticle = getGuideArticle('how-time-deposits-t-bills-uitfs-work');
  const supportingArticles = getGuideArticlesBySlugs([
    'final-withholding-tax-explained',
    'pdic-insurance-guide',
  ]);
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
        title="Product mechanics"
        description="Compare how the products work before you compare the headline rate."
        breadcrumbItems={[
          { label: 'Guides', href: '/guides' },
          { label: 'Mechanics', href: '/guides/mechanics' },
        ]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {featuredArticle && <ArticleCard article={featuredArticle} />}

          <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Compare the mechanics
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Liquidity, tax, and risk decide the winner
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              A product with a lower headline rate can still be the better choice if it is easier to access,
              less risky, or more tax efficient.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/banking/compare/best-no-conditions-savings"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
              >
                <BarChart3 className="h-4 w-4" />
                Compare account styles
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                <Clock3 className="h-4 w-4" />
                Run the calculator
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
              Foundational guides for product comparisons
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
            <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              This section is where rate comparison starts to become useful. Once you understand the mechanics,
              the calculator and the rate desk can actually answer the question you care about.
            </p>
          </div>
        </section>
      </SectionHub>
    </>
  );
}
