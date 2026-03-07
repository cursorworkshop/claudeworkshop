'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface Gallery4Item {
  description: string;
  height: number;
  id: string;
  image: string;
  title: string;
  width: number;
}

export interface Gallery4Props {
  description?: string;
  items: Gallery4Item[];
  title?: string;
}

function GalleryCard({ item, eager }: { eager: boolean; item: Gallery4Item }) {
  return (
    <figure
      className='relative h-[var(--gallery-card-height)] shrink-0 overflow-hidden rounded-[1.25rem] bg-zinc-100'
      style={{
        width: `calc(var(--gallery-card-height) * ${item.width / item.height})`,
      }}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes='(max-width: 640px) 88vw, (max-width: 1024px) 60vw, 42vw'
        className='object-cover'
        loading={eager ? 'eager' : 'lazy'}
        priority={eager}
        style={{
          filter:
            'grayscale(1) contrast(1.14) brightness(1.03) sepia(0.12) hue-rotate(180deg) saturate(0.7)',
        }}
      />
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,244,249,0.14),rgba(203,212,224,0.08)_48%,rgba(62,74,92,0.12))] mix-blend-soft-light' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(44,52,66,0.14))] mix-blend-screen' />
    </figure>
  );
}

const Gallery4 = ({ items }: Gallery4Props) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sequenceRef = useRef<HTMLDivElement | null>(null);
  const [sequenceWidth, setSequenceWidth] = useState(0);

  useEffect(() => {
    if (!sequenceRef.current) {
      return;
    }

    const measure = () => {
      setSequenceWidth(sequenceRef.current?.offsetWidth ?? 0);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(sequenceRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    if (!trackRef.current || !sequenceWidth || items.length <= 1) {
      return;
    }

    const track = trackRef.current;
    let animationFrame = 0;
    let lastTimestamp = 0;
    let offset = 0;

    const getGap = () => {
      const styles = window.getComputedStyle(track);
      return Number.parseFloat(styles.gap || styles.columnGap || '0') || 0;
    };

    const step = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const speed = window.innerWidth >= 1024 ? 42 : 30;
      const wrapDistance = sequenceWidth + getGap();

      offset -= speed * deltaSeconds;

      if (offset <= -wrapDistance) {
        offset += wrapDistance;
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      animationFrame = window.requestAnimationFrame(step);
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      track.style.transform = 'translate3d(0, 0, 0)';
    };
  }, [items.length, sequenceWidth]);

  return (
    <section className='relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden pt-14 [--gallery-card-height:12.5rem] md:pt-16 md:[--gallery-card-height:23rem] lg:[--gallery-card-height:27rem]'>
      <div className='overflow-hidden'>
        <div
          ref={trackRef}
          className='flex w-max gap-3 will-change-transform md:gap-4'
        >
          <div ref={sequenceRef} className='flex shrink-0 gap-3 md:gap-4'>
            {items.map((item, index) => (
              <GalleryCard
                key={`first-${item.id}`}
                item={item}
                eager={index < 4}
              />
            ))}
          </div>
          <div className='flex shrink-0 gap-3 md:gap-4'>
            {items.map(item => (
              <GalleryCard
                key={`second-${item.id}`}
                item={item}
                eager={false}
              />
            ))}
          </div>
          <div className='flex shrink-0 gap-3 md:gap-4'>
            {items.map(item => (
              <GalleryCard key={`third-${item.id}`} item={item} eager={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Gallery4 };
