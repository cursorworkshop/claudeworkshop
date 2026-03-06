'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState('');

  const confirm = async () => {
    if (!token) return;
    setError('');
    setStatus('loading');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || 'Failed to unsubscribe');
      }

      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      setStatus('error');
    }
  };

  return (
    <>
      {!token && (
        <p className='mt-6 rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700'>
          Missing unsubscribe token.
        </p>
      )}

      {token && status !== 'success' && (
        <div className='mt-6 flex flex-wrap items-center gap-2'>
          <Button
            className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800'
            onClick={() => void confirm()}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Unsubscribing...' : 'Confirm unsubscribe'}
          </Button>
          <Button
            variant='outline'
            className='h-9 rounded-none border-zinc-300'
            asChild
          >
            <Link href='/'>Back to site</Link>
          </Button>
        </div>
      )}

      {status === 'success' && (
        <div className='mt-6 rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700'>
          You are unsubscribed.
        </div>
      )}

      {error && (
        <div className='mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>
          {error}
        </div>
      )}
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <div className='min-h-screen bg-white px-6 py-16 text-zinc-900'>
      <div className='mx-auto max-w-xl'>
        <h1 className='text-2xl font-semibold tracking-tight'>Unsubscribe</h1>
        <p className='mt-3 text-sm text-zinc-600'>
          If you do not want to receive follow-up emails from Claude Workshop,
          you can unsubscribe here.
        </p>

        <Suspense>
          <UnsubscribeContent />
        </Suspense>

        <p className='mt-10 text-sm text-zinc-600'>
          Need help?{' '}
          <Link href='/contact' className='underline underline-offset-4'>
            Contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
