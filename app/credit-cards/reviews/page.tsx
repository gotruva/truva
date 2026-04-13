import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { getCreditCards } from '@/lib/credit-cards';

export const metadata: Metadata = {
  title: 'Credit card reviews in the Philippines',
  description:
    'Browse Truva credit card reviews for cashback, rewards, and travel cards with practical verdicts and fee context.',
};

export default async function CreditCardReviewsPage() {
  const cards = await getCreditCards();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: `${card.name} Review`,
        description: card.editorVerdict,
        url: `/credit-cards/reviews/${card.id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8f9fb_18%,#ffffff_55%,#f8f9fb_100%)] py-12 dark:bg-[linear-gradient(180deg,#020617_0%,#081225_24%,#020617_100%)] sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-6 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
                <Sparkles className="h-4 w-4" />
                Article collection
              </div>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-5xl">
                Credit card reviews that feel more useful than brochure copy
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-brand-textSecondary dark:text-gray-300">
                This is the editorial layer for Truva credit card content: practical reviews, best-for framing, fee context, and direct paths back into the broader card discovery flow.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/credit-cards"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  Explore all credit cards
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/credit-cards/reviews/${card.id}`}
                className={`group relative overflow-hidden rounded-[1.75rem] border bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-[0_26px_70px_-38px_rgba(0,82,255,0.3)] dark:bg-white/[0.04] ${card.isSponsored ? 'border-amber-300/60 dark:border-amber-500/30' : 'border-brand-border/80 dark:border-white/10'}`}
              >
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    {card.isSponsored && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        Sponsored
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                      {card.provider}
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-white">
                      {card.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                      {card.editorVerdict}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-brand-border bg-brand-surface/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-textSecondary dark:text-gray-400">
                        Best for
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-textPrimary dark:text-gray-100">
                        {card.bestFor}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-textSecondary dark:text-gray-400">
                        Annual fee
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-textPrimary dark:text-gray-100">
                        {card.annualFee === 0 ? 'Free' : `PHP ${card.annualFee.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-1">
                    <span className="inline-flex items-center gap-2 text-sm text-brand-textSecondary dark:text-gray-400">
                      <ShieldCheck className="h-4 w-4 text-brand-primary" />
                      Editorial review
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                      Read review
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
