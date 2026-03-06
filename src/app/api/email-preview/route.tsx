import { render } from '@react-email/components';

import { LeadMagnetEmail } from '@/components/emails/LeadMagnetEmail';
import { siteConfig } from '@/lib/config';

export async function GET() {
  const html = await render(
    LeadMagnetEmail({
      downloadUrl: `${siteConfig.url}/agentic-coding-cheatsheet.pdf`,
    })
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
