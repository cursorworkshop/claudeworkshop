import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type LeadMagnetEmailProps = {
  downloadUrl: string;
};

const main = {
  backgroundColor: '#ffffff',
  color: '#0a0a0a',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
};

const container = {
  margin: '0 auto',
  padding: '24px 20px 40px',
  maxWidth: '560px',
};

const h1 = {
  fontSize: '22px',
  lineHeight: '30px',
  fontWeight: 700,
  margin: '18px 0 10px',
};

const p = {
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 14px',
  color: '#525252',
};

const button = {
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
};

const subtle = {
  fontSize: '12px',
  lineHeight: '18px',
  margin: '14px 0 0',
  color: '#737373',
};

export function LeadMagnetEmail({ downloadUrl }: LeadMagnetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Agentic Coding Cheatsheet is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={h1}>Your Agentic Coding Cheatsheet is ready</Text>
            <Text style={p}>
              Thanks for your interest in Claude Workshop. Click below to
              download the PDF.
            </Text>
          </Section>

          <Section style={{ marginTop: '18px' }}>
            <Button href={downloadUrl} style={button}>
              Download the cheatsheet
            </Button>
          </Section>

          <Hr style={{ margin: '24px 0', borderColor: '#e5e5e5' }} />

          <Text style={subtle}>
            If the button does not work, copy and paste this link into your
            browser:{' '}
            <Link href={downloadUrl} style={{ color: '#0a0a0a' }}>
              {downloadUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
