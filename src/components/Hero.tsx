'use client';

import { Calendar, Users, MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/lib/config';
import { cn } from '@/lib/utils';

interface HeroProps {
  nextEvent?: {
    title: string;
    date: string;
    location: string;
    registrationUrl?: string;
  };
}

export default function Hero({ nextEvent }: HeroProps) {
  return (
    <section className='relative overflow-hidden bg-background'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

      {/* Hero Content */}
      <div className='relative max-w-7xl mx-auto container-padding section-padding'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-end'>
          {/* Left Column - Content */}
          <div className='space-y-6 lg:space-y-8 order-1 flex flex-col justify-center'>
            <div className='space-y-4'>
              <Badge variant='secondary' className='text-sm font-medium'>
                Engineering Offsite • AI Training
              </Badge>

              <h1 className='text-4xl lg:text-6xl font-bold leading-tight'>
                <span className='text-foreground'>Claude Workshops</span>
                <br />
                <span className='text-muted-foreground'>Workshop Series</span>
              </h1>

              <p className='text-xl text-muted-foreground max-w-2xl'>
                Premium offsite experiences for engineering teams. Hands-on AI
                development with Claude Code, small groups, expert instructors,
                real projects.
              </p>
            </div>

            {/* Trust badges */}
            <div className='flex items-center justify-between sm:justify-start sm:gap-4 lg:gap-6'>
              <Badge
                variant='outline'
                className='flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm'
              >
                <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
                <span className='font-semibold'>5-Day Offsite</span>
              </Badge>
              <Badge
                variant='outline'
                className='flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm'
              >
                <Users className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
                <span className='font-semibold'>Expert-Led</span>
              </Badge>
              <Badge
                variant='outline'
                className='flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-xs sm:text-sm'
              >
                <Users className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
                <span className='font-semibold'>Limited Seats</span>
              </Badge>
            </div>

            {/* Next Event Card */}
            {nextEvent && (
              <Card className='bg-card border'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                    <Badge variant='outline'>Next Event</Badge>
                  </div>
                  <CardTitle className='line-clamp-2'>
                    {nextEvent.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center space-x-1'>
                      <Calendar className='w-4 h-4' />
                      <span suppressHydrationWarning>
                        {new Date(nextEvent.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <MapPin className='w-4 h-4' />
                      <span>{nextEvent.location}</span>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <Button size='sm' asChild>
                      <Link href={nextEvent.registrationUrl || '/workshops'}>
                        Register Now
                        <ArrowRight className='w-4 h-4 ml-2' />
                      </Link>
                    </Button>
                    <Button variant='outline' size='sm' asChild>
                      <Link href='/workshops'>View All Workshops</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Visual */}
          <div className='relative order-2 h-full'>
            <div className='relative z-10'>
              {/* Professional Hero Image */}
              <Card className='relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[600px] overflow-hidden shadow-2xl border-0 group'>
                <div
                  className='absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105'
                  style={{
                    backgroundImage:
                      'url(/images/hotel_ambiance_mustinclude.jpg)',
                  }}
                >
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
                </div>

                {/* Enhanced Information Overlay */}
                <CardContent className='absolute inset-0 flex flex-col justify-between p-6 pointer-events-none'>
                  {/* Top badges */}
                  <div className='flex justify-between items-start pointer-events-auto'>
                    <Badge
                      variant='secondary'
                      className='bg-background text-foreground font-medium'
                    >
                      5-Day Bootcamp
                    </Badge>
                    <Badge
                      variant='outline'
                      className='bg-background text-foreground'
                    >
                      Limited Seats
                    </Badge>
                  </div>

                  {/* Bottom information */}
                  <div className='space-y-3 pointer-events-auto'>
                    <div className='bg-background rounded-lg p-4 border shadow-lg'>
                      <div className='space-y-2'>
                        <h3 className='text-lg font-bold text-foreground'>
                          November Engineering Offsite
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          Kyrimai Hotel • Mani Peninsula, Greece
                        </p>
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            Nov 9-15, 2025
                          </span>
                          <span className='flex items-center gap-1'>
                            <Users className='w-3 h-3' />
                            12-20 seats
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className='absolute bottom-0 left-0 right-0'>
        <svg
          className='w-full h-20 text-white'
          preserveAspectRatio='none'
          viewBox='0 0 1200 120'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z'
            opacity='.25'
            fill='currentColor'
          ></path>
          <path
            d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z'
            opacity='.5'
            fill='currentColor'
          ></path>
          <path
            d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z'
            fill='currentColor'
          ></path>
        </svg>
      </div>
    </section>
  );
}
