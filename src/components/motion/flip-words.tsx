'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

export function FlipWords({
  words,
  duration = 5000,
  className,
}: FlipWordsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Find the longest word to set fixed width
  const longestWord = useMemo(
    () => words.reduce((a, b) => (a.length > b.length ? a : b), ''),
    [words]
  );

  const startAnimation = useCallback(() => {
    const nextIndex = (currentIndex + 1) % words.length;
    setCurrentIndex(nextIndex);
    setIsAnimating(true);
  }, [currentIndex, words.length]);

  useEffect(() => {
    if (!isAnimating) {
      const timeout = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating, duration, startAnimation]);

  return (
    <span className='inline-block relative whitespace-nowrap'>
      {/* Invisible longest word to reserve space */}
      <span className='invisible whitespace-nowrap'>{longestWord}</span>
      {/* Animated word positioned absolutely */}
      <AnimatePresence
        mode='wait'
        onExitComplete={() => {
          setIsAnimating(false);
        }}
      >
        <motion.span
          key={words[currentIndex]}
          initial={{
            opacity: 0,
            y: 10,
            filter: 'blur(8px)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            y: -10,
            filter: 'blur(8px)',
          }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut',
          }}
          className={cn('absolute left-0 top-0 whitespace-nowrap', className)}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
