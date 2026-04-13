import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, HelpCircle, ShieldCheck, Scale } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getFeaturedGuideArticle, getGuideArticles, getGuideArticlesBySlugs } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Philippine Financial Guides and Learning | Truva',
  description:
    'Understand the mechanics of Philippine finance. Guides on final withholding tax, PDIC insurance, time deposits, T-Bills, and more.',
  alternates: {
    canonical: '/guides',
  },
};

const guideCategories = [
  {
    title: 'Taxation and laws',
    description: 'Learn how the 20% Final Withholding Tax changes your after-tax return.',
    href: '/guides/taxation',
    icon: Scale,
    color: 'text-brand-primary',
  },
  {
    title: 'Insurance and safety',
    description: 'Understand PDIC protection and how to keep large balances inside the insured limit.',
    href: '/guides/safety',
    icon: ShieldCheck,
    color: 'text-brand-success',
  },
  {
    title: 'Product mechanics',
    description: 'See how time deposits, T-Bills, and UITFs actually work before you compare rates.',
    href: '/guides/mechanics',
    icon: HelpCircle,
    color: 'text-amber-500',
  },
];

const quickLinks = [
  { label: 'All articles', href: '/articles' },
  { label: 'Best digital bank', href: '/banking/rates/best-digital-bank-philippines' },
  { label: 'PDIC insurance', href: '/guides/pdic-insurance-guide' },
  { label: 'Calculator', href: '/calculator' },
];

export default function GuidesHub() {
  const featuredArticle = getFeaturedGuideArticle();
  const supportingArticles = getGuideArticlesBySlugs([
    'pdic-insurance-guide',
    'how-time-deposits-t-bills-uitfs-work',
  ]);
  const itemListJsonLd = buildItemListSchema(getGuideArticles(), BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Financial guides and learning"
        description="We simplify the jargon and explain the mechanics of Philippine finance so you can invest with confidence."
        breadcrumbItems={[{ label: 'Guides', href: '/guides' }]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-6 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-7">
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
                <BookOpen className="h-4 w-4" />
                Guides hub
              </div>
              <div className="space-y-3">
                <h2 className="max-w-xl text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                  Start with the rule, then compare the return.
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  The guides section explains the tax, safety, and product mechanics that change the answer
                  before you even look at the headline rate.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {guideCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group relative rounded-[1.75rem] border border-brand-border/80 bg-white p-5 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-full flex-col gap-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 ${category.color} dark:bg-brand-primary/15`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                    {category.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {category.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Latest articles
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Read the article, then use the tool
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {supportingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="compact" />
            ))}
          </div>
        </section>
      </SectionHub>
    </>
  );
}
