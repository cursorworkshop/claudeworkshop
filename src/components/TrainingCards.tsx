'use client';

import { Card } from '@/components/ui/card';
import { Globe } from '@/components/ui/globe';
import { OrbitingCircles } from '@/components/ui/orbiting-circles';

// Tech stack icons - transparent, black/grayscale, high quality
const Icons = {
  react: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/react/000000'
      alt='React'
      className='size-6'
    />
  ),
  typescript: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/typescript/000000'
      alt='TypeScript'
      className='size-6'
    />
  ),
  python: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/python/000000'
      alt='Python'
      className='size-6'
    />
  ),
  nodejs: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/nodedotjs/000000'
      alt='Node.js'
      className='size-6'
    />
  ),
  go: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/go/000000'
      alt='Go'
      className='size-6'
    />
  ),
  rust: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/rust/000000'
      alt='Rust'
      className='size-6'
    />
  ),
  java: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/openjdk/000000'
      alt='Java'
      className='size-6'
    />
  ),
  kotlin: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/kotlin/000000'
      alt='Kotlin'
      className='size-6'
    />
  ),
  vue: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/vuedotjs/000000'
      alt='Vue'
      className='size-6'
    />
  ),
  angular: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/angular/000000'
      alt='Angular'
      className='size-6'
    />
  ),
  ruby: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/ruby/000000'
      alt='Ruby'
      className='size-6'
    />
  ),
  php: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src='https://cdn.simpleicons.org/php/000000'
      alt='PHP'
      className='size-6'
    />
  ),
};

export function TrainingCards() {
  return (
    <section className='bg-background @container pb-24 pt-8'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* We Work With Your Stack - Orbiting Circles - SQUARE */}
          <Card
            variant='mixed'
            className='flex flex-col p-6 aspect-square overflow-hidden'
          >
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium text-lg'>
                Your Stack
              </h3>
              <p className='text-muted-foreground text-sm'>
                Custom training tailored to your tech stack. React, TypeScript,
                Python, Go, Rust, and more.
              </p>
            </div>
            {/* Orbiting circles container - centered and contained */}
            <div
              aria-hidden
              className='relative flex-1 flex items-center justify-center overflow-hidden'
            >
              {/* Inner orbit - frontend/scripting */}
              <OrbitingCircles
                iconSize={22}
                radius={40}
                speed={0.6}
                path={true}
              >
                <Icons.react />
                <Icons.typescript />
                <Icons.python />
                <Icons.nodejs />
              </OrbitingCircles>
              {/* Outer orbit - systems/backend */}
              <OrbitingCircles
                iconSize={22}
                radius={75}
                reverse
                speed={0.4}
                path={true}
              >
                <Icons.go />
                <Icons.rust />
                <Icons.java />
                <Icons.kotlin />
                <Icons.vue />
                <Icons.angular />
              </OrbitingCircles>
            </div>
          </Card>

          {/* Training Worldwide - Globe - SQUARE */}
          <Card
            variant='mixed'
            className='flex flex-col p-6 aspect-square overflow-hidden relative'
          >
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium text-lg'>
                Training Worldwide
              </h3>
              <p className='text-muted-foreground text-sm'>
                From Denver to Tokyo, we have trained teams across the globe.
              </p>
            </div>
            {/* Globe container - same size as orbit (radius 100 = 200px diameter) */}
            <div
              aria-hidden
              className='relative flex-1 flex items-center justify-center overflow-hidden'
            >
              <div className='relative size-[220px] md:size-[320px]'>
                <Globe
                  className='!w-full !h-full opacity-90'
                  config={{
                    width: 400,
                    height: 400,
                    devicePixelRatio: 2,
                    phi: 0,
                    theta: 0.3,
                    dark: 0,
                    diffuse: 0.4,
                    mapSamples: 16000,
                    mapBrightness: 1.2,
                    baseColor: [0.9, 0.9, 0.9],
                    markerColor: [0.1, 0.1, 0.1],
                    glowColor: [0.95, 0.95, 0.95],
                    markers: [
                      // Europe
                      { location: [52.3676, 4.9041], size: 0.08 }, // Amsterdam
                      { location: [37.9838, 23.7275], size: 0.08 }, // Athens
                      { location: [51.5074, -0.1278], size: 0.06 }, // London
                      { location: [48.8566, 2.3522], size: 0.06 }, // Paris
                      { location: [52.52, 13.405], size: 0.06 }, // Berlin
                      { location: [41.9028, 12.4964], size: 0.05 }, // Rome
                      { location: [40.4168, -3.7038], size: 0.05 }, // Madrid
                      { location: [50.8503, 4.3517], size: 0.05 }, // Brussels
                      { location: [59.9139, 10.7522], size: 0.05 }, // Oslo
                      { location: [55.6761, 12.5683], size: 0.05 }, // Copenhagen
                      // Asia
                      { location: [35.6762, 139.6503], size: 0.07 }, // Tokyo
                      { location: [34.6937, 135.5022], size: 0.05 }, // Osaka
                      // USA
                      { location: [40.7128, -74.006], size: 0.07 }, // NYC
                      { location: [34.0522, -118.2437], size: 0.06 }, // LA
                      { location: [39.7392, -104.9903], size: 0.05 }, // Denver
                      // Africa
                      { location: [33.9716, -6.8498], size: 0.06 }, // Rabat (Morocco)
                      // Australia
                      { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
                    ],
                    onRender: () => {},
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
