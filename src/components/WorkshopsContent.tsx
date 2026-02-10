'use client';

import {
  Calendar,
  ArrowRight,
  MapPin,
  Users,
  CheckCircle,
  Mail,
  Utensils,
  Hotel,
  Camera,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import EventCard from '@/components/EventCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Event } from '@/lib/types';

interface WorkshopsContentProps {
  upcoming: Event[];
  past: Event[];
}

export function WorkshopsContent({ upcoming, past }: WorkshopsContentProps) {
  return (
    <div className='min-h-screen'>
      {/* Hero Section - Clean, minimal */}
      <section className='py-24 lg:py-32'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Left Column - Content */}
            <div className='space-y-6'>
              <p className='text-sm text-muted-foreground tracking-wide uppercase'>
                Engineering Offsites
              </p>
              <h1 className='text-4xl lg:text-5xl font-medium text-foreground tracking-tight'>
                Engineering Offsites
              </h1>
              <p className='text-lg text-muted-foreground leading-relaxed'>
                Premium offsite experiences that turn experienced developers
                into Claude Code power-users. 5-day intensive bootcamps.
              </p>
              <div className='flex flex-wrap gap-3 pt-2'>
                <Button asChild>
                  <Link href='/contact'>
                    Contact Us
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Link>
                </Button>
                <Button variant='outline' asChild>
                  <Link href='/training'>View Training Programs</Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className='relative'>
              <Card className='relative aspect-[4/3] overflow-hidden border-border/50'>
                <Image
                  src='/images/offsite-training.jpg'
                  alt='Workshop training session'
                  fill
                  className='object-cover'
                  priority
                  quality={100}
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Current Status Section */}
      <section className='py-24 bg-zinc-50 dark:bg-zinc-900/50'>
        <div className='max-w-3xl mx-auto container-padding'>
          <Card className='border-border/50 text-center'>
            <CardHeader className='pb-4'>
              <div className='w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4'>
                <Calendar className='w-6 h-6 text-foreground' />
              </div>
              <CardTitle className='text-2xl font-medium'>
                Q1 2025 Openings Available
              </CardTitle>
              <CardDescription className='text-base max-w-lg mx-auto'>
                Currently, there are no public offsites registered. For Q1 we
                have several openings for on-site training.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              <Button asChild>
                <Link href='/contact'>
                  <Mail className='w-4 h-4 mr-2' />
                  Contact Us for Q1 Training
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What's Included Section */}
      <section className='py-24 bg-background'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
              What's included
            </h2>
            <p className='text-muted-foreground max-w-xl mx-auto'>
              Everything you need for an unforgettable learning experience.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                icon: Hotel,
                title: 'Luxury Stay',
                desc: '5 nights at boutique hotels',
              },
              {
                icon: Utensils,
                title: 'Gourmet Dining',
                desc: 'All meals included',
              },
              {
                icon: Users,
                title: 'Small Groups',
                desc: '12-20 participants',
              },
              {
                icon: Camera,
                title: 'Experiences',
                desc: 'Cultural activities included',
              },
            ].map(item => (
              <Card key={item.title} className='text-center border-border/50'>
                <CardHeader>
                  <div className='w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4'>
                    <item.icon className='w-6 h-6 text-foreground' />
                  </div>
                  <CardTitle className='text-lg font-medium'>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <p className='text-sm text-muted-foreground'>{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Workshops */}
      {upcoming.length > 0 && (
        <section className='py-24 bg-zinc-50 dark:bg-zinc-900/50'>
          <div className='max-w-7xl mx-auto container-padding'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
                Upcoming Workshops
              </h2>
              <p className='text-muted-foreground'>
                Secure your spot before they sell out.
              </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {upcoming.map((event, idx) => (
                <EventCard
                  key={event.slug}
                  event={event}
                  variant={idx === 0 ? 'featured' : 'default'}
                  showContent={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Workshops */}
      {past.length > 0 && (
        <section className='py-24 bg-background'>
          <div className='max-w-7xl mx-auto container-padding'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
                Past Workshops
              </h2>
              <p className='text-muted-foreground'>
                See what we covered previously.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {past.map(event => (
                <EventCard key={event.slug} event={event} variant='compact' />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className='py-24 bg-zinc-50 dark:bg-zinc-900/50'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
            Ready for an unforgettable experience?
          </h2>
          <p className='text-muted-foreground mb-8'>
            Join us for a premium offsite combining world-class training with
            luxury accommodation.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Button size='lg' asChild>
              <Link href='/contact'>
                Get in Touch
                <ArrowRight className='w-4 h-4 ml-2' />
              </Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/training'>View Training</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
