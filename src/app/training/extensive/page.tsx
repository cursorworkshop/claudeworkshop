import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  Rocket,
  ArrowRight,
  Building2,
  Globe,
} from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Extensive - Advanced Training',
  description:
    'Advanced Claude Code training for experienced teams seeking mastery and custom AI solutions.',
};

export default function ExtensiveTrainingPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section with Image */}
      <section className='relative section-padding bg-background overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <Image
            src='https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=4000&auto=format&fit=crop'
            alt='Advanced team collaboration'
            fill
            className='object-cover opacity-15'
            priority
          />
        </div>
        <div className='relative z-10 max-w-7xl mx-auto container-padding'>
          <div className='max-w-3xl mx-auto'>
            <Button
              variant='ghost'
              className='p-0 h-auto text-primary hover:text-primary/80 mb-6'
              asChild
            >
              <Link href='/training'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Training
              </Link>
            </Button>

            <div className='space-y-6'>
              <div>
                <Badge variant='secondary' className='mb-4'>
                  Extensive Training
                </Badge>
                <h1 className='text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-4'>
                  Advanced Training
                </h1>
                <p className='text-xl text-muted-foreground'>
                  A comprehensive, deep-dive program for experienced engineering
                  teams aiming to achieve mastery in AI-powered development and
                  implement custom AI solutions.
                </p>
              </div>

              <div className='flex flex-wrap gap-4'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-primary' />
                  <span className='font-medium'>20-40 hours</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5 text-primary' />
                  <span className='font-medium'>5-25 participants</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>On-location or Remote</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className='section-padding bg-muted/20'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>
              What You'll Achieve
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              This program focuses on advanced AI integration, custom tool
              development, and strategic implementation of AI to solve complex
              engineering challenges.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary flex-shrink-0 mt-1' />
                  <div>
                    <h3 className='font-semibold text-foreground mb-2'>
                      Custom AI Tools
                    </h3>
                    <p className='text-muted-foreground'>
                      Develop custom AI tools and extensions tailored to your
                      specific needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary flex-shrink-0 mt-1' />
                  <div>
                    <h3 className='font-semibold text-foreground mb-2'>
                      Architectural Design
                    </h3>
                    <p className='text-muted-foreground'>
                      Implement AI for architectural design and system
                      optimization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary flex-shrink-0 mt-1' />
                  <div>
                    <h3 className='font-semibold text-foreground mb-2'>
                      Advanced Testing & Security
                    </h3>
                    <p className='text-muted-foreground'>
                      AI-driven testing, security analysis, and performance
                      tuning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary flex-shrink-0 mt-1' />
                  <div>
                    <h3 className='font-semibold text-foreground mb-2'>
                      Strategic Planning
                    </h3>
                    <p className='text-muted-foreground'>
                      Long-term AI integration strategy and team upskilling
                      plans.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className='section-padding bg-background'>
        <div className='max-w-7xl mx-auto container-padding text-center'>
          <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-6'>
            Who Benefits Most?
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-12'>
            This training is designed for highly experienced teams and technical
            leaders who want to push the boundaries of AI in their development
            processes.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card className='text-center'>
              <CardHeader>
                <Users className='w-10 h-10 text-primary mb-4 mx-auto' />
                <CardTitle>AI Innovators</CardTitle>
                <CardDescription>
                  Teams looking to develop custom AI solutions and lead in
                  AI-powered development.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='text-center'>
              <CardHeader>
                <Rocket className='w-10 h-10 text-primary mb-4 mx-auto' />
                <CardTitle>Strategic Implementation</CardTitle>
                <CardDescription>
                  Organizations focused on long-term AI strategy and advanced
                  integration.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='text-center'>
              <CardHeader>
                <Clock className='w-10 h-10 text-primary mb-4 mx-auto' />
                <CardTitle>Deep Expertise</CardTitle>
                <CardDescription>
                  Teams seeking to achieve a deep, comprehensive understanding
                  of AI development.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Format Options */}
      <section className='section-padding bg-muted/20'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>
              Training Format
            </h2>
            <p className='text-lg text-muted-foreground'>
              Available in both on-location and remote formats
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <Building2 className='w-6 h-6 text-primary' />
                  <CardTitle>On-Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-4'>
                  We come to your office for intensive, in-person training
                  sessions.
                </p>
                <p className='text-sm text-muted-foreground'>
                  Contact us for pricing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <Globe className='w-6 h-6 text-primary' />
                  <CardTitle>Remote</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-4'>
                  Live, interactive sessions delivered online for distributed
                  teams.
                </p>
                <p className='text-sm text-muted-foreground'>
                  Contact us for pricing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='section-padding bg-primary text-primary-foreground'>
        <div className='max-w-4xl mx-auto container-padding text-center'>
          <h2 className='text-3xl lg:text-4xl font-bold mb-4'>
            Ready for Extensive Training?
          </h2>
          <p className='text-lg mb-8 opacity-90'>
            Transform your team into AI development masters. Contact us for a
            tailored extensive training program.
          </p>
          <Button variant='secondary' asChild size='lg'>
            <Link href='/contact'>
              Get a Quote for Extensive Training
              <ArrowRight className='w-5 h-5 ml-3' />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
