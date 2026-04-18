import type { EditorialArticle } from '@/types';
import { ArticleCard } from '@/components/editorial/ArticleCard';

interface RelatedArticlesProps {
  title?: string;
  articles: EditorialArticle[];
}

export function RelatedArticles({
  title = 'Keep exploring',
  articles,
}: RelatedArticlesProps) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="mt-16 space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Related reading
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
          {title}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="compact" />
        ))}
      </div>
    </section>
  );
}
