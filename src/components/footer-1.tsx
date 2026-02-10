import Link from 'next/link';

const links = {
  training: [
    { label: 'All Programs', href: '/training' },
    { label: 'Offsite Training', href: '/training#offsite' },
    { label: 'Contact', href: '/contact' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Methodology', href: '/methodology' },
    { label: 'Research', href: '/research' },
  ],
};

export default function VeilFooter() {
  return (
    <footer className='bg-zinc-50 @container border-t border-zinc-200 py-12'>
      <div className='mx-auto max-w-5xl container-padding'>
        <div className='space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-4'>
          {/* Brand column */}
          <div className='text-center md:text-left'>
            <p className='text-muted-foreground max-w-xs mx-auto md:mx-0 text-xs md:text-sm'>
              Official Claude Ambassadors. Enterprise AI development training
              for engineering teams.
            </p>
            <p className='text-muted-foreground mt-4 text-xs md:text-sm'>
              &copy; 2026 Claude Workshop. All rights reserved.
            </p>
          </div>

          {/* Training & Company columns - centered on mobile */}
          <div className='flex justify-center gap-16 md:contents'>
            {/* Training column */}
            <div className='text-left md:text-right'>
              <h3 className='text-foreground mb-2 md:mb-3 text-xs md:text-sm font-medium'>
                Training
              </h3>
              <ul className='space-y-1 md:space-y-2'>
                {links.training.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground text-xs md:text-sm transition-colors'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div className='text-left md:text-right'>
              <h3 className='text-foreground mb-2 md:mb-3 text-xs md:text-sm font-medium'>
                Company
              </h3>
              <ul className='space-y-1 md:space-y-2'>
                {links.company.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground text-xs md:text-sm transition-colors'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
