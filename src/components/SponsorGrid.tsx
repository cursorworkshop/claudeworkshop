import clsx from 'clsx';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Sponsor } from '@/lib/types';

interface SponsorGridProps {
  sponsors: Sponsor[];
  title?: string;
  showContent?: boolean;
}

const tierStyles = {
  main: 'col-span-2 row-span-2 p-8',
  gold: 'col-span-1 p-6',
  silver: 'col-span-1 p-4',
  bronze: 'col-span-1 p-4',
  community: 'col-span-1 p-3',
};

const logoSizes = {
  main: { width: 200, height: 80 },
  platinum: { width: 200, height: 80 },
  gold: { width: 150, height: 60 },
  silver: { width: 120, height: 48 },
  bronze: { width: 100, height: 40 },
  community: { width: 80, height: 32 },
};

export default function SponsorGrid({
  sponsors,
  title = 'Our Sponsors',
  showContent = false,
}: SponsorGridProps) {
  if (!sponsors.length) {
    return null;
  }

  const mainSponsors = sponsors.filter(s => s.tier === 'main');
  const otherSponsors = sponsors.filter(s => s.tier !== 'main');

  return (
    <section className='section-padding bg-gray-50'>
      <div className='max-w-7xl mx-auto container-padding'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl lg:text-4xl font-bold gradient-text mb-4'>
            {title}
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            We're grateful to our sponsors who make our community events
            possible and help us grow the AI development ecosystem globally.
          </p>
        </div>

        {/* Main Sponsors */}
        {mainSponsors.length > 0 && (
          <div className='mb-12'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6 text-center'>
              Main Sponsor
            </h3>
            <div className='grid grid-cols-1 gap-6'>
              {mainSponsors.map(sponsor => (
                <div
                  key={sponsor.slug}
                  className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center card-hover'
                >
                  <div className='space-y-6'>
                    {/* Logo */}
                    <div className='flex justify-center'>
                      <div className='relative'>
                        <Image
                          src={sponsor.logo}
                          alt={`${sponsor.name} logo`}
                          width={logoSizes.main.width}
                          height={logoSizes.main.height}
                          className='object-contain'
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className='space-y-4'>
                      <h4 className='text-2xl font-bold text-gray-900'>
                        {sponsor.name}
                      </h4>
                      <p className='text-lg text-gray-600'>
                        {sponsor.description}
                      </p>

                      {showContent && sponsor.content && (
                        <div
                          className='prose prose-lg max-w-none text-gray-600'
                          dangerouslySetInnerHTML={{
                            __html: `${sponsor.content.substring(0, 500)}...`,
                          }}
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex flex-wrap justify-center gap-4'>
                      <Link
                        href={sponsor.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-primary'
                      >
                        Visit Website
                        <ExternalLink className='w-4 h-4 ml-2' />
                      </Link>
                      <Link
                        href={`/sponsors/${sponsor.slug}`}
                        className='btn btn-secondary'
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Sponsors */}
        {otherSponsors.length > 0 && (
          <div>
            <h3 className='text-xl font-semibold text-gray-900 mb-6 text-center'>
              Supporting Sponsors
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {otherSponsors.map(sponsor => (
                <SponsorCard
                  key={sponsor.slug}
                  sponsor={sponsor}
                  showContent={showContent}
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className='mt-16 text-center'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
              Become a Sponsor
            </h3>
            <p className='text-lg text-gray-600 mb-6 max-w-2xl mx-auto'>
              Support the Italian AI development community and get your brand in
              front of passionate developers, creators, and tech enthusiasts.
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <Link
                href='/sponsors/become-sponsor'
                className='btn btn-primary btn-lg'
              >
                Sponsor Us
              </Link>
              <Link href='/contact' className='btn btn-secondary btn-lg'>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SponsorCard({
  sponsor,
  showContent = false,
}: {
  sponsor: Sponsor;
  showContent?: boolean;
}) {
  const logoSize = logoSizes[sponsor.tier] || logoSizes.community;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center card-hover group'>
      <div className='space-y-4'>
        {/* Logo */}
        <div className='flex justify-center'>
          <div className='relative'>
            <Image
              src={sponsor.logo}
              alt={`${sponsor.name} logo`}
              width={logoSize.width}
              height={logoSize.height}
              className='object-contain transition-transform duration-200 group-hover:scale-105'
            />
          </div>
        </div>

        {/* Content */}
        <div className='space-y-2'>
          <h4 className='font-semibold text-gray-900'>{sponsor.name}</h4>
          <p className='text-sm text-gray-600 line-clamp-2'>
            {sponsor.description}
          </p>

          {/* Tier Badge */}
          {sponsor.tier !== 'community' && (
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                sponsor.tier === 'gold' && 'bg-yellow-100 text-yellow-800',
                sponsor.tier === 'silver' && 'bg-gray-100 text-gray-800',
                sponsor.tier === 'bronze' && 'bg-orange-100 text-orange-800'
              )}
            >
              {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}{' '}
              Sponsor
            </span>
          )}
        </div>

        {/* Actions */}
        <div className='flex flex-col gap-2'>
          <Link
            href={sponsor.url}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-primary btn-sm w-full'
          >
            Visit Website
            <ExternalLink className='w-3 h-3 ml-1' />
          </Link>

          {showContent && (
            <Link
              href={`/sponsors/${sponsor.slug}`}
              className='text-sm text-claude-blue hover:text-blue-700 transition-colors duration-200'
            >
              Learn More
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
