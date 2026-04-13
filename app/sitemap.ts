import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { BASE_URL } from '@/lib/constants';

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

function addMDXRoutes(routes: MetadataRoute.Sitemap, folderPath: string, routePrefix: string) {
  try {
    const fullPath = path.join(process.cwd(), folderPath);
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

  addStaticRoute(routes, '/', path.join(process.cwd(), 'app', 'page.tsx'), 'daily', 1);
  addStaticRoute(routes, '/articles', path.join(process.cwd(), 'app', 'articles', 'page.tsx'), 'weekly', 0.95);
  addStaticRoute(routes, '/calculator', path.join(process.cwd(), 'app', 'calculator', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/banking', path.join(process.cwd(), 'app', 'banking', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/banking/rates', path.join(process.cwd(), 'app', 'banking', 'rates', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/banking/reviews', path.join(process.cwd(), 'app', 'banking', 'reviews', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/banking/compare', path.join(process.cwd(), 'app', 'banking', 'compare', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/credit-cards', path.join(process.cwd(), 'app', 'credit-cards', 'page.tsx'), 'weekly', 0.85);
  addStaticRoute(routes, '/credit-cards/reviews', path.join(process.cwd(), 'app', 'credit-cards', 'reviews', 'page.tsx'), 'weekly', 0.85);
  addStaticRoute(routes, '/guides', path.join(process.cwd(), 'app', 'guides', 'page.tsx'), 'weekly', 0.9);
  addStaticRoute(routes, '/guides/taxation', path.join(process.cwd(), 'app', 'guides', 'taxation', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/guides/safety', path.join(process.cwd(), 'app', 'guides', 'safety', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/guides/mechanics', path.join(process.cwd(), 'app', 'guides', 'mechanics', 'page.tsx'), 'weekly', 0.8);
  addStaticRoute(routes, '/methodology', path.join(process.cwd(), 'app', 'methodology', 'page.tsx'), 'monthly', 0.7);
  addStaticRoute(routes, '/authors/beto', path.join(process.cwd(), 'app', 'authors', 'beto', 'page.tsx'), 'monthly', 0.6);

  addMDXRoutes(routes, 'app/banking/reviews', 'banking/reviews');
  addMDXRoutes(routes, 'app/banking/rates', 'banking/rates');
  addMDXRoutes(routes, 'app/banking/compare', 'banking/compare');
  addMDXRoutes(routes, 'app/guides', 'guides');

  try {
    const dataPath = path.join(process.cwd(), 'data', 'credit-cards.json');
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
