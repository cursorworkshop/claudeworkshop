import Image from 'next/image';

type EventMoment = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

const eventMoments: EventMoment[] = [
  {
    src: '/images/presenting/rogier-claude-1.jpg',
    alt: 'Workshop presentation during a live event',
    width: 900,
    height: 506,
  },
  {
    src: '/images/presenting/rogier-codex-1.jpg',
    alt: 'Founder speaking during a hands-on coding session',
    width: 960,
    height: 720,
  },
  {
    src: '/images/presenting/rogier-codex-2.jpg',
    alt: 'Live audience session during a workshop',
    width: 960,
    height: 720,
  },
  {
    src: '/images/presenting/rogier-createnew.jpg',
    alt: 'Speaker leading an in-person training session',
    width: 900,
    height: 556,
  },
  {
    src: '/images/presenting/rogier-cursor-1.jpg',
    alt: 'Workshop setup with founder presentation',
    width: 720,
    height: 960,
  },
  {
    src: '/images/presenting/rogier-cursor-2.jpg',
    alt: 'Founder presenting to a seated audience',
    width: 720,
    height: 960,
  },
  {
    src: '/images/presenting/rogier-cursor-3.jpg',
    alt: 'Classroom-style event during a live walkthrough',
    width: 900,
    height: 675,
  },
];

export function RecentEventsGallery() {
  return (
    <section
      aria-label='Recent workshop event photos'
      className='border-y border-zinc-200/80 bg-white py-12 md:py-16'
    >
      <div className='mx-auto max-w-7xl container-padding'>
        <div className='columns-1 gap-3 sm:columns-2 md:gap-4 lg:columns-3 xl:columns-4'>
          {eventMoments.map((moment, index) => (
            <figure
              key={moment.src}
              className={[
                'mb-3 break-inside-avoid overflow-hidden rounded-[28px] border border-zinc-200/80 bg-zinc-50 p-2 shadow-[0_14px_40px_rgba(0,0,0,0.04)] md:mb-4',
                index % 3 === 1 ? 'rounded-[24px]' : '',
              ].join(' ')}
            >
              <Image
                src={moment.src}
                alt={moment.alt}
                width={moment.width}
                height={moment.height}
                sizes='(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw'
                className='h-auto w-full rounded-[20px] grayscale contrast-110'
                priority={index < 4}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
