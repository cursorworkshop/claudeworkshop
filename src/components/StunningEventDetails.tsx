'use client';

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  CheckCircle,
  Target,
  TrendingUp,
  Shield,
  Zap,
  BookOpen,
  Code,
  GitBranch,
  Settings,
  Presentation,
  Award,
  ArrowRight,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ContactFormModal } from '@/components/ContactFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ImageSlideshow } from '@/components/ui/ImageSlideshow';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StunningEventDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className='min-h-screen bg-gradient-to-b from-background via-muted/20 to-background'>
      {/* Hero Section with Stunning Images */}
      <section className='relative overflow-hidden'>
        <div className='relative min-h-[100vh] md:h-[70vh]'>
          <Image
            src='/images/hotel_ambiance_mustinclude.jpg'
            alt='Kyrimai Hotel seaside arch view to the sea and sunbeds'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

          {/* Hero Content Overlay */}
          <div className='absolute inset-0 flex items-center md:items-end p-6 md:p-12'>
            <div className='max-w-4xl space-y-4 md:space-y-6'>
              {/* Mobile badges - vertical with semi-transparent backgrounds */}
              <div className='flex flex-col md:flex-row md:flex-wrap gap-3'>
                <Badge className='bg-black/30 backdrop-blur-sm text-white font-bold w-fit md:bg-primary md:text-primary-foreground'>
                  5-Day Intensive Bootcamp
                </Badge>
                <Badge className='bg-black/30 backdrop-blur-sm text-white font-bold w-fit md:bg-background/90 md:text-foreground'>
                  Limited to 20 Seats
                </Badge>
                <Badge className='bg-black/30 backdrop-blur-sm text-white font-bold w-fit md:bg-background/90 md:text-foreground md:border-background/50'>
                  All-Inclusive Experience
                </Badge>
              </div>

              {/* Text content - semi-transparent on mobile, normal on desktop */}
              <div className='bg-black/40 backdrop-blur-sm rounded-xl p-4 space-y-3 md:bg-transparent md:backdrop-blur-none md:rounded-none md:p-0 md:space-y-4'>
                <h1 className='text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight'>
                  Claude Code Engineering Offsite
                </h1>
                <p className='text-base sm:text-lg md:text-xl text-white/95 md:text-white/90 max-w-3xl leading-relaxed'>
                  Master AI-powered development in the stunning Mani Peninsula.
                  This isn't just training, it's a complete transformation
                  experience combining intensive technical upskilling with
                  Mediterranean relaxation.
                </p>
              </div>

              {/* Info section - semi-transparent on mobile, normal on desktop */}
              <div className='flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-white/90 text-sm sm:text-base bg-black/30 backdrop-blur-sm rounded-lg p-3 md:bg-transparent md:backdrop-blur-none md:rounded-none md:p-0 md:text-white/80'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='font-medium'>November 9-15, 2025</span>
                </div>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='font-medium'>
                    Kyrimai Hotel, Mani Peninsula
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='font-medium'>12-20 participants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-16 md:py-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Overview Section */}
          <div className='mb-16'>
            <Card className='border-0 bg-gradient-to-br from-background via-background to-muted/30 shadow-2xl'>
              <CardHeader className='text-center pb-8'>
                <CardTitle className='text-3xl md:text-4xl font-bold mb-4'>
                  Workshop Overview
                </CardTitle>
                <CardDescription className='text-lg md:text-xl max-w-4xl mx-auto leading-relaxed'>
                  This isn't just another offsite, your engineers will master
                  Claude Code through hands-on, expert-guided training while
                  experiencing curated leisure activities to recharge, connect,
                  and get inspired.
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-8'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <Card className='text-center border-dashed hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                    <CardContent className='p-6'>
                      <Code className='w-12 h-12 text-primary mx-auto mb-4' />
                      <CardTitle className='text-lg mb-2'>
                        Master Claude Code through hands-on, expert-guided
                        training
                      </CardTitle>
                    </CardContent>
                  </Card>

                  <Card className='text-center border-dashed hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                    <CardContent className='p-6'>
                      <Users className='w-12 h-12 text-primary mx-auto mb-4' />
                      <CardTitle className='text-lg mb-2'>
                        Experience curated leisure activities to recharge,
                        connect, and get inspired
                      </CardTitle>
                    </CardContent>
                  </Card>

                  <Card className='text-center border-dashed hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                    <CardContent className='p-6'>
                      <Target className='w-12 h-12 text-primary mx-auto mb-4' />
                      <CardTitle className='text-lg mb-2'>
                        Strike a unique balance: intensive technical upskilling
                        by day, local immersion and relaxation by evening and
                        Saturday
                      </CardTitle>
                    </CardContent>
                  </Card>
                </div>

                <div className='text-center'>
                  <h3 className='text-xl font-bold text-primary'>
                    Claude Code Training & Leisure in Harmony
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5-Day Sprint Structure */}
          <div className='mb-16'>
            <Card className='border-0 shadow-2xl'>
              <CardHeader>
                <CardTitle className='text-3xl font-bold flex items-center gap-3'>
                  <Calendar className='w-8 h-8 text-primary' />
                  5-Day Sprint Structure
                </CardTitle>
                <CardDescription className='text-lg'>
                  A carefully designed curriculum that builds expertise day by
                  day
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue='day0' className='w-full'>
                  <TabsList className='grid w-full grid-cols-6 mb-8'>
                    <TabsTrigger value='day0' className='text-xs md:text-sm'>
                      Day 0
                    </TabsTrigger>
                    <TabsTrigger value='day1' className='text-xs md:text-sm'>
                      Day 1
                    </TabsTrigger>
                    <TabsTrigger value='day2' className='text-xs md:text-sm'>
                      Day 2
                    </TabsTrigger>
                    <TabsTrigger value='day3' className='text-xs md:text-sm'>
                      Day 3
                    </TabsTrigger>
                    <TabsTrigger value='day4' className='text-xs md:text-sm'>
                      Day 4
                    </TabsTrigger>
                    <TabsTrigger value='day5' className='text-xs md:text-sm'>
                      Day 5
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='day0' className='space-y-4'>
                    <Card className='bg-gradient-to-r from-muted/50 to-background'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <Settings className='w-6 h-6 text-primary' />
                          Day 0 - Prep
                        </CardTitle>
                        <CardDescription>
                          .claude/rules, ignore, privacy, time-tracking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Pre-survey, repo access, KPIs</span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Setup .cursorignore & custom rules</span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Metrics baseline & onboarding</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='day1' className='space-y-4'>
                    <Card className='bg-gradient-to-r from-muted/50 to-background'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <BookOpen className='w-6 h-6 text-primary' />
                          Day 1 - Claude Code Fundamentals
                        </CardTitle>
                        <CardDescription>
                          Tab completion, prompt design, repo setup, inline
                          edits
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              IDE mastery (VS Code AI interface, "Tab"
                              cross-file completion)
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Prompt design for targeted edits & refactoring
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Repo best practices, privacy, org customizations
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='day2' className='space-y-4'>
                    <Card className='bg-gradient-to-r from-muted/50 to-background'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <Zap className='w-6 h-6 text-primary' />
                          Day 2 - Automated Workflows
                        </CardTitle>
                        <CardDescription>
                          Agent mode, multi-file orchestration, CI/CD
                          integration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Orchestrate multi-tool workflows</span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Use Claude Code Agent Mode for CI/CD, multi-file
                              changes, persistent chat tabs
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Real-time pipeline edits, error handling, YAML
                              generation
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='day3' className='space-y-4'>
                    <Card className='bg-gradient-to-r from-muted/50 to-background'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <Users className='w-6 h-6 text-primary' />
                          Day 3 - Collaboration & Scaling
                        </CardTitle>
                        <CardDescription>
                          Pair programming, control plane, AI code review,
                          secrets
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Pair-programming with live AI</span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Shared context, Claude Code Control Plane,
                              chat-based reviews
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Secrets scanning/integration, session security
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='day4' className='space-y-4'>
                    <Card className='bg-gradient-to-r from-muted/50 to-background'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <Shield className='w-6 h-6 text-primary' />
                          Day 4 - Ship & Harden
                        </CardTitle>
                        <CardDescription>
                          AI debugging, rollbacks, monitoring, squad demos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              AI debugging, performance tuning (model logs, MCP
                              optimizations)
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Automated rollback/rollout flows</span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Demo resilient CI/CD, connect to Grafana
                              monitoring
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='day5' className='space-y-4'>
                    <Card className='bg-gradient-to-r from-muted/50 to-background'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <Award className='w-6 h-6 text-primary' />
                          Day 5 - Capstone & Badging
                        </CardTitle>
                        <CardDescription>
                          Team demos, badging, roadmap, alumni support
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Team demos: live cross-file refactors, advanced
                              workflows
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>Power-user & Train-the-Trainer badging</span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <CheckCircle className='w-5 h-5 text-primary flex-shrink-0' />
                            <span>
                              Activate post-workshop support, alumni network
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Impact Section */}
          <div className='mb-16'>
            <Card className='border-0 shadow-2xl overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-primary/5 to-primary/10'>
                <CardTitle className='text-3xl font-bold text-center flex items-center justify-center gap-3'>
                  <TrendingUp className='w-8 h-8 text-primary' />
                  Impact After Training
                </CardTitle>
                <CardDescription className='text-lg text-center max-w-3xl mx-auto'>
                  Real-world results that transform your development team's
                  capabilities
                </CardDescription>
              </CardHeader>

              <CardContent className='p-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <Card className='text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20'>
                    <CardContent className='p-6'>
                      <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <TrendingUp className='w-8 h-8 text-primary' />
                      </div>
                      <CardTitle className='text-xl mb-2 text-primary'>
                        Up to 36% ↑ Developer Productivity
                      </CardTitle>
                      <CardDescription>
                        Real-world data shows engineers using AI tools like
                        Claude Code deliver faster, shipping more features,
                        saving weeks per quarter.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className='text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20'>
                    <CardContent className='p-6'>
                      <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Shield className='w-8 h-8 text-primary' />
                      </div>
                      <CardTitle className='text-xl mb-2 text-primary'>
                        Fewer Bugs, Higher Quality
                      </CardTitle>
                      <CardDescription>
                        AI-powered reviews, standardized workflows, less
                        firefighting, more stable code.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className='text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20'>
                    <CardContent className='p-6'>
                      <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Zap className='w-8 h-8 text-primary' />
                      </div>
                      <CardTitle className='text-xl mb-2 text-primary'>
                        Faster Onboarding
                      </CardTitle>
                      <CardDescription>
                        New hires reach full speed up to 60% sooner with Claude
                        Code best practices and in-tool help.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>

                <Separator className='my-8' />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <Card className='bg-primary/5 border-primary/20'>
                    <CardHeader>
                      <CardTitle className='text-xl text-primary'>
                        Hard Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <p className='text-2xl font-bold'>$200K+/year</p>
                        <p className='text-muted-foreground'>
                          in productivity gains & avoided rework for a 10-person
                          team
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-primary/5 border-primary/20'>
                    <CardHeader>
                      <CardTitle className='text-xl text-primary'>
                        Multiplier Effect
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground'>
                        Trained engineers become in-house Claude Code champions,
                        spreading value team-wide and ensuring sustained impact.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Training Matters - Comparison */}
          <div className='mb-16'>
            <Card className='border-0 shadow-2xl'>
              <CardHeader>
                <CardTitle className='text-3xl font-bold text-center mb-4'>
                  Why Proper Claude Code Training Matters
                </CardTitle>
                <CardDescription className='text-lg text-center max-w-3xl mx-auto'>
                  Without focused training, even experienced engineers struggle
                  to unlock Claude Code's full value
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Self-Learning Problems */}
                  <div className='space-y-4'>
                    <h3 className='text-xl font-bold text-destructive mb-4'>
                      Self-Learning Challenges
                    </h3>
                    <div className='space-y-3'>
                      {[
                        {
                          title: 'Superficial Usage Only',
                          desc: 'Most just use basic code completion, missing out on advanced features like multi-file refactoring, AI-powered workflows, or real-time collaboration tools.',
                        },
                        {
                          title: 'Workflow Gaps and Inefficiency',
                          desc: 'Key automation tools (Agent Mode, persistent chat tabs, or project rule integration) go undiscovered, meaning teams keep doing tasks manually that Claude Code could automate, slowing down delivery.',
                        },
                        {
                          title: 'Misconfigurations & Security Risks',
                          desc: 'Without best practice setup, privacy controls, or secrets management features, users risk exposing sensitive data or creating inconsistent coding policies across teams.',
                        },
                        {
                          title: 'Missed Productivity Gains',
                          desc: "The real productivity jump (up to 36% uplift) comes only with mastering context-aware prompts, AI debugging, and CI/CD integration, abilities most won't harness without hands-on learning.",
                        },
                        {
                          title: 'Low Confidence and Adoption',
                          desc: "Engineers may get frustrated or distrust AI-powered suggestions because they haven't learned how to guide, audit, and harness them safely and effectively.",
                        },
                      ].map((item, i) => (
                        <Card
                          key={i}
                          className='border-destructive/20 bg-destructive/5'
                        >
                          <CardContent className='p-4'>
                            <h4 className='font-semibold text-destructive mb-1'>
                              {item.title}
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {item.desc}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Professional Training Benefits */}
                  <div className='space-y-4'>
                    <h3 className='text-xl font-bold text-primary mb-4'>
                      With Professional Training
                    </h3>
                    <div className='space-y-3'>
                      {[
                        {
                          title: 'Master Advanced Features',
                          desc: 'Unlock the real productivity jump (up to 36% uplift) comes only with mastering context-aware prompts, AI debugging, and CI/CD integration.',
                        },
                        {
                          title: 'Confidence & Adoption',
                          desc: 'Engineers learn how to guide, audit, and harness AI-powered suggestions safely and effectively.',
                        },
                        {
                          title: 'Security & Best Practices',
                          desc: 'Proper best practice setup, privacy controls, and secrets management features ensure data protection.',
                        },
                        {
                          title: 'Multiplier Effect',
                          desc: 'Trained engineers become in-house Claude Code champions, spreading value team-wide.',
                        },
                      ].map((item, i) => (
                        <Card
                          key={i}
                          className='border-primary/20 bg-primary/5'
                        >
                          <CardContent className='p-4'>
                            <h4 className='font-semibold text-primary mb-1'>
                              {item.title}
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {item.desc}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location & Experience */}
          <div className='mb-16'>
            <Card className='border-0 shadow-2xl overflow-hidden'>
              <CardHeader>
                <CardTitle className='text-3xl font-bold text-center mb-4'>
                  The Location - Mani Peninsula
                </CardTitle>
                <CardDescription className='text-lg text-center max-w-4xl mx-auto'>
                  Mani Peninsula, with its dramatic, untamed landscapes,
                  historic stone towers, and pristine coastline, provides an
                  inspiring backdrop for deep work and creative thinking.
                </CardDescription>
              </CardHeader>

              <CardContent className='p-8'>
                {/* Side-by-side Layout: Slideshow + Content */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
                  {/* Left: Compact Slideshow */}
                  <div>
                    <ImageSlideshow
                      images={[
                        {
                          src: '/images/hotel_ambiance_mustinclude.jpg',
                          alt: 'Kyrimai Hotel Ambiance',
                          label: 'Historic Stone Architecture',
                        },
                        {
                          src: '/images/hotel_pool.JPEG',
                          alt: 'Hotel Pool & Dining Area',
                          label: 'Pool & Mediterranean Dining',
                        },
                        {
                          src: '/images/Kyrimai-Greece-Bedroom.jpg',
                          alt: 'Luxury Hotel Room Interior',
                          label: 'Luxury Accommodation',
                        },
                        {
                          src: '/images/hotel_ambiance_veritcal_pic.jpg',
                          alt: 'Hotel Ambiance & Views',
                          label: 'Breathtaking Sea Views',
                        },
                      ]}
                      autoPlay={true}
                      interval={5000}
                    />
                  </div>

                  {/* Right: Hotel Info & Experiences */}
                  <div className='space-y-8'>
                    {/* Hotel Description */}
                    <div>
                      <h3 className='text-2xl font-bold mb-4'>Kyrimai Hotel</h3>
                      <p className='text-muted-foreground leading-relaxed mb-6'>
                        Kyrimai Hotel, a beautifully restored 19th-century stone
                        complex nestled in the picturesque fishing village of
                        Gerolimenas, offers a stunning seaside location with
                        breathtaking views of Cavo Grosso. It perfectly blends
                        traditional Maniot architecture with modern luxury.
                      </p>

                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='w-4 h-4 text-primary' />
                          <span>Outdoor pool</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='w-4 h-4 text-primary' />
                          <span>Beach access</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='w-4 h-4 text-primary' />
                          <span>Fine dining</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='w-4 h-4 text-primary' />
                          <span>Historic architecture</span>
                        </div>
                      </div>
                    </div>

                    {/* Experiences */}
                    <div>
                      <h4 className='text-xl font-bold mb-4'>
                        Curated Experiences
                      </h4>
                      <div className='space-y-3'>
                        <div className='p-3 border rounded-lg'>
                          <h5 className='font-semibold text-sm mb-1'>
                            Cape Tainaron Hike
                          </h5>
                          <p className='text-xs text-muted-foreground'>
                            Europe's legendary southern tip and historic
                            lighthouse
                          </p>
                        </div>
                        <div className='p-3 border rounded-lg'>
                          <h5 className='font-semibold text-sm mb-1'>
                            Diros Cave Exploration
                          </h5>
                          <p className='text-xs text-muted-foreground'>
                            Boat through underground lakes and crystal chambers
                          </p>
                        </div>
                        <div className='p-3 border rounded-lg'>
                          <h5 className='font-semibold text-sm mb-1'>
                            Olive Harvest & Oil Making
                          </h5>
                          <p className='text-xs text-muted-foreground'>
                            Hands-on harvest in ancient Mani groves
                          </p>
                        </div>
                        <div className='p-3 border rounded-lg'>
                          <h5 className='font-semibold text-sm mb-1'>
                            Beach & Local Dining
                          </h5>
                          <p className='text-xs text-muted-foreground'>
                            Swimming, relaxing, and chef-driven Mani cuisine
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing & Details */}
          <div className='mb-16'>
            <Card className='border-0 shadow-2xl'>
              <CardHeader>
                <CardTitle className='text-3xl font-bold text-center mb-4'>
                  All-Inclusive Offsite Investment
                </CardTitle>
                <CardDescription className='text-lg text-center'>
                  Everything included for a transformative learning experience
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-xl font-bold mb-4'>
                        Package Includes
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {[
                          'Full curriculum',
                          'Luxury room',
                          'Gourmet meals',
                          'All activities',
                          'Post-event support',
                        ].map((item, i) => (
                          <div key={i} className='flex items-center gap-2'>
                            <CheckCircle className='w-4 h-4 text-primary flex-shrink-0' />
                            <span className='text-sm'>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className='text-xl font-bold mb-4'>Schedule</h3>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-primary' />
                          <span>November 9-15, 2025</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-primary' />
                          <span>
                            Kyrimai Hotel, Gerolimenas, Mani Peninsula
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-xl font-bold mb-4'>
                        Investment Options
                      </h3>
                      <div className='space-y-4'>
                        <Card className='border-primary/20 bg-primary/5'>
                          <CardContent className='p-6'>
                            <div className='flex justify-between items-center mb-2'>
                              <span className='font-semibold'>
                                Small Group (up to 5 people)
                              </span>
                              <Badge className='bg-primary text-primary-foreground font-bold text-sm px-3 py-1'>
                                Custom
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              Private, focused offsite for compact teams
                            </p>
                          </CardContent>
                        </Card>

                        <Card className='border-primary/20 bg-primary/5'>
                          <CardContent className='p-6'>
                            <div className='flex justify-between items-center mb-2'>
                              <span className='font-semibold'>
                                Medium Group (6-12 seats)
                              </span>
                              <Badge className='bg-primary text-primary-foreground font-bold text-sm px-3 py-1'>
                                $5,500
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              Maximum personal attention and interaction
                            </p>
                          </CardContent>
                        </Card>

                        <Card className='border-primary/20 bg-primary/5'>
                          <CardContent className='p-6'>
                            <div className='flex justify-between items-center mb-2'>
                              <span className='font-semibold'>
                                Large Group (13-20 seats)
                              </span>
                              <Badge className='bg-foreground text-background font-bold text-sm px-3 py-1'>
                                $3.8k-$4.2k
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              Cost-effective for larger teams
                            </p>
                          </CardContent>
                        </Card>

                        <div className='text-center pt-4'>
                          <p className='text-sm text-muted-foreground mb-4'>
                            * Custom rates for large teams. Airfare not
                            included. Custom Programme for 8+ teams.
                          </p>
                          <Button
                            size='lg'
                            onClick={() => setIsModalOpen(true)}
                          >
                            <Mail className='w-5 h-5 mr-2' />
                            Reserve Your Team's Place
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className='text-center'>
            <Card className='border shadow-lg'>
              <CardContent className='p-12'>
                <div className='space-y-6'>
                  <div>
                    <h2 className='text-2xl font-bold mb-4'>
                      Secure Your Team's Place
                    </h2>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                      Seats are limited. Next event: 2026
                    </p>
                  </div>

                  <div className='flex flex-wrap justify-center gap-4'>
                    <Button size='lg' onClick={() => setIsModalOpen(true)}>
                      <Mail className='w-5 h-5 mr-2' />
                      Contact Vasilis
                    </Button>
                    <Button variant='secondary' size='lg' asChild>
                      <Link href='/workshops'>
                        <ArrowRight className='w-5 h-5 mr-2' />
                        View All Workshops
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultSubject='Workshop Registration Inquiry'
        defaultInquiryType='workshop'
      />
    </div>
  );
}
