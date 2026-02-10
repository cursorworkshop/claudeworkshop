'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { navigation } from '@/lib/config';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-border/40 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl mx-auto container-padding'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2'>
            <div className='w-6 h-6 relative'>
              <svg viewBox='0 0 466.73 532.09' className='w-full h-full'>
                <path
                  fill='currentColor'
                  className='text-foreground'
                  d='M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z'
                />
              </svg>
            </div>
            <span className='font-medium text-foreground text-sm'>
              claudeworkshop.com
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className='hidden md:flex items-center space-x-2'>
            <Button size='default' className='text-sm px-6 h-10' asChild>
              <Link href='/contact'>Book Training</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <div className='flex items-center space-x-2 md:hidden'>
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <Menu className='w-4 h-4' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align='end'
                sideOffset={8}
                className='w-56 p-2 rounded-xl shadow-lg border bg-white'
              >
                <nav className='flex flex-col'>
                  {navigation.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className='text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors py-2.5 px-3 rounded-lg'
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className='pt-2 mt-2 border-t border-border/40'>
                    <Button
                      size='default'
                      className='w-full'
                      onClick={() => setMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href='/contact'>Book Training</Link>
                    </Button>
                  </div>
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
