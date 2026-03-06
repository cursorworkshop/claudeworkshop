import Image from 'next/image';

import type { BrandKey } from '@/lib/brand';
import { siteConfig } from '@/lib/config';

type EventMoment = {
  src: string;
  tag: string;
  title: string;
};

const eventMomentsByBrand: Record<BrandKey, EventMoment[]> = {
  cursor: [
    {
      src: '/images/presenting/rogier-cursor-1.webp',
      tag: 'Workshop',
      title: 'Live coding with engineering teams',
    },
    {
      src: '/images/presenting/rogier-cursor-2.webp',
      tag: 'Meetup',
      title: 'Founder talks and community Q&A',
    },
    {
      src: '/images/presenting/rogier-cursor-3.webp',
      tag: 'Session',
      title: 'Hands-on walkthroughs with real examples',
    },
    {
      src: '/images/presenting/rogier-createnew.webp',
      tag: 'Roadshow',
      title: 'Recent founder sessions with practical team demos',
    },
  ],
  claude: [
    {
      src: '/images/presenting/rogier-claude-1.webp',
      tag: 'Meetup',
      title: 'Founder presentation during a recent Claude meetup',
    },
    {
      src: '/images/presenting/rogier-createnew.webp',
      tag: 'Session',
      title: 'Smaller room setups for live walkthroughs and Q&A',
    },
    {
      src: '/images/presenting/rogier-cursor-2.webp',
      tag: 'Workshop',
      title: 'Practical sessions built around real team questions',
    },
  ],
  codex: [
    {
      src: '/images/presenting/rogier-codex-1.webp',
      tag: 'Meetup',
      title: 'Live room walkthroughs and short founder talks',
    },
    {
      src: '/images/presenting/rogier-codex-2.webp',
      tag: 'Training',
      title: 'Focused demos for teams experimenting with Codex',
    },
    {
      src: '/images/presenting/rogier-createnew.webp',
      tag: 'Session',
      title: 'Smaller discussions on adoption, workflows, and reviews',
    },
  ],
};

export function RecentEventsGallery() {
  const eventMoments =
    eventMomentsByBrand[siteConfig.branding.key] || eventMomentsByBrand.cursor;

  return (
    <section className='border-y border-zinc-200/80 bg-white py-20'>
      <div className='mx-auto max-w-6xl container-padding'>
        <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-2xl'>
            <p className='mb-3 text-xs uppercase tracking-[0.35em] text-zinc-500'>
              Recent Events
            </p>
            <h2 className='text-3xl font-medium tracking-tight text-foreground'>
              Recent moments from {siteConfig.branding.productName} sessions.
            </h2>
          </div>
          <p className='max-w-sm text-sm leading-relaxed text-zinc-500'>
            Kept small and monochrome on purpose. These are candid event shots,
            not polished studio assets.
          </p>
        </div>

        <div className='overflow-x-auto pb-3'>
          <div className='flex w-max snap-x snap-mandatory gap-4 pr-6 md:gap-5'>
            {eventMoments.map(moment => (
              <figure
                key={moment.src}
                className='w-[212px] snap-start rounded-[28px] border border-zinc-200 bg-zinc-50 p-3 sm:w-[236px] lg:w-[248px]'
              >
                <div className='relative aspect-[4/5] overflow-hidden rounded-[22px] bg-zinc-200'>
                  <Image
                    src={moment.src}
                    alt={moment.title}
                    fill
                    sizes='(max-width: 640px) 212px, (max-width: 1024px) 236px, 248px'
                    className='object-cover grayscale contrast-110'
                  />
                </div>
                <figcaption className='px-1 pb-1 pt-3'>
                  <p className='text-[10px] uppercase tracking-[0.28em] text-zinc-500'>
                    {moment.tag}
                  </p>
                  <p className='mt-2 text-sm leading-relaxed text-zinc-700'>
                    {moment.title}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
