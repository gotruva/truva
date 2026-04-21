'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { EditorialArticle } from '@/types';
import { ArticleCard } from './ArticleCard';

interface CategoryOption {
  label: string;
  value: string;
}

interface ArticleHubClientProps {
  articles: EditorialArticle[];
  categories?: CategoryOption[];
  searchPlaceholder?: string;
  featuredSlug?: string;
}

export function ArticleHubClient({
  articles,
  categories,
  searchPlaceholder = 'Search articles...',
  featuredSlug,
}: ArticleHubClientProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const featured = featuredSlug ? articles.find((a) => a.slug === featuredSlug) : null;

  const filtered = useMemo(() => {
    let result = articles;

    if (activeCategory !== 'all') {
      result = result.filter(
        (a) => a.articleType === activeCategory || a.section === activeCategory
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.eyebrow.toLowerCase().includes(q)
      );
    }

    return result;
  }, [articles, activeCategory, query]);

  const gridArticles = featured && activeCategory === 'all' && !query
    ? filtered.filter((a) => a.slug !== featured.slug)
    : filtered;

  const showFeatured = featured && activeCategory === 'all' && !query;

  const hasCategories = categories && categories.length > 0;

  return (
    <div>
      {/* Filter + Search row */}
      <div className={`mb-8 flex flex-col gap-3 ${hasCategories ? 'sm:flex-row sm:items-center sm:justify-between' : ''}`}>
        {hasCategories && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                activeCategory === 'all'
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'border border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/30 hover:bg-brand-surface dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                  activeCategory === cat.value
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'border border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/30 hover:bg-brand-surface dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className={`relative ${hasCategories ? 'w-full sm:max-w-xs' : 'w-full sm:max-w-lg'}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textSecondary dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 rounded-xl border border-brand-border bg-white pl-10 pr-4 text-[14px] text-brand-textPrimary placeholder:text-brand-textSecondary/60 shadow-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 dark:border-white/10 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-600 transition-colors"
          />
        </div>
      </div>

      {/* Featured article */}
      {showFeatured && featured && (
        <div className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-textSecondary dark:text-gray-500">
            Featured
          </p>
          <ArticleCard article={featured} variant="compact" />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-brand-textSecondary dark:text-gray-500">
          No articles match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gridArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
