import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { listAdminAuditEvents } from '@/lib/admin-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before');
  const limitParam = Number(searchParams.get('limit') || '50');
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 200)
    : 50;

  const result = await listAdminAuditEvents({
    before: before || null,
    limit,
  });

  if (result.error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    events: result.rows,
    nextCursor: result.nextCursor,
  });
}
