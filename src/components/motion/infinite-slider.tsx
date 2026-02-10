'use client';

import { motion } from 'framer-motion';
import { ReactNode, Children, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

interface InfiniteSliderProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
}

export function InfiniteSlider({
  children,
  className,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
}: InfiniteSliderProps) {
  const childrenArray = Children.toArray(children);

  // Duplicate children for seamless loop
  const duplicatedChildren = [...childrenArray, ...childrenArray];

  const isHorizontal = direction === 'horizontal';
  const translateKey = isHorizontal ? 'x' : 'y';
  const translateValue = reverse ? ['0%', '-50%'] : ['-50%', '0%'];

  return (
    <div
      className={cn(
        'overflow-hidden',
        isHorizontal ? 'w-full' : 'h-full',
        className
      )}
    >
      <motion.div
        className={cn('flex', isHorizontal ? 'flex-row' : 'flex-col')}
        style={{ gap }}
        animate={{
          [translateKey]: translateValue,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        whileHover={
          durationOnHover
            ? { animationDuration: `${durationOnHover}s` }
            : undefined
        }
      >
        {duplicatedChildren.map((child, index) => (
          <div key={index} className='flex-shrink-0'>
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Logo slider variant
export function LogoSlider({
  logos,
  className,
  logoClassName,
  duration = 30,
}: {
  logos: { src: string; alt: string }[];
  className?: string;
  logoClassName?: string;
  duration?: number;
}) {
  return (
    <InfiniteSlider className={className} duration={duration} gap={48}>
      {logos.map((logo, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={logo.src}
          alt={logo.alt}
          className={cn(
            'h-8 w-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all',
            logoClassName
          )}
        />
      ))}
    </InfiniteSlider>
  );
}
