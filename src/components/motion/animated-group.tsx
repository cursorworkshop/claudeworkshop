'use client';

import { motion, Variants, useInView } from 'framer-motion';
import { useRef, Children, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PresetType = 'fade' | 'slide' | 'scale' | 'blur' | 'blur-slide';

interface AnimatedGroupProps {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: PresetType;
  stagger?: number;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.4 } },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
      },
    },
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
      },
    },
    item: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    },
  },
  blur: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.5 },
      },
    },
  },
  'blur-slide': {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)', y: 30 },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
      },
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset = 'blur-slide',
  stagger = 0.1,
  delay = 0,
  as = 'div',
}: AnimatedGroupProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const selectedVariants = presetVariants[preset];
  const containerVariants = variants?.container || {
    ...selectedVariants.container,
    visible: {
      ...selectedVariants.container.visible,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
  const itemVariants = variants?.item || selectedVariants.item;

  const MotionComponent = motion[
    as as keyof typeof motion
  ] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </MotionComponent>
  );
}
