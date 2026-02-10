'use client';

import { Carousel, Card } from '@/components/motion/apple-cards-carousel';
import { CheckCircle } from 'lucide-react';

// Card content components - clean, minimal like motion-primitives
function InHouseContent() {
  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        Expert training at your office. We come to you with a customized
        curriculum based on your tech stack and codebase.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          'Your Office',
          'Custom Curriculum',
          'Team-Focused',
          'NDA Available',
        ].map(item => (
          <div key={item} className='flex items-center gap-2 text-sm'>
            <CheckCircle className='w-4 h-4 text-muted-foreground' />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemoteContent() {
  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        Live video sessions with screen sharing. Perfect for distributed teams
        across multiple time zones.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          'Live Video Calls',
          'Screen Sharing',
          'Recorded Sessions',
          'Global Teams',
        ].map(item => (
          <div key={item} className='flex items-center gap-2 text-sm'>
            <CheckCircle className='w-4 h-4 text-muted-foreground' />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OffsiteContent() {
  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        5-day intensive bootcamp at stunning Mediterranean locations.
        World-class training with luxury accommodation.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          'Greece',
          'Luxury Hotels',
          'Small Groups',
          'Cultural Experiences',
        ].map(item => (
          <div key={item} className='flex items-center gap-2 text-sm'>
            <CheckCircle className='w-4 h-4 text-muted-foreground' />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanContent() {
  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        AI agents provide immediate, code-aware insights during planning.
        Cross-reference specs against your codebase to flag ambiguities early.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          'AI-Assisted Scoping',
          'Codebase Analysis',
          'Risk Detection',
          'Task Breakdown',
        ].map(item => (
          <div key={item} className='flex items-center gap-2 text-sm'>
            <CheckCircle className='w-4 h-4 text-muted-foreground' />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildContent() {
  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        Accelerate development with AI pair programming. Generate boilerplate,
        refactor code, and implement features faster than ever.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          'AI Pair Programming',
          'Code Generation',
          'Instant Refactoring',
          '10x Faster',
        ].map(item => (
          <div key={item} className='flex items-center gap-2 text-sm'>
            <CheckCircle className='w-4 h-4 text-muted-foreground' />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewContent() {
  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        AI-assisted code review catches bugs, security issues, and style
        violations before they reach production.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          'Automated Review',
          'Bug Detection',
          'Security Scanning',
          'Style Enforcement',
        ].map(item => (
          <div key={item} className='flex items-center gap-2 text-sm'>
            <CheckCircle className='w-4 h-4 text-muted-foreground' />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cards with SENSIBLE images that match the content
const cards = [
  {
    category: 'On-Site Training',
    title: 'At Your Office',
    // Real training session photo - people in office learning
    src: '/images/people/5D068244-A485-4F44-82ED-37B4FDDBCAAE_1_105_c.jpeg',
    content: <InHouseContent />,
  },
  {
    category: 'Remote Training',
    title: 'Video Sessions',
    // Laptop/screen with video call - represents remote work
    src: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=1600&h=1000&fit=crop&q=90',
    content: <RemoteContent />,
  },
  {
    category: 'Premium Offsites',
    title: 'Mediterranean',
    // Greek coastline - Santorini style white buildings, blue sea
    src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&h=1000&fit=crop&q=90',
    content: <OffsiteContent />,
  },
  {
    category: 'Methodology',
    title: 'Plan with AI',
    // People walking on pedestrian lane - Ryoji Iwata (User requested X53e51WfjlE)
    src: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1600&q=80',
    content: <PlanContent />,
  },
  {
    category: 'Methodology',
    title: 'Build Faster',
    // Code on screen / developer workspace - represents coding
    src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=1000&fit=crop&q=90',
    content: <BuildContent />,
  },
  {
    category: 'Methodology',
    title: 'Review & Ship',
    // Rocket launch / deployment - represents shipping code
    src: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1600&h=1000&fit=crop&q=90',
    content: <ReviewContent />,
  },
];

export function AppleCardsSection() {
  const carouselCards = cards.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout />
  ));

  return (
    <section className='py-20'>
      <div className='max-w-7xl mx-auto'>
        <Carousel items={carouselCards} />
      </div>
    </section>
  );
}
