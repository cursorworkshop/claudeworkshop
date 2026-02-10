import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';

const trustedCompanies = [
  { name: 'Algolia', logo: 'https://cdn.simpleicons.org/algolia' },
  { name: 'Contentful', logo: 'https://cdn.simpleicons.org/contentful' },
  { name: 'Datadog', logo: 'https://cdn.simpleicons.org/datadog' },
];

export default function HeroSection() {
  return (
    <section className='bg-background'>
      <div className='relative py-32 md:py-44'>
        {/* Subtle gradient background */}
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900' />

        <div className='relative z-10 mx-auto w-full max-w-5xl px-6'>
          <div className='mx-auto max-w-2xl text-center'>
            {/* Badge */}
            <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80'>
              <Sparkles className='size-4 text-amber-500' />
              <span className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
                Official Claude Ambassadors
              </span>
            </div>

            <h1 className='text-balance font-serif text-4xl font-medium sm:text-5xl md:text-6xl'>
              Master AI-Powered Development
            </h1>
            <p className='text-muted-foreground mt-6 text-balance text-lg'>
              Enterprise training for engineering teams. Transform how your
              developers work with Claude Code and AI coding tools.
            </p>

            <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Button asChild size='lg' className='pr-1.5'>
                <Link href='/contact'>
                  <span className='text-nowrap'>Book Training</span>
                  <ChevronRight className='opacity-50' />
                </Link>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <Link href='/methodology'>Our Methodology</Link>
              </Button>
            </div>
          </div>

          {/* Trusted by section */}
          <div className='mx-auto mt-24 max-w-xl'>
            <p className='mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600'>
              Trusted by teams at
            </p>
            <div className='flex items-center justify-center gap-12 md:gap-16'>
              {trustedCompanies.map(company => (
                <div
                  key={company.name}
                  className='opacity-40 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logo}
                    alt={company.name}
                    className='h-8 w-auto md:h-10'
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
