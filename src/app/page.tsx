import { Github, Linkedin } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { TrainingCards } from '@/components/TrainingCards';
import { TrainingAccordion } from '@/components/TrainingAccordion';
import { HeroSection } from '@/components/HeroSection';
import Features from '@/components/features-2';
import Content from '@/components/content-3';
import Stats from '@/components/stats-1';
import { SpinningText } from '@/components/core/spinning-text';
import { Button } from '@/components/ui/button';
import { InView } from '@/components/motion/in-view';

export const metadata: Metadata = {
  title: 'Claude Workshop - In-House & Offsite Programs',
  description:
    'Transform your team with Claude Code training. In-house sessions at your office or premium offsites in stunning locations.',
};

export default async function HomePage() {
  return (
    <div className='min-h-screen bg-white text-foreground font-sans selection:bg-blue-100 dark:selection:bg-zinc-800'>
      {/* Hero Section */}
      <HeroSection />

      {/* PROBLEM / SOLUTION - Content Section */}
      <Content />

      {/* Divider */}
      <div className='max-w-5xl mx-auto px-6'>
        <div className='border-t border-border' />
      </div>

      {/* Training Accordion - What we offer */}
      <TrainingAccordion />

      {/* NO divider here - cards flow directly from accordion */}

      {/* New Cards - Stack & Worldwide */}
      <TrainingCards />

      {/* Divider */}
      <div className='max-w-5xl mx-auto px-6'>
        <div className='border-t border-border' />
      </div>

      {/* STATS */}
      <Stats />

      {/* Divider */}
      <div className='max-w-5xl mx-auto px-6'>
        <div className='border-t border-border' />
      </div>

      {/* The Framework: Delegate, Review, Own */}
      <Features />

      {/* Meet the Founders / Claude Ambassadors - WHITE background */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto container-padding'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <div className='text-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
                Meet the Founders
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Official Claude ambassadors for Amsterdam and Athens, in daily
                contact with the Claude team, bringing you the latest features
                and best practices.
              </p>
            </div>
          </InView>

          {/* Founders Grid */}
          <div className='flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16'>
            {/* Rogier */}
            <InView
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className='relative'>
                <Link href='/about' className='group block'>
                  <div className='relative w-40 h-48 md:w-48 md:h-56'>
                    <Image
                      src='/images/people/rogier-9-no-bg-site-v2.svg'
                      alt='Rogier Muller - Co-Founder'
                      fill
                      className='object-contain object-bottom transition-transform duration-300 scale-[1.001] group-hover:scale-105 transform-gpu'
                      priority
                      unoptimized
                    />
                  </div>
                  <div className='text-center mt-3'>
                    <p className='font-semibold text-foreground'>
                      Rogier Muller
                    </p>
                    <p className='text-xs text-muted-foreground'>Co-Founder</p>
                  </div>
                </Link>
                <div className='flex justify-center gap-3 mt-2'>
                  <a
                    href='https://github.com/rogierx'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-zinc-800 dark:text-zinc-300 hover:text-blue-600 transition-colors'
                  >
                    <Github className='w-4 h-4' />
                  </a>
                  <a
                    href='https://www.linkedin.com/in/rogyr'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-zinc-800 dark:text-zinc-300 hover:text-blue-600 transition-colors'
                  >
                    <Linkedin className='w-4 h-4' />
                  </a>
                </div>
              </div>
            </InView>

            {/* Spinning Text - Center */}
            <div className='flex-shrink-0 w-28 h-28 md:w-32 md:h-32 flex items-center justify-center'>
              <SpinningText
                radius={3.5}
                fontSize={0.55}
                duration={20}
                className='text-muted-foreground'
              >
                {`claude ambassadors • claude ambassadors • `}
              </SpinningText>
            </div>

            {/* Vasilis */}
            <InView
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className='relative'>
                <Link href='/about' className='group block'>
                  <div className='relative w-40 h-48 md:w-48 md:h-56'>
                    <Image
                      src='/images/people/vasilis-3-no-bg-site.svg'
                      alt='Vasilis Tsolis - Co-Founder'
                      fill
                      className='object-contain object-bottom transition-transform duration-300 scale-[1.001] group-hover:scale-105 transform-gpu'
                      style={{
                        WebkitClipPath: 'inset(4px 0 0 0)',
                        clipPath: 'inset(4px 0 0 0)',
                      }}
                      priority
                      unoptimized
                    />
                  </div>
                  <div className='text-center mt-3'>
                    <p className='font-semibold text-foreground'>
                      Vasilis Tsolis
                    </p>
                    <p className='text-xs text-muted-foreground'>Co-Founder</p>
                  </div>
                </Link>
                <div className='flex justify-center gap-3 mt-2'>
                  <a
                    href='https://github.com/claudeworkshop'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-zinc-800 dark:text-zinc-300 hover:text-blue-600 transition-colors'
                  >
                    <Github className='w-4 h-4' />
                  </a>
                  <a
                    href='https://www.linkedin.com/in/vasilistsolis'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-zinc-800 dark:text-zinc-300 hover:text-blue-600 transition-colors'
                  >
                    <Linkedin className='w-4 h-4' />
                  </a>
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* Simple CTA - WHITE background */}
      <section className='py-32 bg-zinc-50'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <h2 className='text-3xl font-medium mb-6'>Ready to start?</h2>
          <p className='text-muted-foreground mb-10 text-lg'>
            Transform how your team builds software today.
          </p>
          <div className='flex flex-row gap-3 justify-center'>
            <Button
              size='default'
              className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
              asChild
            >
              <Link href='/contact'>Get in touch</Link>
            </Button>
            <Button
              size='default'
              variant='outline'
              className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
              asChild
            >
              <Link href='/methodology'>Our approach</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
