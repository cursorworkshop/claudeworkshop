'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const privacyContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type PrivacyContactFormData = z.infer<typeof privacyContactSchema>;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function PrivacyContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<PrivacyContactFormData>({
    resolver: zodResolver(privacyContactSchema),
    defaultValues: {
      name: '',
      email: '',
      inquiryType: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: PrivacyContactFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Submit to Vercel Forms via API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inquiryType: 'privacy', // Mark as privacy inquiry
          originalInquiryType: data.inquiryType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      form.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    }
  };

  if (status === 'success') {
    return (
      <Card className='w-full max-w-2xl mx-auto'>
        <CardContent className='p-8 text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>
          <h3 className='text-xl font-semibold mb-2'>Privacy Inquiry Sent!</h3>
          <p className='text-muted-foreground mb-4'>
            Thank you for your privacy-related inquiry. We'll respond within 30
            days as outlined in our privacy policy.
          </p>
          <Button
            onClick={() => setStatus('idle')}
            variant='outline'
            className='w-full'
          >
            Send Another Inquiry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex items-center justify-center mb-4'>
          <div className='w-12 h-12 bg-muted rounded-xl flex items-center justify-center'>
            <Shield className='w-6 h-6 text-foreground' />
          </div>
        </div>
        <CardTitle className='text-2xl text-center'>
          Privacy Inquiry Form
        </CardTitle>
        <p className='text-muted-foreground text-center'>
          Have questions about our privacy practices or need to exercise your
          data rights? We're here to help.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Your full name' {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='your@email.com'
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
                  <FormLabel>Privacy Inquiry Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select inquiry type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='data-access'>
                        Request Access to My Data
                      </SelectItem>
                      <SelectItem value='data-correction'>
                        Request Data Correction
                      </SelectItem>
                      <SelectItem value='data-deletion'>
                        Request Data Deletion
                      </SelectItem>
                      <SelectItem value='opt-out'>
                        Opt-out of Communications
                      </SelectItem>
                      <SelectItem value='privacy-question'>
                        General Privacy Question
                      </SelectItem>
                      <SelectItem value='data-breach'>
                        Report Data Concern
                      </SelectItem>
                      <SelectItem value='other'>
                        Other Privacy Matter
                      </SelectItem>
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
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Brief subject line for your privacy inquiry'
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
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Please provide details about your privacy inquiry or data request...'
                      className='min-h-[120px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === 'error' && (
              <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                <AlertCircle className='w-4 h-4 text-red-600' />
                <p className='text-sm text-red-600'>{errorMessage}</p>
              </div>
            )}

            <Button
              type='submit'
              className='w-full'
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Sending Inquiry...
                </>
              ) : (
                <>
                  <Send className='w-4 h-4 mr-2' />
                  Send Privacy Inquiry
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
