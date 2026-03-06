import { siteConfig } from '@/lib/config';

import { OutreachRecipient } from './types';

// Outreach emails should look like barebones text, but still support hyperlinks (HTML + text fallback).
const SIGNATURE_TEXT = `Cheers,\nRogier & Vasilis`;
const SIGNATURE_HTML = `<p>Cheers,<br />Rogier &amp; Vasilis</p>`;

function sanitizeNamePart(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function getRecipientFirstName(recipient: OutreachRecipient): string {
  const firstName = sanitizeNamePart(recipient.firstName);
  if (firstName) return firstName;

  const fullName = sanitizeNamePart(recipient.name);
  if (!fullName) return '';

  return fullName.split(' ')[0] || '';
}

function renderGreetingText(recipient: OutreachRecipient): string {
  const firstName = getRecipientFirstName(recipient);

  if (!firstName) {
    return '';
  }

  return `${firstName},\n\n`;
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function renderGreetingHtml(recipient: OutreachRecipient): string {
  const firstName = getRecipientFirstName(recipient);
  if (!firstName) return '';
  return `<p>${escapeHtml(firstName)},</p>`;
}

function decodeBasicEntities(value: string) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'");
}

function shortenUrlForText(href: string) {
  const trimmed = String(href || '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
}

function simplifyHrefForText(href: string) {
  const shortHref = shortenUrlForText(href);
  if (!shortHref) return '';

  // For plain-text fallbacks we prefer showing the canonical destination,
  // not our long tracking redirect + per-lead token.
  // Tracking remains intact for the HTML part via the redirect route.
  const lower = shortHref.toLowerCase();
  if (lower.startsWith(`${siteConfig.branding.domain}/r/call`))
    return siteConfig.bookings.callDisplayUrl;
  if (lower.startsWith(`${siteConfig.branding.domain}/r/luma`))
    return siteConfig.bookings.lumaDisplayUrl;

  // Strip query/hash to keep it clean in text emails.
  return shortHref.replace(/[?#].*$/, '');
}

function htmlToText(html: string) {
  let work = html;

  // Plain-text fallback should still contain a clickable URL.
  // Keep it minimal by shortening https://... to domain/path.
  work = work.replace(
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_: string, href: string, inner: string) => {
      const label = decodeBasicEntities(
        inner
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );

      const simplifiedHref = simplifyHrefForText(href);

      if (!label && !simplifiedHref) return '';
      if (!label) return simplifiedHref;
      if (!simplifiedHref) return label;

      // Prefer "Label: destination" for readability in text clients.
      // Avoid long raw URLs / tracking params in the visible body.
      if (label === simplifiedHref) return label;
      return `${label}: ${simplifiedHref}`;
    }
  );

  const withNewlines = work
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<\/h[1-6]\s*>/gi, '\n\n')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<\/ol\s*>/gi, '\n\n')
    .replace(/<\/ul\s*>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ');

  return decodeBasicEntities(withNewlines);
}

function collapseBlankLines(value: string) {
  return value.replace(/\n{3,}/g, '\n\n').trim();
}

function textToHtml(text: string) {
  const normalized = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!normalized) return '';

  const paragraphs = normalized.split(/\n{2,}/g);
  const html = paragraphs
    .map(paragraph => {
      const clean = paragraph.trim();
      if (!clean) return '';
      return `<p>${escapeHtml(clean).replaceAll('\n', '<br />\n')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

export function renderBodyTemplate(
  bodyHtmlOrText: string,
  recipient: OutreachRecipient
): string {
  const raw = typeof bodyHtmlOrText === 'string' ? bodyHtmlOrText : '';
  const token = sanitizeNamePart(recipient.unsubscribeToken);

  // Optional tokens for admin-edited templates.
  const firstName = getRecipientFirstName(recipient);
  const lastName = sanitizeNamePart(recipient.lastName);
  const fullName =
    sanitizeNamePart(recipient.name) ||
    sanitizeNamePart(`${firstName} ${lastName}`.trim());

  if (looksLikeHtml(raw)) {
    let body = raw;
    const greetingHtml = renderGreetingHtml(recipient);
    const hasGreetingToken = body.includes('{{greeting}}');
    body = body.replaceAll('{{greeting}}', greetingHtml);

    body = body.replaceAll('{{email}}', escapeHtml(recipient.email));
    body = body.replaceAll('{{firstName}}', escapeHtml(firstName));
    body = body.replaceAll('{{lastName}}', escapeHtml(lastName));
    body = body.replaceAll('{{name}}', escapeHtml(fullName));
    body = body.replaceAll('{{unsubscribeToken}}', escapeHtml(token));

    if (!hasGreetingToken && greetingHtml) {
      body = `${greetingHtml}\n${body}`;
    }

    return body.trim();
  }

  let text = raw;
  const greetingText = renderGreetingText(recipient);
  const hasGreetingToken = text.includes('{{greeting}}');
  text = text.replaceAll('{{greeting}}', greetingText);

  text = text.replaceAll('{{email}}', recipient.email);
  text = text.replaceAll('{{firstName}}', firstName);
  text = text.replaceAll('{{lastName}}', lastName);
  text = text.replaceAll('{{name}}', fullName);
  text = text.replaceAll('{{unsubscribeToken}}', token);

  if (!hasGreetingToken && greetingText) {
    text = `${greetingText}${text}`;
  }

  return textToHtml(collapseBlankLines(text));
}

function getUnsubscribeUrl(recipient?: OutreachRecipient): string {
  const token =
    typeof recipient?.unsubscribeToken === 'string'
      ? recipient.unsubscribeToken.trim()
      : '';

  if (!token) return '';

  return `${siteConfig.url}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function wrapEmailText(bodyHtml: string, recipient?: OutreachRecipient) {
  const unsubscribeUrl = getUnsubscribeUrl(recipient);
  const bodyText = collapseBlankLines(htmlToText(bodyHtml));
  const parts = [
    bodyText.trim(),
    SIGNATURE_TEXT,
    unsubscribeUrl ? `Unsubscribe\n${unsubscribeUrl}` : '',
  ].filter(Boolean);
  return collapseBlankLines(parts.join('\n\n'));
}

export function wrapEmailHtml(bodyHtml: string, recipient?: OutreachRecipient) {
  const unsubscribeUrl = getUnsubscribeUrl(recipient);
  const unsubscribeHtml = unsubscribeUrl
    ? `<p><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p>`
    : '';

  const content = [bodyHtml.trim(), SIGNATURE_HTML, unsubscribeHtml]
    .filter(Boolean)
    .join('\n\n');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    ${content}
  </body>
</html>`;
}
