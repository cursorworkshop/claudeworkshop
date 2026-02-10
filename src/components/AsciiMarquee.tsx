'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface AsciiMarqueeProps {
  className?: string;
}

// ASCII banner that scrolls horizontally as the page scrolls vertically
export default function AsciiMarquee({ className }: AsciiMarqueeProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const text =
    '>> offsite • claude • ai • mani • kyrimai • training • shipping • teamwork • focus • code • learn • build ';

  useEffect(() => {
    const handleScroll = () => {
      if (!innerRef.current) return;
      const speed = 0.35; // tune for desired parallax speed
      const offset = (window.scrollY * speed) % innerRef.current.scrollWidth;
      innerRef.current.style.transform = `translateX(${-offset}px)`;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        'sticky top-0 z-40 bg-background/80 backdrop-blur border-y border-border/60 marquee-mask group overflow-hidden',
        className
      )}
    >
      <div
        ref={innerRef}
        className='pointer-events-none select-none whitespace-nowrap will-change-transform py-2 text-[11px] tracking-[0.35em] text-muted-foreground/70 font-mono animate-marquee overflow-hidden'
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className='mx-6 opacity-70'>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
