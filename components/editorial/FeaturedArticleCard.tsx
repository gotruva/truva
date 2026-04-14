import type { EditorialArticle } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FeaturedArticleCardProps {
  article: EditorialArticle;
}

export function FeaturedArticleCard({ article }: FeaturedArticleCardProps) {
  return (
    <Link
      href={article.path}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-brand-primary/20 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_32%),linear-gradient(135deg,_rgba(0,82,255,0.96),_rgba(4,25,70,0.98))] text-white shadow-[0_28px_80px_-36px_rgba(0,82,255,0.72)] transition-transform duration-300 hover:-translate-y-1 sm:rounded-[2rem]"
    >
      {article.bannerUrl && (
        <div
          className="h-48 w-full flex-shrink-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${article.bannerUrl}')`,
          }}
        />
      )}
      <div className="absolute -right-10 top-6 h-36 w-36 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="relative flex h-full flex-col gap-4 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur sm:text-xs sm:tracking-[0.24em]">
            <Sparkles className="h-3.5 w-3.5" />
            {article.eyebrow}
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-xs sm:tracking-[0.22em]">
            {article.articleType}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="max-w-xl text-2xl font-bold leading-tight tracking-tight sm:text-[2rem]">
            {article.title}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-white/78 sm:text-base">
            {article.subtitle}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-white/72 sm:text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span>{article.readingTime}</span>
            <span>Updated {new Date(article.updatedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
          </div>
          <span className="inline-flex items-center gap-2 font-semibold text-white">
            Open article
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
