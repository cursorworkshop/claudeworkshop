'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpinningTextProps {
  children: string;
  radius?: number;
  fontSize?: number;
  className?: string;
  duration?: number;
}

export function SpinningText({
  children,
  radius = 5,
  fontSize = 1,
  className,
  duration = 20,
}: SpinningTextProps) {
  const characters = children.split('');
  const diameter = radius * 2;

  return (
    <div
      className={cn('relative overflow-visible', className)}
      style={{
        width: `${diameter}rem`,
        height: `${diameter}rem`,
      }}
    >
      <motion.div
        className='absolute inset-0'
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {characters.map((char, i) => {
          const angle = (i / characters.length) * 360;
          return (
            <span
              key={i}
              className='absolute left-1/2 top-0 select-none'
              style={{
                fontSize: `${fontSize}rem`,
                transformOrigin: `0 ${radius}rem`,
                transform: `rotate(${angle}deg)`,
              }}
            >
              {char}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
