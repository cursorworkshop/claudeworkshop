import Image from 'next/image';

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
    <figure className='relative aspect-[4/3] overflow-hidden bg-zinc-100'>
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes='(max-width: 768px) 50vw, 33vw'
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
  return (
    <section className='pt-12 md:pt-14'>
      <div className='grid grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2'>
        {items.map((item, index) => (
          <GalleryCard key={item.id} item={item} eager={index < 6} />
        ))}
      </div>
    </section>
  );
};

export { Gallery4 };
