import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BASE_URL } from '@/lib/constants';
import { EditorialHero } from '@/components/editorial/EditorialHero';
import { InArticleCTA } from '@/components/editorial/InArticleCTA';
import { RelatedArticles } from '@/components/editorial/RelatedArticles';
import { StickyTOC } from '@/components/editorial/StickyTOC';
import { getBankingArticlesBySlugs } from '@/lib/editorial';
import type { EditorialArticle } from '@/types';

interface BlogLayoutProps {
  children: ReactNode;
  article: EditorialArticle;
}

export function BlogLayout({
  children,
  article,
}: BlogLayoutProps) {
  const relatedArticles =
    article.category === 'banking'
      ? getBankingArticlesBySlugs(article.relatedArticles).filter((entry) => entry.slug !== article.slug)
      : [];

  const breadcrumbs = [
    { label: article.categoryLabel, href: `/${article.category}` },
    {
      label: article.articleType === 'Review' ? 'Reviews' : article.section === 'compare' ? 'Compare' : 'Rates',
      href: `/${article.category}/${article.section}`,
    },
    { label: article.title, href: article.path },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    articleSection: article.categoryLabel,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: `${BASE_URL}${article.path}`,
    keywords: article.keywords?.join(', '),
  };

  const faqJsonLd = article.faqItems?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8f9fb_18%,#ffffff_55%,#f8f9fb_100%)] py-10 dark:bg-[linear-gradient(180deg,#020617_0%,#081225_24%,#020617_100%)] sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}

        <Breadcrumbs items={breadcrumbs} />
        <EditorialHero article={article} />

        <div className="mt-6">
          <StickyTOC items={article.toc} mobile />
        </div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0 space-y-8">
            <article className="prose-truva rounded-[2rem] border border-brand-border/70 bg-white px-5 py-8 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04] sm:px-8 lg:px-10">
              {children}
            </article>

            <InArticleCTA
              title="Turn the insight into a practical next step"
              description="Use one of Truva's utility surfaces next so this article becomes a decision, not just a tab you close."
              primaryCta={article.primaryCta}
              secondaryCta={article.secondaryCta}
            />

            <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                    Editorial trust
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                    Clear, current, and connected to action
                  </h2>
                  <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {article.disclosureNote ?? 'We review product conditions regularly and connect each article to the tool or comparison page that helps you act on it.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/methodology"
                    className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                  >
                    <ShieldCheck className="h-4 w-4 text-brand-primary" />
                    View methodology
                  </Link>
                  <Link
                    href="/banking"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
                  >
                    Browse Banking
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            <RelatedArticles title="More Banking intelligence" articles={relatedArticles} />
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-4">
              <StickyTOC items={article.toc} />
              <div className="rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                  Next move
                </p>
                <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                  {article.primaryCta.label}
                </h3>
                {article.primaryCta.description && (
                  <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {article.primaryCta.description}
                  </p>
                )}
                <Link
                  href={article.primaryCta.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
                >
                  Open the tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
