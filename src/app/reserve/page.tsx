'use client';

import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Shield,
  Clock,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import StripePayment from '@/components/StripePayment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function ReservePage() {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const totalAmount = selectedSeats * 500;

  return (
    <div className='min-h-screen overflow-x-hidden bg-background'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-background'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        {/* Hero Content */}
        <div className='relative max-w-7xl mx-auto container-padding section-padding'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end'>
            {/* Left Column - Content */}
            <div className='space-y-6 lg:space-y-8 order-1'>
              <div className='space-y-4'>
                <Badge variant='secondary' className='text-sm font-medium'>
                  Limited Seats Available • Early Bird Pricing
                </Badge>

                <h1 className='text-4xl lg:text-6xl font-bold leading-tight'>
                  <span className='text-foreground'>Reserve Your Spot</span>
                  <br />
                  <span className='text-muted-foreground'>November 2025</span>
                </h1>
              </div>

              {/* Event Details */}
              <Card className='bg-card border'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                    <Badge variant='outline'>November 9-15, 2025</Badge>
                  </div>
                  <CardTitle className='text-2xl'>
                    Claude Code Engineering Offsite
                  </CardTitle>
                  <CardDescription>
                    Kyrimai Hotel • Mani Peninsula, Greece
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-primary' />
                      <span>5-Day Intensive</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Users className='w-4 h-4 text-primary' />
                      <span>20 Seats Max</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <MapPin className='w-4 h-4 text-primary' />
                      <span>Mani Peninsula</span>
                    </div>
                  </div>

                  <div className='border-t pt-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-lg font-semibold'>
                        Reservation Fee
                      </span>
                      <span className='text-lg text-muted-foreground'>
                        €500 per seat
                      </span>
                    </div>

                    {/* Seat Selection */}
                    <div className='mb-6'>
                      <label className='block text-sm font-medium mb-2'>
                        Number of seats
                      </label>
                      <Select
                        value={selectedSeats.toString()}
                        onValueChange={value =>
                          setSelectedSeats(parseInt(value))
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select number of seats' />
                        </SelectTrigger>
                        <SelectContent
                          side='bottom'
                          align='start'
                          className='max-h-[200px] overflow-y-auto'
                          sideOffset={4}
                          avoidCollisions={true}
                          collisionPadding={8}
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(
                            num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} seat{num > 1 ? 's' : ''}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <p className='text-xs text-muted-foreground mt-2'>
                        Limited space available. For bookings over capacity, we
                        will contact you to arrange alternative solutions.
                      </p>
                    </div>

                    <p className='text-sm text-muted-foreground mb-6'>
                      Secure your spot(s) with a reservation fee. This amount
                      will be deducted from your final workshop cost.
                    </p>

                    {/* Reserve Button */}
                    <StripePayment
                      amount={totalAmount}
                      currency='eur'
                      description={`Claude Code Engineering Offsite Reservation - ${selectedSeats} seat${selectedSeats > 1 ? 's' : ''}`}
                    />

                    <div className='flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Shield className='w-3 h-3' />
                        <span>Secure Payment</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <CheckCircle className='w-3 h-3' />
                        <span>Instant Confirmation</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Visual */}
            <div className='relative order-2 h-full'>
              <div className='relative z-10'>
                {/* Professional Hero Image */}
                <Card className='relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[750px] overflow-hidden shadow-2xl border-0 group'>
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
                  <CardContent className='absolute inset-0 flex flex-col justify-between p-6'>
                    {/* Top badges */}
                    <div className='flex justify-between items-start'>
                      <Badge
                        variant='secondary'
                        className='bg-background text-foreground font-medium'
                      >
                        Premium Experience
                      </Badge>
                      <Badge className='bg-primary text-primary-foreground font-bold'>
                        €500 Reserve
                      </Badge>
                    </div>

                    {/* Bottom information */}
                    <div className='space-y-3'>
                      <div className='bg-background rounded-lg p-4 border shadow-lg'>
                        <div className='space-y-2'>
                          <h3 className='text-lg font-bold text-foreground'>
                            Kyrimai Hotel
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            Luxury 5-star resort in historic Mani Peninsula
                          </p>
                          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Star className='w-3 h-3 text-yellow-500' />
                              <span>5-star luxury</span>
                            </span>
                            <span className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              <span>5 days / 4 nights</span>
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
    </div>
  );
}
