import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/optimizer', '/tracker', '/go/', '/keystatic'],
      },
    ],
    sitemap: 'https://www.gotruva.com/sitemap.xml',
  };
}
