import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { evaluate } from '@mdx-js/mdx';
import * as jsxRuntime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import { Children, isValidElement, type ReactNode } from 'react';

import { BlogLayout } from '@/components/layout/BlogLayout';
import { InArticleCTA } from '@/components/editorial/InArticleCTA';
import { AffiliateButton } from '@/components/AffiliateButton';
import { SEOBox } from '@/components/seo/SEOBox';
import { getBlogPost, getBlogPosts, getRelatedPosts, slugifyHeading } from '@/lib/blog';
import { buildBreadcrumbSchema } from '@/lib/blog-schema';
import { BASE_URL } from '@/lib/constants';

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const url = `${BASE_URL}/blog/${slug}`;
  return {
    title: post.seoTitle ?? post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      url,
      title: post.seoTitle ?? post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle ?? post.title,
      description: post.description,
    },
  };
}

/** Extract plain text from MDX children so heading ids match the TOC anchors. */
function childrenToText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      if (isValidElement(child)) return childrenToText((child.props as { children?: ReactNode }).children);
      return '';
    })
    .join('');
}

const mdxComponents = {
  SEOBox,
  InArticleCTA,
  AffiliateButton,
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 id={slugifyHeading(childrenToText(children))}>{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 id={slugifyHeading(childrenToText(children))}>{children}</h3>
  ),
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.relatedArticles, post.slug);

  const { default: MDXContent } = await evaluate(post.content, {
    ...(jsxRuntime as Record<string, unknown>),
    development: false,
    remarkPlugins: [remarkGfm],
  } as Parameters<typeof evaluate>[1]);

  return (
    <BlogLayout article={post} relatedArticlesResolved={related}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(post, BASE_URL)) }}
      />
      {post.directAnswer && <SEOBox title="The Direct Answer">{post.directAnswer}</SEOBox>}
      <MDXContent components={mdxComponents} />
    </BlogLayout>
  );
}
