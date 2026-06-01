import type { BlogPost } from '@/lib/blog';

/**
 * BreadcrumbList JSON-LD for a blog post.
 * Article + FAQPage schema are emitted by BlogLayout; this adds the breadcrumb
 * trail (Home → Blog → Category → Post) that the visual Breadcrumbs component
 * does not output as structured data.
 */
export function buildBreadcrumbSchema(post: BlogPost, baseUrl: string) {
  const crumbs = [
    { name: 'Home', url: `${baseUrl}/` },
    { name: 'Blog', url: `${baseUrl}/blog` },
    { name: post.categoryLabel, url: `${baseUrl}/blog/category/${post.category}` },
    { name: post.title, url: `${baseUrl}/blog/${post.slug}` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
