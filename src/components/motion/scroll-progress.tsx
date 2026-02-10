'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
  position?: 'top' | 'bottom';
  height?: number;
  color?: string;
}

export function ScrollProgress({
  className,
  position = 'top',
  height = 3,
  color,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={cn(
        'fixed left-0 right-0 z-[100] origin-left',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
      style={{
        scaleX,
        height,
        backgroundColor: color || 'hsl(var(--primary))',
      }}
    />
  );
}

// Circular progress indicator
export function ScrollProgressCircle({
  className,
  size = 48,
  strokeWidth = 3,
}: {
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn('fixed bottom-8 right-8 z-50', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='hsl(var(--muted))'
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='hsl(var(--primary))'
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          style={{
            pathLength,
            rotate: -90,
            transformOrigin: 'center',
          }}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
    </div>
  );
}
