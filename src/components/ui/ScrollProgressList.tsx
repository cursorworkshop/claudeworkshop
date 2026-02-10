'use client';

import { useState, useEffect, useRef } from 'react';

interface FocusArea {
  title: string;
  description: string;
}

interface ScrollProgressListProps {
  items: FocusArea[];
  title: string;
}

export function ScrollProgressList({ items, title }: ScrollProgressListProps) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(items.length).fill(false)
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate overall section scroll progress
      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;
      const startOffset = windowHeight * 0.8; // Start animation when section is 80% from top
      const endOffset = windowHeight * 0.2; // End when section is 20% from top

      let progress = 0;
      if (sectionTop < startOffset && sectionTop > -sectionHeight + endOffset) {
        progress =
          (startOffset - sectionTop) /
          (sectionHeight - endOffset + startOffset);
        progress = Math.max(0, Math.min(1, progress));
      }

      setScrollProgress(progress);

      // Check visibility for each item
      const newVisibleItems = itemRefs.current.map(ref => {
        if (!ref) return false;
        const rect = ref.getBoundingClientRect();
        return (
          rect.top < windowHeight * 0.75 && rect.bottom > windowHeight * 0.25
        );
      });

      setVisibleItems(newVisibleItems);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className='section-padding bg-background' ref={sectionRef}>
      <div className='max-w-4xl mx-auto container-padding'>
        <div className='text-left mb-12'>
          <h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-4'>
            {title}
          </h2>
        </div>

        <div className='relative pl-8'>
          {/* Progress Path Line - Centered through circles */}
          <div className='absolute left-[11px] top-0 bottom-0 w-0.5 bg-muted-foreground/20'>
            <div
              className='w-full bg-foreground transition-all duration-700 ease-out'
              style={{
                height: `${scrollProgress * 100}%`,
              }}
            />
          </div>

          <div className='space-y-8'>
            {items.map((item, index) => (
              <div
                key={index}
                ref={el => {
                  itemRefs.current[index] = el;
                }}
                className={`group relative transition-all duration-700 ${
                  visibleItems[index]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-30 translate-x-4'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className='p-6'>
                  <h3
                    className={`font-semibold text-lg mb-2 transition-all duration-500 ${
                      visibleItems[index]
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm transition-all duration-500 ${
                      visibleItems[index]
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
