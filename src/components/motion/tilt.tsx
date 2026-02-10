'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface TiltProps {
  children: ReactNode;
  className?: string;
  rotationFactor?: number;
  springConfig?: {
    stiffness?: number;
    damping?: number;
  };
  style?: React.CSSProperties;
  isRevese?: boolean;
}

export function Tilt({
  children,
  className,
  rotationFactor = 15,
  springConfig = { stiffness: 300, damping: 30 },
  style,
  isRevese = false,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const factor = isRevese ? -1 : 1;

  const rotateX = useTransform(
    ySpring,
    [-0.5, 0.5],
    [rotationFactor * factor, -rotationFactor * factor]
  );
  const rotateY = useTransform(
    xSpring,
    [-0.5, 0.5],
    [-rotationFactor * factor, rotationFactor * factor]
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
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
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={cn('relative', className)}
    >
      {children}
    </motion.div>
  );
}

// Card wrapper with tilt + spotlight effect
export function TiltCard({
  children,
  className,
  rotationFactor = 10,
}: {
  children: ReactNode;
  className?: string;
  rotationFactor?: number;
}) {
  return (
    <Tilt
      rotationFactor={rotationFactor}
      className={cn('rounded-xl', className)}
    >
      <div className='h-full w-full rounded-xl bg-background border shadow-lg'>
        {children}
      </div>
    </Tilt>
  );
}
