import { Calendar, Users, Mic } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { siteConfig, footerLinks } from '@/lib/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className='border-t border-gray-200'
      style={{ backgroundColor: '#f7f7f4' }}
    >
      <div className='max-w-7xl mx-auto container-padding section-padding'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='lg:col-span-1'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='w-8 h-8 relative'>
                <Image
                  src='/images/logos/CUBE_2D_LIGHT.svg'
                  alt='Claude Code Logo'
                  fill
                  className='object-contain'
                />
              </div>
              <div className='flex flex-col'>
                <span className='font-bold text-lg text-foreground'>
                  Claude Workshops
                </span>
                <span className='text-xs text-muted-foreground -mt-1'>
                  {siteConfig.location}
                </span>
              </div>
            </div>
            <p className='text-muted-foreground text-sm mb-6'>
              {siteConfig.description}
            </p>
            <div className='flex space-x-2'>
              {siteConfig.social.meetup && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground'
                  asChild
                >
                  <Link
                    href={siteConfig.social.meetup}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Meetup'
                  >
                    <Users className='w-5 h-5' />
                  </Link>
                </Button>
              )}

              {siteConfig.social.luma && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground'
                  asChild
                >
                  <Link
                    href={siteConfig.social.luma}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Lu.ma'
                  >
                    <Calendar className='w-5 h-5' />
                  </Link>
                </Button>
              )}
              {siteConfig.social.sessionize && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground'
                  asChild
                >
                  <Link
                    href={siteConfig.social.sessionize}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Sessionize'
                  >
                    <Mic className='w-5 h-5' />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Community Links removed */}

          {/* About Links */}
          <div>
            <h3 className='font-semibold text-foreground mb-4'>About</h3>
            <ul className='space-y-2'>
              {footerLinks.about.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className='font-semibold text-foreground mb-4'>Resources</h3>
            <ul className='space-y-2'>
              {footerLinks.resources.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      link.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    className='text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className='mt-12' />

        {/* Bottom Section */}
        <div className='mt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-muted-foreground text-sm'>
            © {currentYear} {siteConfig.title}. Built with ❤️ for developers
            worldwide.
          </p>
          <div className='mt-4 md:mt-0 flex items-center space-x-6'>
            <Link
              href='/privacy'
              className='text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm'
            >
              Privacy Policy
            </Link>
            <Link
              href='/terms'
              className='text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm'
            >
              Terms of Service
            </Link>
            <Link
              href='/code-of-conduct'
              className='text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm'
            >
              Code of Conduct
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
