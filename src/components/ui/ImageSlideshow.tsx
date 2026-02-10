'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Badge } from './badge';
import { Button } from './button';

interface SlideImage {
  src: string;
  alt: string;
  label: string;
}

interface ImageSlideshowProps {
  images: SlideImage[];
  autoPlay?: boolean;
  interval?: number;
}

export function ImageSlideshow({
  images,
  autoPlay = true,
  interval = 4000,
}: ImageSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % images.length);
  };

  return (
    <div className='relative overflow-hidden rounded-lg bg-background'>
      {/* Main Image Display */}
      <div className='relative h-64 md:h-80'>
        <Image
          src={images[currentSlide].src}
          alt={images[currentSlide].alt}
          fill
          className='object-cover transition-opacity duration-700'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />

        {/* Image Label */}
        <div className='absolute bottom-4 left-4'>
          <Badge
            className='bg-background/90 text-foreground'
            key={currentSlide}
          >
            {images[currentSlide].label}
          </Badge>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant='ghost'
          size='icon'
          className='absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-white hover:text-white'
          onClick={goToPrevious}
        >
          <ChevronLeft className='w-6 h-6' />
        </Button>

        <Button
          variant='ghost'
          size='icon'
          className='absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-white hover:text-white'
          onClick={goToNext}
        >
          <ChevronRight className='w-6 h-6' />
        </Button>
      </div>

      {/* Thumbnail Navigation */}
      <div className='flex gap-2 p-4 bg-muted/30'>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative w-16 h-12 rounded-md overflow-hidden transition-all duration-300 ${
              currentSlide === index
                ? 'ring-2 ring-primary scale-110'
                : 'opacity-70 hover:opacity-90'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className='object-cover'
            />
          </button>
        ))}
      </div>
    </div>
  );
}
