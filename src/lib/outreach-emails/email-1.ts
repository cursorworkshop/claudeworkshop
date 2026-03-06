import { siteConfig } from '@/lib/config';

import { OutreachStep } from './types';
import { renderBodyTemplate, wrapEmailHtml } from './shared';

const CALL_LINK = `${siteConfig.url}/r/call?t={{unsubscribeToken}}&amp;s=1`;

const BODY = `
{{greeting}}

<p>You downloaded our Enterprise Guide to Agentic Development.</p>

<p>
  Most teams run into the same split fast: one group ships AI-assisted code with
  weak review, another group avoids AI entirely. The result is inconsistent
  quality, unpredictable velocity, and a lot of arguing about \"what good looks
  like.\"
</p>

<p>
  The fix is rarely better prompting. It's an operating model. We use a simple
  frame: Delegate / Review / Own (DRO). Most of the leverage sits in Review:
  AI drafts the work, humans make the shipping decisions.
</p>

<p>
  When teams adopt DRO with clear guardrails, we commonly see 40-60% faster
  development cycles within the first month, with fewer \"mystery regressions\"
  showing up in review.
</p>

<p>
  If you want help rolling this out, we run a single engagement that combines
  training + implementation support (guardrails, review checks, and workflow
  changes your team can actually stick to).
</p>

<p>If that's relevant, <a href="${CALL_LINK}">${siteConfig.bookings.callDisplayUrl}</a>.</p>
`;

export const OUTREACH_EMAIL_1: OutreachStep = {
  step: 1,
  dayOffset: 2,
  subject: 'Quick follow-up on the guide',
  bodyHtml: BODY,
  renderHtml: recipient =>
    wrapEmailHtml(renderBodyTemplate(BODY, recipient), recipient),
};
