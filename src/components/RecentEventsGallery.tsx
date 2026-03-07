import Image from 'next/image';

type EventMoment = {
  className?: string;
  height: number;
  sizes: string;
  src: string;
  width: number;
};

const eventMoments: EventMoment[] = [
  {
    src: '/images/presenting/rogier-claude-1.jpg',
    width: 900,
    height: 506,
    className: 'md:col-span-4 md:col-start-1 md:row-start-1',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 22vw',
  },
  {
    src: '/images/presenting/rogier-codex-1.jpg',
    width: 960,
    height: 720,
    className: 'md:col-span-5 md:col-start-5 md:row-start-1',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 42vw, 30vw',
  },
  {
    src: '/images/presenting/rogier-cursor-1.jpg',
    width: 720,
    height: 960,
    className: 'md:col-span-3 md:col-start-10 md:row-start-1 md:row-span-2',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 26vw, 20vw',
  },
  {
    src: '/images/presenting/rogier-codex-2.jpg',
    width: 960,
    height: 720,
    className: 'md:col-span-4 md:col-start-1 md:row-start-2',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 24vw',
  },
  {
    src: '/images/presenting/rogier-createnew.jpg',
    width: 900,
    height: 556,
    className: 'md:col-span-4 md:col-start-5 md:row-start-2',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 24vw',
  },
  {
    src: '/images/presenting/rogier-cursor-2.jpg',
    width: 720,
    height: 960,
    className: 'md:col-span-3 md:col-start-10 md:row-start-3',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 26vw, 20vw',
  },
  {
    src: '/images/presenting/rogier-cursor-3.jpg',
    width: 900,
    height: 675,
    className:
      'md:col-span-4 md:col-start-1 md:row-start-3 xl:col-span-5 xl:col-start-1',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 28vw',
  },
];

export function RecentEventsGallery() {
  return (
    <section aria-label='Workshop photo collage' className='mt-12 md:mt-14'>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-[10px]'>
        {eventMoments.map((moment, index) => (
          <figure
            key={moment.src}
            className={[
              'relative overflow-hidden bg-[#f4eadc] shadow-[0_18px_40px_rgba(91,56,75,0.14)]',
              moment.className || '',
            ].join(' ')}
          >
            <div
              className='relative w-full'
              style={{ aspectRatio: `${moment.width} / ${moment.height}` }}
            >
              <Image
                src={moment.src}
                alt=''
                fill
                sizes={moment.sizes}
                className='object-cover'
                priority={index < 4}
                style={{
                  filter:
                    'sepia(0.24) saturate(0.88) contrast(0.84) brightness(1.1) hue-rotate(-16deg)',
                  transform: 'scale(1.015)',
                }}
              />
              <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,212,224,0.32),rgba(255,245,210,0.16)_42%,rgba(160,214,255,0.2))] mix-blend-soft-light' />
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(255,252,236,0.44),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(255,174,208,0.18),transparent_28%),radial-gradient(circle_at_82%_84%,rgba(124,182,245,0.16),transparent_30%),linear-gradient(180deg,rgba(97,72,42,0.08),rgba(43,29,24,0.2))] mix-blend-screen' />
              <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,177,211,0.14),transparent_16%,transparent_84%,rgba(121,211,255,0.12))] mix-blend-overlay' />
              <div className='pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light [background-image:radial-gradient(circle_at_1px_1px,rgba(255,248,232,0.72)_1px,transparent_0)] [background-size:7px_7px]' />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
