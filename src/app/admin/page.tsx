'use client';

import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormStatus = 'idle' | 'loading' | 'error';

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body?.error || 'Login failed');
      }

      router.push('/admin/dashboard');
    } catch (loginError) {
      setStatus('error');
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-16 bg-background'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center space-y-2'>
          <div className='mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <Lock className='w-6 h-6 text-primary' />
          </div>
          <CardTitle className='text-2xl'>Admin Access</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Sign in to view traffic sources and form analytics.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                type='text'
                value={username}
                onChange={event => setUsername(event.target.value)}
                placeholder='admin'
                autoComplete='username'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete='current-password'
                required
              />
            </div>
            {status === 'error' && (
              <div className='flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4' />
                <span>{error}</span>
              </div>
            )}
            <Button
              type='submit'
              className='w-full'
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
