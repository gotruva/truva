import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { BASE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/calculator`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/banking`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guides`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Helper to add dynamic routes from MDX files
  const addMDXRoutes = (folderPath: string, routePrefix: string) => {
    try {
      const fullPath = path.join(process.cwd(), folderPath);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath, { recursive: true }) as string[];
        const filteredFiles = files.filter(file => 
           (file.endsWith('.mdx') || file.endsWith('.md')) && 
           !file.startsWith('_')
        );

        for (const file of filteredFiles) {
          const slug = file.replace(/\.mdx?$/, '').replace(/\/page$/, '');
          routes.push({
            url: `${BASE_URL}/${routePrefix}/${slug}`,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    } catch (e) {
      console.error(`Failed to crawl MDX routes for ${routePrefix}`, e);
    }
  };

  // Crawl dynamic content
  addMDXRoutes('app/banking/reviews', 'banking/reviews');
  addMDXRoutes('app/banking/rates', 'banking/rates');
  addMDXRoutes('app/banking/compare', 'banking/compare');
  addMDXRoutes('app/credit-cards/reviews', 'credit-cards/reviews');
  addMDXRoutes('app/credit-cards/compare', 'credit-cards/compare');
  addMDXRoutes('app/guides', 'guides');

  // Handle Credit Cards from JSON (existing logic preserved)
  try {
    const dataPath = path.join(process.cwd(), 'data', 'credit-cards.json');
    if (fs.existsSync(dataPath)) {
      const cards = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      for (const card of cards) {
        routes.push({
          url: `${BASE_URL}/credit-cards/reviews/${card.id}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse credit cards for sitemap', e);
  }

  return routes;
}
