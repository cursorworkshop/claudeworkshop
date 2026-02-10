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
  title: 'Enterprise - Comprehensive On-Site Training',
  description:
    'Comprehensive on-site Claude Code training for organizations seeking mastery and custom AI solutions.',
};

export default function EnterpriseTrainingPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section with Image */}
      <section className='section-padding bg-background'>
        <div className='max-w-7xl mx-auto container-padding'>
          <Button
            variant='ghost'
            className='p-0 h-auto text-primary hover:text-primary/80 mb-8'
            asChild
          >
            <Link href='/training'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Training
            </Link>
          </Button>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            {/* Left Column - Content */}
            <div className='space-y-6'>
              <Badge variant='secondary' className='mb-4'>
                Enterprise Program
              </Badge>
              <h1 className='text-4xl lg:text-6xl font-bold text-foreground leading-tight'>
                Comprehensive On-Site Training
              </h1>
              <p className='text-xl text-muted-foreground'>
                An intensive, on-site program designed for organizations seeking
                to transform developer efficiency at scale. This comprehensive
                training brings our expert team directly to your location for
                maximum impact and customization.
              </p>
              <div className='flex flex-wrap gap-4 pt-4'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-primary' />
                  <span className='font-medium'>20-40 hours</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5 text-primary' />
                  <span className='font-medium'>5-25 participants</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-primary/10'>
                    On-Site Only
                  </Badge>
                </div>
              </div>
              <div className='pt-4'>
                <Button asChild>
                  <Link href='/contact'>
                    Contact Us
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Link>
                </Button>
              </div>
            </div>
            {/* Right Column - Image */}
            <div className='relative'>
              <Card className='relative aspect-[4/3] overflow-hidden shadow-xl border group'>
                <Image
                  src='/images/onsite-training.jpg'
                  alt='Abstract minimalist design'
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-105'
                  priority
                  quality={100}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1920px'
                />
              </Card>
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
              This program focuses on advanced Claude Code integration, custom tool
              development, and strategic implementation to transform developer
              efficiency and solve complex engineering challenges.
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
                <CardTitle>Efficiency Leaders</CardTitle>
                <CardDescription>
                  Teams looking to transform development workflows and maximize
                  developer efficiency at scale.
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
                  of efficient development.
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
                  Contact us for customized enterprise pricing
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
            Ready for Enterprise Training?
          </h2>
          <p className='text-lg mb-8 opacity-90'>
            Transform your team's developer efficiency. Contact us for a
            tailored comprehensive training program.
          </p>
          <Button variant='secondary' asChild size='lg'>
            <Link href='/contact'>
              Contact Us for Enterprise Training
              <ArrowRight className='w-5 h-5 ml-3' />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
