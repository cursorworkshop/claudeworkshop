import { siteConfig } from '@/lib/config';

import { OutreachStep } from './types';
import { renderBodyTemplate, wrapEmailHtml } from './shared';

const CALL_LINK = `${siteConfig.url}/r/call?t={{unsubscribeToken}}&amp;s=3`;
const LUMA_LINK = `${siteConfig.url}/r/luma?t={{unsubscribeToken}}&amp;s=3`;

const BODY = `
{{greeting}}

<p>Two quick questions:</p>

<p>
  1) Where does your rollout break today: quality, review, security, velocity,
  or buy-in?
</p>

<p>
  2) Do you already have a written standard for AI-assisted work (what can be
  delegated, what must be reviewed, what must be owned), or is it still ad hoc?
</p>

<p>
  If it's easier, reply with one word: quality, review, security, velocity,
  buy-in.
</p>

<p>
  The reason I'm asking: the teams that get consistent wins are the ones that
  turn “review” into a system, not a vibe (PR checks, test rules, “no-go” areas,
  and a shared bar for what gets shipped).
</p>

<p>
  If you want to talk, <a href="${CALL_LINK}">${siteConfig.bookings.callDisplayUrl}</a>.
</p>

<p>
  PS. If your team is using a mixed stack or moving toward terminal-first agent
  workflows, we can support that transition professionally. Rogier also hosts
  events for these communities globally: <a href="${LUMA_LINK}">${siteConfig.bookings.lumaDisplayUrl}</a>.
</p>

<p>
  We help teams move to terminal-based agentic engineering while keeping review
  standards and quality bars intact.
</p>
`;

export const OUTREACH_EMAIL_3: OutreachStep = {
  step: 3,
  // Cadence: send Step 3 N days after Step 2 was sent.
  dayOffset: 5,
  subject: 'Quick question on your team’s rollout',
  bodyHtml: BODY,
  renderHtml: recipient =>
    wrapEmailHtml(renderBodyTemplate(BODY, recipient), recipient),
};
