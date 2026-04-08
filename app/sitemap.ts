import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gotruva.com';

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
  ];

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
