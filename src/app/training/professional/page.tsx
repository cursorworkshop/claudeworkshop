import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  Zap,
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
  title: 'Professional - Advanced Training',
  description:
    'Advanced Claude Code training to maximize developer efficiency for teams ready to optimize workflows and integrate advanced features.',
};

export default function ProfessionalTrainingPage() {
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
                Professional Program
              </Badge>
              <h1 className='text-4xl lg:text-6xl font-bold text-foreground leading-tight'>
                Advanced Training
              </h1>
              <p className='text-xl text-muted-foreground'>
                Level up your team's AI capabilities. Optimize workflows,
                integrate advanced features, and build production-ready
                practices.
              </p>
              <div className='flex flex-wrap gap-4 pt-4'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-primary' />
                  <span className='font-medium'>12-16 hours</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5 text-primary' />
                  <span className='font-medium'>5-20 participants</span>
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
      <section className='section-padding bg-muted/20'>
        <div className='max-w-7xl mx-auto container-padding'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>
              What You'll Master
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Dive deeper into Claude Code's capabilities, learning to leverage
              advanced features to maximize developer efficiency for complex
              tasks, code reviews, and project management.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='w-6 h-6 text-primary flex-shrink-0 mt-1' />
                  <div>
                    <h3 className='font-semibold text-foreground mb-2'>
                      Advanced Prompt Engineering
                    </h3>
                    <p className='text-muted-foreground'>
                      Master complex prompting techniques and custom AI agents
                      for specialized tasks.
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
                      CI/CD Integration
                    </h3>
                    <p className='text-muted-foreground'>
                      Integrate Claude Code with your existing pipelines and
                      development workflows.
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
                      Efficient Code Review with Claude Code
                    </h3>
                    <p className='text-muted-foreground'>
                      Implement efficient code review processes and quality
                      assurance.
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
                      Team Scaling Strategies
                    </h3>
                    <p className='text-muted-foreground'>
                      Learn strategies for scaling AI adoption across larger
                      engineering teams.
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
            This training is ideal for teams who have basic AI experience and
            are ready to integrate AI more deeply into their development
            lifecycle.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card className='text-center'>
              <CardHeader>
                <Users className='w-10 h-10 text-primary mb-4 mx-auto' />
                <CardTitle>Experienced AI Users</CardTitle>
                <CardDescription>
                  Developers with some AI experience looking to enhance their
                  skills.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='text-center'>
              <CardHeader>
                <Zap className='w-10 h-10 text-primary mb-4 mx-auto' />
                <CardTitle>Workflow Optimization</CardTitle>
                <CardDescription>
                  Teams focused on streamlining development processes with
                  advanced AI tools.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='text-center'>
              <CardHeader>
                <Clock className='w-10 h-10 text-primary mb-4 mx-auto' />
                <CardTitle>Efficiency Boost</CardTitle>
                <CardDescription>
                  Organizations aiming for significant improvements in coding
                  efficiency and quality.
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
                  We come to your office for hands-on, in-person training
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
            Ready for Professional Training?
          </h2>
          <p className='text-lg mb-8 opacity-90'>
            Elevate your team's AI capabilities. Contact us to tailor your
            intermediate training program.
          </p>
          <Button variant='secondary' asChild size='lg'>
            <Link href='/contact'>
              Contact Us for Professional Training
              <ArrowRight className='w-5 h-5 ml-3' />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
