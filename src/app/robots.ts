import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/white-paper'],
      },
    ],
    sitemap: 'https://www.claudeworkshop.com/sitemap.xml',
  };
}
