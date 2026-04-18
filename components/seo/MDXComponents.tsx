import { Children, ComponentPropsWithoutRef, ReactNode, isValidElement } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { slugifyHeading } from '@/lib/editorial';

function extractText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return extractText(child.props.children);
      }

      return '';
    })
    .join(' ')
    .trim();
}

function resolveHeadingId(children: ReactNode, explicitId?: string) {
  if (explicitId) {
    return explicitId;
  }

  const headingText = extractText(children);
  return headingText ? slugifyHeading(headingText) : undefined;
}

const CustomLink = ({
  href,
  children,
  ...props
}: ComponentPropsWithoutRef<'a'>) => {
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

  if (isInternalLink) {
    return (
      <Link href={href!} className="text-brand-primary font-medium hover:underline" {...(props as any)}>
        {children}
      </Link>
    );
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-primary font-medium hover:underline inline-flex items-center gap-1"
      href={href!}
      {...props}
    >
      {children}
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
};

export const MDXComponents = {
  h1: ({ children, id, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <h1
      id={resolveHeadingId(children, id)}
      className="scroll-mt-28 text-4xl sm:text-5xl font-bold tracking-tight mb-8 mt-4 text-brand-textPrimary dark:text-gray-100 italic"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2
      id={resolveHeadingId(children, id)}
      className="scroll-mt-28 text-2xl sm:text-3xl font-bold tracking-tight mb-6 mt-12 text-brand-textPrimary dark:text-gray-100 pb-2 border-b border-brand-border dark:border-white/10"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3
      id={resolveHeadingId(children, id)}
      className="scroll-mt-28 text-xl font-bold mb-4 mt-8 text-brand-textPrimary dark:text-gray-100"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p className="text-lg leading-relaxed mb-6 text-brand-textSecondary dark:text-gray-300" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-none space-y-3 mb-8 ml-0 pl-0" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className="text-lg leading-relaxed text-brand-textSecondary dark:text-gray-300" {...props}>
      {children}
    </li>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="mb-8 list-decimal space-y-3 pl-6" {...props}>
      {children}
    </ol>
  ),
  a: CustomLink,
  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-brand-primary/40 pl-6 py-2 my-8 italic text-brand-textSecondary dark:text-gray-400 bg-brand-surface dark:bg-white/[0.02] rounded-r-xl" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="table-wrap">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm sm:text-base" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-brand-surface dark:bg-white/[0.05]" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-textSecondary border-b border-brand-border dark:border-white/10 sm:px-5 sm:py-4" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td className="px-4 py-3 align-top text-sm text-brand-textPrimary border-b border-brand-border dark:border-white/5 dark:text-gray-200 sm:px-5 sm:py-4 sm:text-base" {...props}>
      {children}
    </td>
  ),
};
