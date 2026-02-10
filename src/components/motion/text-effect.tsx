'use client';

import { motion, Variants, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

type PresetType = 'blur' | 'fade' | 'slide' | 'scale' | 'fade-in-blur';

interface TextEffectProps {
  children: string;
  per?: 'word' | 'char' | 'line';
  as?: keyof JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: PresetType;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  segmentWrapperClassName?: string;
}

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  'fade-in-blur': {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)', y: 20 },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          duration: 0.5,
        },
      },
    },
  },
};

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset = 'fade-in-blur',
  delay = 0,
  trigger = true,
  onAnimationComplete,
  segmentWrapperClassName,
}: TextEffectProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants };
  const containerVariants = variants?.container || selectedVariants.container;
  const itemVariants = variants?.item || selectedVariants.item;

  const MotionComponent = motion[
    as as keyof typeof motion
  ] as typeof motion.div;

  let segments: string[];
  if (per === 'line') {
    segments = children.split('\n');
  } else if (per === 'word') {
    segments = children.split(/(\s+)/);
  } else {
    segments = children.split('');
  }

  return (
    <MotionComponent
      ref={ref}
      initial='hidden'
      animate={isInView && trigger ? 'visible' : 'hidden'}
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            ...(containerVariants.visible as { transition?: object })
              ?.transition,
            delayChildren: delay,
          },
        },
      }}
      onAnimationComplete={onAnimationComplete}
      className={cn('whitespace-pre-wrap', className)}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          variants={itemVariants}
          className={cn('inline-block', segmentWrapperClassName)}
        >
          {segment === ' ' ? '\u00A0' : segment}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
