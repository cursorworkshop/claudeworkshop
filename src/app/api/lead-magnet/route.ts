export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ status: 'Lead magnet API ready' });
}

export async function POST(request: Request) {
  try {
    const { email, source: customSource } = await request.json();

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check for Resend API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Dynamic import Resend
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    // PDF download URL (public file)
    const downloadUrl =
      'https://claudeworkshop.com/claudeworkshop-enterprise-guide.pdf';

    // Send email with HTML
    const { data, error } = await resend.emails.send({
      from: 'Claude Workshop <info@claudeworkshop.com>',
      to: [email],
      subject: 'The Enterprise Guide to Agentic Development',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #0a0a0a; margin: 0; padding: 0;">
          <div style="max-width: 560px; margin: 0 auto; padding: 32px 20px 48px;">
            
            <h1 style="font-size: 24px; line-height: 32px; font-weight: 700; margin: 0 0 20px;">
              Your Guide is Ready
            </h1>
            
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px; color: #525252;">
              Thank you for downloading The Enterprise Guide to Agentic Development.
            </p>

            <h2 style="font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #0a0a0a;">
              The challenge you're facing
            </h2>
            
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px; color: #525252;">
              Some engineers have fully embraced AI tools. Sometimes too much, shipping code they don't fully understand, introducing subtle bugs that slip through review. Others remain skeptical, refusing to adopt AI at all, falling behind on velocity while their peers accelerate.
            </p>
            
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px; color: #525252;">
              The result? Inconsistent code quality. Unpredictable velocity. Code reviews that either rubber-stamp AI output or reject it outright. And no shared language for when AI assistance is appropriate versus when human judgment is non-negotiable.
            </p>

            <h2 style="font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #0a0a0a;">
              What's inside this guide
            </h2>
            
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px; color: #525252;">
              We introduce the <strong>Delegate, Review, Own</strong> framework: a practical methodology for categorizing every engineering task. Your team will learn which work to fully hand off to AI, which requires human oversight, and which demands complete human ownership. No more guesswork, no more inconsistency.
            </p>

            <h2 style="font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #0a0a0a;">
              Why this works
            </h2>
            
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 24px; color: #525252;">
              We've trained engineering teams at Fortune 100 companies and top EU enterprises using this exact framework. The teams that adopt it report 40-60% faster development cycles. Not by blindly trusting AI, but by knowing exactly when to trust it and when not to. Code quality stays high because everyone operates from the same playbook.
            </p>

            <a href="${downloadUrl}" style="display: inline-block; background-color: #0a0a0a; color: #ffffff; border-radius: 8px; padding: 14px 24px; font-size: 15px; font-weight: 600; text-decoration: none;">
              Download the guide
            </a>

            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;" />

            <p style="font-size: 15px; line-height: 24px; margin: 0 0 8px; color: #0a0a0a;">
              Looking forward to helping your team,
            </p>
            
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 4px; color: #0a0a0a; font-weight: 500;">
              <a href="https://www.linkedin.com/in/rogyr/" style="color: #0a0a0a; text-decoration: underline;">Rogier</a> & <a href="https://www.linkedin.com/in/vasilistsolis/" style="color: #0a0a0a; text-decoration: underline;">Vasilis</a>
            </p>
            
            <p style="font-size: 13px; line-height: 20px; margin: 0 0 20px; color: #737373;">
              Founders, Claude Workshop
            </p>

            <!-- Availability note -->
            <div style="display: inline-flex; align-items: center; gap: 6px; background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 10px;">
              <span style="width: 5px; height: 5px; background-color: #a1a1aa; border-radius: 50%;"></span>
              <span style="font-size: 11px; color: #71717a;">Limited availability this quarter</span>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Also store in Supabase for lead tracking
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email,
            source: customSource || 'white_paper_download',
            created_at: new Date().toISOString(),
          }),
        });
      }
    } catch (e) {
      // Don't fail the request if Supabase storage fails
      console.error('Failed to store lead in Supabase:', e);
    }

    return Response.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Lead magnet API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
