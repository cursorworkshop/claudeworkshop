'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Globe,
  Award,
  Github,
  ExternalLink,
  Star,
  GitFork,
  Zap,
  MessageSquare,
  CheckCircle2,
  Rocket,
  Linkedin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { InView } from '@/components/motion/in-view';
import { AnimatedGroup } from '@/components/motion/animated-group';
import { TextEffect } from '@/components/motion/text-effect';

const founders = [
  {
    name: 'Rogier Muller',
    role: 'Co-Founder',
    image: '/images/people/rogier-9-no-bg-site-v2.svg',
    bio: 'Passionate about AI-assisted development and helping teams unlock their full potential with Claude Code.',
    github: 'https://github.com/rogierx',
    linkedin: 'https://www.linkedin.com/in/rogyr',
  },
  {
    name: 'Vasilis Tsolis',
    role: 'Co-Founder',
    image: '/images/people/vasilis-3-no-bg-site.svg',
    bio: 'Dedicated to spreading the power of AI coding tools and building a global community of Claude Code enthusiasts.',
    github: 'https://github.com/claudeworkshop',
    linkedin: 'https://www.linkedin.com/in/vasilistsolis',
  },
];

const aboutStats = [
  {
    icon: Award,
    title: 'Official Claude Ambassadors',
    description:
      'In daily contact with the Claude Code development team to ensure our training reflects the latest features and best practices. We help shape the product and provide feedback from real-world usage.',
    highlights: [
      { icon: Zap, text: 'Early access to new features' },
      { icon: MessageSquare, text: 'Direct feedback channel' },
      { icon: CheckCircle2, text: 'Certified expertise' },
    ],
  },
  {
    icon: Globe,
    title: 'Global Events & Training',
    description:
      'We have hosted events around the world, bringing enthusiasm and expertise to developers and engineering teams across continents.',
    highlights: [
      { icon: Users, text: '100+ teams trained' },
      { icon: Rocket, text: 'In-person & remote' },
      { icon: Globe, text: 'Worldwide availability' },
    ],
  },
  {
    icon: Github,
    title: 'We Build in the Open',
    description:
      'We contribute to the Claude Code ecosystem with open source tools. Our flagship project coordinates multiple AI agents for complex workflows.',
    isOpenSource: true,
    link: 'https://github.com/claudeworkshop/claude-gastown',
  },
];

const faqItems = [
  {
    question: 'What makes Claude Workshop different?',
    answer:
      'We are official Claude ambassadors with direct access to the Claude Code development team. Our training is always up-to-date with the latest features, and we provide insights that others simply cannot. We have trained over 100 teams at Fortune 100 and DAX 40 companies.',
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
    fetch('https://api.github.com/repos/claudeworkshop/claude-gastown')
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
                          href='https://github.com/claudeworkshop'
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
        <div className='max-w-5xl mx-auto container-padding'>
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
                Direct connection to Claude Code and a passion for developer
                education.
              </p>
            </div>
          </InView>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Card 1: Official Claude Ambassadors */}
            <Card className='border-transparent bg-white h-full flex flex-col shadow-none ring-0'>
              <CardHeader>
                <div className='w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4'>
                  <Award className='w-5 h-5 text-foreground' />
                </div>
                <CardTitle className='text-lg font-medium'>
                  Official Claude Ambassadors
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 flex-1 flex flex-col'>
                <CardDescription className='text-base mb-4'>
                  In daily contact with the Claude Code development team to
                  ensure our training reflects the latest features and best
                  practices. We help shape the product and provide feedback from
                  real-world usage.
                </CardDescription>
                <div className='mt-auto space-y-2 pt-4 border-t border-border/30'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Zap className='w-3.5 h-3.5 text-zinc-400' />
                    <span>Early access to new features</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <MessageSquare className='w-3.5 h-3.5 text-zinc-400' />
                    <span>Direct feedback channel</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <CheckCircle2 className='w-3.5 h-3.5 text-zinc-400' />
                    <span>Certified expertise</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Global Events & Training */}
            <Card className='border-transparent bg-white h-full flex flex-col shadow-none ring-0'>
              <CardHeader>
                <div className='w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4'>
                  <Globe className='w-5 h-5 text-foreground' />
                </div>
                <CardTitle className='text-lg font-medium'>
                  Global Events & Training
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 flex-1 flex flex-col'>
                <CardDescription className='text-base mb-4'>
                  We have hosted events around the world, bringing enthusiasm
                  and expertise to developers and engineering teams across
                  continents.
                </CardDescription>
                <div className='mt-auto space-y-2 pt-4 border-t border-border/30'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Users className='w-3.5 h-3.5 text-zinc-400' />
                    <span>100+ teams trained</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Rocket className='w-3.5 h-3.5 text-zinc-400' />
                    <span>In-person & remote</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Globe className='w-3.5 h-3.5 text-zinc-400' />
                    <span>Worldwide availability</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: We Build in the Open */}
            <Card className='border-transparent bg-white h-full flex flex-col shadow-none ring-0'>
              <CardHeader>
                <div className='w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4'>
                  <Github className='w-5 h-5 text-foreground' />
                </div>
                <CardTitle className='text-lg font-medium'>
                  We Build in the Open
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 flex-1 flex flex-col'>
                <CardDescription className='text-base mb-4'>
                  We contribute to the Claude Code ecosystem with open source
                  tools. Our flagship project coordinates multiple AI agents for
                  complex workflows.
                </CardDescription>

                {/* Mini GitHub Card - clickable */}
                <div className='mt-auto pt-4 border-t border-border/30'>
                  <p className='text-xs text-muted-foreground mb-2 uppercase tracking-wider'>
                    Latest contribution
                  </p>
                  <a
                    href='https://github.com/claudeworkshop/claude-gastown'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block group'
                  >
                    <div className='p-3 rounded-lg border border-border/50 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all duration-200'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <Github className='w-4 h-4 text-zinc-700' />
                          <span className='font-medium text-sm text-foreground'>
                            claude-gastown
                          </span>
                        </div>
                        <ExternalLink className='w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors' />
                      </div>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                          <Star className='w-3 h-3 fill-amber-400 text-amber-400' />
                          {githubStats.stars}
                        </span>
                        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                          <GitFork className='w-3 h-3' />
                          {githubStats.forks}
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        <Badge
                          variant='outline'
                          className='text-[10px] px-1.5 py-0 bg-[#00ADD8]/10 border-[#00ADD8]/30 text-[#00ADD8]'
                        >
                          Go
                        </Badge>
                        <Badge
                          variant='outline'
                          className='text-[10px] px-1.5 py-0'
                        >
                          Multi-Agent
                        </Badge>
                        <Badge
                          variant='outline'
                          className='text-[10px] px-1.5 py-0'
                        >
                          MIT
                        </Badge>
                      </div>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <Button
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/training'>View Training</Link>
              </Button>
              <Button
                variant='secondary'
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/contact'>Contact Us</Link>
              </Button>
            </div>
          </InView>
        </div>
      </section>
    </div>
  );
}
