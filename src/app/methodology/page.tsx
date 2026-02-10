import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { InView } from '@/components/motion/in-view';
import { TextEffect } from '@/components/motion/text-effect';
import Stats from '@/components/stats-1';
import FAQs from '@/components/faqs-2';

const methodologySteps = [
  {
    title: 'Plan',
    description: 'Strategic planning with AI-assisted insights',
    delegate: 'Specification analysis, dependency mapping',
    review: 'Feature feasibility, architectural decisions',
    own: 'Product vision, strategic priorities',
  },
  {
    title: 'Design',
    description: 'Architecture and system design with AI support',
    delegate: 'Initial design drafts, pattern analysis',
    review: 'Architecture decisions, API contracts',
    own: 'System architecture, technology choices',
  },
  {
    title: 'Build',
    description: 'Accelerated development with intelligent assistance',
    delegate: 'Boilerplate code, standard implementations',
    review: 'Code quality, edge cases',
    own: 'Core algorithms, novel solutions',
  },
  {
    title: 'Test',
    description: 'Comprehensive testing with AI-generated coverage',
    delegate: 'Test generation, coverage analysis',
    review: 'Test quality, edge case coverage',
    own: 'Testing strategy, acceptance criteria',
  },
  {
    title: 'Review',
    description: 'Intelligent code review and quality assurance',
    delegate: 'Style checking, security scanning',
    review: 'Business logic, team standards',
    own: 'Final approval, merge decisions',
  },
  {
    title: 'Document',
    description: 'Automated documentation that stays current',
    delegate: 'API docs, code comments',
    review: 'Core service overviews, public docs',
    own: 'Documentation strategy, compliance',
  },
  {
    title: 'Deploy',
    description: 'Streamlined operations and incident response',
    delegate: 'Log parsing, initial diagnostics',
    review: 'Root cause validation, fix verification',
    own: 'Critical incidents, production decisions',
  },
];

export default function MethodologyPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='pt-28 pb-24 lg:py-32'>
        <div className='max-w-4xl mx-auto container-padding text-center'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <p className='text-sm text-muted-foreground mb-4 tracking-wide uppercase'>
              Our Approach
            </p>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6'>
              <TextEffect per='word' as='span' preset='fade'>
                How We Work
              </TextEffect>
            </h1>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
              We help teams move from using AI as autocomplete to leveraging
              agents that generate entire files, scaffold projects, and reason
              through multi-step problems. Teams we have trained reduced code
              review cycles by 60% and cut onboarding time in half.
            </p>
          </InView>
        </div>
      </section>

      {/* Methodology Steps - Clean Accordion Style */}
      <section className='py-24'>
        <div className='max-w-4xl mx-auto container-padding'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-3xl font-medium text-foreground mb-12 text-center'>
              The 7-Step Process
            </h2>
          </InView>

          <Accordion type='single' collapsible className='w-full'>
            {methodologySteps.map((step, index) => (
              <AccordionItem
                key={step.title}
                value={`step-${index}`}
                className='border-border/50'
              >
                <AccordionTrigger className='hover:no-underline py-6'>
                  <div className='flex items-center gap-4 text-left'>
                    <span className='text-3xl font-bold text-muted-foreground/30'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className='text-xl font-medium text-foreground'>
                        {step.title}
                      </h3>
                      <p className='text-sm text-muted-foreground font-normal'>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pb-6'>
                  <div className='ml-16 grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Delegate to AI
                      </p>
                      <p className='text-sm text-foreground'>{step.delegate}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Engineer Reviews
                      </p>
                      <p className='text-sm text-foreground'>{step.review}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Engineer Owns
                      </p>
                      <p className='text-sm text-foreground'>{step.own}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* FAQs Section */}
      <FAQs />

      {/* CTA Section */}
      <section className='py-24 bg-zinc-50 dark:bg-zinc-900/50'>
        <div className='max-w-2xl mx-auto container-padding text-center'>
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-3xl font-medium text-foreground mb-6'>
              Ready to get started?
            </h2>
            <p className='text-muted-foreground mb-10 text-lg'>
              Let us help you implement this methodology with hands-on training
              tailored to your codebase.
            </p>
            <div className='flex flex-row gap-3 justify-center'>
              <Button
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/contact'>Get Started</Link>
              </Button>
              <Button
                variant='secondary'
                className='h-10 px-5 sm:h-12 sm:px-8 text-sm sm:text-base'
                asChild
              >
                <Link href='/training'>View Training</Link>
              </Button>
            </div>
          </InView>
        </div>
      </section>
    </div>
  );
}
