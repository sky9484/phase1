import { NextResponse } from 'next/server';
import { z } from 'zod';

import { userIdFromEmail } from '@/lib/auth/accounts';
import { resolveAuthorityForSession, UnauthorizedError } from '@/lib/auth/authority';
import { requireCustomerRequest } from '@/lib/server/customer-auth';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/rate-limit';
import { readJsonBody } from '@/lib/server/http';
import { OrgWalletRuleError, type OrgWalletMember } from '@/lib/wallet/org-wallet-rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Splash-assisted recovery of the business wallet (v15 §4).
 *
 * POST {action:'request'}: the RECOVERY CONTACT — who may hold no workspace
 * membership at all; being named on the wallet is the authority — opens the
 * 72-hour notice. The new wallet is built around a named new admin's existing
 * keys, so what will exist after the ceremony is reviewed now.
 *
 * POST {action:'cancel'}: the main admin (or backup passkey holder) shuts the
 * window. This is what makes the notice a control: a hostile request dies in
 * front of the person it targets.
 *
 * POST {action:'prepare-sweep'}: after the notice — the unsigned full-balance
 * move for the ceremony to sign.
 *
 * POST {action:'complete', sweepDigest?}: after the ceremony EXECUTED the
 * sweep on chain — records the migration (old row retired, the proposed
 * wallet active) only when the chain shows the old wallet empty; the digest,
 * when given, must be that sweep and is kept as evidence. Order matters:
 * complete first and the sweep's sender row would already be retired while
 * the funds still sat on it.
 *
 * Splash's cold key signs the sweep in a CEREMONY — nothing here signs
 * anything, and Splash alone can neither open nor complete a recovery.
 */
const recoverySchema = z.object({
  action: z.enum(['request', 'cancel', 'prepare-sweep', 'complete']),
  orgId: z.string().trim().min(1).max(128).optional(),
  newAdminUserId: z.string().trim().min(1).max(256).optional(),
  reason: z.string().trim().min(1).max(500).optional(),
  sweepDigest: z.string().trim().regex(/^[1-9A-HJ-NP-Za-km-z]{32,50}$/).optional(),
});

// One answer for "no such org", "no wallet", "no recovery" and "not yours":
// the org id comes from the body, so any difference would let a stranger
// probe which organisations have wallets and who guards them.
const NOT_YOURS = { error: 'There is no recovery here that you can act on.', code: 'wallet_rules' } as const;

/** The people a migration concerns: the recovery contact who asked and the
 *  admin/backup holders it would replace. */
function isWalletParty(members: OrgWalletMember[], userId: string): boolean {
  return members.some(
    (m) => (m.role === 'recovery' || m.role === 'admin' || m.role === 'backup') && m.userId === userId,
  );
}

