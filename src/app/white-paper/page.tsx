import { notFound } from 'next/navigation';

import { WhitePaperLanding } from '@/components/WhitePaperLanding';
import { siteConfig } from '@/lib/config';

export default function WhitePaperPage() {
  if (!siteConfig.branding.leadMagnetEnabled) {
    notFound();
  }

  return <WhitePaperLanding />;
}
