import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise Guide to Agentic Development | Claude Workshop',
  description:
    'Download our free guide on how Fortune 100 engineering teams use AI to ship faster. The framework behind our enterprise training programs.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function WhitePaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
