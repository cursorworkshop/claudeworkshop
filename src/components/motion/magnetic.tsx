'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  range?: number;
  actionArea?: 'self' | 'parent' | 'global';
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export function Magnetic({
  children,
  className,
  intensity = 0.5,
  range = 100,
  actionArea = 'self',
  springConfig = { stiffness: 150, damping: 15, mass: 0.1 },
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < range) {
      x.set(distanceX * intensity);
      y.set(distanceY * intensity);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}

// Simplified magnetic button wrapper
export function MagneticButton({
  children,
  className,
  intensity = 0.3,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  return (
    <Magnetic intensity={intensity} className={className}>
      {children}
    </Magnetic>
  );
}
