'use client';

import Link from 'next/link';

import { siteConfig, footerLinks } from '@/lib/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-border/40 bg-background'>
      <div className='max-w-7xl mx-auto container-padding py-12'>
        <div className='flex flex-col items-center text-center space-y-6'>
          {/* Logo - SVG Cube */}
          <div className='w-8 h-8 relative'>
            <svg viewBox='0 0 466.73 532.09' className='w-full h-full'>
              <path
                fill='#26251e'
                d='M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z'
              />
            </svg>
          </div>

          {/* Brand */}
          <div className='space-y-1'>
            <p className='font-medium text-foreground text-sm'>
              claudeworkshop.com
            </p>
            <p className='text-xs text-muted-foreground'>
              {siteConfig.location}
            </p>
          </div>

          {/* Links - horizontal */}
          <div className='flex flex-wrap justify-center gap-6 text-sm'>
            {footerLinks.about.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                {link.name}
              </Link>
            ))}
            {footerLinks.resources.map(link => (
              <Link
                key={link.name}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  link.href.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className='text-xs text-muted-foreground'>
            © {currentYear} Claude Workshop
          </p>
        </div>
      </div>
    </footer>
  );
}
