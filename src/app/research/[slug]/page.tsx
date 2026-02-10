import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
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

  return {
    title,
    description,
    keywords: article.tags,
    authors: [{ name: article.author }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: article.canonicalUrl || `/research/${article.slug}`,
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

export default async function ResearchArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getResearchArticle(slug);

  if (!article) {
    notFound();
  }

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
              className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Research
            </Link>

            <h1 className='text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4'>
              {article.title}
            </h1>

            <p className='text-xl text-muted-foreground mb-6'>
              {article.description}
            </p>

            {/* Key Takeaways */}
            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <div className='rounded-lg border bg-primary/5 p-4 mb-6'>
                <p className='font-medium text-sm mb-3'>Key Takeaways</p>
                <ul className='space-y-1 text-sm'>
                  {article.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className='flex items-start gap-2'>
                      <span className='text-primary'>•</span>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
            <MDXContent content={article.content} />
          </div>

          {/* CTA */}
          <div className='mt-12 rounded-lg border bg-muted/50 p-6 text-center'>
            <h2 className='text-xl font-semibold mb-2'>
              Want to learn more about Claude Code?
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
