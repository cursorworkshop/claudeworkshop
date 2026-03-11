'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import Features from '@/components/features-2';
import { InView } from '@/components/motion/in-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LightRays } from '@/components/ui/light-rays';

export function WhitePaperLanding() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          source: 'white_paper_landing',
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className='min-h-screen bg-white font-sans text-foreground selection:bg-blue-100 dark:selection:bg-zinc-800'>
      <section className='relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-white pb-8'>
        <LightRays
          count={12}
          color='rgba(200, 200, 200, 0.3)'
          blur={60}
          speed={10}
          length='90vh'
        />

        <div className='container-padding relative z-10 mx-auto flex max-w-3xl flex-1 flex-col justify-center pt-20 md:pt-0'>
          <div className='space-y-8 text-center'>
            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              viewOptions={{ once: true }}
            >
              <h1 className='text-5xl font-bold tracking-tighter text-foreground md:text-7xl lg:text-8xl'>
                The Enterprise Guide to{' '}
                <span className='text-muted-foreground'>
                  Agentic Development
                </span>
              </h1>
              <p className='mx-auto mt-4 max-w-lg text-base text-muted-foreground md:text-lg'>
                24 pages. The framework Fortune 100 engineering leaders use to
                adopt AI-assisted development safely.
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
              <div className='mx-auto max-w-md'>
                {status === 'success' ? (
                  <div className='py-4 text-center'>
                    <div className='mb-4 text-3xl'>📬</div>
                    <h3 className='mb-2 text-xl font-medium text-foreground'>
                      Check your inbox
                    </h3>
                    <p className='text-muted-foreground'>
                      The guide is on its way.
                    </p>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className='space-y-3'>
                      <div className='grid grid-cols-2 gap-3'>
                        <Input
                          type='text'
                          placeholder='First name'
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className='h-12 border-0 bg-zinc-100 pl-6'
                          required
                        />
                        <Input
                          type='text'
                          placeholder='Last name'
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className='h-12 border-0 bg-zinc-100 pl-6'
                          required
                        />
                      </div>
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className='h-12 w-full border-0 bg-zinc-100 pl-6'
                        required
                      />
                      <Button
                        type='submit'
                        className='h-12 w-full'
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          'Sending...'
                        ) : (
                          <>
                            <Download className='mr-2 h-4 w-4' />
                            Get the free guide
                          </>
                        )}
                      </Button>
                    </form>
                    {status === 'error' && (
                      <p className='mt-3 text-center text-sm text-red-500'>
                        Something went wrong. Please try again.
                      </p>
                    )}
                    <p className='mt-3 text-center text-xs text-muted-foreground'>
                      No spam, never. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </InView>
          </div>
        </div>
      </section>

      <Features />
    </div>
  );
}
