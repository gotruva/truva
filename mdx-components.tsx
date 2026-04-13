import type { MDXComponents } from 'mdx/types';
import { MDXComponents as TruvaComponents } from '@/components/seo/MDXComponents';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...TruvaComponents,
    ...components,
  };
}
