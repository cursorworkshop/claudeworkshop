import { NextRequest, NextResponse } from 'next/server';

import { siteConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_OWNER = 'cursorworkshop';
const DEFAULT_REPO = siteConfig.github.repoName;
const DEFAULT_WORKFLOW_ID = 'research-cycle.yml';
const DEFAULT_REF = 'main';

const githubHeaders = (token: string) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'User-Agent': `${siteConfig.github.repoName}-vercel-cron`,
  'X-GitHub-Api-Version': '2022-11-28',
});

const getConfig = () => {
  const owner = process.env.RESEARCH_GH_OWNER || DEFAULT_OWNER;
  const repo = process.env.RESEARCH_GH_REPO || DEFAULT_REPO;
  const workflowId = process.env.RESEARCH_GH_WORKFLOW_ID || DEFAULT_WORKFLOW_ID;
  const ref = process.env.RESEARCH_GH_REF || DEFAULT_REF;
  const token = process.env.GITHUB_ACTIONS_TRIGGER_TOKEN || '';

  return { owner, repo, workflowId, ref, token };
};

const isAuthorized = (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET || '';
  if (!cronSecret) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return true;

  // Convenience for local/manual testing.
  const url = new URL(request.url);
  return url.searchParams.get('token') === cronSecret;
};

const getActiveRunUrl = async ({
  owner,
  repo,
  workflowId,
  ref,
  token,
}: {
  owner: string;
  repo: string;
  workflowId: string;
  ref: string;
  token: string;
}) => {
  const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?branch=${encodeURIComponent(
    ref
  )}&status=in_progress&per_page=1`;

  const response = await fetch(runsUrl, {
    method: 'GET',
    headers: githubHeaders(token),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    workflow_runs?: Array<{ html_url?: string }>;
  };

  return json.workflow_runs?.[0]?.html_url || null;
};

const dispatchWorkflow = async ({
  owner,
  repo,
  workflowId,
  ref,
  token,
}: {
  owner: string;
  repo: string;
  workflowId: string;
  ref: string;
  token: string;
}) => {
  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;

  const response = await fetch(dispatchUrl, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({ ref }),
    cache: 'no-store',
  });

  return response;
};

const run = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = getConfig();

  if (!config.token) {
    return NextResponse.json(
      {
        error: 'Missing GITHUB_ACTIONS_TRIGGER_TOKEN',
      },
      { status: 500 }
    );
  }

  const activeRunUrl = await getActiveRunUrl(config);
  if (activeRunUrl) {
    return NextResponse.json(
      {
        ok: true,
        status: 'skipped',
        reason: 'research cycle already running',
        active_run_url: activeRunUrl,
      },
      { status: 202 }
    );
  }

  const dispatchResponse = await dispatchWorkflow(config);
  if (!dispatchResponse.ok) {
    const details = await dispatchResponse.text();
    return NextResponse.json(
      {
        error: 'Failed to dispatch GitHub workflow',
        details,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: 'queued',
      repository: `${config.owner}/${config.repo}`,
      workflow: config.workflowId,
      ref: config.ref,
      triggered_at: new Date().toISOString(),
    },
    { status: 202 }
  );
};

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
