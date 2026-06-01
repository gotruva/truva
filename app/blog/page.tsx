import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BLOG_CATEGORIES, getBlogPosts, getFeaturedPost } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Truva Blog — plain-language money guides for Filipinos',
  description:
    'Rate guides, reviews, and comparisons that turn Philippine savings, deposits, and credit-card decisions into clear next steps.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();
  const featured = getFeaturedPost();
  const rest = posts.filter((post) => post.slug !== featured?.slug);

  return (
    <SectionHub
      title="Truva Blog"
      description="Plain-language guides on savings, deposits, and credit cards — each one ending in a clear next step, not just a read."
      breadcrumbItems={[{ label: 'Blog', href: '/blog' }]}
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap gap-3">
        {BLOG_CATEGORIES.map((category) => (
          <Link
            key={category.value}
            href={`/blog/category/${category.value}`}
            className="rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
          >
            {category.label}
          </Link>
        ))}
      </section>

      {featured && (
        <section>
          <FeaturedArticleCard article={featured} />
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            Latest articles
          </h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((post) => (
              <ArticleCard key={post.slug} article={post} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </SectionHub>
  );
}
