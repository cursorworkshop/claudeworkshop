import { Metadata } from 'next';

import { siteConfig } from './config';
import { SeoProps } from './types';

export function generateMetadata(props: SeoProps): Metadata {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors = [siteConfig.organizer],
    tags = [],
  } = props;

  const fullTitle = title ? `${title} | ${siteConfig.title}` : siteConfig.title;

  const fullDescription = description || siteConfig.description;
  const fullImage = image || siteConfig.images.ogImage;
  const fullUrl = url || siteConfig.url;

  // Map 'event' to 'website' since Next.js OpenGraph doesn't support 'event'
  const openGraphType = type === 'event' ? 'website' : type;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      'Claude Code',
      'AI Development',
      'IDE',
      'Milano',
      'Global',
      'Meetup',
      'Artificial Intelligence',
      'Programming',
      'Developers',
      'Community',
      ...tags,
    ],
    authors: authors.map(author => ({ name: author })),
    creator: siteConfig.organizer,
    publisher: siteConfig.organizer,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type: openGraphType,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.title,
      images: [
        {
          url: fullImage.startsWith('http')
            ? fullImage
            : `${siteConfig.url}${fullImage}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [
        fullImage.startsWith('http')
          ? fullImage
          : `${siteConfig.url}${fullImage}`,
      ],
      creator: '@claude_workshop', // Update with actual Twitter handle
      site: '@claude_workshop', // Update with actual Twitter handle
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add verification codes when available
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // yahoo: 'your-yahoo-verification-code',
    },
    other: {
      'theme-color': '#3B82F6', // Claude Code blue
      'color-scheme': 'light',
    },
  };
}

export function generateStructuredData(props: SeoProps) {
  const {
    type = 'website',
    publishedTime,
    modifiedTime,
    authors = [siteConfig.organizer],
  } = props;

  const baseData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    name: props.title || siteConfig.title,
    description: props.description || siteConfig.description,
    url: props.url || siteConfig.url,
    author: {
      '@type': 'Person',
      name: authors[0] || siteConfig.organizer,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.title,
      url: siteConfig.url,
    },
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
  };

  if (type === 'event') {
    return {
      ...baseData,
      '@type': 'Event',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: siteConfig.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Milano',
          addressCountry: 'IT',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: siteConfig.title,
        url: siteConfig.url,
      },
    };
  }

  return baseData;
}

export function generateSitemapData() {
  const baseUrl = siteConfig.url;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/workshops`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/code-of-conduct`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
