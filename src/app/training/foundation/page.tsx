import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  Code,
  Zap,
  BookOpen,
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
  title: 'Foundation - Essential Training',
  description:
    'Essential Claude Code training to improve developer efficiency for teams new to Claude Code. Perfect starting point for teams exploring efficient development workflows.',
};

export default function FoundationTrainingPage() {
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
                Foundation Program
              </Badge>
              <h1 className='text-4xl lg:text-6xl font-bold text-foreground leading-tight'>
                Essential Training
              </h1>
              <p className='text-xl text-muted-foreground'>
                Perfect starting point for teams new to Claude Code. Learn the
                fundamentals to improve developer efficiency and build
                confidence with efficient development workflows.
              </p>
              <div className='flex flex-wrap gap-4 pt-4'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-primary' />
                  <span className='font-medium'>4-8 hours</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5 text-primary' />
                  <span className='font-medium'>5-15 participants</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>On-location or Remote</Badge>
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
      <section className='section-padding bg-background'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <div>
                <h2 className='text-3xl font-bold mb-4'>What You'll Learn</h2>
                <p className='text-lg text-muted-foreground mb-6'>
                  This introductory program covers the essential foundations of
                  Claude Code, helping your team understand how to improve developer
                  efficiency without overwhelming them.
                </p>
              </div>

              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-1'>Claude Code Fundamentals</h3>
                    <p className='text-muted-foreground text-sm'>
                      Understanding the interface, basic commands, and core
                      features
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-1'>
                      Claude Code Coding Basics for Efficiency
                    </h3>
                    <p className='text-muted-foreground text-sm'>
                      Writing effective prompts and leveraging AI suggestions
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-1'>Best Practices</h3>
                    <p className='text-muted-foreground text-sm'>
                      Establishing workflows and avoiding common pitfalls
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-semibold mb-1'>Hands-On Practice</h3>
                    <p className='text-muted-foreground text-sm'>
                      Real exercises to build confidence and understanding
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className='section-padding bg-background'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Curriculum Outline</h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Structured learning path designed for beginners
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Code className='w-6 h-6 text-primary' />
                  <CardTitle>Module 1: Getting Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Claude Code installation and setup</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Interface overview and navigation</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Basic configuration and preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <Zap className='w-6 h-6 text-primary' />
                  <CardTitle>Module 2: AI Features</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Understanding AI suggestions</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Writing effective prompts</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Accepting and refining AI code</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <BookOpen className='w-6 h-6 text-primary' />
                  <CardTitle>Module 3: Practical Application</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Hands-on coding exercises</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Real-world examples and use cases</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Q&A and troubleshooting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  <CheckCircle className='w-6 h-6 text-primary' />
                  <CardTitle>Module 4: Next Steps</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Establishing team workflows</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Best practices and guidelines</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-primary mt-1'>•</span>
                    <span>Resources for continued learning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Format Options */}
      <section className='section-padding bg-background'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Training Format</h2>
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
                  We come to your office for hands-on, in-person training
                  sessions.
                </p>
                <p className='text-sm font-medium'>Contact us for pricing</p>
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
                  Live interactive sessions delivered online via video
                  conferencing.
                </p>
                <p className='text-sm font-medium'>Contact us for pricing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='section-padding bg-primary text-primary-foreground'>
        <div className='max-w-4xl mx-auto container-padding text-center'>
          <h2 className='text-3xl lg:text-4xl font-bold mb-4'>
            Ready to Build Your Foundation?
          </h2>
          <p className='text-lg mb-8 opacity-90'>
            Empower your team with essential Claude Code skills to improve developer
            efficiency. Contact us to customize your foundation training
            program.
          </p>
          <Button variant='secondary' size='lg' asChild>
            <Link href='/contact'>
              Contact Us for Foundation Training
              <ArrowRight className='w-4 h-4 ml-2' />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
