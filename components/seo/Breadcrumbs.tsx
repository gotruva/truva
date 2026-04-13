import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BASE_URL } from '@/lib/constants';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': BASE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': item.label,
        'item': `${BASE_URL}${item.href}`,
      })),
    ],
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center text-sm text-brand-textSecondary dark:text-gray-400">
        <li className="flex items-center">
          <Link
            href="/"
            className="hover:text-brand-primary transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1.5 opacity-40 shrink-0" />
            {index === items.length - 1 ? (
              <span className="font-medium text-brand-textPrimary dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-brand-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
