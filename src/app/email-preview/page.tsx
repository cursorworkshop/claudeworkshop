'use client';

import { useState } from 'react';

import { siteConfig } from '@/lib/config';
import { OUTREACH_STEPS } from '@/lib/outreach-emails';

export default function EmailPreviewPage() {
  const [activeEmail, setActiveEmail] = useState(0);
  const sampleRecipient = {
    email: 'contact@rogyr.com',
    firstName: 'Rogier',
    lastName: 'Muller',
    name: 'Rogier Muller',
  };

  const downloadUrl = `${siteConfig.url}/enterprise-guide-agentic-development.pdf`;

  const tabs = [
    {
      label: 'Day 0: Delivery',
      subject: 'The Enterprise Guide to Agentic Development',
    },
    ...OUTREACH_STEPS.map(s => ({
      label: `Day ${s.dayOffset}: Step ${s.step}`,
      subject: s.subject,
    })),
  ];

  return (
    <div
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '24px 20px 0',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            color: '#737373',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Email preview
        </p>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveEmail(i)}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: activeEmail === i ? 600 : 400,
                backgroundColor: activeEmail === i ? '#0a0a0a' : '#ffffff',
                color: activeEmail === i ? '#ffffff' : '#525252',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '13px', color: '#525252', margin: '12px 0 0' }}>
          Subject: {tabs[activeEmail].subject}
        </p>
      </div>

      {/* Email content */}
      <div
        style={{
          maxWidth: '700px',
          margin: '16px auto 0',
          padding: '0 20px 48px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            overflow: 'hidden',
          }}
        >
          {activeEmail === 0 ? (
            <DeliveryEmail downloadUrl={downloadUrl} />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  OUTREACH_STEPS[activeEmail - 1].renderHtml(sampleRecipient),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DeliveryEmail({ downloadUrl }: { downloadUrl: string }) {
  return (
    <div
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        color: '#0a0a0a',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '32px 20px 48px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: 700,
            margin: '0 0 20px',
          }}
        >
          Your Guide is Ready
        </h1>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 16px',
            color: '#525252',
          }}
        >
          Thank you for downloading The Enterprise Guide to Agentic Development.
        </p>

        <h2
          style={{
            fontSize: '16px',
            fontWeight: 600,
            margin: '24px 0 12px',
            color: '#0a0a0a',
          }}
        >
          The challenge you&apos;re facing
        </h2>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 16px',
            color: '#525252',
          }}
        >
          Some engineers have fully embraced AI tools. Sometimes too much,
          shipping code they don&apos;t fully understand, introducing subtle
          bugs that slip through review. Others remain skeptical, refusing to
          adopt AI at all, falling behind on velocity while their peers
          accelerate.
        </p>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 16px',
            color: '#525252',
          }}
        >
          The result? Inconsistent code quality. Unpredictable velocity. Code
          reviews that either rubber-stamp AI output or reject it outright. And
          no shared language for when AI assistance is appropriate versus when
          human judgment is non-negotiable.
        </p>

        <h2
          style={{
            fontSize: '16px',
            fontWeight: 600,
            margin: '24px 0 12px',
            color: '#0a0a0a',
          }}
        >
          What&apos;s inside this guide
        </h2>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 16px',
            color: '#525252',
          }}
        >
          We introduce the <strong>Delegate, Review, Own</strong> framework: a
          practical methodology for categorizing every engineering task. Your
          team will learn which work to fully hand off to AI, which requires
          human oversight, and which demands complete human ownership. No more
          guesswork, no more inconsistency.
        </p>

        <h2
          style={{
            fontSize: '16px',
            fontWeight: 600,
            margin: '24px 0 12px',
            color: '#0a0a0a',
          }}
        >
          Why this works
        </h2>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 24px',
            color: '#525252',
          }}
        >
          We&apos;ve trained engineering teams at Fortune 100 companies and top
          EU enterprises using this exact framework. The teams that adopt it
          report 40-60% faster development cycles. Not by blindly trusting AI,
          but by knowing exactly when to trust it and when not to. Code quality
          stays high because everyone operates from the same playbook.
        </p>

        <a
          href={downloadUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Download the guide
        </a>

        <hr
          style={{
            margin: '32px 0',
            border: 'none',
            borderTop: '1px solid #e5e5e5',
          }}
        />

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 8px',
            color: '#0a0a0a',
          }}
        >
          Looking forward to helping your team,
        </p>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '24px',
            margin: '0 0 4px',
            color: '#0a0a0a',
            fontWeight: 500,
          }}
        >
          <a
            href='https://www.linkedin.com/in/rogyr/'
            style={{ color: '#0a0a0a', textDecoration: 'underline' }}
          >
            Rogier
          </a>{' '}
          &{' '}
          <a
            href='https://www.linkedin.com/in/vasilistsolis/'
            style={{ color: '#0a0a0a', textDecoration: 'underline' }}
          >
            Vasilis
          </a>
        </p>

        <p
          style={{
            fontSize: '13px',
            lineHeight: '20px',
            margin: '0 0 20px',
            color: '#737373',
          }}
        >
          Founders, Claude Workshop
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '9999px',
            padding: '4px 10px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
            }}
          />
          <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 500 }}>
            Limited training availability this quarter
          </span>
        </div>
      </div>
    </div>
  );
}
