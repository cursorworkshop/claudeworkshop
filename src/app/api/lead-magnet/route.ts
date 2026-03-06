export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAILERLITE_LEADS_GROUP_ID = '179658323762612095';

function sanitizeText(value: unknown, maxLength = 80): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function composeFullName(firstName: string, lastName: string): string | null {
  const full = `${firstName} ${lastName}`.trim();
  return full || null;
}

export async function GET() {
  return Response.json({ status: 'Lead magnet API ready' });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      email?: unknown;
      source?: unknown;
      firstName?: unknown;
      lastName?: unknown;
    };

    const email = sanitizeText(payload.email, 200).toLowerCase();
    const customSource = sanitizeText(payload.source, 120);
    const firstName = sanitizeText(payload.firstName);
    const lastName = sanitizeText(payload.lastName);
    const fullName = composeFullName(firstName, lastName);

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 1. Add to MailerLite "Leads" group (triggers automation for all emails)
    const mlKey = process.env.MAILERLITE_API_KEY;
    if (!mlKey) {
      console.error('MAILERLITE_API_KEY not configured');
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const mlRes = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fields: {
            name: firstName || undefined,
            last_name: lastName || undefined,
          },
          groups: [MAILERLITE_LEADS_GROUP_ID],
          status: 'active',
        }),
      }
    );

    if (!mlRes.ok) {
      const err = await mlRes.text();
      console.error('MailerLite error:', err);
      return Response.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // 2. Save to Supabase for analytics (fire-and-forget)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const existing = await supabase
          .from('leads')
          .select('id')
          .eq('email', email)
          .limit(1)
          .maybeSingle();

        if (!existing.data?.id) {
          await fetch(`${supabaseUrl}/rest/v1/leads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              email,
              name: fullName,
              first_name: firstName || null,
              last_name: lastName || null,
              source: customSource || 'white_paper_download',
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }),
          });
        }
      }
    } catch (storageError) {
      console.error('Failed to store lead in Supabase:', storageError);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Lead magnet API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