export async function POST(request: Request) {
  const auth = await requireCustomerRequest(request);
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit({ rule: RATE_LIMITS.walletRecoveryUser, key: auth.session.email });
  if (limited) return limited;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Recovery needs the database.', code: 'ledger_unavailable' }, { status: 503 });
  }

  const parsed = recoverySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Say what to do: request, cancel, prepare-sweep or complete.', code: 'invalid_input' }, { status: 400 });
  }

  const [{ getDb }, orgWallet, recovery] = await Promise.all([
    import('@/lib/db/client'),
    import('@/lib/wallet/org-wallet'),
    import('@/lib/wallet/org-wallet-recovery'),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  try {
    if (parsed.data.action === 'prepare-sweep') {
      // After the notice: the ceremony's inputs. The requester must again be
      // the wallet's own recovery member; the response is UNSIGNED bytes and
      // the addresses, nothing that moves money by itself.
      const requesterUserId = userIdFromEmail(auth.session.email);
      const orgId = parsed.data.orgId;
      if (!orgId) {
        return NextResponse.json({ error: 'Name the organisation.', code: 'invalid_input' }, { status: 400 });
      }
      const wallet = await recovery.migratingWallet(db, orgId);
      if (!wallet?.recovery || !isWalletParty(wallet.members, requesterUserId)) {
        return NextResponse.json(NOT_YOURS, { status: 404 });
      }
      if (!recovery.recoveryNoticeOver(wallet.recovery)) {
        return NextResponse.json(
          { error: 'The 72-hour notice has not ended yet.', code: 'wallet_rules', noticeEndsAt: wallet.recovery.noticeEndsAt },
          { status: 409 },
        );
      }
      const { deriveOrgWalletAddress } = await import('@/lib/wallet/org-wallet-rules');
      const { prepareRecoverySweep } = await import('@/lib/wallet/org-wallet-sweep');
      const to = deriveOrgWalletAddress(wallet.recovery.proposedMembers).toLowerCase();
      const sweep = await prepareRecoverySweep({ from: wallet.address, to });
      return NextResponse.json(
        { sweep, note: 'Signed by the recovery contact and the Splash cold key in the ceremony; complete the migration record afterwards.' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    if (parsed.data.action === 'complete') {
      const requesterUserId = userIdFromEmail(auth.session.email);
      const orgId = parsed.data.orgId;
      if (!orgId) {
        return NextResponse.json({ error: 'Name the organisation.', code: 'invalid_input' }, { status: 400 });
      }
      const wallet = await recovery.migratingWallet(db, orgId);
      if (!wallet?.recovery || !isWalletParty(wallet.members, requesterUserId)) {
        return NextResponse.json(NOT_YOURS, { status: 404 });
      }
      // The migration is recorded only once the chain shows the old wallet
      // empty — never on the caller's word that the ceremony happened.
      const { confirmRecoverySweep } = await import('@/lib/wallet/org-wallet-sweep');
      const sweepDigest = parsed.data.sweepDigest ?? null;
      const { wallet: recovered, retired } = await recovery.completeRecovery(db, {
        orgId,
        confirmSweep: (sweep) => confirmRecoverySweep({ ...sweep, digest: sweepDigest }),
      });
      return NextResponse.json({
        completed: true,
        newAddress: recovered.address,
        version: recovered.version,
        sweepDigest: retired.recovery?.sweepDigest ?? null,
      });
    }

    if (parsed.data.action === 'cancel') {
      // Cancelling takes workspace authority — the admin defends their own
      // wallet — so the org comes from the SESSION, never the body.
      const authority = await resolveAuthorityForSession(auth.session);
      await recovery.cancelRecovery(db, { orgId: authority.orgId, byUserId: authority.userId });
      return NextResponse.json({ cancelled: true });
    }

    // The requester may be membership-less: the wallet row itself names them.
    // That is why the org id is in the body HERE and nowhere else — it is
    // checked against the wallet's own recovery member before anything moves.
    const requesterUserId = userIdFromEmail(auth.session.email);
    const orgId = parsed.data.orgId;
    const newAdminUserId = parsed.data.newAdminUserId;
    if (!orgId || !newAdminUserId) {
      return NextResponse.json(
        { error: 'A recovery request names the organisation and the new admin.', code: 'invalid_input' },
        { status: 400 },
      );
    }

    // Authority FIRST: nothing about the org, its wallet or the named new
    // admin is looked at until the requester is shown to be this wallet's
    // recovery contact.
    const isRecoveryContact = (members: OrgWalletMember[]) =>
      members.some((m) => m.role === 'recovery' && m.userId === requesterUserId);
    const current = await orgWallet.readActiveOrgWallet(db, orgId);
    if (!current || !isRecoveryContact(current.members)) {
      const running = current ? null : await recovery.migratingWallet(db, orgId);
      if (running && isRecoveryContact(running.members)) {
        return NextResponse.json(
          { error: 'A recovery is already in progress for this wallet.', code: 'wallet_rules' },
          { status: 409 },
        );
      }
      return NextResponse.json(NOT_YOURS, { status: 404 });
    }
    // The fresh wallet: the new admin's existing keys, the requesting
    // recovery contact kept on, Splash's cold member when configured.
    const keep = current.members.filter((m) => m.role === 'recovery' || m.role === 'splash-cold');
    const proposed = await orgWallet.proposedAdminMembers(db, { userId: newAdminUserId, label: 'Recovered admin key' });
    const walletRow = await recovery.requestRecovery(db, {
      orgId,
      requestedByUserId: requesterUserId,
      proposedMembers: [...proposed, ...keep],
      reason: parsed.data.reason ?? 'recovery requested',
    });
    return NextResponse.json({
      requested: true,
      noticeEndsAt: walletRow.recovery?.noticeEndsAt,
      newAddress: null,
      note: 'The main admin can cancel at any time during the 72-hour notice. After it, the migration is signed in a ceremony by the recovery contact and the Splash cold key.',
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'No workspace membership yet.' }, { status: 403 });
    }
    if (error instanceof OrgWalletRuleError) {
      return NextResponse.json({ error: error.message, code: 'wallet_rules' }, { status: 409 });
    }
    throw error;
  }
}
