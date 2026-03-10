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
      />
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
