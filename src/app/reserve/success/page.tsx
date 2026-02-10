import { CheckCircle, Calendar, Users, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface SearchParams {
  seats?: string;
  amount?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function ReserveSuccessPage({ searchParams }: Props) {
  // Parse URL parameters with fallbacks
  const params = await searchParams;
  const seats = parseInt(params.seats || '1');
  const totalAmount = parseInt(params.amount || '500');

  return (
    <div className='min-h-screen overflow-x-hidden bg-background'>
      {/* Success Section */}
      <section className='relative overflow-hidden bg-background'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

        {/* Success Content */}
        <div className='relative max-w-7xl mx-auto container-padding section-padding'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end'>
            {/* Left Column - Content */}
            <div className='space-y-6 lg:space-y-8 order-1'>
              <div className='space-y-4'>
                <Badge variant='secondary' className='text-sm font-medium'>
                  Payment Successful • Reservation Confirmed
                </Badge>

                <h1 className='text-4xl lg:text-6xl font-bold leading-tight text-foreground'>
                  Reservation
                  <br />
                  Confirmed
                </h1>
              </div>

              {/* Confirmation Details */}
              <Card className='bg-card border'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='w-5 h-5 text-green-500' />
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
                    <div className='space-y-2 mb-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          {seats} seat{seats > 1 ? 's' : ''} × €500
                        </span>
                        <span className='text-sm font-medium'>
                          €{totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg font-semibold'>
                          Total Paid
                        </span>
                        <span className='text-2xl font-bold text-green-600'>
                          €{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className='text-sm text-muted-foreground mb-6'>
                      This amount will be deducted from your final workshop
                      cost. You'll receive a confirmation email shortly with
                      your invoice from Stripe.
                    </p>

                    {/* Contact Organizers */}
                    <div className='space-y-4'>
                      <h3 className='text-lg font-semibold'>
                        Contact Organizers
                      </h3>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            Rogier Muller
                          </span>
                          <div className='flex items-center gap-2'>
                            <Link
                              href='https://www.linkedin.com/in/rogyr/'
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex p-1'
                            >
                              <svg
                                className='w-4 h-4 text-foreground hover:text-muted-foreground transition-colors'
                                viewBox='0 0 24 24'
                                fill='currentColor'
                              >
                                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                              </svg>
                            </Link>
                            <Link
                              href='mailto:contact@rogyr.com'
                              className='inline-flex p-1'
                            >
                              <Mail className='w-4 h-4 text-foreground hover:text-blue-600 transition-colors' />
                            </Link>
                          </div>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            Vasilis Tsolis
                          </span>
                          <div className='flex items-center gap-2'>
                            <Link
                              href='https://www.linkedin.com/in/vasilistsolis/'
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex p-1'
                            >
                              <svg
                                className='w-4 h-4 text-foreground hover:text-muted-foreground transition-colors'
                                viewBox='0 0 24 24'
                                fill='currentColor'
                              >
                                <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                              </svg>
                            </Link>
                            <Link
                              href='mailto:vasilis.tsolis@gmail.com'
                              className='inline-flex p-1'
                            >
                              <Mail className='w-4 h-4 text-foreground hover:text-blue-600 transition-colors' />
                            </Link>
                          </div>
                        </div>
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
                        Reservation Confirmed
                      </Badge>
                      <Badge className='bg-green-600 text-white font-bold'>
                        <CheckCircle className='w-3 h-3 mr-1' />
                        Paid
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
                              <CheckCircle className='w-3 h-3 text-green-500' />
                              <span>Confirmed</span>
                            </span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              <span>Nov 9-15, 2025</span>
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
