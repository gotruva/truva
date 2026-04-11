import { ReactNode } from 'react';
import { Target } from 'lucide-react';

interface SEOBoxProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * SEOBox provides a high-visibility container for "Direct Answer" content.
 * This is designed to satisfy search engine "Featured Snippets" and AI grounding queries.
 */
export function SEOBox({ title, children, className = '' }: SEOBoxProps) {
  return (
    <section 
      className={`my-8 p-6 sm:p-8 rounded-2xl bg-brand-primary/[0.03] border border-brand-primary/10 dark:bg-brand-primary/5 dark:border-brand-primary/20 relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Target className="w-16 h-16 text-brand-primary" />
      </div>
      
      {title && (
        <h3 className="text-lg font-bold text-brand-primary mb-3 flex items-center gap-2">
          {title}
        </h3>
      )}
      
      <div className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-brand-textPrimary dark:text-gray-100 italic">
        {children}
      </div>
    </section>
  );
}
