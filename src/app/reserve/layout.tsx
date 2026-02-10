import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reserve Your Spot - Claude Code Engineering Offsite',
  description:
    'Secure your spot at the November 2025 Claude Code Engineering Offsite in Mani Peninsula, Greece. Premium 5-day bootcamp with expert training.',
};

export default function ReserveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
