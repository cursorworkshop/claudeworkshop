'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultInquiryType?: string;
}

export function ContactFormModal({
  isOpen,
  onClose,
  defaultSubject = '',
  defaultInquiryType = '',
}: ContactFormModalProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: defaultSubject,
      message: '',
      inquiryType: defaultInquiryType,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
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

  const handleClose = () => {
    setStatus('idle');
    setErrorMessage('');
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Contact Us</DialogTitle>
        </DialogHeader>

        {status === 'success' ? (
          <div className='p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>Message Sent!</h3>
            <p className='text-muted-foreground mb-4'>
              Thank you for your message. We'll get back to you within 24 hours.
            </p>
            <Button onClick={handleClose} className='w-full'>
              Close
            </Button>
          </div>
        ) : (
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
                        <Input placeholder='Your name' {...field} />
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
                    <FormLabel>Inquiry Type *</FormLabel>
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
                        <SelectItem value='workshop'>
                          Workshop Information
                        </SelectItem>
                        <SelectItem value='partnership'>Partnership</SelectItem>
                        <SelectItem value='speaking'>
                          Speaking Opportunity
                        </SelectItem>
                        <SelectItem value='general'>
                          General Question
                        </SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
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
                      <Input placeholder='Brief subject line' {...field} />
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
                        placeholder='Tell us more about your inquiry...'
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

              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='flex-1'
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4 mr-2' />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
