import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

const members = [
  {
    avatar: '/images/people/rogier-9-no-bg-site-v2.svg',
    name: 'Rogier Muller',
    role: 'Co-Founder',
    bio: 'Official Claude Ambassador for Amsterdam. Over 15 years of experience in software engineering and AI development training.',
    linkedin: 'https://www.linkedin.com/in/rogyr',
    github: 'https://github.com/rogierx',
  },
  {
    avatar: '/images/people/vasilis-3-no-bg-site.svg',
    name: 'Vasilis Tsolis',
    role: 'Co-Founder',
    bio: 'Official Claude Ambassador for Athens. Expert in enterprise AI adoption and developer productivity optimization.',
    linkedin: 'https://www.linkedin.com/in/vasilistsolis',
    github: 'https://github.com/claudeworkshop',
  },
];

export default function Team() {
  return (
    <section className='bg-background @container py-24'>
      <div className='mx-auto max-w-2xl px-6'>
        <div className='space-y-4'>
          <h2 className='text-balance font-serif text-4xl font-medium'>
            Meet the Founders
          </h2>
          <p className='text-muted-foreground text-balance'>
            Official Claude Ambassadors, in daily contact with the Claude Code team,
            bringing you the latest features and best practices.
          </p>
        </div>
        <div className='mt-12 grid gap-12 text-sm'>
          {members.map((member, index) => (
            <div
              key={index}
              className='relative grid grid-cols-[auto_1fr] gap-4'
            >
              <div
                aria-hidden
                className='max-h-26 absolute -inset-x-6 inset-y-1 border-y'
              />
              <div
                aria-hidden
                className='w-26 absolute -inset-y-6 inset-x-1 border-x'
              />
              <div className='before:border-foreground/10 shadow-foreground/6.5 dark:shadow-black/6.5 relative size-28 shrink-0 rounded-xl shadow-md before:absolute before:inset-0 before:rounded-xl before:border'>
                <Image
                  src={member.avatar}
                  alt={member.name}
                  className='rounded-xl object-cover'
                  width={120}
                  height={120}
                />
              </div>

              <div className='flex flex-col justify-between gap-4 py-1'>
                <div className='space-y-0.5'>
                  <p className='text-foreground text-base font-medium'>
                    {member.name}
                  </p>
                  <p className='text-muted-foreground text-sm'>{member.role}</p>
                </div>

                <p className='text-muted-foreground text-balance text-sm'>
                  {member.bio}
                </p>

                <div className='flex gap-3'>
                  <Link
                    href={member.linkedin}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <Linkedin className='size-4' />
                  </Link>
                  <Link
                    href={member.github}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <Github className='size-4' />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
