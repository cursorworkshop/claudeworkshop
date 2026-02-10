'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  glowClassName?: string;
  mode?: 'static' | 'pulse' | 'breathe';
  colors?: string[];
  blur?: 'sm' | 'md' | 'lg' | 'xl';
}

const blurSizes = {
  sm: 'blur-xl',
  md: 'blur-2xl',
  lg: 'blur-3xl',
  xl: 'blur-[100px]',
};

export function GlowEffect({
  children,
  className,
  glowClassName,
  mode = 'breathe',
  colors = ['hsl(var(--primary) / 0.3)', 'hsl(var(--primary) / 0.1)'],
  blur = 'lg',
}: GlowEffectProps) {
  const animationProps =
    mode === 'pulse'
      ? {
          animate: {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }
      : mode === 'breathe'
        ? {
            animate: {
              opacity: [0.3, 0.6, 0.3],
            },
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            },
          }
        : {};

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(
          'absolute inset-0 -z-10 rounded-full',
          blurSizes[blur],
          glowClassName
        )}
        style={{
          background: `radial-gradient(circle, ${colors.join(', ')})`,
        }}
        {...animationProps}
      />
      {children}
    </div>
  );
}

// Background glow for sections
export function BackgroundGlow({
  className,
  position = 'center',
  color = 'hsl(var(--primary) / 0.15)',
  size = 'lg',
}: {
  className?: string;
  position?:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
  };

  const sizeClasses = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[500px] h-[500px]',
    xl: 'w-[700px] h-[700px]',
  };

  return (
    <motion.div
      className={cn(
        'absolute rounded-full blur-3xl pointer-events-none',
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }}
    />
  );
}
