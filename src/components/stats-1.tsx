import Link from 'next/link';
import { ArrowUpRight, TrendingUp, Users, Star } from 'lucide-react';

export default function Stats() {
  return (
    <section className='bg-background @container py-24'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='mb-16'>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            Proven Results
          </h2>
          <p className='text-muted-foreground max-w-2xl'>
            Our training delivers measurable productivity gains across
            engineering teams of all sizes.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
          <div className='space-y-3'>
            <TrendingUp className='w-5 h-5 text-muted-foreground' />
            <div>
              <span className='text-foreground text-3xl font-medium'>40%</span>
              <p className='text-foreground font-medium mt-1'>
                More efficient developers
              </p>
              <p className='text-muted-foreground text-sm mt-2 leading-relaxed'>
                Average productivity increase measured across trained teams
                within the first month.
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <Users className='w-5 h-5 text-muted-foreground' />
            <div>
              <span className='text-foreground text-3xl font-medium'>100+</span>
              <p className='text-foreground font-medium mt-1'>Teams trained</p>
              <p className='text-muted-foreground text-sm mt-2 leading-relaxed'>
                From startups to Fortune 100 companies and DAX 40 enterprises
                worldwide.
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <Star className='w-5 h-5 text-muted-foreground' />
            <div>
              <span className='text-foreground text-3xl font-medium'>5/5</span>
              <p className='text-foreground font-medium mt-1'>Average rating</p>
              <p className='text-muted-foreground text-sm mt-2 leading-relaxed'>
                Consistently top-rated by participants for quality and practical
                value.
              </p>
            </div>
          </div>
        </div>
        <div className='mt-12 text-center'>
          <Link
            href='/methodology'
            className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            Find out about our methodology
            <ArrowUpRight className='w-3 h-3 ml-1' />
          </Link>
        </div>
      </div>
    </section>
  );
}
