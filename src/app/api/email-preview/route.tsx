import { render } from '@react-email/components';

import { LeadMagnetEmail } from '@/components/emails/LeadMagnetEmail';

export async function GET() {
  const html = await render(
    LeadMagnetEmail({
      downloadUrl: 'https://claudeworkshop.com/agentic-coding-cheatsheet.pdf',
    })
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
