'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InView } from '@/components/motion/in-view';
import { LightRays } from '@/components/ui/light-rays';
import Features from '@/components/features-2';

export default function WhitePaperPage() {
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
    <div className='min-h-screen bg-white text-foreground font-sans selection:bg-blue-100 dark:selection:bg-zinc-800'>
      {/* Hero Section */}
      <section className='min-h-[100svh] flex flex-col justify-center items-center overflow-hidden relative pb-8 bg-white'>
        <LightRays
          count={12}
          color='rgba(200, 200, 200, 0.3)'
          blur={60}
          speed={10}
          length='90vh'
        />

        <div className='max-w-3xl mx-auto container-padding z-10 flex-1 flex flex-col justify-center relative pt-20 md:pt-0'>
          <div className='text-center space-y-8'>
            <InView
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              viewOptions={{ once: true }}
            >
              <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground'>
                The Enterprise Guide to{' '}
                <span className='text-muted-foreground'>
                  Agentic Development
                </span>
              </h1>
              <p className='text-base md:text-lg text-muted-foreground max-w-lg mx-auto mt-4'>
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
              <div className='max-w-md mx-auto'>
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
                    <form onSubmit={handleSubmit} className='space-y-3'>
                      <div className='grid grid-cols-2 gap-3'>
                        <Input
                          type='text'
                          placeholder='First name'
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className='h-12 bg-zinc-100 border-0 rounded-full pl-6'
                          required
                        />
                        <Input
                          type='text'
                          placeholder='Last name'
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className='h-12 bg-zinc-100 border-0 rounded-full pl-6'
                          required
                        />
                      </div>
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className='h-12 bg-zinc-100 border-0 rounded-full pl-6 w-full'
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
                            <Download className='w-4 h-4 mr-2' />
                            Get the free guide
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
                      No spam, never. Unsubscribe anytime.
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
    </div>
  );
}
