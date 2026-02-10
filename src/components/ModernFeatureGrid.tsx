'use client';

import {
  type LucideIcon,
  Code,
  Users,
  Zap,
  Calendar,
  MessageCircle,
  Rocket,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const features = [
  {
    icon: Code,
    title: 'Live Coding Sessions',
    description:
      "Watch experts build real applications with Claude Code's AI capabilities, from idea to deployment in minutes.",
    highlight: 'Interactive',
  },
  {
    icon: Users,
    title: 'Structured Curriculum',
    description:
      '5-day deep dive with daily objectives, capstone, and badging.',
    highlight: 'Comprehensive',
  },
  {
    icon: Zap,
    title: 'AI-Powered Workshops',
    description:
      "Hands-on workshops where you'll learn to leverage AI for faster development and better products.",
    highlight: 'Practical',
  },
];

const ASCII_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function AsciiAnimation() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % ASCII_FRAMES.length);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0'>
      <span className='text-foreground text-lg font-mono'>
        {ASCII_FRAMES[frame]}
      </span>
    </div>
  );
}

const benefits = [
  {
    icon: Rocket,
    title: 'Learn from Experts',
    description:
      'Learn proven workflows and best practices from experienced instructors.',
  },
  {
    icon: Calendar,
    title: 'Structured Curriculum',
    description:
      '5-day deep dives with daily objectives, capstone, and badging.',
  },
  {
    icon: MessageCircle,
    title: 'Real-World Lab Time',
    description: 'Build production-ready workflows and ship with confidence.',
  },
  {
    icon: Users,
    title: 'Real-World Practice',
    description: 'Build production-ready workflows and ship with confidence.',
  },
  {
    icon: null, // Special case for ASCII animation
    title: 'Ready to Build?',
    description:
      'Join us in shaping the future of development with AI-powered tools.',
    isSpecial: true,
  },
];

export function ModernFeatureGrid() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {features.map((feature, index) => (
        <Card
          key={index}
          className='group relative overflow-hidden border hover:shadow-lg transition-all duration-300'
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-300'>
                <feature.icon className='w-6 h-6 text-foreground' />
              </div>
              <Badge variant='secondary' className='text-xs'>
                {feature.highlight}
              </Badge>
            </div>
            <CardTitle className='text-xl group-hover:text-foreground transition-colors duration-300'>
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className='text-base leading-relaxed'>
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ModernBenefitsList() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
      {benefits.map((benefit, index) => (
        <div
          key={index}
          className='group'
          style={{
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
          }}
        >
          <div className='flex flex-col items-start space-y-4 p-6 rounded-lg border bg-card hover:shadow-lg hover:scale-105 transition-all duration-300 h-full transform hover:-translate-y-2'>
            {benefit.isSpecial ? (
              <AsciiAnimation />
            ) : (
              <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-all duration-300'>
                {(() => {
                  const Icon: LucideIcon = (benefit.icon ||
                    Users) as LucideIcon;
                  return (
                    <Icon className='w-5 h-5 text-foreground group-hover:text-background transition-colors duration-300' />
                  );
                })()}
              </div>
            )}
            <div className='space-y-1'>
              <h3 className='font-semibold text-foreground text-base group-hover:text-primary transition-colors duration-300'>
                {benefit.title}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {benefit.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
