import Image from 'next/image';

type EventMoment = {
  alt: string;
  orientation: 'landscape' | 'portrait';
  src: string;
};

const eventMoments: EventMoment[] = [
  {
    src: '/images/presenting/rogier-claude-1.jpg',
    alt: 'Workshop presentation during a live event',
    orientation: 'landscape',
  },
  {
    src: '/images/presenting/rogier-codex-1.jpg',
    alt: 'Founder speaking during a hands-on coding session',
    orientation: 'landscape',
  },
  {
    src: '/images/presenting/rogier-codex-2.jpg',
    alt: 'Live audience session during a workshop',
    orientation: 'landscape',
  },
  {
    src: '/images/presenting/rogier-createnew.jpg',
    alt: 'Speaker leading an in-person training session',
    orientation: 'landscape',
  },
  {
    src: '/images/presenting/rogier-cursor-1.jpg',
    alt: 'Workshop setup with founder presentation',
    orientation: 'portrait',
  },
  {
    src: '/images/presenting/rogier-cursor-2.jpg',
    alt: 'Founder presenting to a seated audience',
    orientation: 'portrait',
  },
  {
    src: '/images/presenting/rogier-cursor-3.jpg',
    alt: 'Classroom-style event during a live walkthrough',
    orientation: 'landscape',
  },
];

const marqueeMoments = [...eventMoments, ...eventMoments];

export function RecentEventsGallery() {
  return (
    <section
      aria-label='Recent workshop event photos'
      className='overflow-hidden border-y border-zinc-200/80 bg-white py-12 md:py-16'
    >
      <div className='mx-auto max-w-7xl container-padding'>
        <div className='marquee-mask overflow-hidden'>
          <div
            className='flex w-max items-center gap-4 py-2 will-change-transform sm:gap-5 md:gap-6 animate-marquee'
            style={{ animationDirection: 'reverse' }}
          >
            {marqueeMoments.map((moment, index) => {
              const isLandscape = moment.orientation === 'landscape';

              return (
                <div
                  key={`${moment.src}-${index}`}
                  className={[
                    'relative shrink-0 overflow-hidden rounded-[24px] bg-zinc-100',
                    isLandscape
                      ? 'aspect-[16/10] w-[280px] sm:w-[320px] lg:w-[360px]'
                      : 'aspect-[4/5] w-[210px] sm:w-[228px] lg:w-[246px]',
                  ].join(' ')}
                >
                  <Image
                    src={moment.src}
                    alt={moment.alt}
                    fill
                    sizes={
                      isLandscape
                        ? '(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px'
                        : '(max-width: 640px) 210px, (max-width: 1024px) 228px, 246px'
                    }
                    className='object-cover grayscale contrast-110'
                    priority={index < eventMoments.length}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
