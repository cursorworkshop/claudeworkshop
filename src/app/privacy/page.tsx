import { Shield, Eye, Database, Users, Mail, Calendar } from 'lucide-react';
import { Metadata } from 'next';

import { PrivacyContactForm } from '@/components/PrivacyContactForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy - Claude Workshops',
  description:
    'Privacy policy for Claude Workshops - how we collect, use, and protect your personal information.',
};

const privacySections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: [
      'Personal information you provide when registering for workshops (name, email, company)',
      'Event attendance and participation data',
      'Communication preferences and feedback',
      'Website usage analytics and cookies',
    ],
  },
  {
    icon: Users,
    title: 'How We Use Your Information',
    content: [
      'To organize and manage workshop events',
      'To communicate about upcoming events and opportunities',
      'To improve our services and workshop content',
      'To provide customer support and respond to inquiries',
    ],
  },
  {
    icon: Shield,
    title: 'Data Protection',
    content: [
      'We implement appropriate security measures to protect your data',
      'We do not sell or share your personal information with third parties',
      'We retain your information only as long as necessary for our services',
      'You have the right to access, update, or delete your personal information',
    ],
  },
  {
    icon: Eye,
    title: 'Your Rights',
    content: [
      'Access your personal data we hold about you',
      'Request correction of inaccurate information',
      'Request deletion of your personal data',
      'Opt-out of marketing communications at any time',
    ],
  },
];

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'For privacy-related questions or requests',
    contact: 'privacy@claudeworkshop.com',
  },
  {
    icon: Calendar,
    title: 'Response Time',
    description: 'We respond to privacy requests within 30 days',
    contact: 'Standard processing time',
  },
];

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='section-padding bg-background'>
        <div className='max-w-4xl mx-auto container-padding'>
          <div className='text-center space-y-6'>
            <Badge variant='secondary' className='text-sm font-medium'>
              Privacy Policy
            </Badge>

            <h1 className='text-4xl lg:text-5xl font-bold leading-tight'>
              <span className='text-foreground'>Your Privacy</span>
              <br />
              <span className='text-muted-foreground'>Our Commitment</span>
            </h1>

            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              We are committed to protecting your privacy and being transparent
              about how we collect, use, and protect your personal information.
            </p>

            <div className='flex flex-wrap justify-center gap-4 pt-4'>
              <Badge
                variant='outline'
                className='flex items-center space-x-2 p-2'
              >
                <Shield className='w-4 h-4 text-muted-foreground' />
                <span className='font-semibold'>GDPR Compliant</span>
              </Badge>
              <Badge
                variant='outline'
                className='flex items-center space-x-2 p-2'
              >
                <Eye className='w-4 h-4 text-muted-foreground' />
                <span className='font-semibold'>Transparent</span>
              </Badge>
              <Badge
                variant='outline'
                className='flex items-center space-x-2 p-2'
              >
                <Database className='w-4 h-4 text-muted-foreground' />
                <span className='font-semibold'>Secure</span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className='section-padding bg-background'>
        <div className='max-w-4xl mx-auto container-padding'>
          <div className='space-y-12'>
            {/* Introduction */}
            <div className='prose prose-lg max-w-none'>
              <h2 className='text-2xl font-bold text-foreground mb-4'>
                Introduction
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                This Privacy Policy describes how Claude Workshops ("we," "our,"
                or "us") collects, uses, and protects your personal information
                when you visit our website, register for workshops, or interact
                with our services. By using our services, you agree to the
                collection and use of information in accordance with this
                policy.
              </p>
            </div>

            <Separator />

            {/* Privacy Sections */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {privacySections.map((section, index) => (
                <Card
                  key={index}
                  className='group hover:shadow-lg transition-all duration-300'
                >
                  <CardHeader>
                    <div className='flex items-center space-x-3 mb-4'>
                      <div className='w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-300'>
                        <section.icon className='w-5 h-5 text-foreground' />
                      </div>
                      <CardTitle className='text-xl'>{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {section.content.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className='flex items-start space-x-2 text-sm'
                        >
                          <span className='text-muted-foreground mt-1'>•</span>
                          <span className='text-muted-foreground'>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Cookies and Analytics */}
            <div className='prose prose-lg max-w-none'>
              <h2 className='text-2xl font-bold text-foreground mb-4'>
                Cookies and Analytics
              </h2>
              <p className='text-muted-foreground leading-relaxed mb-4'>
                We use cookies and similar technologies to enhance your
                experience on our website. These technologies help us:
              </p>
              <ul className='list-disc list-inside space-y-2 text-muted-foreground'>
                <li>Understand how visitors use our website</li>
                <li>Remember your preferences and settings</li>
                <li>Improve website performance and functionality</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p className='text-muted-foreground leading-relaxed mt-4'>
                You can control cookie settings through your browser
                preferences. Note that disabling cookies may affect the
                functionality of our website.
              </p>
            </div>

            <Separator />

            {/* Third-Party Services */}
            <div className='prose prose-lg max-w-none'>
              <h2 className='text-2xl font-bold text-foreground mb-4'>
                Third-Party Services
              </h2>
              <p className='text-muted-foreground leading-relaxed mb-4'>
                We may use third-party services to enhance our website and
                services. These services have their own privacy policies:
              </p>
              <ul className='list-disc list-inside space-y-2 text-muted-foreground'>
                <li>
                  <strong>Analytics:</strong> We use analytics tools to
                  understand website usage
                </li>
                <li>
                  <strong>Email Services:</strong> We use email services to
                  communicate with you
                </li>
                <li>
                  <strong>Event Management:</strong> We use platforms like Lu.ma
                  for event registration
                </li>
                <li>
                  <strong>Social Media:</strong> We may integrate social media
                  features
                </li>
              </ul>
            </div>

            <Separator />

            {/* Data Retention */}
            <div className='prose prose-lg max-w-none'>
              <h2 className='text-2xl font-bold text-foreground mb-4'>
                Data Retention
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                We retain your personal information only for as long as
                necessary to fulfill the purposes outlined in this Privacy
                Policy, unless a longer retention period is required or
                permitted by law. When we no longer need your personal
                information, we will securely delete or anonymize it.
              </p>
            </div>

            <Separator />

            {/* Updates to Policy */}
            <div className='prose prose-lg max-w-none'>
              <h2 className='text-2xl font-bold text-foreground mb-4'>
                Updates to This Policy
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date. We encourage you
                to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className='space-y-8'>
              <div className='text-center'>
                <h2 className='text-2xl font-bold text-foreground mb-4'>
                  Contact Us About Privacy
                </h2>
                <p className='text-muted-foreground max-w-2xl mx-auto'>
                  Have questions about our privacy practices or need to exercise
                  your data rights? Use the form below to send us a
                  privacy-related inquiry.
                </p>
              </div>

              <PrivacyContactForm />

              {/* Additional Contact Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                {contactInfo.map((info, index) => (
                  <Card key={index} className='text-center'>
                    <CardHeader>
                      <div className='w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4'>
                        <info.icon className='w-6 h-6 text-foreground' />
                      </div>
                      <CardTitle className='text-lg'>{info.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground mb-2'>
                        {info.description}
                      </p>
                      <p className='font-medium text-foreground'>
                        {info.contact}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className='text-center pt-8'>
              <p className='text-sm text-muted-foreground'>
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
