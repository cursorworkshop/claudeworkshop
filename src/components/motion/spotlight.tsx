'use client';

import { useRef, useState, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  spotlightClassName?: string;
  size?: number;
}

export function Spotlight({
  children,
  className,
  spotlightClassName,
  size = 400,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden', className)}
    >
      <motion.div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300',
          spotlightClassName
        )}
        style={{
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, hsl(var(--primary) / 0.15), transparent 40%)`,
          opacity,
        }}
      />
      {children}
    </div>
  );
}

// Spotlight card wrapper
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Spotlight
      className={cn('rounded-xl border bg-background p-6 shadow-sm', className)}
    >
      {children}
    </Spotlight>
  );
}
