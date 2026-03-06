import { AlertTriangle, GitPullRequest, Users } from 'lucide-react';

export default function Content() {
  return (
    <section className='bg-background @container py-32'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='mb-16'>
          <h2 className='text-3xl md:text-5xl font-medium tracking-tight mb-6 leading-tight'>
            AI adoption is splitting engineering orgs.
            <br />
            <span className='text-muted-foreground'>
              Quality and velocity drift without a shared operating model.
            </span>
          </h2>
          <p className='text-muted-foreground max-w-3xl text-lg leading-relaxed'>
            One group ships AI-generated code with too little review. Another
            avoids AI entirely. The result is inconsistent code quality,
            unpredictable throughput, and no shared standard for when AI help is
            appropriate.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
          <div className='space-y-4'>
            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
              <Users className='w-5 h-5 text-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Split Adoption</h3>
            <p className='text-muted-foreground leading-relaxed'>
              Different teams, different rules. Without alignment, adoption
              becomes political instead of practical.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
              <GitPullRequest className='w-5 h-5 text-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Review Risk</h3>
            <p className='text-muted-foreground leading-relaxed'>
              AI can draft quickly, but teams struggle with where the human line
              is. Reviews become rubber-stamps or vetoes.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
              <AlertTriangle className='w-5 h-5 text-foreground' />
            </div>
            <h3 className='text-lg font-medium'>No Shared Standard</h3>
            <p className='text-muted-foreground leading-relaxed'>
              Without a simple framework, teams cannot measure ROI, enforce
              safety, or scale best practices across engineers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
