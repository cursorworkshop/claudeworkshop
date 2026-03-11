'use client';

import { useState, useEffect } from 'react';
import { Users, Globe, Award, Github, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { InView } from '@/components/motion/in-view';
import { AnimatedGroup } from '@/components/motion/animated-group';
import { RecentEventsGallery } from '@/components/RecentEventsGallery';
import { TextEffect } from '@/components/motion/text-effect';

const founders = [
  {
    name: 'Rogier Muller',
    role: 'Co-Founder',
    image: '/images/people/rogier-9-no-bg-site-v2.svg',
    bio: 'Passionate about AI-assisted development and helping teams unlock their full potential with Claude.',
    github: 'https://github.com/rogierx',
    linkedin: 'https://www.linkedin.com/in/rogyr',
  },
  {
    name: 'Vasilis Tsolis',
    role: 'Co-Founder',
    image: '/images/people/vasilis-3-no-bg-site.svg',
    bio: 'Dedicated to spreading the power of AI coding tools and building a global community of Claude enthusiasts.',
    github: 'https://github.com/okc0mputex',
    linkedin: 'https://www.linkedin.com/in/vasilistsolis',
  },
];

const faqItems = [
  {
    question: 'What makes Claude Workshop different?',
    answer:
      'We are official Claude ambassadors with direct access to the Claude development team. Our training is always up-to-date with the latest features, and we provide insights that others simply cannot. We have trained over 100 teams at Fortune 100 and DAX 40 companies.',
  },
  {
    question: 'What is the Delegate, Review, Own framework?',
    answer:
      'Every task in AI-assisted development falls into one of three categories. Delegate: hand off repetitive tasks entirely (boilerplate, migrations, tests, documentation). Review: AI proposes, you decide (bug fixes, refactoring, optimization). Own: keep under human control (core architecture, security decisions, business logic). Master these, and you master AI-augmented engineering.',
  },
  {
    question: 'How do you customize training for our team?',
    answer:
      'We start with a discovery call to understand your tech stack, workflows, and goals. We can work with your actual codebase (under NDA) to provide hands-on training that directly applies to your daily work. This ensures developers learn with real examples from their projects.',
  },
  {
    question: 'Do you offer remote training?',
    answer:
      'Yes. We offer both in-person and remote training options. Our remote sessions are live and interactive, with screen sharing and hands-on exercises. For in-person training, we come to your office worldwide with a minimum of two trainers.',
  },
  {
    question: 'What results can we expect?',
    answer:
      'Teams typically see a 40% increase in developer efficiency within the first month. Our framework delivers measurable productivity gains across engineering teams of all sizes, from startups to Fortune 100 companies.',
  },
  {
    question: 'What about offsite programs?',
    answer:
      'Our offsite programs are intensive 5-day bootcamps at stunning Mediterranean locations in Greece. They include all-inclusive accommodation, meals, and team activities. Maximum 12 participants per offsite for focused, personalized training.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Contact us through our website to schedule a discovery call. We will discuss your team size, tech stack, and training goals to recommend the best program for you. You can also download our Enterprise Guide to Agentic Development for a preview of our methodology.',
  },
];

export default function AboutPage() {
  const [githubStats, setGithubStats] = useState({ stars: 10, forks: 0 });

  useEffect(() => {
    // Fetch live GitHub stats
    fetch('https://api.github.com/repos/cursorworkshop/cursor-gastown')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setGithubStats({
            stars: data.stargazers_count,
            forks: data.forks_count || 0,
          });
        }
      })
      .catch(() => {
        // Keep default values on error
      });
  }, []);

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='pt-28 pb-24 lg:py-32'>
        <div className='max-w-5xl mx-auto container-padding'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Left Column - Content */}
            <InView
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <div className='space-y-6'>
                <p className='text-sm text-muted-foreground tracking-wide uppercase'>
                  About Us
                </p>
                <h1 className='text-4xl lg:text-5xl font-medium text-foreground tracking-tight'>
                  <TextEffect per='word' as='span' preset='fade'>
                    Meet the Founders
                  </TextEffect>
                </h1>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  Official Claude ambassadors for Amsterdam and Athens
                  respectively, passionate about bringing AI-assisted
                  development to teams worldwide.
                </p>
                <p className='text-muted-foreground leading-relaxed'>
                  In daily contact with the Claude team, bringing you the latest
                  features and best practices. Through events, workshops, and
                  training programs, we help developers unlock their full
                  potential.
                </p>

                {/* Key Stats */}
                <div className='flex flex-wrap items-center gap-3 pt-2'>
                  <Badge variant='outline' className='text-sm'>
                    <Award className='w-3 h-3 mr-1' />
                    Claude Ambassadors
                  </Badge>
                  <Badge variant='outline' className='text-sm'>
                    <Globe className='w-3 h-3 mr-1' />
                    Global
                  </Badge>
                  <Badge variant='outline' className='text-sm'>
                    <Users className='w-3 h-3 mr-1' />
                    100+ Teams Trained
                  </Badge>
                </div>
              </div>
            </InView>

            {/* Right Column - Diagonal Founder Portraits - No cards, blended */}
            <InView
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className='relative h-[520px] lg:h-[550px]'>
                {/* Rogier - Top Left */}
                <div className='absolute top-0 left-0 lg:left-8 z-10 group'>
                  <div className='relative'>
                    {/* Image - transparent background */}
                    <div
                      className='relative w-56 h-72 lg:w-64 lg:h-80 overflow-hidden'
                      style={{
                        clipPath: 'inset(1px)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src='/images/people/rogier-9-no-bg-site-v2.svg'
                        alt='Rogier Muller - Co-Founder'
                        className='w-[calc(100%+2px)] h-[calc(100%+2px)] object-contain object-bottom -m-[1px]'
                      />
                    </div>

                    {/* Simple name below */}
                    <div className='text-center mt-2'>
                      <p className='font-semibold text-sm text-zinc-900'>
                        Rogier Muller
                      </p>
                      <p className='text-xs text-zinc-500'>Co-Founder</p>
                      <div className='flex justify-center gap-3 mt-2'>
                        <a
                          href='https://github.com/rogierx'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-zinc-800 hover:text-[#0A66C2] transition-colors'
                        >
                          <Github className='w-4 h-4' />
                        </a>
                        <a
                          href='https://www.linkedin.com/in/rogyr'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-zinc-800 hover:text-[#0A66C2] transition-colors'
                        >
                          <Linkedin className='w-4 h-4' />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vasilis - Bottom Right */}
                <div className='absolute bottom-0 right-0 lg:-right-4 z-20 group'>
                  <div className='relative'>
                    {/* Image - transparent background */}
                    <div
                      className='relative w-56 h-72 lg:w-64 lg:h-80 overflow-hidden'
                      style={{
                        clipPath: 'inset(1px)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src='/images/people/vasilis-3-no-bg-site.svg'
                        alt='Vasilis Tsolis - Co-Founder'
                        className='w-[calc(100%+2px)] h-[calc(100%+2px)] object-contain object-bottom -m-[1px]'
                      />
                    </div>

                    {/* Simple name below */}
                    <div className='text-center mt-2'>
                      <p className='font-semibold text-sm text-zinc-900'>
                        Vasilis Tsolis
                      </p>
                      <p className='text-xs text-zinc-500'>Co-Founder</p>
                      <div className='flex justify-center gap-3 mt-2'>
                        <a
                          href='https://github.com/okc0mputex'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-zinc-800 hover:text-[#0A66C2] transition-colors'
                        >
                          <Github className='w-4 h-4' />
                        </a>
                        <a
                          href='https://www.linkedin.com/in/vasilistsolis'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-zinc-800 hover:text-[#0A66C2] transition-colors'
                        >
                          <Linkedin className='w-4 h-4' />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className='py-24 bg-zinc-50'>
        <div className='max-w-7xl mx-auto container-padding'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
                What makes us different
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Direct connection to Claude and a passion for developer
                education.
              </p>
            </div>
          </InView>

          <div className='border-t border-zinc-200/80 divide-y divide-zinc-200/80 md:grid md:grid-cols-3 md:items-stretch md:divide-y-0 md:divide-x'>
            <div className='flex h-full flex-col py-8 md:min-h-[31rem] md:px-8 md:py-10'>
              <h3 className='text-2xl font-medium tracking-tight text-foreground'>
                Official Claude Ambassadors
              </h3>
              <p className='mt-5 text-lg leading-8 text-muted-foreground'>
                In daily contact with the Claude development team to ensure our
                training reflects the latest features and best practices. We
                help shape the product and provide feedback from real-world
                usage.
              </p>
              <div className='mt-auto space-y-2 border-t border-zinc-200/80 pt-5 text-sm text-zinc-500'>
                <p>Early access to new features</p>
                <p>Direct feedback channel</p>
                <p>Certified expertise</p>
              </div>
            </div>

            <div className='flex h-full flex-col py-8 md:min-h-[31rem] md:px-8 md:py-10'>
              <h3 className='text-2xl font-medium tracking-tight text-foreground'>
                Global Events & Training
              </h3>
              <p className='mt-5 text-lg leading-8 text-muted-foreground'>
                We have hosted events around the world, bringing enthusiasm and
                expertise to developers and engineering teams across continents.
              </p>
              <div className='mt-auto space-y-2 border-t border-zinc-200/80 pt-5 text-sm text-zinc-500'>
                <p>100+ teams trained</p>
                <p>In-person & remote</p>
                <p>Worldwide availability</p>
              </div>
            </div>

            <div className='flex h-full flex-col py-8 md:min-h-[31rem] md:px-8 md:py-10'>
              <h3 className='text-2xl font-medium tracking-tight text-foreground'>
                We Build in the Open
              </h3>
              <p className='mt-5 text-lg leading-8 text-muted-foreground'>
                We contribute to the ecosystem with open source tools. Our
                flagship project coordinates multiple AI agents for complex
                workflows.
              </p>
              <div className='mt-auto border-t border-zinc-200/80 pt-5'>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                  Latest contribution
                </p>
                <a
                  href='https://github.com/cursorworkshop/cursor-gastown'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-3 block text-foreground transition-opacity hover:opacity-70'
                >
                  <p className='text-base font-medium'>cursor-gastown</p>
                  <p className='mt-2 text-sm text-zinc-500'>
                    {githubStats.stars} stars · {githubStats.forks} forks · Go ·
                    Multi-Agent · MIT
                  </p>
                </a>
              </div>
            </div>
          </div>

          <RecentEventsGallery />
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className='py-24 bg-white'>
        <div className='max-w-3xl mx-auto container-padding'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
                Frequently Asked Questions
              </h2>
              <p className='text-muted-foreground'>
                Everything you need to know about our training programs.
              </p>
            </div>
          </InView>

          <Accordion type='single' collapsible className='w-full'>
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className='border-border/50 py-2'
              >
                <AccordionTrigger className='text-left text-lg md:text-xl font-medium hover:no-underline'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground text-base md:text-lg leading-relaxed'>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 bg-white'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
              Get started today
            </h2>
            <p className='text-muted-foreground mb-8'>
              Join engineering teams worldwide who have improved their developer
              efficiency through our training programs.
            </p>
            <div className='flex flex-row justify-center gap-3'>
              <Button size='lg' asChild>
                <Link href='/training'>View Training</Link>
              </Button>
              <Button variant='secondary' size='lg' asChild>
                <Link href='/contact'>Contact Us</Link>
              </Button>
            </div>
          </InView>
        </div>
      </section>
    </div>
  );
}
