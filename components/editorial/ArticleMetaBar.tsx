import { CalendarDays, Clock3, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

interface ArticleMetaBarProps {
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  verificationNote?: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ArticleMetaBar({
  author,
  publishedAt,
  updatedAt,
  readingTime,
  verificationNote,
}: ArticleMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm text-brand-textSecondary dark:text-gray-300">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-2 shadow-sm ring-1 ring-brand-border/80 backdrop-blur dark:bg-white/10 dark:ring-white/10">
        <UserRound className="h-4 w-4 text-brand-primary" />
        {author}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-2 shadow-sm ring-1 ring-brand-border/80 backdrop-blur dark:bg-white/10 dark:ring-white/10">
        <CalendarDays className="h-4 w-4 text-brand-primary" />
        Published {formatDate(publishedAt)}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-2 shadow-sm ring-1 ring-brand-border/80 backdrop-blur dark:bg-white/10 dark:ring-white/10">
        <Clock3 className="h-4 w-4 text-brand-primary" />
        {readingTime}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-3.5 py-2 text-white shadow-lg shadow-brand-primary/20 dark:bg-brand-primary/90">
        <Sparkles className="h-4 w-4" />
        Updated {formatDate(updatedAt)}
      </span>
      {verificationNote && (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          {verificationNote}
        </span>
      )}
    </div>
  );
}
