import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Event } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
  showContent?: boolean;
}

export default function EventCard({
  event,
  variant = 'default',
  showContent = false,
}: EventCardProps) {
  const isUpcoming = new Date(event.date) >= new Date();
  const eventDate = new Date(event.date);

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (time: string, timezone?: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return (
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }) + (timezone ? ` ${timezone}` : '')
    );
  };

  if (variant === 'compact') {
    return (
      <Card className='hover:shadow-md transition-shadow duration-200'>
        <CardContent className='p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <CardTitle className='truncate mb-1 text-base'>
                {event.title}
              </CardTitle>
              <div className='flex items-center text-sm text-muted-foreground mb-2'>
                <Calendar className='w-4 h-4 mr-1' />
                <span>{formattedDate}</span>
                <span className='mx-2'>•</span>
                <Clock className='w-4 h-4 mr-1' />
                <span>{formatTime(event.startTime, event.timezone)}</span>
              </div>
              <div className='flex items-center text-sm text-muted-foreground'>
                <MapPin className='w-4 h-4 mr-1 flex-shrink-0' />
                <span className='truncate'>{event.location}</span>
              </div>
            </div>

            <div className='ml-4 flex items-center space-x-2'>
              {event.attendees && (
                <div className='flex items-center text-sm text-muted-foreground'>
                  <Users className='w-4 h-4 mr-1' />
                  <span>{event.attendees}</span>
                </div>
              )}
              <Button variant='ghost' size='icon' asChild>
                <Link href={`/workshops/${event.slug}`}>
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        variant === 'featured' ? 'lg:col-span-2' : '',
        isUpcoming ? 'ring-2 ring-primary/20' : ''
      )}
    >
      {/* Event Image */}
      {event.image && (
        <div
          className={cn(
            'relative overflow-hidden',
            variant === 'featured' ? 'h-64' : 'h-48'
          )}
        >
          <Image
            src={event.image}
            alt={event.title}
            fill
            className='object-cover transition-transform duration-200 hover:scale-105'
          />

          {/* Status Badge */}
          <div className='absolute top-4 left-4'>
            <Badge variant={isUpcoming ? 'default' : 'secondary'}>
              {isUpcoming ? 'Upcoming' : 'Past Event'}
            </Badge>
          </div>

          {/* Date Badge */}
          <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center'>
            <div className='text-sm font-semibold text-gray-900'>
              {eventDate.getDate()}
            </div>
            <div className='text-xs text-gray-600 uppercase'>
              {eventDate.toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
        </div>
      )}

      {/* Event Content */}
      <CardHeader>
        <CardTitle
          className={cn(
            variant === 'featured' ? 'text-xl lg:text-2xl' : 'text-lg'
          )}
        >
          {event.title}
        </CardTitle>
        {event.description && (
          <CardDescription className='line-clamp-2'>
            {event.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Event Details */}
        <div className='space-y-2'>
          <div className='flex items-center text-sm text-muted-foreground'>
            <Calendar className='w-4 h-4 mr-2 flex-shrink-0' />
            <span>{formattedDate}</span>
            <span className='mx-2'>•</span>
            <Clock className='w-4 h-4 mr-1' />
            <span>{formatTime(event.startTime, event.timezone)}</span>
            {event.endTime && (
              <>
                <span className='mx-1'>-</span>
                <span>{formatTime(event.endTime, event.timezone)}</span>
              </>
            )}
          </div>

          <div className='flex items-center text-sm text-muted-foreground'>
            <MapPin className='w-4 h-4 mr-2 flex-shrink-0' />
            <span className='flex-1'>{event.location}</span>
            {event.locationUrl && (
              <Button variant='ghost' size='icon' asChild>
                <Link
                  href={event.locationUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink className='w-4 h-4' />
                </Link>
              </Button>
            )}
          </div>

          {event.attendees && (
            <div className='flex items-center text-sm text-muted-foreground'>
              <Users className='w-4 h-4 mr-2 flex-shrink-0' />
              <span>
                {event.attendees} attending
                {event.maxAttendees && ` / ${event.maxAttendees} max`}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {event.tags.map(tag => (
              <Badge key={tag} variant='outline'>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <div className='space-y-2'>
            <h4 className='font-medium text-gray-900'>Speakers:</h4>
            <div className='space-y-1'>
              {event.speakers.map((speaker, index) => (
                <div key={index} className='text-sm'>
                  <span className='font-medium text-gray-900'>
                    {speaker.name}
                  </span>
                  {speaker.topic && (
                    <span className='text-gray-600'> - {speaker.topic}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Preview */}
        {showContent && event.content && (
          <div
            className='prose prose-sm max-w-none text-gray-600'
            dangerouslySetInnerHTML={{
              __html: `${event.content.substring(0, 300)}...`,
            }}
          />
        )}
      </CardContent>

      <CardFooter className='flex flex-wrap gap-3'>
        <Button size='sm' className='flex-1 sm:flex-none' asChild>
          <Link href={`/workshops/${event.slug}`}>
            View Details
            <ArrowRight className='w-4 h-4 ml-2' />
          </Link>
        </Button>

        {isUpcoming && event.registrationUrl && (
          <Button
            variant='secondary'
            size='sm'
            className='flex-1 sm:flex-none'
            asChild
          >
            <Link
              href={event.registrationUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              Register
              <ExternalLink className='w-4 h-4 ml-2' />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
