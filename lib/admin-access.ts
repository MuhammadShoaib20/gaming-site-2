import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getAdminPath } from '@/lib/admin-path';

const ACCESS_COOKIE = 'admin_access_key';
const ACCESS_DURATION_SECONDS = 24 * 60 * 60;

function getAccessKey(): string | null {
  const key = process.env.ADMIN_ACCESS_KEY;
  return key && /^\d{8}$/.test(key) ? key : null;
}

function getSigningSecret(): string | null {
  return process.env.NEXTAUTH_SECRET || null;
}

function signExpiry(expiresAt: string, accessKey: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`admin-access:${getAdminPath()}:${expiresAt}:${accessKey}`)
    .digest('hex');
}

export async function hasAdminAccess(): Promise<boolean> {
  const accessKey = getAccessKey();
  const secret = getSigningSecret();
  if (!accessKey || !secret) return false;

  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return false;

  const [expiresAt, signature, extra] = token.split('.');
  if (
    extra !== undefined ||
    !expiresAt ||
    !/^\d+$/.test(expiresAt) ||
    !signature ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry <= Date.now()) return false;

  const expected = Buffer.from(signExpiry(expiresAt, accessKey, secret), 'hex');
  const actual = Buffer.from(signature, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function grantAdminAccess(input: string): Promise<{ error?: string }> {
  const accessKey = getAccessKey();
  const secret = getSigningSecret();
  if (!accessKey || !secret) {
    console.error('Admin access requires an 8-digit ADMIN_ACCESS_KEY and NEXTAUTH_SECRET.');
    return { error: 'Admin access is not configured correctly. Contact the site administrator.' };
  }

  if (typeof input !== 'string' || !/^\d{8}$/.test(input)) {
    return { error: 'Invalid access key.' };
  }

  const expected = Buffer.from(accessKey, 'utf8');
  const provided = Buffer.from(input, 'utf8');
  if (!timingSafeEqual(provided, expected)) return { error: 'Invalid access key.' };

  const expiresAt = String(Date.now() + ACCESS_DURATION_SECONDS * 1000);
  const signature = signExpiry(expiresAt, accessKey, secret);
  (await cookies()).set(ACCESS_COOKIE, `${expiresAt}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ACCESS_DURATION_SECONDS,
    path: `/${getAdminPath()}`,
  });

  return {};
}
