import type { EditorialArticle } from '@/types';
import { ArrowRight, BookOpenText, GitCompareArrows, SearchCheck, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: EditorialArticle;
  variant?: 'default' | 'compact';
  className?: string;
}

function getArticleIcon(articleType: EditorialArticle['articleType']) {
  switch (articleType) {
    case 'Review':
      return SearchCheck;
    case 'Comparison':
      return GitCompareArrows;
    case 'Explainer':
      return BookOpenText;
    default:
      return TrendingUp;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticleCard({
  article,
  variant = 'default',
  className,
}: ArticleCardProps) {
  const Icon = getArticleIcon(article.articleType);
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <Link
        href={article.path}
        className={cn(
          'block w-full group relative overflow-hidden rounded-[1.75rem] border border-brand-border/80 bg-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-[0_24px_65px_-30px_rgba(0,82,255,0.32)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-primary/40',
          className
        )}
      >
        {/* Banner image / placeholder zone */}
        {article.bannerUrl ? (
          <div className="relative aspect-[16/7] w-full flex-shrink-0 bg-[#eef3ff] dark:bg-[#0d1b38]">
            <Image
              src={article.bannerUrl}
              alt={article.title}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
            />
          </div>
        ) : (
          <div className="flex h-32 w-full flex-shrink-0 items-center justify-center bg-gradient-to-br from-brand-primary/8 to-brand-primary/20 dark:from-brand-primary/12 dark:to-brand-primary/28">
            <Icon className="h-7 w-7 text-brand-primary/50" />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-3 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              {article.eyebrow}
            </p>
            <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              {article.articleType}
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-gray-50">
            {article.title}
          </h3>
          <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {article.description}
          </p>

          <div className="flex items-center justify-between gap-4 pt-1 text-sm text-brand-textSecondary dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span>{article.readingTime}</span>
              <span>{formatDate(article.updatedAt)}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 font-semibold text-brand-primary">
              Read now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={article.path}
      className={cn(
        'group relative overflow-hidden rounded-[1.75rem] border border-brand-border/80 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-[0_24px_65px_-30px_rgba(0,82,255,0.32)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-primary/40 h-full min-h-[18rem]',
        className
      )}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            {article.articleType}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            {article.eyebrow}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-gray-50">
            {article.title}
          </h3>
          <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {article.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-2 text-sm text-brand-textSecondary dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span>{article.readingTime}</span>
            <span>{formatDate(article.updatedAt)}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand-primary">
            Read now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
