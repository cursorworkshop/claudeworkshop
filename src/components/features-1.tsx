import { Card } from '@/components/ui/card';
import { Terminal, Zap, Users, Shield } from 'lucide-react';

export default function Features() {
  return (
    <section className='bg-background @container py-24'>
      <div className='mx-auto max-w-2xl px-6'>
        <div>
          <h2 className='text-balance font-serif text-4xl font-medium'>
            Why Teams Choose Us
          </h2>
          <p className='text-muted-foreground mt-4 text-balance'>
            Most teams use less than 10% of Claude Code's capabilities. We bridge the
            gap between tool and mastery.
          </p>
        </div>
        <div className='@xl:grid-cols-2 mt-12 grid gap-3 *:p-6'>
          <Card variant='outline' className='row-span-2 grid grid-rows-subgrid'>
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium'>
                Command Line Mastery
              </h3>
              <p className='text-muted-foreground text-sm'>
                Move beyond basic chat. Learn to control your entire
                environment, git workflow, and terminal through natural
                language.
              </p>
            </div>
            <div aria-hidden className='flex h-44 items-center justify-center'>
              <div className='relative'>
                <Terminal className='size-20 stroke-[0.5px] opacity-20' />
                <Terminal className='absolute inset-0 size-20 stroke-[1px]' />
              </div>
            </div>
          </Card>
          <Card
            variant='outline'
            className='row-span-2 grid grid-rows-subgrid overflow-hidden'
          >
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium'>Context Awareness</h3>
              <p className='text-muted-foreground text-sm'>
                Teach Claude Code your codebase architecture. Stop hallucinating
                imports and start generating production-ready code.
              </p>
            </div>
            <div aria-hidden className='relative h-44 translate-y-6'>
              <div className='bg-foreground/15 absolute inset-0 mx-auto w-px'></div>
              <div className='absolute -inset-x-16 top-6 aspect-square rounded-full border'></div>
              <div className='border-primary absolute -inset-x-16 top-6 aspect-square rounded-full border opacity-50'></div>
              <div className='absolute -inset-x-8 top-24 aspect-square rounded-full border'></div>
            </div>
          </Card>
          <Card
            variant='outline'
            className='row-span-2 grid grid-rows-subgrid overflow-hidden'
          >
            <div className='space-y-2'>
              <h3 className='text-foreground font-medium'>Team Velocity</h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Standardize AI workflows across your team. Share prompts, rules,
                and context to elevate everyone.
              </p>
            </div>
            <div aria-hidden className='flex h-44 items-center justify-center'>
              <div className='relative'>
                <Zap className='size-20 stroke-[0.5px] opacity-20' />
                <Zap className='absolute inset-0 size-20 stroke-[1px]' />
              </div>
            </div>
          </Card>
          <Card variant='outline' className='row-span-2 grid grid-rows-subgrid'>
            <div className='space-y-2'>
              <h3 className='font-medium'>Enterprise Ready</h3>
              <p className='text-muted-foreground text-sm'>
                Tailored programs for Fortune 100 teams. Security-conscious,
                scalable training solutions.
              </p>
            </div>

            <div className='pointer-events-none relative -ml-7 flex size-44 items-center justify-center pt-5'>
              <Shield className='absolute inset-0 top-2.5 size-full stroke-[0.1px] opacity-15' />
              <Shield className='size-32 stroke-[0.1px]' />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
