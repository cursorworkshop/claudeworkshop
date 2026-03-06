import { siteConfig } from '@/lib/config';

import { OutreachStep } from './types';
import { renderBodyTemplate, wrapEmailHtml } from './shared';

const CALL_LINK = `${siteConfig.url}/r/call?t={{unsubscribeToken}}&amp;s=2`;

const BODY = `
{{greeting}}

<p>When we say we help teams \"roll out AI,\" we don't mean a tool demo.</p>

<p>
  We package it as one engagement: training + implementation, so you end up
  with an operating model your team can run without us.
</p>

<p>
  Deliverables (intentionally boring):<br />
  - A DRO-based policy: what can be delegated, what must be reviewed, what must be owned<br />
  - Review guardrails: checklists, testing rules, and \"no-go\" areas (security, secrets, etc.)<br />
  - Workflow changes: PR templates, agent task breakdown patterns, and a measurable quality bar
</p>

<p>
  Teams like this because it removes ambiguity: engineers can move fast with AI
  without turning code review into a debate club.
</p>

<p>
  If you want to sanity-check whether this fits your org, <a href="${CALL_LINK}">${siteConfig.bookings.callDisplayUrl}</a>.
</p>
`;

export const OUTREACH_EMAIL_2: OutreachStep = {
  step: 2,
  // Cadence: send Step 2 N days after Step 1 was sent.
  dayOffset: 3,
  subject: 'What rollout support actually means',
  bodyHtml: BODY,
  renderHtml: recipient =>
    wrapEmailHtml(renderBodyTemplate(BODY, recipient), recipient),
};
