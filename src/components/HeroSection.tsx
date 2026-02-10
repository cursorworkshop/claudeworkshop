'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FlipWords } from '@/components/motion/flip-words';
import { TextEffect } from '@/components/motion/text-effect';
import { InView } from '@/components/motion/in-view';
import { LightRays } from '@/components/ui/light-rays';

const companies = [
  {
    name: 'Algolia',
    url: 'https://algolia.com',
    logo: 'https://cdn.simpleicons.org/algolia',
  },
  {
    name: 'Contentful',
    url: 'https://contentful.com',
    logo: 'https://cdn.simpleicons.org/contentful',
  },
  {
    name: 'Datadog',
    url: 'https://datadoghq.com',
    logo: 'https://cdn.simpleicons.org/datadog',
  },
];

export function HeroSection() {
  const words = ['Claude Code', 'AI IDEs', 'AI CLIs'];

  return (
    <section className='min-h-[100svh] flex flex-col justify-center items-center overflow-hidden relative pb-8 bg-white'>
      {/* Light rays background - grey/secondary */}
      <LightRays
        count={12}
        color='rgba(200, 200, 200, 0.3)'
        blur={60}
        speed={10}
        length='90vh'
      />

      <div className='max-w-5xl mx-auto container-padding z-10 flex-1 flex flex-col justify-center relative pt-28 md:pt-0'>
        <div className='text-center space-y-8'>
          <h1 className='text-[4.25rem] md:text-8xl font-bold tracking-tighter text-foreground leading-[0.95]'>
            Master{' '}
            <FlipWords
              words={words}
              duration={6000}
              className='text-muted-foreground'
            />
          </h1>

          <p className='text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light'>
            Tailored trainings for your
            <br className='md:hidden' /> engineering team.
          </p>

          <div className='flex flex-row gap-3 justify-center pt-8'>
            <Button
              size='default'
              className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
              asChild
            >
              <Link href='/training'>Programs</Link>
            </Button>
            <Button
              size='default'
              variant='secondary'
              className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
              asChild
            >
              <Link href='/methodology'>Methodology</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Trusted By - Integrated into hero */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className='w-full mt-auto relative z-10'
      >
        <div className='max-w-5xl mx-auto container-padding'>
          <div className='flex flex-col items-center gap-8 py-12'>
            <p className='text-xs font-medium text-muted-foreground/60 uppercase tracking-[0.2em]'>
              Trusted by teams at
            </p>
            <div className='flex flex-wrap justify-center items-center gap-12 md:gap-20'>
              {companies.map((company, index) => (
                <a
                  key={company.name}
                  href={company.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='opacity-40 hover:opacity-90 transition-all duration-500 grayscale hover:grayscale-0 hover:scale-110'
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className='h-10 md:h-12 w-auto'
                    loading='lazy'
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}
