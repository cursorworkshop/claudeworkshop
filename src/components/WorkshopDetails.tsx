import {
  Calendar,
  Clock,
  Users,
  Award,
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
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkshopDetails() {
  return (
    <div className='space-y-8'>
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Workshop Overview</CardTitle>
          <CardDescription>
            This isn't just another offsite, your engineers will master Claude
            Code through hands-on, expert-guided training while experiencing
            curated leisure activities.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card className='border-dashed'>
              <CardContent className='p-4 text-center'>
                <Code className='w-8 h-8 text-primary mx-auto mb-2' />
                <CardTitle className='text-sm mb-1'>
                  Master Claude Code
                </CardTitle>
                <CardDescription className='text-xs'>
                  Expert-guided training
                </CardDescription>
              </CardContent>
            </Card>
            <Card className='border-dashed'>
              <CardContent className='p-4 text-center'>
                <Users className='w-8 h-8 text-primary mx-auto mb-2' />
                <CardTitle className='text-sm mb-1'>Curated Leisure</CardTitle>
                <CardDescription className='text-xs'>
                  Recharge & connect
                </CardDescription>
              </CardContent>
            </Card>
            <Card className='border-dashed'>
              <CardContent className='p-4 text-center'>
                <Target className='w-8 h-8 text-primary mx-auto mb-2' />
                <CardTitle className='text-sm mb-1'>Perfect Balance</CardTitle>
                <CardDescription className='text-xs'>
                  Technical + relaxation
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 5-Day Structure */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl flex items-center gap-2'>
            <Calendar className='w-6 h-6' />
            5-Day Sprint Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='day0' className='w-full'>
            <TabsList className='grid w-full grid-cols-6'>
              <TabsTrigger value='day0'>Day 0</TabsTrigger>
              <TabsTrigger value='day1'>Day 1</TabsTrigger>
              <TabsTrigger value='day2'>Day 2</TabsTrigger>
              <TabsTrigger value='day3'>Day 3</TabsTrigger>
              <TabsTrigger value='day4'>Day 4</TabsTrigger>
              <TabsTrigger value='day5'>Day 5</TabsTrigger>
            </TabsList>

            <TabsContent value='day0' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Settings className='w-5 h-5' />
                    Day 0 - Prep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      .claude/rules, ignore, privacy, time-tracking setup
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Pre-survey, repo access, KPIs baseline
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Metrics baseline & onboarding
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='day1' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BookOpen className='w-5 h-5' />
                    Day 1 - Claude Code Fundamentals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      IDE mastery (VS Code AI interface, "Tab" cross-file
                      completion)
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Prompt design for targeted edits & refactoring
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Repo best practices, privacy, org customizations
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='day2' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Zap className='w-5 h-5' />
                    Day 2 - Automated Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Orchestrate multi-tool workflows
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Claude Code Agent Mode for CI/CD, multi-file changes
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Real-time pipeline edits, error handling, YAML generation
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='day3' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='w-5 h-5' />
                    Day 3 - Collaboration & Scaling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Pair-programming with live AI
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Shared context, Claude Code Control Plane, chat-based
                      reviews
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Secrets scanning/integration, session security
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='day4' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='w-5 h-5' />
                    Day 4 - Ship & Harden
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      AI debugging, performance tuning (model logs, MCP
                      optimizations)
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Automated rollback/rollout flows
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Demo resilient CI/CD, connect to Grafana monitoring
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='day5' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Award className='w-5 h-5' />
                    Day 5 - Capstone & Badging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Team demos: live cross-file refactors, advanced workflows
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Power-user & Train-the-Trainer badging
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-primary' />
                      Activate post-workshop support, alumni network
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Impact Section */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl flex items-center gap-2'>
            <TrendingUp className='w-6 h-6' />
            Impact After Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className='border-dashed'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5 text-primary' />
                  Up to 36% ↑ Developer Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-world data shows engineers using AI tools like Claude
                  Code deliver faster, shipping more features, saving weeks per
                  quarter.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-dashed'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Shield className='w-5 h-5 text-primary' />
                  Fewer Bugs, Higher Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered reviews, standardized workflows, less firefighting,
                  more stable code.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-dashed'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Zap className='w-5 h-5 text-primary' />
                  Faster Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  New hires reach full speed up to 60% sooner with Claude Code
                  best practices and in-tool help.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-dashed'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Target className='w-5 h-5 text-primary' />
                  Hard Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  For a 10-person team: $200K+/year in productivity gains &
                  avoided rework.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            The Location - Mani Peninsula
          </CardTitle>
          <CardDescription>
            Mani Peninsula, with its dramatic, untamed landscapes, historic
            stone towers, and pristine coastline, provides an inspiring and
            stimulating backdrop for deep work and creative thinking.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <CardTitle className='text-lg mb-3'>The Venue</CardTitle>
            <CardDescription>
              Kyrimai Hotel, a beautifully restored 19th-century stone complex
              nestled in the picturesque fishing village of Gerolimenas, offers
              a stunning seaside location with breathtaking views of Cavo
              Grosso. It perfectly blends traditional Maniot architecture with
              modern luxury. Highlights include an outdoor pool, direct beach
              access, and a renowned restaurant and bars.
            </CardDescription>
          </div>

          <Separator />

          <div>
            <CardTitle className='text-lg mb-3'>
              Curated Leisure & Experience
            </CardTitle>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4 text-primary' />
                  Cape Tainaron Hike
                </h4>
                <p className='text-sm text-muted-foreground pl-6'>
                  Walk to Europe's legendary southern tip and historic
                  lighthouse, the mythic "Gate to Hades."
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4 text-primary' />
                  Diros Cave Exploration
                </h4>
                <p className='text-sm text-muted-foreground pl-6'>
                  Take a boat through shimmering underground lakes and crystal
                  chambers.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4 text-primary' />
                  Olive Gathering & Oil Making
                </h4>
                <p className='text-sm text-muted-foreground pl-6'>
                  Hands-on harvest and pressing in ancient Mani groves,
                  authentic, social, and grounding.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4 text-primary' />
                  Beach, Pool, and Local Dining
                </h4>
                <p className='text-sm text-muted-foreground pl-6'>
                  Free time for swimming, relaxing, and savouring chef-driven
                  Mani cuisine together.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All-Inclusive Details */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>All-Inclusive Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <h4 className='font-medium mb-2'>Dates</h4>
                <p className='text-sm text-muted-foreground'>
                  Late October 2025
                </p>
              </div>
              <div>
                <h4 className='font-medium mb-2'>Package Includes</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Full curriculum</li>
                  <li>• Luxury room accommodation</li>
                  <li>• Gourmet meals</li>
                  <li>• All activities</li>
                  <li>• Post-event support</li>
                </ul>
              </div>
            </div>
            <div className='space-y-4'>
              <div>
                <h4 className='font-medium mb-2'>Investment</h4>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center p-3 bg-muted rounded-md'>
                    <span className='text-sm'>10-12 seats</span>
                    <Badge variant='outline'>$5,500/participant</Badge>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-muted rounded-md'>
                    <span className='text-sm'>16-20 seats</span>
                    <Badge variant='outline'>$3,800-$4,200/participant</Badge>
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    * Custom rates for large teams. Airfare not included.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Training Matters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            Why Proper Claude Code Training Matters
          </CardTitle>
          <CardDescription>
            Without focused training, even experienced engineers struggle to
            unlock Claude Code's full value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <CardTitle className='text-lg text-destructive'>
                What Typically Happens (Self-Learning)
              </CardTitle>
              <div className='space-y-3'>
                <div className='p-3 bg-destructive/5 border border-destructive/20 rounded-md'>
                  <h4 className='font-medium text-sm text-destructive mb-1'>
                    Superficial Usage Only
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Most just use basic code completion, missing advanced
                    features like multi-file refactoring.
                  </p>
                </div>
                <div className='p-3 bg-destructive/5 border border-destructive/20 rounded-md'>
                  <h4 className='font-medium text-sm text-destructive mb-1'>
                    Workflow Gaps and Inefficiency
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Key automation tools go undiscovered, meaning teams keep
                    doing tasks manually.
                  </p>
                </div>
                <div className='p-3 bg-destructive/5 border border-destructive/20 rounded-md'>
                  <h4 className='font-medium text-sm text-destructive mb-1'>
                    Security Risks
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Without best practice setup, users risk exposing sensitive
                    data.
                  </p>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <CardTitle className='text-lg text-primary'>
                With Professional Training
              </CardTitle>
              <div className='space-y-3'>
                <div className='p-3 bg-primary/5 border border-primary/20 rounded-md'>
                  <h4 className='font-medium text-sm text-primary mb-1'>
                    Master Advanced Features
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Unlock the real productivity jump (up to 36% uplift) with
                    context-aware prompts.
                  </p>
                </div>
                <div className='p-3 bg-primary/5 border border-primary/20 rounded-md'>
                  <h4 className='font-medium text-sm text-primary mb-1'>
                    Confidence and Adoption
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Learn how to guide, audit, and harness AI suggestions safely
                    and effectively.
                  </p>
                </div>
                <div className='p-3 bg-primary/5 border border-primary/20 rounded-md'>
                  <h4 className='font-medium text-sm text-primary mb-1'>
                    Multiplier Effect
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Trained engineers become in-house Claude Code champions,
                    spreading value team-wide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
