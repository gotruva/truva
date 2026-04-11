import { ReactNode, AnchorHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

type ComponentProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

const CustomLink = ({
  href,
  ...props
}: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

  if (isInternalLink) {
    return (
      <Link href={href!} className="text-brand-primary font-medium hover:underline" {...props}>
        {props.children}
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
      {props.children}
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
};

export const MDXComponents = {
  h1: ({ children, ...props }: ComponentProps) => (
    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8 mt-4 text-brand-textPrimary dark:text-gray-100 italic" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentProps) => (
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 mt-12 text-brand-textPrimary dark:text-gray-100 pb-2 border-b border-brand-border dark:border-white/10" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentProps) => (
    <h3 className="text-xl font-bold mb-4 mt-8 text-brand-textPrimary dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: ComponentProps) => (
    <p className="text-lg leading-relaxed mb-6 text-brand-textSecondary dark:text-gray-300" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ComponentProps) => (
    <ul className="list-none space-y-3 mb-8 ml-0" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }: ComponentProps) => (
    <li className="flex items-start gap-3 text-lg text-brand-textSecondary dark:text-gray-300" {...props}>
      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-[0.6rem]" />
      <span>{children}</span>
    </li>
  ),
  a: CustomLink,
  blockquote: ({ children, ...props }: ComponentProps) => (
    <blockquote className="border-l-4 border-brand-primary/40 pl-6 py-2 my-8 italic text-brand-textSecondary dark:text-gray-400 bg-brand-surface dark:bg-white/[0.02] rounded-r-xl" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: ComponentProps) => (
    <div className="overflow-x-auto my-8 rounded-2xl border border-brand-border dark:border-white/10 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[500px]" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentProps) => (
    <thead className="bg-brand-surface dark:bg-white/[0.05]" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: ComponentProps) => (
    <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-brand-textSecondary border-b border-brand-border dark:border-white/10" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentProps) => (
    <td className="px-6 py-4 text-base text-brand-textPrimary dark:text-gray-200 border-b border-brand-border dark:border-white/5" {...props}>
      {children}
    </td>
  ),
};
