'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  TRACKING_STORAGE_KEY,
  type AnalyticsPayload,
  type PageVisit,
  type TrackingSession,
} from '@/lib/tracking';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FormStatus = 'idle' | 'submitting' | 'error';

type TrackingStorage = TrackingSession & { pages: PageVisit[] };

const readTrackingSession = (): TrackingStorage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(TRACKING_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TrackingStorage;
  } catch {
    return null;
  }
};

const finalizePages = (pages: PageVisit[], submittedAt: number) => {
  if (!pages.length) {
    return pages;
  }

  return pages.map((page, index) => {
    if (page.endedAt || page.durationMs || index !== pages.length - 1) {
      return page;
    }

    const durationMs = Math.max(submittedAt - page.startedAt, 0);

    return {
      ...page,
      endedAt: submittedAt,
      durationMs,
    };
  });
};

const buildAnalyticsPayload = (
  data: ContactFormData
): AnalyticsPayload | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const session = readTrackingSession();
  if (!session?.id) {
    return null;
  }

  const submittedAt = Date.now();
  const pages = finalizePages(session.pages ?? [], submittedAt);
  const normalizedPages =
    pages.length > 0
      ? pages
      : [
          {
            path: window.location.pathname,
            startedAt: submittedAt,
            endedAt: submittedAt,
            durationMs: 0,
          },
        ];

  const totalTimeMs = normalizedPages.reduce(
    (total, page) => total + (page.durationMs ?? 0),
    0
  );

  const payload: AnalyticsPayload = {
    session: {
      id: session.id,
      startedAt: session.startedAt,
      referrer: session.referrer ?? null,
      referrerHost: session.referrerHost ?? null,
      utm: session.utm,
      landingPath: session.landingPath ?? null,
    },
    pages: normalizedPages,
    submission: {
      formType: 'contact',
      name: data.name,
      email: data.email,
      inquiryType: data.inquiryType,
      pagePath: window.location.pathname,
      submittedAt,
      totalTimeMs,
    },
  };

  window.sessionStorage.setItem(
    TRACKING_STORAGE_KEY,
    JSON.stringify({ ...session, pages: normalizedPages })
  );

  return payload;
};

export function ContactForm() {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const analyticsPayload = buildAnalyticsPayload(data);
      const analyticsPromise = analyticsPayload
        ? fetch('/api/analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            keepalive: true,
            body: JSON.stringify(analyticsPayload),
          }).catch(() => undefined)
        : Promise.resolve();

      // Submit to Vercel Forms via API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      await analyticsPromise;

      // Redirect to thank you page for Google Ads conversion tracking
      router.push('/contact/thank-you');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div className='w-full max-w-2xl mx-auto'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Your name'
                      className='h-12 text-base'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='your@email.com'
                      className='h-12 text-base'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='inquiryType'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base'>Inquiry Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='h-12 text-base'>
                      <SelectValue placeholder='Select inquiry type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='onsite'>
                      On-Site Training for Teams
                    </SelectItem>
                    <SelectItem value='offsite'>
                      Executive Offsite Program
                    </SelectItem>
                    <SelectItem value='enterprise'>
                      Enterprise Licensing
                    </SelectItem>
                    <SelectItem value='partnership'>
                      Partnership Opportunity
                    </SelectItem>
                    <SelectItem value='speaking'>
                      Speaking Engagement
                    </SelectItem>
                    <SelectItem value='other'>Other Inquiry</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base'>Subject *</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Brief subject line'
                    className='h-12 text-base'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base'>Message *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us about your team, timeline, and goals...'
                    className='min-h-[320px] text-base'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {status === 'error' && (
            <div className='flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-red-600' />
              <p className='text-base text-red-600'>{errorMessage}</p>
            </div>
          )}

          <div className='space-y-3'>
            <Button
              type='submit'
              size='lg'
              className='w-full h-14 text-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='w-5 h-5 mr-2' />
                  Send Message
                </>
              )}
            </Button>
            <p className='text-sm text-muted-foreground text-center'>
              We typically respond within 24 hours.
            </p>
            <p className='text-xs text-muted-foreground/70 text-center max-w-md mx-auto'>
              The more detail you provide about your team size, current
              workflows, and objectives, the better we can tailor our response
              to your specific requirements.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
