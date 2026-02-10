import { Calendar, Clock, Plus } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { siteConfig } from '@/lib/config';
import { getUpcomingEvents, getPastEvents } from '@/lib/markdown';

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Join our upcoming events and explore past meetups, workshops, and talks.',
};

export default async function EventsPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
  ]);

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='hero-bg pt-28 pb-16 lg:py-24'>
        <div className='max-w-5xl mx-auto container-padding'>
          <div className='text-center space-y-8'>
            <div className='space-y-4'>
              <h1 className='text-4xl lg:text-6xl font-bold text-gray-900 leading-tight'>
                <span className='gradient-text'>Events</span>
              </h1>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Join us for exciting meetups, workshops, and talks about
                AI-powered development with Claude Code
              </p>
            </div>

            {/* Quick Stats */}
            <div className='flex flex-wrap justify-center gap-8'>
              <div className='flex items-center space-x-2'>
                <Calendar className='w-5 h-5 text-claude-blue' />
                <span className='font-semibold text-gray-900'>
                  Monthly Meetups
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <Clock className='w-5 h-5 text-claude-blue' />
                <span className='font-semibold text-gray-900'>
                  Usually 18:30 CEST
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <Plus className='w-5 h-5 text-claude-blue' />
                <span className='font-semibold text-gray-900'>Open CFP</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className='flex flex-wrap justify-center gap-4'>
              <Button asChild>
                <Link
                  href={siteConfig.social.sessionize || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Propose a Talk
                </Link>
              </Button>
              <Button variant='secondary' asChild>
                <Link
                  href={siteConfig.social.meetup || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 ? (
        <section className='section-padding bg-background'>
          <div className='max-w-5xl mx-auto container-padding'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl lg:text-4xl font-bold gradient-text mb-4'>
                Upcoming Events
              </h2>
              <p className='text-lg text-gray-600'>
                Don't miss these exciting opportunities to learn and connect
              </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.slug}
                  event={event}
                  variant={index === 0 ? 'featured' : 'default'}
                  showContent={true}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className='section-padding bg-background'>
          <div className='max-w-4xl mx-auto container-padding text-center'>
            <Card className='p-8'>
              <CardContent className='space-y-6'>
                <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto'>
                  <Calendar className='w-8 h-8 text-gray-400' />
                </div>
                <div>
                  <CardTitle className='text-2xl mb-2'>
                    No Upcoming Events Yet
                  </CardTitle>
                  <CardDescription className='text-base mb-6'>
                    We're planning our next amazing event! Stay tuned for
                    updates or join our community to be the first to know.
                  </CardDescription>
                </div>
                <div className='flex flex-wrap justify-center gap-4'>
                  <Button asChild>
                    <Link
                      href={siteConfig.social.meetup || '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Join Community for Updates
                    </Link>
                  </Button>
                  <Button variant='secondary' asChild>
                    <Link
                      href={siteConfig.social.sessionize || '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Propose a Talk
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className='section-padding bg-muted/30'>
          <div className='max-w-5xl mx-auto container-padding'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl lg:text-4xl font-bold gradient-text mb-4'>
                Past Events
              </h2>
              <p className='text-lg text-gray-600'>
                Explore what we've accomplished together
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {pastEvents.map(event => (
                <EventCard key={event.slug} event={event} variant='compact' />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Speaking Opportunities */}
      <section className='section-padding bg-white'>
        <div className='max-w-5xl mx-auto container-padding'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Content */}
            <div className='space-y-6'>
              <div>
                <h2 className='text-3xl lg:text-4xl font-bold gradient-text mb-4'>
                  Want to Speak?
                </h2>
                <p className='text-lg text-gray-600 mb-6'>
                  We welcome speakers from all backgrounds and experience
                  levels. Share your knowledge with our passionate community.
                </p>
              </div>

              <div className='space-y-4'>
                <div className='flex items-start space-x-4'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-green-600 text-xs font-bold'>✓</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                      Open to All Levels
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      Whether you're a beginner or expert, we value diverse
                      perspectives and experiences.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-blue-600 text-xs font-bold'>✓</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                      Diverse Topics
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      AI development, Claude Code tips, product management, design,
                      entrepreneurship, and more.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4'>
                  <div className='w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                    <span className='text-purple-600 text-xs font-bold'>✓</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                      Supportive Environment
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      Our community is friendly and supportive, perfect for
                      first-time speakers.
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-4'>
                <Button asChild>
                  <Link
                    href={siteConfig.social.sessionize || '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Submit Your Proposal
                    <Plus className='w-4 h-4 ml-2' />
                  </Link>
                </Button>
                <Button variant='secondary' asChild>
                  <Link href='/contact'>Contact Organizers</Link>
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className='relative'>
              <Card className='bg-primary border-0 text-primary-foreground overflow-hidden'>
                <CardContent className='p-8 text-center'>
                  <div className='space-y-6'>
                    <div className='w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto'>
                      <Plus className='w-8 h-8' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-bold mb-2 text-primary-foreground'>
                        Share Your Expertise
                      </CardTitle>
                      <CardDescription className='text-primary-foreground/90 mb-4'>
                        Join our lineup of amazing speakers and help shape the
                        future of AI development globally.
                      </CardDescription>
                    </div>
                    <div className='space-y-3 text-left text-sm'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-2 h-2 bg-primary-foreground rounded-full'></div>
                        <span>Open Discussion</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <div className='w-2 h-2 bg-primary-foreground rounded-full'></div>
                        <span>Full presentations (20-30 minutes)</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <div className='w-2 h-2 bg-primary-foreground rounded-full'></div>
                        <span>Live coding sessions</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <div className='w-2 h-2 bg-primary-foreground rounded-full'></div>
                        <span>Hands-on sessions</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className='section-padding bg-gray-50'>
        <div className='max-w-4xl mx-auto container-padding text-center'>
          <div className='space-y-8'>
            <div>
              <h2 className='text-3xl lg:text-4xl font-bold gradient-text mb-4'>
                Never Miss an Event
              </h2>
              <p className='text-lg text-gray-600'>
                Join our community to get notified about upcoming events,
                workshops, and special announcements
              </p>
            </div>

            <div className='flex flex-wrap justify-center gap-4'>
              <Button size='lg' asChild>
                <Link
                  href={siteConfig.social.meetup || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Join on Meetup
                </Link>
              </Button>
            </div>

            <div className='text-sm text-muted-foreground'>
              Or stay updated on{' '}
              <Link
                href={siteConfig.social.luma || '#'}
                className='text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline'
              >
                Lu.ma
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
