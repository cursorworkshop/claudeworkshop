'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import type { ResearchArticle } from '@/lib/research';

// Hero images for each article
const articleImages: Record<string, string> = {
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
  'multi-agent-orchestration-2019564738649505882':
    '/images/editorials/multi-agent-orchestration-2019564738649505882.png',
  'ai-coding-tooling-1977706278110765481':
    '/images/editorials/ai-coding-tooling-1977706278110765481.png',
  'mcp-and-integrations-1961848171925278932':
    '/images/editorials/mcp-and-integrations-1961848171925278932.png',
  'ai-coding-tooling-2020290971951391031':
    '/images/editorials/ai-coding-tooling-2020290971951391031.png',
  'multi-agent-orchestration-2019564738649505882-20260304124620':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304124620.png',
  'multi-agent-orchestration-2019564738649505882-20260304125803':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304125803.png',
  'multi-agent-orchestration-2019564738649505882-20260304134944':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304134944.png',
  'multi-agent-orchestration-2019564738649505882-20260304143439':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304143439.png',
  'multi-agent-orchestration-2019564738649505882-20260304145109':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304145109.png',
  'multi-agent-orchestration-2019564738649505882-20260304150431':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304150431.png',
  'multi-agent-orchestration-2019564738649505882-20260304160211':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304160211.png',
  'multi-agent-orchestration-2019564738649505882-20260304165409':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304165409.png',
  'multi-agent-orchestration-2019564738649505882-20260304170252':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304170252.png',
  'multi-agent-orchestration-2019564738649505882-20260304170948':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304170948.png',
  'multi-agent-orchestration-2019564738649505882-20260304172558':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304172558.png',
  'multi-agent-orchestration-2019564738649505882-20260304173811':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304173811.png',
  'multi-agent-orchestration-2019564738649505882-20260304175352':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304175352.png',
  'multi-agent-orchestration-2019564738649505882-20260304184030':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304184030.png',
  'multi-agent-orchestration-2019564738649505882-20260304185005':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260304185005.png',
  'multi-agent-orchestration-2019564738649505882-20260305095655':
    '/images/editorials/multi-agent-orchestration-2019564738649505882-20260305095655.png',
  'multi-agent-orchestration-20260305-1046':
    '/images/editorials/multi-agent-orchestration-20260305-1046.png',
  'multi-agent-orchestration-20260306-0828':
    '/images/editorials/multi-agent-orchestration-20260306-0828.png',
};

const getArticleImage = (slug: string): string => {
  return articleImages[slug] || `/images/editorials/${slug}.png`;
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
