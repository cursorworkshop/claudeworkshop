import { Terminal, Zap, Users } from 'lucide-react';

export default function Content() {
  return (
    <section className='bg-background @container py-32'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='mb-16'>
          <h2 className='text-3xl md:text-5xl font-medium tracking-tight mb-6 leading-tight'>
            Most teams use{' '}
            <span className='text-muted-foreground'>less than 10%</span> of
            Claude Code's capabilities.
            <br />
            We bridge the gap between tool and mastery.
          </h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
          <div className='space-y-4'>
            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
              <Terminal className='w-5 h-5 text-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Command Line Mastery</h3>
            <p className='text-muted-foreground leading-relaxed'>
              Move beyond basic chat. Learn to control your entire environment,
              git workflow, and terminal through natural language.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
              <Zap className='w-5 h-5 text-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Context Awareness</h3>
            <p className='text-muted-foreground leading-relaxed'>
              Teach Claude Code your codebase architecture. Stop hallucinating
              imports and start generating production-ready code that fits your
              patterns.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
              <Users className='w-5 h-5 text-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Team Velocity</h3>
            <p className='text-muted-foreground leading-relaxed'>
              Standardize AI workflows across your team. Share prompts, rules,
              and context to ensure everyone codes at the level of your senior
              engineers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
