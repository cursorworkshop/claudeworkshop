'use client';

import { motion, useInView, Variants, UseInViewOptions } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PresetType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'blur';

interface InViewProps {
  children: ReactNode;
  variants?: {
    hidden: Variants['hidden'];
    visible: Variants['visible'];
  };
  preset?: PresetType;
  transition?: object;
  viewOptions?: UseInViewOptions;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const presetVariants: Record<
  PresetType,
  { hidden: Variants['hidden']; visible: Variants['visible'] }
> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

const defaultTransition = {
  duration: 0.5,
  ease: [0.25, 0.4, 0.25, 1],
};

export function InView({
  children,
  variants,
  preset = 'fade',
  transition = defaultTransition,
  viewOptions = { once: true, margin: '-10%' },
  className,
  as = 'div',
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const selectedVariants = variants || presetVariants[preset];

  const MotionComponent = motion[
    as as keyof typeof motion
  ] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: selectedVariants.hidden,
        visible: {
          ...selectedVariants.visible,
          transition,
        },
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
