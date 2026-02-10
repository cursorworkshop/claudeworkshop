import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservation Confirmed - Claude Code Engineering Offsite',
  description:
    'Your reservation for the November 2025 Claude Code Engineering Offsite has been confirmed. Thank you for securing your spot!',
};

export default function ReserveSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
