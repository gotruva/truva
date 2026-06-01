import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { ArticleTocItem, EditorialArticle } from '@/types';
import { slugifyHeading } from '@/lib/editorial';

/**
 * File-based blog content layer.
 *
 * Every post lives at `content/blog/{slug}/index.mdx` as frontmatter + MDX body.
 * The frontmatter mirrors the `EditorialArticle` shape so `BlogLayout` and the
 * editorial card components render blog posts with no rewrite. This same file
 * format is exactly what Keystatic reads/writes, so adding the CMS later is a
 * config-only drop-in (see keystatic.config.ts).
 */

const BLOG_ROOT = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost extends EditorialArticle {
  /** Raw MDX body (frontmatter stripped) for the renderer. */
  content: string;
  /** Optional "Direct Answer" shown in a highlighted box above the body. */
  directAnswer?: string;
}

const CATEGORY_LABELS: Record<EditorialArticle['category'], string> = {
  banking: 'Savings & Deposits',
  'credit-cards': 'Credit Cards',
  guides: 'Guides',
};

const ARTICLE_TYPE_EYEBROW: Record<EditorialArticle['articleType'], string> = {
  'Rate Guide': 'Rate guide',
  Review: 'Product review',
  Comparison: 'Comparison',
  Explainer: 'Guide',
};

/** Normalise YAML dates (which parse to JS Date) to ISO `YYYY-MM-DD`. */
function toIsoDate(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? str : parsed.toISOString().slice(0, 10);
}

function estimateReadingTime(body: string): string {
  const words = body.replace(/[#>*_`~\-|]/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/** Derive a table of contents from `##` / `###` headings, skipping fenced code. */
function deriveToc(body: string): ArticleTocItem[] {
  const toc: ArticleTocItem[] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;
    const depth = match[1].length as 2 | 3;
    const label = match[2].replace(/[*_`]/g, '').trim();
    if (label) toc.push({ label, depth });
  }
  return toc;
}

function toPost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const category = (data.category ?? 'guides') as EditorialArticle['category'];
  const articleType = (data.articleType ?? 'Explainer') as EditorialArticle['articleType'];
  const publishedAt = toIsoDate(data.publishedAt);
  const updatedAt = toIsoDate(data.updatedAt) || publishedAt;

  return {
    slug,
    path: `/blog/${slug}`,
    title: data.title ?? slug,
    seoTitle: data.seoTitle,
    description: data.description ?? '',
    subtitle: data.subtitle ?? data.description ?? '',
    category,
    categoryLabel: data.categoryLabel ?? CATEGORY_LABELS[category] ?? 'Guides',
    section: (data.section ?? 'guides') as EditorialArticle['section'],
    sectionPath: '/blog',
    articleType,
    eyebrow: data.eyebrow ?? ARTICLE_TYPE_EYEBROW[articleType] ?? 'Guide',
    bannerUrl: data.heroImage ?? data.bannerUrl,
    bannerFocus: data.bannerFocus,
    publishedAt,
    updatedAt,
    author: data.author ?? 'Beto',
    authorUrl: data.authorUrl ?? '/authors/beto',
    readingTime: data.readingTime ?? estimateReadingTime(content),
    featured: Boolean(data.featured),
    keywords: data.keywords ?? [],
    verificationNote: data.verificationNote,
    disclosureNote: data.disclosureNote,
    toc: data.toc ?? deriveToc(content),
    faqItems: data.faqItems ?? [],
    primaryCta: data.primaryCta ?? { label: 'Compare savings rates', href: '/banking/rates' },
    secondaryCta: data.secondaryCta,
    relatedArticles: data.relatedArticles ?? [],
    content,
    directAnswer: data.directAnswer || undefined,
  };
}

function readPostFile(slug: string): BlogPost | null {
  const file = path.join(BLOG_ROOT, slug, 'index.mdx');
  if (!fs.existsSync(file)) return null;
  return toPost(slug, fs.readFileSync(file, 'utf-8'));
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_ROOT)) return [];
  return fs
    .readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .filter((entry) => fs.existsSync(path.join(BLOG_ROOT, entry.name, 'index.mdx')))
    .map((entry) => entry.name);
}

function compareByDate(a: BlogPost, b: BlogPost): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function getBlogPosts(): BlogPost[] {
  return getBlogSlugs()
    .map(readPostFile)
    .filter((post): post is BlogPost => Boolean(post))
    .sort(compareByDate);
}

export function getBlogPost(slug: string): BlogPost | null {
  return readPostFile(slug);
}

export function getBlogPostsByCategory(category: EditorialArticle['category']): BlogPost[] {
  return getBlogPosts().filter((post) => post.category === category);
}

export function getFeaturedPost(): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find((post) => post.featured) ?? posts[0];
}

export function getRelatedPosts(slugs: string[], excludeSlug?: string): BlogPost[] {
  return slugs
    .filter((slug) => slug !== excludeSlug)
    .map(readPostFile)
    .filter((post): post is BlogPost => Boolean(post));
}

export const BLOG_CATEGORIES: { value: EditorialArticle['category']; label: string }[] = [
  { value: 'banking', label: CATEGORY_LABELS.banking },
  { value: 'credit-cards', label: CATEGORY_LABELS['credit-cards'] },
  { value: 'guides', label: CATEGORY_LABELS.guides },
];

export { CATEGORY_LABELS, slugifyHeading };
