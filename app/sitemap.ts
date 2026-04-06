import { MetadataRoute } from 'next';

const BASE_URL = 'https://truva.ph';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
}
