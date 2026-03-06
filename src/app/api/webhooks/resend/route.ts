import { NextRequest, NextResponse } from 'next/server';

import { siteConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ResendWebhookEvent = {
  type: string;
  data: {
    email_id: string;
    to?: string[];
    from?: string;
    subject?: string;
    created_at?: string;
  };
};

function parseEmailList(value: string | undefined, fallback: string[]) {
  const emails = String(value || '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  return emails.length > 0 ? emails : fallback;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  const payload = await request.text();

  let event: ResendWebhookEvent;

  if (webhookSecret) {
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing webhook signature headers' },
        { status: 401 }
      );
    }

    // Reject events older than 5 minutes (helps reduce replay risk).
    const timestamp = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 300) {
      return NextResponse.json(
        { error: 'Webhook timestamp too old' },
        { status: 401 }
      );
    }

    try {
      const { Webhook } = await import('svix');
      const wh = new Webhook(webhookSecret);
      event = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ResendWebhookEvent;
    } catch (e) {
      console.error('Invalid Resend webhook signature:', e);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } else {
    try {
      event = JSON.parse(payload) as ResendWebhookEvent;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  }

  const { type, data } = event;
  const resendId = data.email_id;

  if (!resendId) {
    return NextResponse.json({ error: 'Missing email_id' }, { status: 400 });
  }

  // We only use Resend webhooks for inbound email forwarding now.
  if (type !== 'email.received') {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const infoEmail = siteConfig.contact.infoEmail.toLowerCase();
  const forwardRecipients = parseEmailList(
    process.env.REPLY_FORWARD_RECIPIENTS,
    siteConfig.contact.replyForwardRecipients.map(email => email.toLowerCase())
  );

  // Forward inbound replies sent to the main inbox to the founders.
  const recipients = Array.isArray(data.to) ? data.to : [];
  const isToInfo = recipients.some(address =>
    String(address || '')
      .toLowerCase()
      .includes(infoEmail)
  );

  if (!isToInfo) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const from = String(data.from || '').toLowerCase();
  if (forwardRecipients.includes(from) || from === infoEmail) {
    // Avoid accidental forwarding loops if we email the inbox ourselves.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('RESEND_API_KEY not configured for inbound forwarding');
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendKey);
    const { data: forwardData, error: forwardError } =
      await resend.emails.receiving.forward({
        emailId: resendId,
        to: forwardRecipients,
        from: `${siteConfig.title} <${siteConfig.contact.infoEmail}>`,
        passthrough: true,
      });

    if (forwardError) {
      console.error('Failed to forward received email:', forwardError);
      return NextResponse.json(
        { ok: false, error: forwardError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      forwarded: true,
      forwardId: forwardData?.id || null,
    });
  } catch (error) {
    console.error('Inbound forwarding crashed:', error);
    return NextResponse.json(
      { ok: false, error: 'Forwarding failed' },
      { status: 500 }
    );
  }
}
