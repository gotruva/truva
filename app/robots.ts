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
    sitemap: 'https://truva.ph/sitemap.xml',
  };
}
