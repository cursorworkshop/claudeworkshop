'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { X } from 'lucide-react';
import Image from 'next/image';

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
}

type CardData = {
  src: string;
  title: string;
  category: string;
  content: ReactNode;
  grayscale?: boolean;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export function Carousel({ items, speed = 'slow' }: CarouselProps) {
  // Duration based on speed
  const duration = speed === 'fast' ? 20 : speed === 'normal' ? 40 : 80;

  // Quadruple buffer for robust infinite scroll
  // Using cloneElement to safely assign unique keys
  const allItems = [
    ...items.map((item, index) =>
      React.cloneElement(item, { key: `p1-${index}` })
    ),
    ...items.map((item, index) =>
      React.cloneElement(item, { key: `p2-${index}` })
    ),
    ...items.map((item, index) =>
      React.cloneElement(item, { key: `p3-${index}` })
    ),
    ...items.map((item, index) =>
      React.cloneElement(item, { key: `p4-${index}` })
    ),
  ];

  return (
    <CarouselContext.Provider
      value={{ onCardClose: () => {}, currentIndex: 0 }}
    >
      <div className='relative w-full overflow-hidden select-none group'>
        {/* Gradient masks for smooth fade in/out */}
        <div className='absolute left-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-r from-background to-transparent pointer-events-none' />
        <div className='absolute right-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-l from-background to-transparent pointer-events-none' />

        <motion.div
          className='flex flex-row gap-4 py-10 md:py-20 pl-4 w-max'
          animate={{
            x: ['0%', '-25%'], // Scroll 1/4 of the way (one full set) then reset
          }}
          transition={{
            duration,
            ease: 'linear',
            repeat: Infinity,
          }}
          whileHover={{
            animationPlayState: 'paused',
          }}
        >
          {allItems.map(item => (
            <div key={item.key} className='flex-shrink-0'>
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </CarouselContext.Provider>
  );
}

export function Card({
  card,
  index,
  layout = false,
}: {
  card: CardData;
  index: number;
  layout?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleClose = useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [onCardClose, index]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  const handleOpen = () => {
    setOpen(true);
  };

  useOutsideClick(containerRef, () => handleClose());

  // Generate a unique layout ID based on the card's content to avoid conflicts
  // We use a combination of title and a random hash or just ensure it's stable
  // Since we have duplicates, layout animations might get confused.
  // Disabling layout animations for the card wrapper in the carousel avoids flying cards from duplicates.
  // We only keep layoutId for the internal content if needed, or disable it entirely for simplicity and stability.
  const uniqueId = `card-${card.title}`;

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className='fixed inset-0 h-screen z-50 overflow-auto'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0'
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? uniqueId : undefined}
              className='max-w-5xl mx-auto bg-background dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative'
            >
              <button
                className='sticky top-4 h-8 w-8 right-0 ml-auto bg-muted rounded-full flex items-center justify-center'
                onClick={handleClose}
              >
                <X className='h-5 w-5' />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className='text-base font-medium text-muted-foreground'
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className='text-2xl md:text-5xl font-semibold text-foreground mt-4'
              >
                {card.title}
              </motion.p>
              <div className='py-10'>{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? uniqueId : undefined}
        onClick={handleOpen}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className='rounded-3xl bg-muted/50 dark:bg-neutral-900 h-80 w-56 md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 group/card'
      >
        <div className='absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none' />
        <div className='relative z-40 p-8'>
          <motion.p
            layoutId={layout ? `category-${card.title}` : undefined}
            className='text-white text-sm md:text-base font-medium font-sans text-left'
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className='text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2'
          >
            {card.title}
          </motion.p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          className={cn(
            'object-cover absolute z-10 inset-0 transition-transform duration-500 group-hover/card:scale-110',
            card.grayscale && 'grayscale'
          )}
        />
      </motion.button>
    </>
  );
}

export function BlurImage({
  height,
  width,
  src,
  className,
  alt,
  fill,
  ...rest
}: {
  height?: number | string;
  width?: number | string;
  src: string;
  className?: string;
  alt?: string;
  fill?: boolean;
  [key: string]: unknown;
}) {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        'transition duration-300',
        isLoading ? 'blur-sm' : 'blur-0',
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={fill ? undefined : (width as number)}
      height={fill ? undefined : (height as number)}
      fill={fill}
      loading='lazy'
      decoding='async'
      blurDataURL={typeof src === 'string' ? src : undefined}
      alt={alt ? alt : 'Background of a beautiful view'}
      {...rest}
    />
  );
}
