import type { ArticleTocItem } from '@/types';
import { buildTocAnchors } from '@/lib/editorial';
import { ListCollapse } from 'lucide-react';

interface StickyTOCProps {
  items: ArticleTocItem[];
  mobile?: boolean;
}

export function StickyTOC({ items, mobile = false }: StickyTOCProps) {
  if (!items.length) {
    return null;
  }

  const anchors = buildTocAnchors(items);

  if (mobile) {
    return (
      <details className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-brand-textPrimary dark:text-white">
          <ListCollapse className="h-4 w-4 text-brand-primary" />
          Jump to a section
        </summary>
        <nav className="mt-4 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {anchors.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-textSecondary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-brand-primary/30"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </details>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-brand-primary">
        <ListCollapse className="h-4 w-4" />
        On this page
      </div>
      <nav>
        <ol className="space-y-3">
          {anchors.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block text-sm leading-relaxed text-brand-textSecondary transition-colors hover:text-brand-primary dark:text-gray-300"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
