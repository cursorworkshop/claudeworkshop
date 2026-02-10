'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  return (
    <motion.span
      className={cn(
        'relative inline-block bg-clip-text text-transparent',
        'bg-gradient-to-r from-foreground via-foreground/50 to-foreground',
        'bg-[length:200%_100%]',
        className
      )}
      animate={{
        backgroundPosition: ['100% 0%', '0% 0%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

// Shimmer wave effect for text
export function TextShimmerWave({
  children,
  className,
  duration = 1.5,
}: {
  children: string;
  className?: string;
  duration?: number;
}) {
  const letters = children.split('');

  return (
    <span className={cn('inline-flex', className)}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className='inline-block'
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: index * 0.05,
            ease: 'easeInOut',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
}
