'use client';

import { MapPin, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { InView } from '@/components/motion/in-view';
import { AnimatedGroup } from '@/components/motion/animated-group';

// Previous offsites data
const previousOffsites = [
  {
    title: 'Mani Peninsula, Greece',
    date: 'September 2024',
    description:
      '5-day intensive bootcamp on the stunning Greek coast. Historic villages, Mediterranean cuisine, and world-class Claude Code training.',
    image: '/images/offsite-training.jpg',
    attendees: 12,
  },
];

export default function WorkshopsPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='pt-28 pb-24 lg:py-32'>
        <div className='max-w-5xl mx-auto container-padding'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <div className='max-w-3xl'>
              <p className='text-sm text-muted-foreground tracking-wide uppercase mb-4'>
                Previous Offsites
              </p>
              <h1 className='text-4xl lg:text-5xl font-medium text-foreground tracking-tight mb-6'>
                Offsite Training History
              </h1>
              <p className='text-lg text-muted-foreground leading-relaxed mb-8'>
                Explore our previous offsite training programs. Each offsite
                combines intensive Claude Code training with unforgettable
                experiences in stunning Mediterranean locations.
              </p>
              <div className='flex flex-wrap gap-3'>
                <Button asChild>
                  <Link href='/contact'>Inquire About Offsites</Link>
                </Button>
                <Button variant='outline' asChild>
                  <Link href='/training'>View All Training</Link>
                </Button>
              </div>
            </div>
          </InView>
        </div>
      </section>

      {/* Previous Offsites */}
      <section className='py-24 bg-zinc-50 dark:bg-zinc-900/50'>
        <div className='max-w-5xl mx-auto container-padding'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-3xl font-medium text-foreground mb-12 tracking-tight'>
              Past Programs
            </h2>
          </InView>

          <AnimatedGroup
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            preset='slide'
            stagger={0.1}
          >
            {previousOffsites.map(offsite => (
              <Card
                key={offsite.title}
                className='border-border/50 overflow-hidden'
              >
                <div className='relative aspect-[16/10] bg-zinc-100'>
                  <Image
                    src={offsite.image}
                    alt={offsite.title}
                    fill
                    priority
                    className='object-cover'
                  />
                </div>
                <CardHeader>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge variant='outline' className='text-xs'>
                      <Calendar className='w-3 h-3 mr-1' />
                      {offsite.date}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {offsite.attendees} attendees
                    </Badge>
                  </div>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <MapPin className='w-4 h-4 text-muted-foreground' />
                    {offsite.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <CardDescription className='text-sm'>
                    {offsite.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}

            {/* Upcoming placeholder */}
            <Card className='border-dashed border-2 border-border/50 bg-transparent'>
              <CardContent className='flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8'>
                <div className='w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4'>
                  <MapPin className='w-6 h-6 text-muted-foreground' />
                </div>
                <h3 className='font-medium text-foreground mb-2'>
                  Next Offsite: Q1 2025
                </h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Location to be announced
                </p>
                <Button variant='outline' size='sm' asChild>
                  <Link href='/contact'>Express Interest</Link>
                </Button>
              </CardContent>
            </Card>
          </AnimatedGroup>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
              Interested in an offsite?
            </h2>
            <p className='text-muted-foreground mb-8'>
              Contact us to learn about upcoming offsite training programs or to
              organize a private offsite for your team.
            </p>
            <div className='flex flex-row gap-3 justify-center'>
              <Button
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/contact'>Contact Us</Link>
              </Button>
              <Button
                variant='secondary'
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/training'>On-Site Training</Link>
              </Button>
            </div>
          </InView>
        </div>
      </section>
    </div>
  );
}
