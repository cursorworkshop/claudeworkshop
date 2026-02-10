import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

export type ResearchArticle = {
  slug: string;
  title: string;
  description: string;
  author: string;
  authorRole?: string;
  authorUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  category: 'claude-features' | 'methodology' | 'ai-coding' | 'open-source';
  tags: string[];
  readingTime: number;
  featured?: boolean;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  // Structured data for LLMs
  keyTakeaways?: string[];
  tldr?: string;
};

export type ResearchArticleWithContent = ResearchArticle & {
  content: string;
};

const RESEARCH_DIR = path.join(process.cwd(), 'content', 'research');

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const getAllResearchArticles = (): ResearchArticle[] => {
  if (!fs.existsSync(RESEARCH_DIR)) {
    return [];
  }

  const files = fs.readdirSync(RESEARCH_DIR).filter(f => f.endsWith('.mdx'));

  const articles = files
    .map(filename => {
      const slug = filename.replace(/\.mdx$/, '');
      const filePath = path.join(RESEARCH_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        author: data.author || 'Rogier Muller',
        authorRole: data.authorRole,
        authorUrl: data.authorUrl,
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        category: data.category || 'ai-coding',
        tags: data.tags || [],
        readingTime: calculateReadingTime(content),
        featured: data.featured || false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        keyTakeaways: data.keyTakeaways,
        tldr: data.tldr,
      } as ResearchArticle;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return articles;
};

export const getResearchArticle = (
  slug: string
): ResearchArticleWithContent | null => {
  const filePath = path.join(RESEARCH_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    author: data.author || 'Rogier Muller',
    authorRole: data.authorRole,
    authorUrl: data.authorUrl,
    publishedAt: data.publishedAt || new Date().toISOString(),
    updatedAt: data.updatedAt,
    category: data.category || 'ai-coding',
    tags: data.tags || [],
    readingTime: calculateReadingTime(content),
    featured: data.featured || false,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    canonicalUrl: data.canonicalUrl,
    keyTakeaways: data.keyTakeaways,
    tldr: data.tldr,
    content,
  };
};

export const getResearchArticlesByCategory = (
  category: ResearchArticle['category']
): ResearchArticle[] => {
  return getAllResearchArticles().filter(a => a.category === category);
};

export const getFeaturedResearchArticles = (): ResearchArticle[] => {
  return getAllResearchArticles().filter(a => a.featured);
};

export const CATEGORY_LABELS: Record<ResearchArticle['category'], string> = {
  'claude-features': 'Claude Code Features',
  methodology: 'Methodology',
  'ai-coding': 'AI-Assisted Coding',
  'open-source': 'Open Source',
};

export const CATEGORY_DESCRIPTIONS: Record<
  ResearchArticle['category'],
  string
> = {
  'claude-features':
    'Deep dives into Claude Code IDE features like Tab completion, Composer, and Agent mode.',
  methodology:
    'Our approach to teaching AI-assisted development and training methodology.',
  'ai-coding':
    'Best practices for working with AI coding assistants effectively.',
  'open-source': 'Our open source projects and contributions to the community.',
};
