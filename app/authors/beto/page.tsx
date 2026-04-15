import type { Metadata } from 'next';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { getBankingArticles, getGuideArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Beto - Founder',
  description: 'Meet the solo builder behind Truva, the Philippines\' dedicated after-tax personal finance platform.',
  alternates: {
    canonical: '/authors/beto',
  },
};

export default function AuthorPage() {
  const featuredReading = [
    ...getBankingArticles().slice(0, 2),
    ...getGuideArticles().slice(0, 1),
  ];

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-8 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-10">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary/10 text-4xl font-bold text-brand-primary ring-4 ring-brand-primary/20">
            B
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-5xl">
              Beto
            </h1>
            <p className="mt-3 text-xl text-brand-textSecondary dark:text-gray-300">
              Solo Founder and Lead Builder at Truva
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-[1.75rem] border border-brand-border bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                <strong>Mabuhay.</strong> I built Truva because it was too hard for regular Filipinos to know
                how much their savings were actually earning.
              </p>
              <p>
                Between hidden promo conditions, lock-in periods, and the standard 20% Final Withholding Tax,
                comparing a digital bank against a tax-exempt government product felt like a math exam.
              </p>
              <p>
                My goal is straightforward: make the comparison layer transparent, fast, and mathematically honest.
                I write the code, verify the rates, and design the calculators you use here.
              </p>
              <p>
                If Truva helps you make a better savings decision, that is the point.
              </p>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Feedback or corrections: {' '}
              <a href="mailto:partners@truva.ph" className="font-semibold text-brand-primary hover:underline">
                partners@truva.ph
              </a>
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                What I work on
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                <li>After-tax rate comparisons for Philippine savers</li>
                <li>Guide pages for taxes, PDIC, and product mechanics</li>
                <li>Banking and credit-card decision tools</li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Featured reading
              </p>
              <div className="mt-4 space-y-4">
                {featuredReading.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
