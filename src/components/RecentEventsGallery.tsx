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
    className: 'md:col-span-5 md:col-start-1 md:row-start-3',
    sizes: '(max-width: 767px) 100vw, (max-width: 1279px) 42vw, 30vw',
  },
];

export function RecentEventsGallery() {
  return (
    <section aria-label='Workshop photo collage' className='mt-12 md:mt-14'>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3'>
        {eventMoments.map((moment, index) => (
          <figure
            key={moment.src}
            className={[
              'relative overflow-hidden shadow-[0_16px_42px_rgba(82,54,78,0.18)]',
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
                    'sepia(0.16) saturate(1.18) contrast(0.88) brightness(1.06) hue-rotate(-10deg)',
                }}
              />
              <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,168,193,0.18),rgba(255,233,188,0.14)_52%,rgba(117,196,255,0.12))] mix-blend-soft-light' />
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_38%),linear-gradient(180deg,rgba(113,66,92,0.10),rgba(50,40,24,0.16))] mix-blend-screen' />
              <div className='pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light [background-image:radial-gradient(circle_at_1px_1px,rgba(255,246,228,0.95)_1px,transparent_0)] [background-size:8px_8px]' />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
