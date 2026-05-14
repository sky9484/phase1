import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export type AdminSession = {
  email: string;
  name: string;
  role: 'compliance' | 'support' | 'operations';
};

export const ADMIN_SESSION_COOKIE = 'splash_admin_session';

const fallbackEmail = 'staff@splash.finance';
const fallbackPassword = 'splash-admin-demo';
const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'splash-admin-dev-secret';
const sessionValue = createHash('sha256').update(`splash-admin:${sessionSecret}`).digest('hex');

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function configuredSession(): AdminSession {
  const email = process.env.ADMIN_EMAIL || fallbackEmail;

  return {
    email,
    name: email.split('@')[0]?.replace(/[._-]/g, ' ') || 'Splash staff',
    role: 'operations',
  };
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || fallbackEmail;
  const expectedPassword = process.env.ADMIN_PASSWORD || fallbackPassword;

  if (email.trim().toLowerCase() !== expectedEmail.toLowerCase()) {
    return null;
  }

  if (!safeEqual(password, expectedPassword)) {
    return null;
  }

  return configuredSession();
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!value || !safeEqual(value, sessionValue)) {
    return null;
  }

  return configuredSession();
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
