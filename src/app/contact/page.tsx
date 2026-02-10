import { ContactForm } from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-background'>
      <section className='pt-28 pb-20 lg:py-28'>
        <div className='max-w-3xl mx-auto container-padding'>
          <div className='text-center mb-16'>
            <h1 className='text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6'>
              Get In Touch
            </h1>

            <p className='text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
              Book an on-site training session for your team, inquire about our
              executive offsite programs, or explore partnership opportunities.
            </p>
          </div>

          <div className='mt-16'>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
