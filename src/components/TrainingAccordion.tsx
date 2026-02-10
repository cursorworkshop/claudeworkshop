'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/core/accordion';

const trainingOptions = [
  {
    id: 'on-site',
    title: 'On-Site Training',
    description:
      'Expert training at your location, online or in-person at your office. We come to you worldwide with a minimum of two trainers and a customized curriculum based on your tech stack and codebase.',
    features: [
      'Worldwide',
      'Min. 2 Trainers',
      'Custom Curriculum',
      'NDA Available',
    ],
    link: null,
  },
  {
    id: 'offsite',
    title: 'Offsite Training',
    description:
      '5-day intensive bootcamp at stunning Mediterranean locations. World-class training with luxury accommodation in Greece. Offsites are scheduled periodically. Contact us for upcoming dates.',
    features: ['Greece', 'Luxury Hotels', 'Small Groups', 'All-Inclusive'],
    link: null,
  },
  {
    id: 'methodology',
    title: 'Our Methodology',
    description:
      'A structured 7-step approach to AI-assisted development. Learn to plan with AI, build faster with pair programming, and ship with confidence through automated review.',
    features: [
      'AI-Assisted Scoping',
      'Codebase Analysis',
      'Risk Detection',
      'Task Breakdown',
    ],
    link: '/methodology',
  },
  {
    id: 'badging',
    title: 'Badging',
    description:
      'Complete our training programs and receive recognition for your Claude Code expertise. Our badging program validates your skills and demonstrates your proficiency in AI-assisted development to employers and clients.',
    features: [
      'Completion Badge',
      'Skills Validation',
      'Career Advancement',
      'Industry Recognition',
    ],
    link: null,
  },
];

export function TrainingAccordion() {
  return (
    <section className='py-24 max-w-5xl mx-auto container-padding'>
      <h2 className='text-2xl md:text-3xl font-medium tracking-tight mb-12'>
        What we offer
      </h2>
      <Accordion
        type='single'
        collapsible
        defaultValue='on-site'
        className='flex w-full flex-col divide-y divide-zinc-200 dark:divide-zinc-700'
      >
        {trainingOptions.map(option => (
          <AccordionItem key={option.id} value={option.id}>
            <AccordionTrigger className='w-full py-5 text-left text-lg font-medium text-zinc-950 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors'>
              {option.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className='pb-6 pt-2'>
                <p className='text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-4'>
                  {option.description}
                </p>
                {option.link && (
                  <Link
                    href={option.link}
                    className='inline-flex items-center text-sm text-foreground hover:text-muted-foreground transition-colors mb-6 border-b border-foreground pb-0.5'
                  >
                    Learn more
                    <ArrowUpRight className='w-3 h-3 ml-1' />
                  </Link>
                )}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-4'>
                  {option.features.map(feature => (
                    <div
                      key={feature}
                      className='flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400'
                    >
                      <CheckCircle className='w-4 h-4 text-zinc-400 dark:text-zinc-500' />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
