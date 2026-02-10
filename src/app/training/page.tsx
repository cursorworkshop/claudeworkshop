import {
  Building2,
  MapPin,
  CheckCircle,
  Plane,
  Video,
  Users,
  Globe,
  Calendar,
} from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FAQs from '@/components/faqs-2';

export const metadata: Metadata = {
  title: 'Training Programs | Claude Workshop',
  description:
    'Professional Claude Code training. On-site sessions at your location or premium offsite programs in stunning locations.',
};

export default function TrainingPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section - Text Only */}
      <section className='pt-28 pb-24 lg:py-32'>
        <div className='max-w-4xl mx-auto container-padding text-center'>
          <p className='text-sm text-muted-foreground tracking-wide uppercase mb-4'>
            Training Programs
          </p>
          <h1 className='text-4xl lg:text-6xl font-medium text-foreground tracking-tight mb-6'>
            Master Claude Code with Expert Training
          </h1>
          <p className='text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto'>
            Choose how you want to learn. On-site training at your location or
            premium offsite programs in stunning locations.
          </p>
          <div className='flex flex-row gap-3 justify-center'>
            <Button
              className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
              asChild
            >
              <Link href='/contact'>Book Training</Link>
            </Button>
            <Button
              variant='secondary'
              className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
              asChild
            >
              <Link href='#formats'>View Formats</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className='border-t border-zinc-200' />

      {/* Training Formats - Visual Cards */}
      <section className='py-24 bg-zinc-50' id='formats'>
        <div className='max-w-5xl mx-auto container-padding'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-medium text-foreground mb-4 tracking-tight'>
              Two Ways to Train
            </h2>
            <p className='text-muted-foreground max-w-xl mx-auto'>
              Choose the format that works best for your team.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* On-Site Training - Large Visual Card */}
            <div className='group relative rounded-2xl overflow-hidden bg-background border border-border/50 hover:border-border transition-all duration-300'>
              {/* Large Image */}
              <div className='relative h-64 lg:h-80 overflow-hidden bg-zinc-100'>
                <Image
                  src='/images/onsite-training.jpg'
                  alt='Modern office building'
                  fill
                  priority
                  className='object-cover group-hover:scale-105 transition-transform duration-500 z-0'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10' />

                {/* Floating Badge */}
                <div className='absolute top-4 left-4'>
                  <Badge className='bg-white/90 text-foreground backdrop-blur-sm'>
                    <Globe className='w-3 h-3 mr-1' />
                    Worldwide
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className='p-6 lg:p-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center'>
                    <Building2 className='w-6 h-6 text-foreground' />
                  </div>
                  <div>
                    <h3 className='text-2xl font-medium text-foreground'>
                      On-Site Training
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      At your location
                    </p>
                  </div>
                </div>

                <p className='text-muted-foreground mb-6'>
                  Expert training delivered online or in-person at your office.
                  We come to you worldwide with a minimum of two trainers.
                </p>

                {/* Features Grid */}
                <div className='grid grid-cols-2 gap-3 mb-6'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Video className='w-4 h-4 text-muted-foreground' />
                    <span>Online sessions</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <Users className='w-4 h-4 text-muted-foreground' />
                    <span>In-person training</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <CheckCircle className='w-4 h-4 text-muted-foreground' />
                    <span>Custom curriculum</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <CheckCircle className='w-4 h-4 text-muted-foreground' />
                    <span>Your codebase (NDA)</span>
                  </div>
                </div>

                <Button className='w-full' asChild>
                  <Link href='/contact'>Request On-Site Training</Link>
                </Button>
              </div>
            </div>

            {/* Offsite Training - Large Visual Card */}
            <div className='group relative rounded-2xl overflow-hidden bg-background border border-border/50 hover:border-border transition-all duration-300'>
              {/* Large Image */}
              <div className='relative h-64 lg:h-80 overflow-hidden bg-zinc-100'>
                <Image
                  src='/images/offsite-training.jpg'
                  alt='Mediterranean hotel terrace with sea view'
                  fill
                  priority
                  className='object-cover group-hover:scale-105 transition-transform duration-500 z-0'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10' />

                {/* Floating Badge */}
                <div className='absolute top-4 left-4'>
                  <Badge className='bg-white/90 text-foreground backdrop-blur-sm'>
                    <Plane className='w-3 h-3 mr-1' />
                    Premium Experience
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className='p-6 lg:p-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center'>
                    <MapPin className='w-6 h-6 text-foreground' />
                  </div>
                  <div>
                    <h3 className='text-2xl font-medium text-foreground'>
                      Offsite Training
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Mediterranean locations
                    </p>
                  </div>
                </div>

                <p className='text-muted-foreground mb-6'>
                  5-day intensive bootcamp at stunning locations in Greece.
                  All-inclusive with hotel, meals, and activities.
                </p>

                {/* Features Grid */}
                <div className='grid grid-cols-2 gap-3 mb-6'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='w-4 h-4 text-muted-foreground' />
                    <span>5-day bootcamp</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <Users className='w-4 h-4 text-muted-foreground' />
                    <span>Max 12 participants</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <CheckCircle className='w-4 h-4 text-muted-foreground' />
                    <span>All-inclusive</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <CheckCircle className='w-4 h-4 text-muted-foreground' />
                    <span>Certificate</span>
                  </div>
                </div>

                <div className='flex flex-row gap-3'>
                  <Button className='flex-1' asChild>
                    <Link href='/contact'>Inquire About Offsites</Link>
                  </Button>
                  <Button variant='secondary' className='flex-1' asChild>
                    <Link href='/workshops'>View Previous</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <FAQs />

      {/* CTA Section */}
      <section className='py-32'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <h2 className='text-3xl font-medium text-foreground mb-6'>
            Ready to transform your team?
          </h2>
          <p className='text-muted-foreground mb-10 text-lg'>
            Contact us to discuss your training needs and find the perfect
            format.
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
              <Link href='/methodology'>Our Methodology</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
