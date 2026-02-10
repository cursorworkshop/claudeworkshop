export type UTMParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
};

export type PageVisit = {
  path: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
};

export type TrackingSession = {
  id: string;
  startedAt: number;
  referrer?: string | null;
  referrerHost?: string | null;
  utm?: UTMParams;
  landingPath?: string | null;
};

export type AnalyticsSubmission = {
  formType: string;
  name?: string;
  email?: string;
  inquiryType?: string;
  pagePath?: string;
  submittedAt: number;
  totalTimeMs?: number;
};

export type AnalyticsPayload = {
  session: TrackingSession;
  pages: PageVisit[];
  submission: AnalyticsSubmission;
};

export const TRACKING_STORAGE_KEY = 'cw_tracking_v1';

const normalizeValue = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  return value.trim().toLowerCase();
};

export const normalizeUtm = (utm?: UTMParams | null): UTMParams => {
  if (!utm) {
    return {};
  }

  return {
    source: normalizeValue(utm.source),
    medium: normalizeValue(utm.medium),
    campaign: normalizeValue(utm.campaign),
    content: normalizeValue(utm.content),
    term: normalizeValue(utm.term),
    gclid: normalizeValue(utm.gclid),
    fbclid: normalizeValue(utm.fbclid),
    msclkid: normalizeValue(utm.msclkid),
  };
};

export const getReferrerHost = (referrer?: string | null): string | null => {
  if (!referrer) {
    return null;
  }

  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
};

export const inferChannel = (input: {
  referrer?: string | null;
  referrerHost?: string | null;
  utm?: UTMParams | null;
}): string => {
  const utm = normalizeUtm(input.utm);
  const source = utm.source ?? '';
  const medium = utm.medium ?? '';
  const campaign = utm.campaign ?? '';
  const referrerHost =
    input.referrerHost?.toLowerCase() ??
    getReferrerHost(input.referrer)?.toLowerCase() ??
    '';

  const isPaidSearch = ['cpc', 'ppc', 'paid', 'paidsearch'].includes(medium);
  const isPaidSocial = [
    'paid-social',
    'paid_social',
    'paidsocial',
    'social-paid',
    'social_paid',
  ].includes(medium);
  const isEmail = ['email', 'newsletter'].includes(medium);

  if (utm.gclid || (source === 'google' && isPaidSearch)) {
    return 'Google Ads';
  }

  if (utm.msclkid || (source === 'bing' && isPaidSearch)) {
    return 'Bing Ads';
  }

  if (
    source.includes('linkedin') &&
    (isPaidSearch || isPaidSocial || campaign.includes('ads'))
  ) {
    return 'LinkedIn Ads';
  }

  if (source.includes('linkedin')) {
    return 'LinkedIn';
  }

  if (source.includes('facebook') || source.includes('instagram')) {
    return isPaidSocial ? 'Meta Ads' : 'Meta';
  }

  if (source === 'x' || source.includes('twitter')) {
    return isPaidSocial ? 'X Ads' : 'X (Twitter)';
  }

  if (source.includes('tiktok')) {
    return isPaidSocial ? 'TikTok Ads' : 'TikTok';
  }

  if (isEmail) {
    return 'Email';
  }

  // LLM / AI referrers - important to track AI-driven traffic
  if (
    referrerHost.includes('chatgpt.com') ||
    referrerHost.includes('chat.openai.com')
  ) {
    return 'AI (ChatGPT)';
  }

  if (referrerHost.includes('perplexity.ai')) {
    return 'AI (Perplexity)';
  }

  if (referrerHost.includes('claude.ai')) {
    return 'AI (Claude)';
  }

  if (referrerHost.includes('gemini.google.com')) {
    return 'AI (Gemini)';
  }

  if (referrerHost.includes('copilot.microsoft.com')) {
    return 'AI (Copilot)';
  }

  if (referrerHost.includes('you.com')) {
    return 'AI (You.com)';
  }

  if (referrerHost.includes('phind.com')) {
    return 'AI (Phind)';
  }

  if (referrerHost.includes('google.')) {
    return 'Organic Search (Google)';
  }

  if (referrerHost.includes('bing.')) {
    return 'Organic Search (Bing)';
  }

  if (referrerHost.includes('duckduckgo.')) {
    return 'Organic Search (DuckDuckGo)';
  }

  if (referrerHost.includes('yahoo.')) {
    return 'Organic Search (Yahoo)';
  }

  if (!referrerHost) {
    return 'Direct';
  }

  return 'Referral';
};
