import type { EditorialArticle } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ArticleMetaBar } from '@/components/editorial/ArticleMetaBar';

interface EditorialHeroProps {
  article: EditorialArticle;
}

export function EditorialHero({ article }: EditorialHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-brand-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.16),_transparent_36%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.94))] p-6 shadow-[0_28px_90px_-48px_rgba(0,82,255,0.55)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.28),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-8 lg:p-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(120deg,transparent,rgba(0,82,255,0.06),transparent)] lg:block" />
      <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
      <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-brand-primary/15 blur-3xl dark:bg-brand-primary/20" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
            <Sparkles className="h-4 w-4" />
            {article.eyebrow}
          </span>
          <span className="rounded-full border border-brand-border bg-white/70 px-3 py-1.5 text-brand-textSecondary shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
            {article.categoryLabel}
          </span>
          <span className="rounded-full border border-brand-border bg-white/70 px-3 py-1.5 text-brand-textSecondary shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
            {article.articleType}
          </span>
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-brand-textPrimary dark:text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-xl">
            {article.subtitle}
          </p>
        </div>

        <ArticleMetaBar
          author={article.author}
          publishedAt={article.publishedAt}
          updatedAt={article.updatedAt}
          readingTime={article.readingTime}
          verificationNote={article.verificationNote}
        />

        <div className="grid gap-3 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Why this piece matters
            </p>
            <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {article.description}
            </p>
          </div>

          <div className="rounded-3xl border border-brand-primary/15 bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            <div className="flex h-full flex-col justify-between gap-4 p-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                  Best next step
                </p>
                <p className="text-lg font-semibold">{article.primaryCta.label}</p>
                {article.primaryCta.description && (
                  <p className="mt-2 text-sm text-white/80">{article.primaryCta.description}</p>
                )}
              </div>
              <Link
                href={article.primaryCta.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/95 transition-transform hover:translate-x-1"
              >
                Open now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
