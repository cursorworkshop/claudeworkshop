'use client';

import { cn } from '@/lib/utils';
import { motion, Transition } from 'framer-motion';
import { ReactNode } from 'react';

interface BorderTrailProps {
  children: ReactNode;
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
  contentClassName?: string;
  trailColor?: string;
  trailSize?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 60,
  md: 100,
  lg: 150,
};

export function BorderTrail({
  children,
  className,
  size = 100,
  transition,
  delay = 0,
  onAnimationComplete,
  style,
  contentClassName,
  trailColor = 'hsl(var(--primary))',
  trailSize = 'md',
}: BorderTrailProps) {
  const effectiveSize = sizes[trailSize] || size;

  const baseTransition: Transition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
    delay,
  };

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg', className)}
      style={style}
    >
      <motion.div
        className='pointer-events-none absolute inset-0'
        style={{
          background: `radial-gradient(${effectiveSize}px circle at var(--x) var(--y), ${trailColor}, transparent 100%)`,
        }}
        initial={{ '--x': '0%', '--y': '0%' } as never}
        animate={
          {
            '--x': ['0%', '100%', '100%', '0%', '0%'],
            '--y': ['0%', '0%', '100%', '100%', '0%'],
          } as never
        }
        transition={transition || baseTransition}
        onAnimationComplete={onAnimationComplete}
      />
      <div
        className={cn(
          'relative z-10 h-full w-full rounded-[inherit] bg-background',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Simpler border glow on hover
export function BorderGlow({
  children,
  className,
  glowColor = 'hsl(var(--primary) / 0.5)',
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <motion.div
      className={cn('relative rounded-lg', className)}
      whileHover={{
        boxShadow: `0 0 20px 2px ${glowColor}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
