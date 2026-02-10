import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface EnhancedWorkshopCardProps {
  title: string;
  description: string;
  location: string;
  date: string;
  duration: string;
  seats: string;
  price: string;
  image: string;
  features: string[];
  href: string;
}

export default function EnhancedWorkshopCard({
  title,
  description,
  location,
  date,
  duration,
  seats,
  price,
  image,
  features,
  href,
}: EnhancedWorkshopCardProps) {
  return (
    <Card className='group relative overflow-hidden border-0 bg-gradient-to-br from-background via-background to-muted/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3'>
      {/* Hero Image */}
      <div className='relative h-48 overflow-hidden'>
        <Image
          src={image}
          alt={title}
          fill
          className='object-cover transition-transform duration-700 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

        {/* Overlay badges */}
        <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
          <Badge
            variant='secondary'
            className='bg-background/95 text-foreground font-medium'
          >
            {duration}
          </Badge>
          <Badge
            variant='outline'
            className='bg-background/95 text-foreground border-background/50'
          >
            {seats}
          </Badge>
        </div>

        {/* Price badge */}
        <div className='absolute bottom-4 right-4'>
          <Badge className='bg-primary/90 text-primary-foreground font-bold'>
            {price}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardHeader>
        <div className='space-y-2'>
          <CardTitle className='text-xl group-hover:text-primary transition-colors duration-300'>
            {title}
          </CardTitle>
          <CardDescription className='text-base leading-relaxed'>
            {description}
          </CardDescription>
        </div>

        {/* Location and Date */}
        <div className='space-y-2 pt-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <MapPin className='w-4 h-4' />
            <span>{location}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Calendar className='w-4 h-4' />
            <span>{date}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Features */}
        <div className='space-y-3'>
          <h4 className='font-medium text-sm text-foreground'>
            What's Included:
          </h4>
          <div className='grid grid-cols-1 gap-2'>
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className='flex items-center gap-2 text-sm'>
                <CheckCircle className='w-4 h-4 text-primary flex-shrink-0' />
                <span className='text-muted-foreground'>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className='flex gap-3'>
          <Button asChild className='flex-1'>
            <Link href={href}>
              View Details
              <ArrowRight className='w-4 h-4 ml-2' />
            </Link>
          </Button>
        </div>
      </CardContent>

      {/* Subtle gradient overlay on hover */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
    </Card>
  );
}
