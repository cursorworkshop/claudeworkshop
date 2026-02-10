'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useSpring,
  useInView,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  delay?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 1.5,
  formatOptions,
  delay = 0,
}: AnimatedNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, value, motionValue, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', latest => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  const formattedValue = new Intl.NumberFormat('en-US', formatOptions).format(
    displayValue
  );

  return (
    <motion.span ref={ref} className={cn('tabular-nums', className)}>
      {formattedValue}
    </motion.span>
  );
}

// Percentage variant
export function AnimatedPercentage({
  value,
  className,
  duration = 1.5,
  decimals = 0,
}: {
  value: number;
  className?: string;
  duration?: number;
  decimals?: number;
}) {
  return (
    <span className={className}>
      <AnimatedNumber
        value={value}
        duration={duration}
        formatOptions={{
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }}
      />
      %
    </span>
  );
}
