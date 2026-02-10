'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    id: 'item-1',
    question: 'What is the typical training format?',
    answer:
      "We offer both on-site workshops at your office and remote training sessions. Programs range from half-day intensives to multi-week comprehensive courses, depending on your team's needs.",
  },
  {
    id: 'item-2',
    question: 'How large should our team be for training?',
    answer:
      'We work with teams of all sizes, from small startups (5-10 developers) to enterprise engineering organizations (100+ developers). We customize the approach based on your team structure.',
  },
  {
    id: 'item-3',
    question: 'What experience level is required?',
    answer:
      'Our training is designed for developers at all levels. We start with fundamentals and progress to advanced agentic workflows, ensuring everyone can learn at their own pace.',
  },
  {
    id: 'item-4',
    question: 'Do you offer ongoing support after training?',
    answer:
      'Yes, we provide follow-up sessions, office hours, and ongoing support packages to ensure your team continues to improve their AI-assisted development skills.',
  },
  {
    id: 'item-5',
    question: 'What makes you different from other training providers?',
    answer:
      'We are Official Claude Ambassadors with direct access to the Claude Code team. Our training is based on real-world enterprise implementations, not generic tutorials.',
  },
];

export default function FAQs() {
  return (
    <section className='bg-background @container py-24'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='mb-12'>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight'>
            Frequently Asked Questions
          </h2>
          <p className='text-muted-foreground mt-3'>Your questions answered</p>
        </div>
        <div>
          <Accordion type='single' collapsible>
            {faqItems.map(item => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className='border-b py-2'
              >
                <AccordionTrigger className='cursor-pointer py-5 text-base md:text-lg font-medium hover:no-underline text-left'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className='text-muted-foreground pb-4 text-base leading-relaxed'>
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
