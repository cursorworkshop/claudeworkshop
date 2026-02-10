import 'server-only';

import crypto from 'crypto';

import bcrypt from 'bcryptjs';

export const ADMIN_COOKIE_NAME = 'cw_admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

type AdminSessionPayload = {
  username: string;
  issuedAt: number;
  expiresAt: number;
};

let cachedPasswordHash: string | null = null;

const getAdminUsername = () => process.env.ADMIN_USERNAME ?? '';
const getAdminPassword = () => process.env.ADMIN_PASSWORD ?? '';
const getSessionSecret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

const getPasswordHash = () => {
  if (cachedPasswordHash) {
    return cachedPasswordHash;
  }

  const password = getAdminPassword();
  if (!password) {
    return null;
  }

  cachedPasswordHash = password.startsWith('$2')
    ? password
    : bcrypt.hashSync(password, 12);

  return cachedPasswordHash;
};

const encodePayload = (payload: AdminSessionPayload) =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

const signPayload = (data: string) => {
  const secret = getSessionSecret();
  if (!secret) {
    return '';
  }

  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
};

export const createAdminSessionToken = (username: string) => {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('Missing ADMIN_PASSWORD or ADMIN_SESSION_SECRET');
  }

  const issuedAt = Date.now();
  const payload: AdminSessionPayload = {
    username,
    issuedAt,
    expiresAt: issuedAt + SESSION_MAX_AGE_MS,
  };
  const data = encodePayload(payload);
  const signature = signPayload(data);

  return `${data}.${signature}`;
};

export const verifyAdminSessionToken = (token?: string | null) => {
  if (!token) {
    return null;
  }

  const [data, signature] = token.split('.');
  if (!data || !signature) {
    return null;
  }

  const expected = signPayload(data);
  if (!expected || expected.length !== signature.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
  if (!isValid) {
    return null;
  }

  let payload: AdminSessionPayload;
  try {
    const decoded = Buffer.from(data, 'base64url').toString('utf-8');
    payload = JSON.parse(decoded) as AdminSessionPayload;
  } catch {
    return null;
  }

  if (payload.expiresAt < Date.now()) {
    return null;
  }

  if (payload.username !== getAdminUsername()) {
    return null;
  }

  return payload;
};

export const verifyAdminCredentials = async (
  username: string,
  password: string
) => {
  const adminUsername = getAdminUsername();
  const passwordHash = getPasswordHash();

  if (!adminUsername || !passwordHash) {
    return false;
  }

  if (username !== adminUsername) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
};
