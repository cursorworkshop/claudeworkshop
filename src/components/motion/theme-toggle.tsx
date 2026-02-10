'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { button: 'w-8 h-8', icon: 16 },
  md: { button: 'w-10 h-10', icon: 20 },
  lg: { button: 'w-12 h-12', icon: 24 },
};

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(sizes[size].button, 'rounded-full bg-muted', className)}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';
  const iconSize = sizes[size].icon;

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        sizes[size].button,
        'relative flex items-center justify-center rounded-full',
        'bg-muted hover:bg-muted/80 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode='wait' initial={false}>
        {isDark ? (
          <motion.svg
            key='moon'
            xmlns='http://www.w3.org/2000/svg'
            width={iconSize}
            height={iconSize}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
          </motion.svg>
        ) : (
          <motion.svg
            key='sun'
            xmlns='http://www.w3.org/2000/svg'
            width={iconSize}
            height={iconSize}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            initial={{ rotate: 90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <circle cx='12' cy='12' r='4' />
            <path d='M12 2v2' />
            <path d='M12 20v2' />
            <path d='m4.93 4.93 1.41 1.41' />
            <path d='m17.66 17.66 1.41 1.41' />
            <path d='M2 12h2' />
            <path d='M20 12h2' />
            <path d='m6.34 17.66-1.41 1.41' />
            <path d='m19.07 4.93-1.41 1.41' />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
