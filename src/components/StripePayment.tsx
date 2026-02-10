'use client';

import { loadStripe } from '@stripe/stripe-js';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentProps {
  amount: number;
  currency?: string;
  description: string;
  className?: string;
}

export default function StripePayment({
  amount,
  currency = 'eur',
  description,
  className,
}: StripePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Stripe keys are configured
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        setError(
          'Online payments are coming soon! Please contact us directly to reserve your spot.'
        );
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(
        err.message ||
          'Online payments are coming soon! Please contact us directly to reserve your spot.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        size='lg'
        className='w-full text-lg py-6'
        onClick={handlePayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className='w-5 h-5 mr-2 animate-spin' />
            Processing...
          </>
        ) : (
          <>
            <svg
              className='w-5 h-5 mr-2'
              viewBox='0 0 24 24'
              fill='currentColor'
            >
              <path d='M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z' />
            </svg>
            Reserve with Stripe
          </>
        )}
      </Button>
      {error && (
        <div className='mt-4 p-4 bg-muted rounded-lg border border-red-200'>
          <p className='text-sm text-red-600'>{error}</p>
          <p className='text-xs text-muted-foreground mt-2'>
            Contact us at{' '}
            <a
              href='/contact'
              className='text-primary hover:underline font-medium'
            >
              our contact page
            </a>{' '}
            or email us directly to reserve your spot. Online payments coming
            soon!
          </p>
        </div>
      )}
    </div>
  );
}
