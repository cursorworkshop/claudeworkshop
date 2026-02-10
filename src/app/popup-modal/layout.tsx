import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Popup Modal Test',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PopupModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
