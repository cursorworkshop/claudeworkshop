import { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/email-preview',
          '/popup-modal',
          '/r/',
          '/reserve',
          '/reserve/success',
          '/contact/thank-you',
          '/white-paper',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
