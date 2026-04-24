import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { BASE_URL } from '@/lib/constants';

const APP_ROOT = path.join(process.cwd(), 'app');
const DATA_ROOT = path.join(process.cwd(), 'data');

function addRoute(
  routes: MetadataRoute.Sitemap,
  url: string,
  filePath?: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly',
  priority = 0.6
) {
  const entry: MetadataRoute.Sitemap[number] = {
    url,
    changeFrequency,
    priority,
  };

  if (filePath && fs.existsSync(filePath)) {
    entry.lastModified = fs.statSync(filePath).mtime;
  }

  routes.push(entry);
}

function addStaticRoute(routes: MetadataRoute.Sitemap, route: string, filePath: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number) {
  addRoute(routes, `${BASE_URL}${route}`, filePath, changeFrequency, priority);
}

function addMDXRoutes(routes: MetadataRoute.Sitemap, fullPath: string, routePrefix: string) {
  try {
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const files = fs.readdirSync(fullPath, { recursive: true }) as string[];
    for (const file of files) {
      const normalizedFile = file.replace(/\\/g, '/');
      if (!normalizedFile.endsWith('.mdx') && !normalizedFile.endsWith('.md')) {
        continue;
      }
      if (normalizedFile.startsWith('_')) {
        continue;
      }

      const relativeSlug = normalizedFile.replace(/\.mdx?$/, '').replace(/\/page$/, '');
      const url = `${BASE_URL}/${routePrefix}${relativeSlug ? `/${relativeSlug}` : ''}`;
      addRoute(routes, url, path.join(fullPath, file), 'monthly', 0.6);
    }
  } catch (error) {
    console.error(`Failed to crawl MDX routes for ${routePrefix}`, error);
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  const now = new Date();

  addStaticRoute(routes, '/', path.join(APP_ROOT, 'page.tsx'), 'daily', 1);
  addStaticRoute(routes, '/articles', path.join(APP_ROOT, 'articles', 'page.tsx'), 'weekly', 0.95);
  addStaticRoute(routes, '/calculator', path.join(APP_ROOT, 'calculator', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/banking', path.join(APP_ROOT, 'banking', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/banking/rates', path.join(APP_ROOT, 'banking', 'rates', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/banking/reviews', path.join(APP_ROOT, 'banking', 'reviews', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/banking/compare', path.join(APP_ROOT, 'banking', 'compare', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/credit-cards', path.join(APP_ROOT, 'credit-cards', 'page.tsx'), 'weekly', 0.85);
  addStaticRoute(routes, '/credit-cards/reviews', path.join(APP_ROOT, 'credit-cards', 'reviews', 'page.tsx'), 'weekly', 0.85);
  addStaticRoute(routes, '/loans', path.join(APP_ROOT, 'loans', 'page.tsx'), 'monthly', 0.7);
  addStaticRoute(routes, '/guides', path.join(APP_ROOT, 'guides', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/guides/taxation', path.join(APP_ROOT, 'guides', 'taxation', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/guides/safety', path.join(APP_ROOT, 'guides', 'safety', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/guides/mechanics', path.join(APP_ROOT, 'guides', 'mechanics', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/methodology', path.join(APP_ROOT, 'methodology', 'page.tsx'), 'monthly', 0.7);
  addStaticRoute(routes, '/methodology/banking', path.join(APP_ROOT, 'methodology', 'banking', 'page.tsx'), 'monthly', 0.65);
  addStaticRoute(routes, '/methodology/credit-cards', path.join(APP_ROOT, 'methodology', 'credit-cards', 'page.tsx'), 'monthly', 0.65);
  addStaticRoute(routes, '/methodology/loans', path.join(APP_ROOT, 'methodology', 'loans', 'page.tsx'), 'monthly', 0.6);
  addStaticRoute(routes, '/methodology/editorial-integrity', path.join(APP_ROOT, 'methodology', 'editorial-integrity', 'page.tsx'), 'monthly', 0.65);
  addStaticRoute(routes, '/authors/beto', path.join(APP_ROOT, 'authors', 'beto', 'page.tsx'), 'monthly', 0.6);

  addMDXRoutes(routes, path.join(APP_ROOT, 'banking', 'reviews'), 'banking/reviews');
  addMDXRoutes(routes, path.join(APP_ROOT, 'banking', 'rates'), 'banking/rates');
  addMDXRoutes(routes, path.join(APP_ROOT, 'banking', 'compare'), 'banking/compare');
  addMDXRoutes(routes, path.join(APP_ROOT, 'guides'), 'guides');

  try {
    const dataPath = path.join(DATA_ROOT, 'credit-cards.json');
    if (fs.existsSync(dataPath)) {
      const cards = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as { id: string }[];

      for (const card of cards) {
        addRoute(routes, `${BASE_URL}/credit-cards/reviews/${card.id}`, dataPath, 'weekly', 0.7);
      }

      for (let i = 0; i < cards.length; i += 1) {
        for (let j = i + 1; j < cards.length; j += 1) {
          addRoute(routes, `${BASE_URL}/credit-cards/compare/${cards[i].id}-vs-${cards[j].id}`, dataPath, 'monthly', 0.55);
          addRoute(routes, `${BASE_URL}/credit-cards/compare/${cards[j].id}-vs-${cards[i].id}`, dataPath, 'monthly', 0.55);
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse credit cards for sitemap', error);
  }

  if (routes.length === 0) {
    routes.push({
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: now,
    });
  }

  return routes;
}
