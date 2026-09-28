import { NextResponse } from 'next/server';

import { resolveAuthorityForSession, UnauthorizedError } from '@/lib/auth/authority';
import { requireCustomerRequest } from '@/lib/server/customer-auth';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/rate-limit';
import { OrgWalletRuleError } from '@/lib/wallet/org-wallet-rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The business wallet, for Settings → Wallet (v15 §4).
 *
 * GET: the org's wallet as it stands — address, members (labels and roles,
 * never key material beyond the public halves already public on chain), the
 * pending recovery if one is running, and what is missing (backup passkey,
 * recovery contact, Splash cold key) with the honest consequence: adding a
 * member later MIGRATES the wallet to a new address.
 *
 * POST: create the wallet from the admin's existing keys when none exists.
 * OWNER only — the wallet is the organisation's money identity.
 */
export async function GET(request: Request) {
  const auth = await requireCustomerRequest(request);
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit({ rule: RATE_LIMITS.stablecoinQuoteUser, key: auth.session.email });
  if (limited) return limited;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'The wallet needs the database.', code: 'ledger_unavailable' }, { status: 503 });
  }

  let orgId: string;
  let userId: string;
  try {
    const authority = await resolveAuthorityForSession(auth.session);
    orgId = authority.orgId;
    userId = authority.userId;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'No workspace membership yet.' }, { status: 403 });
    }
    throw error;
  }

  const [{ getDb }, { readCurrentOrgWallet }, { pendingRecovery }, { splashColdMember }] = await Promise.all([
    import('@/lib/db/client'),
    import('@/lib/wallet/org-wallet'),
    import('@/lib/wallet/org-wallet-recovery'),
    import('@/lib/wallet/org-wallet'),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  // Active or migrating: a recovery in its notice window is exactly what the
  // admin must see here, with the Cancel button.
  const wallet = await readCurrentOrgWallet(db, orgId);

  if (!wallet) {
    return NextResponse.json(
      {
        wallet: null,
        coldConfigured: Boolean(splashColdMember()),
        reason:
          'No business wallet yet. It is created from your sign-in key or passkey — open Send USDC once, or create it here.',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const roles = new Set(wallet.members.map((m) => m.role));
  return NextResponse.json(
    {
      wallet: {
        address: wallet.address,
        version: wallet.version,
        threshold: wallet.threshold,
        status: wallet.status,
        members: wallet.members.map((m) => ({
          role: m.role,
          kind: m.kind,
          weight: m.weight,
          label: m.label,
          mine: m.userId === userId,
        })),
        recovery: pendingRecovery(wallet),
      },
      missing: {
        backupPasskey: !roles.has('backup'),
        recoveryContact: !roles.has('recovery'),
        splashCold: !roles.has('splash-cold'),
      },
      coldConfigured: Boolean(splashColdMember()),
      // Verbatim per v15 §1 — what Splash can and cannot do.
      custody: 'No key on our server can move, freeze or approve customer money.',
      migrationNote:
        'Adding or replacing a member changes the wallet address (a migration). Do it before the first deposit when you can.',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  const auth = await requireCustomerRequest(request);
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit({ rule: RATE_LIMITS.stablecoinQuoteUser, key: auth.session.email });
  if (limited) return limited;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'The wallet needs the database.', code: 'ledger_unavailable' }, { status: 503 });
  }

  let orgId: string;
  let userId: string;
  try {
    const authority = await resolveAuthorityForSession(auth.session);
    if (authority.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only the workspace owner can open the business wallet.', code: 'role_cannot_create' },
        { status: 403 },
      );
    }
    orgId = authority.orgId;
    userId = authority.userId;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'No workspace membership yet.' }, { status: 403 });
    }
    throw error;
  }

  const [{ getDb }, { ensureOrgWalletForUser }] = await Promise.all([
    import('@/lib/db/client'),
    import('@/lib/wallet/org-wallet'),
  ]);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wallet = await ensureOrgWalletForUser(getDb() as any, { orgId, userId });
    return NextResponse.json({ wallet: { address: wallet.address, version: wallet.version } });
  } catch (error) {
    if (error instanceof OrgWalletRuleError) {
      return NextResponse.json({ error: error.message, code: 'wallet_rules' }, { status: 409 });
    }
    throw error;
  }
}
