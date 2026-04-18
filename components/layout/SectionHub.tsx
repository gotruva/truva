import { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { cn } from '@/lib/utils';

interface SectionHubProps {
  title: string;
  description: string;
  breadcrumbItems: { label: string; href: string }[];
  children: ReactNode;
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHub({
  title,
  description,
  breadcrumbItems,
  children,
  containerClassName,
  titleClassName,
  descriptionClassName,
}: SectionHubProps) {
  return (
    <div className="bg-brand-surface dark:bg-slate-950 min-h-screen py-10 sm:py-16">
      <div className={cn('mx-auto px-4 sm:px-6', containerClassName ?? 'max-w-4xl')}>
        <Breadcrumbs items={breadcrumbItems} />
        
        <header className="mb-8 sm:mb-12">
          <h1
            className={cn(
              'text-3xl sm:text-5xl font-bold leading-[1.05] tracking-tight mb-3 sm:mb-4 text-brand-textPrimary dark:text-gray-100 sm:italic',
              titleClassName
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              'text-base sm:text-xl leading-relaxed text-brand-textSecondary dark:text-gray-400 max-w-2xl',
              descriptionClassName
            )}
          >
            {description}
          </p>
        </header>

        <section className="space-y-10 sm:space-y-12">
          {children}
        </section>
      </div>
    </div>
  );
}
