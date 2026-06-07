import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export type AdminSession = {
  email: string;
  name: string;
  role: 'compliance' | 'support' | 'operations';
};

export const ADMIN_SESSION_COOKIE = 'splash_admin_session';

const fallbackEmail = 'staff@splash.finance';
const fallbackPassword = 'splash-admin-demo';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Resolve the signing secret used to mint and verify admin session tokens.
 *
 * Security: trust is NEVER derived from the client-controlled Host header, and
 * no signing secret is ever a constant shipped in source (that would let anyone
 * forge an admin cookie offline).
 *   • If ADMIN_SESSION_SECRET is set, it is always used — in every environment.
 *   • In production without it we FAIL CLOSED (return null): no session can be
 *     minted or verified, so every admin route stays locked.
 *   • In local development without it, an ephemeral random secret is generated
 *     once per process (sessions reset on restart). It is never a shipped
 *     constant, so cookies cannot be forged from the public source.
 */
let cachedDevSecret: string | null = null;
function resolveSecret(): string | null {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configured) return configured;

  if (isProduction) return null;

  if (!cachedDevSecret) {
    cachedDevSecret = randomBytes(32).toString('hex');
    console.warn(
      '[admin-auth] ADMIN_SESSION_SECRET is not set. Generated an ephemeral ' +
        'local secret; admin sessions reset on restart. Set ' +
        'ADMIN_SESSION_SECRET before deploying.',
    );
  }
  return cachedDevSecret;
}

function timingSafeStrEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Mint a stateless, per-session token: `${nonce}.${hmac(secret, nonce)}`.
 * The random nonce makes every issued cookie unique, and the HMAC means the
 * value cannot be forged without the secret. Verification is stateless — no
 * server-side session store required.
 */
function signToken(secret: string): string {
  const nonce = randomBytes(18).toString('hex');
  const mac = createHmac('sha256', secret).update(`admin:${nonce}`).digest('hex');
  return `${nonce}.${mac}`;
}

function verifyToken(token: string, secret: string): boolean {
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return false;
  const nonce = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(`admin:${nonce}`).digest('hex');
  return timingSafeStrEqual(mac, expected);
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
  // On a live deployment, never accept the built-in demo credentials and never
  // mint a session without a real signing secret. All three must be configured.
  if (isProduction) {
    const envEmail = process.env.ADMIN_EMAIL?.trim();
    const envPassword = process.env.ADMIN_PASSWORD;
    const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
    if (!envEmail || !envPassword || !envSecret) {
      console.error(
        '[admin-auth] Refusing login: ADMIN_EMAIL, ADMIN_PASSWORD and ' +
          'ADMIN_SESSION_SECRET must all be set in production.',
      );
      return null;
    }
  }

  const expectedEmail = String(process.env.ADMIN_EMAIL || fallbackEmail);
  const expectedPassword = String(process.env.ADMIN_PASSWORD || fallbackPassword);

  if (String(email ?? '').trim().toLowerCase() !== expectedEmail.toLowerCase()) {
    return null;
  }

  if (!timingSafeStrEqual(password, expectedPassword)) {
    return null;
  }

  return configuredSession();
}

export async function getAdminSession() {
  const secret = resolveSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!value || !verifyToken(value, secret)) {
    return null;
  }

  return configuredSession();
}

export async function setAdminSessionCookie(options: { secure?: boolean } = {}) {
  const secret = resolveSecret();
  if (!secret) {
    throw new Error('Cannot create admin session: ADMIN_SESSION_SECRET is not configured.');
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, signToken(secret), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
    secure: options.secure ?? isProduction,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
