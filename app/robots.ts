import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/optimizer', '/tracker'],
      },
    ],
    sitemap: 'https://www.gotruva.com/sitemap.xml',
  };
}
