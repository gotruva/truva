import { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

interface SectionHubProps {
  title: string;
  description: string;
  breadcrumbItems: { label: string; href: string }[];
  children: ReactNode;
}

export function SectionHub({
  title,
  description,
  breadcrumbItems,
  children,
}: SectionHubProps) {
  return (
    <div className="bg-brand-surface dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-brand-textPrimary dark:text-gray-100 italic">
            {title}
          </h1>
          <p className="text-xl text-brand-textSecondary dark:text-gray-400 max-w-2xl">
            {description}
          </p>
        </header>

        <section className="space-y-12">
          {children}
        </section>
      </div>
    </div>
  );
}
