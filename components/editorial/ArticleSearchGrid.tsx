'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { EditorialArticle } from '@/types';
import { ArticleCard } from './ArticleCard';

interface ArticleSearchGridProps {
  articles: EditorialArticle[];
  placeholder?: string;
}

export function ArticleSearchGrid({ articles, placeholder = 'Search articles...' }: ArticleSearchGridProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.eyebrow.toLowerCase().includes(q)
    );
  }, [articles, query]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8 max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textSecondary dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 rounded-xl border border-brand-border bg-white pl-11 pr-4 text-[15px] text-brand-textPrimary placeholder:text-brand-textSecondary/60 shadow-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 dark:border-white/10 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-600 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-brand-textSecondary dark:text-gray-500">
          No articles match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
