'use client';

import { Card } from '@/components/ui/card';

export default function Features() {
  return (
    <section className='bg-background @container py-24'>
      <div className='mx-auto max-w-5xl px-6'>
        <div>
          <h2 className='text-balance text-4xl font-medium'>
            The Framework: Delegate, Review, Own
          </h2>
          <p className='text-muted-foreground mt-4 text-balance'>
            Every task in AI-assisted development falls into one of three
            categories. Master these, and you master AI-augmented engineering.
          </p>
        </div>
        <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 *:p-6'>
          <Card variant='mixed' className='flex flex-col'>
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium text-lg'>Delegate</h3>
              <p className='text-muted-foreground text-sm'>
                Hand off repetitive tasks entirely. Boilerplate, migrations,
                tests, documentation, logs. Trust but verify.
              </p>
            </div>
            {/* Delegate visual: Horizontal flowing lines representing handoff */}
            <div
              aria-hidden
              className='flex h-44 flex-col justify-between pt-8 pb-4 overflow-hidden'
            >
              {[0, 1, 2, 3, 4].map(row => (
                <div key={row} className='relative h-px w-full'>
                  <div className='absolute inset-0 bg-border' />
                  <div
                    className='absolute h-2 w-2 -top-[3px] rounded-full bg-primary'
                    style={{
                      animation: 'delegateFlow 3s ease-in-out infinite',
                      animationDelay: `${row * 400}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
          <Card variant='mixed' className='flex flex-col overflow-hidden'>
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium text-lg'>Review</h3>
              <p className='text-muted-foreground text-sm'>
                AI proposes, you decide. Bug fixes, refactoring, optimization.
                Stay in control of quality.
              </p>
            </div>
            {/* Review visual: Rippling circles representing review cycles */}
            <div aria-hidden className='relative h-44 translate-y-6'>
              <div className='bg-foreground/15 absolute inset-0 mx-auto w-px'></div>
              <div
                className='absolute -inset-x-16 top-6 aspect-square rounded-full border animate-ping'
                style={{ animationDuration: '3s' }}
              ></div>
              <div className='border-primary absolute -inset-x-16 top-6 aspect-square rounded-full border opacity-60'></div>
              <div
                className='absolute -inset-x-8 top-24 aspect-square rounded-full border animate-ping'
                style={{ animationDuration: '3s', animationDelay: '1s' }}
              ></div>
              <div className='absolute -inset-x-8 top-24 aspect-square rounded-full border border-foreground/40 opacity-60'></div>
            </div>
          </Card>
          <Card variant='mixed' className='flex flex-col overflow-hidden'>
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium text-lg'>Own</h3>
              <p className='text-muted-foreground text-sm'>
                Core architecture, security decisions, business logic. Some
                things require human judgment.
              </p>
            </div>
            {/* Own visual: Pulsing vertical bars representing human control */}
            <div aria-hidden className='flex h-44 justify-between pb-6 pt-12'>
              {Array.from({ length: 16 }).map((_, i) => {
                const isPrimary = [3, 7, 10, 14].includes(i);
                return (
                  <div
                    key={i}
                    className={`h-full w-px ${isPrimary ? 'bg-primary' : 'bg-foreground/15'}`}
                    style={{
                      animation: isPrimary
                        ? 'pulse 2s ease-in-out infinite'
                        : undefined,
                      animationDelay: isPrimary ? `${i * 100}ms` : undefined,
                    }}
                  />
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
