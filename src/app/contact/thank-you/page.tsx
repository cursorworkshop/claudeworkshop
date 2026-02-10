'use client';

import { useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { LightRays } from '@/components/ui/light-rays';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function ContactThankYouPage() {
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      });
    }
  }, []);
  return (
    <div className='min-h-screen bg-white'>
      <section className='min-h-[100svh] flex flex-col justify-center items-center overflow-hidden relative'>
        {/* Light rays background */}
        <LightRays
          count={12}
          color='rgba(200, 200, 200, 0.3)'
          blur={60}
          speed={10}
          length='90vh'
        />

        <div className='max-w-2xl mx-auto container-padding z-10 text-center pt-16 md:pt-0'>
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className='w-20 h-20 mx-auto mb-10 rounded-full border-2 border-foreground flex items-center justify-center'
          >
            <Check className='w-10 h-10 text-foreground' strokeWidth={2.5} />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-5xl md:text-6xl font-bold tracking-tight mb-6'
          >
            Message received
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-xl text-muted-foreground mb-10'
          >
            We'll get back to you within 24 hours.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-3 justify-center'
          >
            <Button asChild size='lg' className='h-12 px-8'>
              <Link href='/training'>
                View Programs
                <ArrowRight className='w-4 h-4 ml-2' />
              </Link>
            </Button>
            <Button asChild variant='outline' size='lg' className='h-12 px-8'>
              <Link href='/'>Back to Home</Link>
            </Button>
          </motion.div>

          {/* Direct email */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='mt-14 text-center'
          >
            <p className='text-base text-muted-foreground/70'>
              Need to reach us directly?
            </p>
            <a
              href='mailto:info@claudeworkshop.com'
              className='text-base text-foreground hover:underline'
            >
              info@claudeworkshop.com
            </a>
          </motion.div>

          {/* Limited spots notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='mt-16 inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-full px-4 py-2'
          >
            <span className='w-2 h-2 bg-zinc-400 rounded-full' />
            <p className='text-sm text-zinc-500'>
              Limited availability this quarter
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
