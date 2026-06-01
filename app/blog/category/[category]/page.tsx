import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { BLOG_CATEGORIES, getBlogPostsByCategory } from '@/lib/blog';
import type { EditorialArticle } from '@/types';

export const dynamicParams = false;

const CATEGORY_DESCRIPTIONS: Record<EditorialArticle['category'], string> = {
  banking: 'Rate guides, digital bank reviews, and account comparisons for Philippine savers.',
  'credit-cards': 'Cashback, rewards, and travel card reviews with clear paths into card discovery.',
  guides: 'Tax, PDIC, and product mechanics explained in plain language.',
};

function getCategory(slug: string) {
  return BLOG_CATEGORIES.find((category) => category.value === slug);
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.label} — Truva Blog`,
    description: CATEGORY_DESCRIPTIONS[category.value],
    alternates: { canonical: `/blog/category/${category.value}` },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const posts = getBlogPostsByCategory(category.value);

  return (
    <SectionHub
      title={category.label}
      description={CATEGORY_DESCRIPTIONS[category.value]}
      breadcrumbItems={[
        { label: 'Blog', href: '/blog' },
        { label: category.label, href: `/blog/category/${category.value}` },
      ]}
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap gap-3">
        <Link
          href="/blog"
          className="rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
        >
          All articles
        </Link>
        {BLOG_CATEGORIES.map((entry) => (
          <Link
            key={entry.value}
            href={`/blog/category/${entry.value}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              entry.value === category.value
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-brand-border bg-white text-brand-textPrimary hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100'
            }`}
          >
            {entry.label}
          </Link>
        ))}
      </section>

      {posts.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.slug} article={post} variant="compact" />
          ))}
        </section>
      ) : (
        <p className="text-brand-textSecondary dark:text-gray-400">
          No articles here yet. Check back soon.
        </p>
      )}
    </SectionHub>
  );
}
