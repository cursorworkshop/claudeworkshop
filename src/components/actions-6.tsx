'use client';

import { InView } from '@/components/motion/in-view';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/core/accordion';

const ACTIONS = [
  {
    id: '01',
    title: 'Establish Documentation for AI',
    body: 'Document conventions, testing patterns, and project quirks so AI tools generate outputs that match your codebase.',
  },
  {
    id: '02',
    title: 'Write Plans Before Prompting',
    body: 'Plan the implementation first: outline intent, break work into tasks, then execute systematically with AI.',
  },
  {
    id: '03',
    title: 'Reset Early When Output Goes Wrong',
    body: 'When AI drifts, discard the attempt and restart with a clearer spec. Stacking corrections creates fragile code.',
  },
  {
    id: '04',
    title: 'Decompose Work Into Small Units',
    body: 'AI performs best on focused, well-defined tasks. Prefer small components over “build the whole feature.”',
  },
  {
    id: '05',
    title: 'Use Verification Checklists',
    body: 'Give juniors explicit checks: error states, least privilege, no secrets, and tests that cover failure cases.',
  },
  {
    id: '06',
    title: 'Protect Core Engineering Skills',
    body: 'Keep human ownership over decomposition, debugging intuition, system design, and risk trade-offs.',
  },
];

export default function ActionsSix() {
  return (
    <section className='bg-background @container py-24'>
      <div className='mx-auto max-w-5xl px-6'>
        <InView
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5 }}
          viewOptions={{ once: true }}
        >
          <div className='mb-10'>
            <h2 className='text-balance text-3xl md:text-4xl font-medium tracking-tight'>
              Six actions high-performing teams take
            </h2>
            <p className='mt-4 text-muted-foreground max-w-3xl'>
              Pulled directly from our Enterprise Guide to Agentic Development.
              These are the operational moves that turn AI tooling into durable
              team velocity.
            </p>
          </div>
        </InView>

        <Accordion
          type='single'
          collapsible
          defaultValue='01'
          className='flex w-full flex-col divide-y divide-zinc-200 dark:divide-zinc-700'
        >
          {ACTIONS.map(action => (
            <AccordionItem key={action.id} value={action.id}>
              <AccordionTrigger className='w-full py-5 text-left text-lg font-medium text-zinc-950 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors'>
                {action.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className='pb-6 pt-2'>
                  <p className='text-zinc-500 dark:text-zinc-400 text-base leading-relaxed'>
                    {action.body}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
