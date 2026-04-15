import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface ProductTrustBarItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  linkLabel?: string;
}

interface ProductTrustBarProps {
  eyebrow: string;
  title?: string;
  description?: string;
  items: ProductTrustBarItem[];
}

export function ProductTrustBar({ eyebrow, title, description, items }: ProductTrustBarProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
          {title ?? 'Trust signals should be visible before the first big decision'}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={`${item.title}-${item.description}`}
              className="rounded-[1.35rem] border border-brand-border/80 bg-white p-4 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-brand-textPrimary dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {item.description}
              </p>
              {item.href && item.linkLabel ? (
                <Link
                  href={item.href}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
                >
                  {item.linkLabel}
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
