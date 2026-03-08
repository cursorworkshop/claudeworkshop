import fs from 'node:fs';
import path from 'node:path';

import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/MDXContent';
import {
  CATEGORY_LABELS,
  getAllResearchArticles,
  getResearchArticle,
} from '@/lib/research';

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://claudeworkshop.com'
).replace(/\/+$/, '');

const toAbsoluteUrl = (value: string): string => {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

const imageExistsForWebPath = (webPath: string): boolean => {
  if (!webPath.startsWith('/')) return false;
  const filePath = path.join(
    process.cwd(),
    'public',
    webPath.replace(/^\/+/, '')
  );
  return fs.existsSync(filePath);
};

export async function generateStaticParams() {
  const articles = getAllResearchArticles();
  return articles.map(article => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getResearchArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Claude Workshop Research',
    };
  }

  const title = article.metaTitle || `${article.title} | Claude Workshop`;
  const description = article.metaDescription || article.description;
  const heroImage = getResearchHeroImage(article.slug, article.image);
  const canonicalPath = article.canonicalUrl || `/research/${article.slug}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const socialImage = heroImage ? toAbsoluteUrl(heroImage) : undefined;

  return {
    title,
    description,
    keywords: article.tags,
    authors: [{ name: article.author }],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: `Hero image for ${article.title}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const normalizeTitleForCompare = (value: string): string =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const stripLeadingDuplicateH1 = (content: string, title: string): string => {
  const trimmedStart = content.trimStart();
  const headingMatch = trimmedStart.match(/^#\s+(.+?)\s*(?:\n+|$)/);
  if (!headingMatch) return content;

  const headingText = headingMatch[1] || '';
  const isDuplicateTitle =
    normalizeTitleForCompare(headingText) === normalizeTitleForCompare(title);
  if (!isDuplicateTitle) return content;

  return trimmedStart.slice(headingMatch[0].length).replace(/^\s+/, '');
};

const legacyArticleImages: Record<string, string> = {
  'claude-2-4-subagents-skills':
    '/images/editorials/research-renaissance-1.jpg',
  'designing-codebases-for-ai-agents':
    '/images/editorials/research-renaissance-2.jpg',
  'gas-town-multi-agent-orchestration':
    '/images/editorials/research-renaissance-3.jpg',
  'job-vs-gym-ai-skills-framework':
    '/images/editorials/research-renaissance-4.jpg',
  'senior-vs-junior-ai-acceptance-rates':
    '/images/editorials/research-renaissance-5.jpg',
  'yc-founders-ai-coding-patterns':
    '/images/editorials/research-renaissance-6.jpg',
  'claude-gastown-multi-agent-orchestration':
    '/images/editorials/research-renaissance-7.jpg',
};

function getResearchHeroImage(
  slug: string,
  explicitImage?: string | null
): string | null {
  const frontmatterImage = String(explicitImage || '').trim();
  if (frontmatterImage && imageExistsForWebPath(frontmatterImage)) {
    return frontmatterImage;
  }

  const legacyImage = legacyArticleImages[slug];
  if (legacyImage) return legacyImage;

  const candidates = ['png', 'jpg', 'jpeg', 'webp'].map(
    ext => `/images/editorials/${slug}.${ext}`
  );

  for (const src of candidates) {
    const filePath = path.join(
      process.cwd(),
      'public',
      src.replace(/^\/+/, '')
    );
    if (fs.existsSync(filePath)) {
      return src;
    }
  }

  return null;
}

export default async function ResearchArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getResearchArticle(slug);

  if (!article) {
    notFound();
  }

  const heroImage = getResearchHeroImage(article.slug, article.image);
  if (!heroImage) {
    notFound();
  }
  const contentWithoutDuplicateTitle = stripLeadingDuplicateH1(
    article.content,
    article.title
  );

  // JSON-LD structured data for SEO and LLM understanding
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Claude Workshop',
      url: 'https://claudeworkshop.com',
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    keywords: article.tags.join(', '),
    image: toAbsoluteUrl(heroImage),
    articleSection: CATEGORY_LABELS[article.category],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://claudeworkshop.com/research/${article.slug}`,
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className='min-h-screen bg-background'>
        {/* Header */}
        <header className='border-b bg-gradient-to-b from-muted/50 to-background py-12 md:py-16'>
          <div className='mx-auto max-w-3xl px-4'>
            <Link
              href='/research'
              className='mb-6 mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary md:mt-0'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Research
            </Link>

            <h1 className='mb-8 text-3xl font-semibold leading-[1.44] tracking-tight md:text-4xl lg:text-5xl'>
              {article.title}
            </h1>

            <p className='mb-8 text-xl text-muted-foreground'>
              {article.description}
            </p>

            <div className='mb-6 overflow-hidden rounded-2xl border bg-muted/20'>
              <div className='relative aspect-[16/9] w-full'>
                <Image
                  src={heroImage}
                  alt={`Hero image for ${article.title}`}
                  fill
                  priority
                  sizes='(min-width: 1024px) 768px, 100vw'
                  className='object-cover'
                />
              </div>
            </div>

            {/* Meta info */}
            <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <User className='h-4 w-4' />
                {article.authorUrl ? (
                  <a
                    href={article.authorUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-primary transition-colors underline underline-offset-2'
                  >
                    {article.author}
                  </a>
                ) : (
                  article.author
                )}
                {article.authorRole && (
                  <span className='text-xs'>({article.authorRole})</span>
                )}
              </span>
              <span className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                {formatDate(article.publishedAt)}
              </span>
              <span className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                {article.readingTime} min read
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className='mx-auto max-w-3xl px-4 py-12'>
          <div className='prose prose-lg dark:prose-invert max-w-none'>
            <MDXContent content={contentWithoutDuplicateTitle} />
          </div>

          {/* CTA */}
          <div className='mt-12 rounded-lg border bg-muted/50 p-6 text-center'>
            <h2 className='text-xl font-semibold mb-2'>
              Want to learn more about Claude?
            </h2>
            <p className='text-muted-foreground mb-4'>
              We offer enterprise training and workshops to help your team
              become more productive with AI-assisted development.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors'
            >
              Contact Us
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
