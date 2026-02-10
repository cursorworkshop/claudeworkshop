import { NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminCredentials,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LoginPayload = {
  username?: string;
  password?: string;
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

const loginAttempts = new Map<
  string,
  { count: number; firstAttemptAt: number; blockedUntil?: number }
>();

const getClientIp = (request: NextRequest) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
};

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 0, firstAttemptAt: now });
    return { allowed: true };
  }

  return { allowed: true };
};

const recordAttempt = (ip: string) => {
  const now = Date.now();
  const entry = loginAttempts.get(ip) ?? {
    count: 0,
    firstAttemptAt: now,
  };

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
  }

  loginAttempts.set(ip, entry);
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        {
          status: 429,
          headers: rateLimit.retryAfter
            ? { 'Retry-After': rateLimit.retryAfter.toString() }
            : undefined,
        }
      );
    }

    const body = (await request.json()) as LoginPayload;
    const username = body?.username?.trim() ?? '';
    const password = body?.password ?? '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      recordAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    loginAttempts.delete(ip);

    const token = createAdminSessionToken(username);
    const response = NextResponse.json({ ok: true }, { status: 200 });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
