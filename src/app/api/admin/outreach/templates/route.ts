import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { OUTREACH_STEPS } from '@/lib/outreach-emails';
import {
  renderBodyTemplate,
  wrapEmailHtml,
  wrapEmailText,
} from '@/lib/outreach-emails/shared';
import {
  getOutreachTemplateOverrides,
  resetOutreachTemplateOverride,
  setOutreachTemplateOverride,
} from '@/lib/outreach-template-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function textToSnippet(text: string, maxLength = 220): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function stripFooterForSnippet(fullText: string) {
  // Keep the snippet focused on the body, not the signature/unsubscribe line.
  const marker = '\n\nCheers,';
  const idx = fullText.indexOf(marker);
  const body = idx === -1 ? fullText : fullText.slice(0, idx);
  // Snippets should read like body copy. Strip any plain-text URL remnants.
  return body
    .replace(
      /\s*\((https?:\/\/[^\s)]+|[a-z0-9.-]+\.[a-z]{2,}\/[^\s)]+)\)/gi,
      ''
    )
    .replace(/\bhttps?:\/\/\S+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sampleRecipient = {
    // Use placeholders so previews/snippets don't look like we're addressing Rogier.
    email: 'first.last@company.com',
    firstName: '{FirstName}',
    lastName: '{LastName}',
    name: '{FirstName} {LastName}',
    unsubscribeToken: '00000000-0000-0000-0000-000000000000',
  };

  const overrides = await getOutreachTemplateOverrides();

  const templates = OUTREACH_STEPS.map(step => {
    const override = overrides[step.step];
    const subject = override?.subject || step.subject;
    const bodyHtml = override?.bodyHtml || step.bodyHtml;

    const renderedBody = renderBodyTemplate(bodyHtml, sampleRecipient);
    const previewText = wrapEmailText(renderedBody, sampleRecipient);
    const html = wrapEmailHtml(renderedBody, sampleRecipient);
    return {
      step: step.step,
      dayOffset: step.dayOffset,
      subject,
      snippet: textToSnippet(stripFooterForSnippet(previewText)),
      previewText,
      previewHtml: html,
      bodyHtml,
      isOverride: Boolean(override),
    };
  });

  return NextResponse.json({ templates });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      step?: unknown;
      subject?: unknown;
      bodyHtml?: unknown;
      reset?: unknown;
    };

    const step =
      typeof payload.step === 'number' && Number.isFinite(payload.step)
        ? payload.step
        : Number(payload.step);
    const reset = payload.reset === true;

    if (!Number.isFinite(step) || step <= 0) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    if (!OUTREACH_STEPS.some(item => item.step === step)) {
      return NextResponse.json({ error: 'Unknown step' }, { status: 400 });
    }

    if (reset) {
      await resetOutreachTemplateOverride(step);
      return NextResponse.json({ ok: true, reset: true });
    }

    const subject =
      typeof payload.subject === 'string' ? payload.subject.trim() : '';
    const bodyHtml =
      typeof payload.bodyHtml === 'string' ? payload.bodyHtml.trim() : '';

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (subject.length > 160) {
      return NextResponse.json(
        { error: 'Subject is too long (max 160 chars)' },
        { status: 400 }
      );
    }

    if (!bodyHtml) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    if (bodyHtml.length > 20000) {
      return NextResponse.json(
        { error: 'Body is too long (max 20,000 chars)' },
        { status: 400 }
      );
    }

    await setOutreachTemplateOverride(step, { subject, bodyHtml });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update outreach template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
