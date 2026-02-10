'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, TrendingUp, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InView } from '@/components/motion/in-view';
import { LightRays } from '@/components/ui/light-rays';
import Features from '@/components/features-2';

export default function WhitePaperPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'white_paper_landing' }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className='min-h-screen bg-white text-foreground font-sans selection:bg-blue-100 dark:selection:bg-zinc-800'>
      {/* Hero Section - Full screen */}
      <section className='min-h-[100svh] flex flex-col justify-center items-center overflow-hidden relative pb-8 bg-white'>
        <LightRays
          count={12}
          color='rgba(200, 200, 200, 0.3)'
          blur={60}
          speed={10}
          length='90vh'
        />

        <div className='max-w-5xl mx-auto container-padding z-10 flex-1 flex flex-col justify-center relative pt-20 md:pt-0'>
          <div className='text-center space-y-8'>
            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              viewOptions={{ once: true }}
            >
              <h1 className='text-3xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground'>
                <span className='whitespace-nowrap'>
                  The Enterprise Guide to
                </span>
                <br />
                <span className='text-muted-foreground'>
                  Agentic Development
                </span>
              </h1>
              <p className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-6 leading-relaxed'>
                The playbook behind 100+ enterprise teams shipping faster with
                AI. Get the exact framework Fortune 100 and DAX 40 engineering
                leaders use to adopt agentic development safely.
              </p>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewOptions={{ once: true }}
            >
              <div className='max-w-md mx-auto text-left mb-2'>
                <ul className='space-y-2 text-sm md:text-base text-muted-foreground'>
                  <li className='flex items-start gap-2'>
                    <span className='text-foreground mt-0.5'>&#10003;</span>
                    The Delegate, Review, Own decision framework
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-foreground mt-0.5'>&#10003;</span>
                    Security and code quality guidelines for AI-generated code
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-foreground mt-0.5'>&#10003;</span>
                    How to measure AI adoption ROI across your team
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-foreground mt-0.5'>&#10003;</span>
                    Real rollout strategies from enterprise deployments
                  </li>
                </ul>
              </div>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewOptions={{ once: true }}
            >
              <div className='max-w-xl mx-auto px-4'>
                {status === 'success' ? (
                  <div className='py-4 text-center'>
                    <div className='text-3xl mb-4'>📬</div>
                    <h3 className='text-xl font-medium text-foreground mb-2'>
                      Check your inbox
                    </h3>
                    <p className='text-muted-foreground'>
                      The guide is on its way.
                    </p>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={handleSubmit}
                      className='flex flex-col sm:flex-row gap-3'
                    >
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className='h-12 bg-zinc-100 border-0 rounded-full pl-6 flex-1'
                        required
                      />
                      <Button
                        type='submit'
                        className='h-12 px-8 whitespace-nowrap'
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          'Sending...'
                        ) : (
                          <>
                            <Download className='w-4 h-4 mr-2' />
                            Get the Free Guide
                          </>
                        )}
                      </Button>
                    </form>
                    {status === 'error' && (
                      <p className='text-sm text-red-500 mt-3 text-center'>
                        Something went wrong. Please try again.
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground mt-3 text-center'>
                      Free PDF, 24 pages. No spam.
                    </p>
                  </>
                )}
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* The Framework: Delegate, Review, Own */}
      <Features />

      {/* Stats Section - from homepage */}
      <section className='bg-background @container py-24'>
        <div className='mx-auto max-w-6xl px-6'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            viewOptions={{ once: true }}
          >
            <div className='mb-16'>
              <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
                Proven Results
              </h2>
              <p className='text-muted-foreground max-w-2xl'>
                Our framework delivers measurable productivity gains across
                engineering teams of all sizes.
              </p>
            </div>
          </InView>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewOptions={{ once: true }}
            >
              <div className='space-y-3'>
                <TrendingUp className='w-5 h-5 text-muted-foreground' />
                <div>
                  <span className='text-foreground text-3xl font-medium'>
                    40%
                  </span>
                  <p className='text-foreground font-medium mt-1'>
                    More efficient developers
                  </p>
                  <p className='text-muted-foreground text-sm mt-2 leading-relaxed'>
                    Average productivity increase measured across trained teams
                    within the first month.
                  </p>
                </div>
              </div>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewOptions={{ once: true }}
            >
              <div className='space-y-3'>
                <Users className='w-5 h-5 text-muted-foreground' />
                <div>
                  <span className='text-foreground text-3xl font-medium'>
                    100+
                  </span>
                  <p className='text-foreground font-medium mt-1'>
                    Teams trained
                  </p>
                  <p className='text-muted-foreground text-sm mt-2 leading-relaxed'>
                    From startups to Fortune 100 companies and DAX 40
                    enterprises worldwide.
                  </p>
                </div>
              </div>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewOptions={{ once: true }}
            >
              <div className='space-y-3'>
                <Star className='w-5 h-5 text-muted-foreground' />
                <div>
                  <span className='text-foreground text-3xl font-medium'>
                    5/5
                  </span>
                  <p className='text-foreground font-medium mt-1'>
                    Average rating
                  </p>
                  <p className='text-muted-foreground text-sm mt-2 leading-relaxed'>
                    Consistently top-rated by participants for quality and
                    practical value.
                  </p>
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-32 bg-white'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            viewOptions={{ once: true }}
          >
            <h2 className='text-3xl font-medium mb-6'>Ready to start?</h2>
            <p className='text-muted-foreground mb-10 text-lg'>
              Transform how your team builds software today.
            </p>
            <div className='flex flex-row gap-3 justify-center'>
              <Button
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/contact'>Get in touch</Link>
              </Button>
              <Button
                variant='secondary'
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/training'>View Training</Link>
              </Button>
            </div>
          </InView>
        </div>
      </section>
    </div>
  );
}
