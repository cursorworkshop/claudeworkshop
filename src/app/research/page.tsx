import { Metadata } from 'next';

import { ResearchList } from '@/components/ResearchList';
import { getAllResearchArticles } from '@/lib/research';

export const metadata: Metadata = {
  title: 'Research | Claude Workshop',
  description:
    'Research on agentic coding in enterprise environments. Multi-agent orchestration, team adoption patterns, and what actually works at scale.',
  keywords: [
    'agentic coding',
    'AI coding research',
    'enterprise AI development',
    'multi-agent orchestration',
    'AI-assisted development',
    'developer productivity',
  ],
  openGraph: {
    title: 'Research | Claude Workshop',
    description:
      'Research on agentic coding in enterprise environments. What actually works at scale.',
    type: 'website',
  },
};

export default function ResearchPage() {
  const articles = getAllResearchArticles().sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='pt-28 pb-16 lg:py-24'>
        <div className='max-w-4xl mx-auto container-padding text-center'>
          <h1 className='text-4xl lg:text-5xl font-medium text-foreground tracking-tight mb-6'>
            Research
          </h1>
          <p className='text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto'>
            We publish and curate research on agentic coding in enterprise
            environments. Our focus spans multi-agent orchestration, team
            adoption patterns, and the evolving best practices that help
            engineering teams ship faster with AI. Here we share what we learn
            from training teams and staying close to the cutting edge.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className='border-t border-zinc-200' />

      {/* Articles List with Search */}
      <section className='py-16 lg:py-24'>
        <div className='max-w-6xl mx-auto container-padding'>
          <ResearchList articles={articles} />
        </div>
      </section>
    </div>
  );
}
