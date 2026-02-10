'use client';

import Link from 'next/link';

import { Claude } from '@/components/ui/svgs/claude';
import { siteConfig, footerLinks } from '@/lib/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-border/40 bg-background'>
      <div className='max-w-7xl mx-auto container-padding py-12'>
        <div className='flex flex-col items-center text-center space-y-6'>
          {/* Logo */}
          <Claude className='w-8 h-8' />

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
