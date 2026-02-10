import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | Claude Workshop',
  description:
    'Thank you for contacting Claude Workshop. We will get back to you shortly.',
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
