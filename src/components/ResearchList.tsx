'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import type { ResearchArticle } from '@/lib/research';

// Renaissance oil painting images for each article
const articleImages: Record<string, string> = {
  'claude-code-subagents-skills': '/images/research/research-renaissance-1.jpg',
  'designing-codebases-for-ai-agents':
    '/images/research/research-renaissance-2.jpg',
  'gas-town-multi-agent-orchestration':
    '/images/research/research-renaissance-3.jpg',
  'job-vs-gym-ai-skills-framework':
    '/images/research/research-renaissance-4.jpg',
  'senior-vs-junior-ai-acceptance-rates':
    '/images/research/research-renaissance-5.jpg',
  'yc-founders-ai-coding-patterns':
    '/images/research/research-renaissance-6.jpg',
  'claude-gastown-multi-agent-orchestration':
    '/images/research/research-renaissance-7.jpg',
};

const defaultImage = '/images/research/research-renaissance-1.jpg';

const getArticleImage = (slug: string): string => {
  return articleImages[slug] || defaultImage;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

type Props = {
  articles: ResearchArticle[];
};

export function ResearchList({ articles }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <>
      {/* Search Bar */}
      <div className='max-w-xl mx-auto mb-12'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Search articles...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10 h-11'
          />
        </div>
      </div>

      {/* Articles List */}
      <div className='space-y-0'>
        {filteredArticles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/research/${article.slug}`}
            className='group block'
          >
            <article
              className={`flex flex-col md:flex-row gap-6 lg:gap-10 py-10 ${
                index !== filteredArticles.length - 1
                  ? 'border-b border-zinc-200'
                  : ''
              }`}
            >
              {/* Image - Left */}
              <div className='md:w-80 lg:w-96 flex-shrink-0'>
                <div className='relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-100'>
                  <Image
                    src={getArticleImage(article.slug)}
                    alt={article.title}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-500'
                    sizes='(max-width: 768px) 100vw, 384px'
                    priority={index < 3}
                  />
                </div>
              </div>

              {/* Content - Right */}
              <div className='flex-1 flex flex-col justify-center'>
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-sm text-muted-foreground'>
                    {article.readingTime} min read
                  </span>
                </div>

                <h2 className='text-xl lg:text-2xl font-medium text-foreground group-hover:text-foreground/80 transition-colors mb-3 tracking-tight'>
                  {article.title}
                </h2>

                <p className='text-muted-foreground leading-relaxed mb-4 line-clamp-2'>
                  {article.description}
                </p>

                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.author && (
                    <>
                      <span className='text-zinc-300'>·</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className='text-center py-16'>
          <p className='text-muted-foreground'>
            {searchQuery
              ? 'No articles match your search.'
              : 'No articles yet. Check back soon.'}
          </p>
        </div>
      )}
    </>
  );
}
