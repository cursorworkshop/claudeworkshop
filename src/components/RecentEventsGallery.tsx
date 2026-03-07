import Image from 'next/image';

type EventMoment = {
  height: number;
  layoutClassName?: string;
  sizes: string;
  src: string;
  width: number;
};

const galleryRows: EventMoment[][] = [
  [
    {
      src: '/images/presenting/rogier-claude-1.jpg',
      width: 900,
      height: 506,
      layoutClassName: 'lg:flex-[1.08]',
      sizes: '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 34vw',
    },
    {
      src: '/images/presenting/rogier-codex-1.jpg',
      width: 960,
      height: 720,
      layoutClassName: 'lg:flex-[1.18]',
      sizes: '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 38vw',
    },
    {
      src: '/images/presenting/rogier-cursor-1.jpg',
      width: 720,
      height: 960,
      layoutClassName: 'lg:flex-[0.82]',
      sizes: '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 24vw',
    },
  ],
  [
    {
      src: '/images/presenting/rogier-codex-2.jpg',
      width: 960,
      height: 720,
      layoutClassName: 'lg:flex-[1.12]',
      sizes: '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 36vw',
    },
    {
      src: '/images/presenting/rogier-createnew.jpg',
      width: 900,
      height: 556,
      layoutClassName: 'lg:flex-[1.04]',
      sizes: '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 34vw',
    },
    {
      src: '/images/presenting/rogier-cursor-2.jpg',
      width: 720,
      height: 960,
      layoutClassName: 'lg:flex-[0.84]',
      sizes: '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 24vw',
    },
  ],
  [
    {
      src: '/images/presenting/rogier-cursor-3.jpg',
      width: 900,
      height: 675,
      sizes: '(max-width: 1023px) 100vw, 78vw',
    },
  ],
];

export function RecentEventsGallery() {
  return (
    <section aria-label='Workshop photo collage' className='mt-12 md:mt-14'>
      <div className='space-y-2 md:space-y-3'>
        {galleryRows.map((row, rowIndex) => (
          <div
            key={`gallery-row-${rowIndex}`}
            className='flex flex-col gap-2 md:gap-3 lg:flex-row lg:items-start'
          >
            {row.map((moment, index) => (
              <figure
                key={moment.src}
                className={[
                  'relative overflow-hidden border border-zinc-300/80 bg-[#e7ddcf]',
                  'flex-1',
                  moment.layoutClassName || '',
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
                    priority={rowIndex === 0 || index === 0}
                    style={{
                      filter:
                        'sepia(0.34) saturate(0.82) contrast(0.94) brightness(1.04)',
                    }}
                  />
                  <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,236,0.14),rgba(86,56,30,0.18))] mix-blend-multiply' />
                  <div className='pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.85)_1px,transparent_0)] [background-size:9px_9px]' />
                </div>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
