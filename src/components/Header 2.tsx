'use client';

import { Menu, Calendar, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navigation, siteConfig } from '@/lib/config';

export default function Header() {
  return (
    <header
      className='sticky top-0 z-50 w-full border-b border-gray-200 backdrop-blur supports-[backdrop-filter]:bg-[#f7f7f4]/60'
      style={{ backgroundColor: 'rgba(247, 247, 244, 0.95)' }}
    >
      <div className='max-w-7xl mx-auto container-padding'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='w-10 h-10 relative'>
              <Image
                src='/images/logos/CUBE_2D_LIGHT.svg'
                alt='Claude Code Logo'
                fill
                className='object-contain'
                priority
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
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className='text-muted-foreground hover:text-foreground font-medium transition-colors duration-200'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            <Button variant='secondary' size='sm' asChild>
              <Link
                href={siteConfig.social.meetup || '#'}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Users className='w-4 h-4 mr-2' />
                Join Community
              </Link>
            </Button>
            <Button variant='default' size='sm' asChild>
              <Link href='/workshops'>
                <Calendar className='w-4 h-4 mr-2' />
                Next Workshop
              </Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden'>
                <Menu className='w-6 h-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
              <nav className='flex flex-col space-y-4 mt-8'>
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className='text-lg font-medium hover:text-primary transition-colors'
                  >
                    {item.name}
                  </Link>
                ))}

                <div className='flex flex-col space-y-3 pt-6 border-t'>
                  <Button variant='secondary' asChild>
                    <Link
                      href={siteConfig.social.meetup || '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Users className='w-4 h-4 mr-2' />
                      Join Community
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href='/workshops'>
                      <Calendar className='w-4 h-4 mr-2' />
                      Next Workshop
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
