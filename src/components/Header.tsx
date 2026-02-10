'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Claude } from '@/components/ui/svgs/claude';

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
            <Claude className='w-6 h-6' />
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
