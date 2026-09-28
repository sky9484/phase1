/**
 * Splash-assisted recovery (v15 §4): the recovery contact and Splash's cold
 * key — 1 + 1 = the threshold — sign ONE migration transaction to a fresh
 * wallet holding the business's new keys.
 *
 * The shape mirrors `business_account.move`'s pending recovery deliberately:
 * a REQUEST opens a 72-hour notice window and marks the wallet `migrating`;
 * the main admin can CANCEL throughout (a hostile or mistaken request dies
 * quietly); after the notice the SWEEP transaction can be prepared — built
 * here, signed in a ceremony (the cold key never touches a server), executed
 * by whoever holds the combined signature. Splash alone can do none of it:
 * the request must come from the wallet's own recovery member.
 */
import { and, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';

import { orgWallets } from '../db/schema.ts';
import type * as schemaModule from '../db/schema.ts';
import {
  OrgWalletRuleError,
  validateMembers,
  deriveOrgWalletAddress,
  type OrgWalletMember,
} from './org-wallet-rules.ts';
import {
  readActiveOrgWallet,
  migrateOrgWallet,
  assertRecoveryMemberAllowed,
  type OrgWalletRecovery,
  type OrgWalletRow,
} from './org-wallet.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = PgDatabase<any, typeof schemaModule, any>;

/** 72 hours, as on chain. A notice, not a formality: the admin can cancel. */
export const RECOVERY_NOTICE_MS = 72 * 60 * 60 * 1000;

function refuse(message: string): never {
  throw new OrgWalletRuleError(message);
}

/** The live recovery on a wallet, when its window has not been cancelled. */
export function pendingRecovery(wallet: OrgWalletRow): OrgWalletRecovery | null {
  return wallet.status === 'migrating' && wallet.recovery ? wallet.recovery : null;
}

/** The org's wallet while a recovery holds it in `migrating`, or null. */
export async function migratingWallet(db: Database, orgId: string): Promise<OrgWalletRow | null> {
  const rows = await db
    .select()
    .from(orgWallets)
    .where(and(eq(orgWallets.orgId, orgId), eq(orgWallets.status, 'migrating')))
    .limit(1);
  if (!rows.length) return null;
  const row = rows[0];
  return {
    ...row,
    members: row.members as OrgWalletMember[],
    status: 'migrating',
    recovery: (row.recovery as OrgWalletRecovery | null) ?? null,
  } as OrgWalletRow;
}

export function recoveryNoticeOver(recovery: OrgWalletRecovery, nowMs = Date.now()): boolean {
  return nowMs >= new Date(recovery.noticeEndsAt).getTime();
}

/**
 * Open the notice window. Only the wallet's own recovery member may ask, and
 * the proposed member set must already be a valid wallet — reviewed now, not
 * at the ceremony.
 */
export async function requestRecovery(
  db: Database,
  input: {
    orgId: string;
    requestedByUserId: string;
    proposedMembers: OrgWalletMember[];
    reason: string;
    nowMs?: number;
  },
): Promise<OrgWalletRow> {
  const wallet = await readActiveOrgWallet(db, input.orgId);
  if (!wallet) refuse('This organisation has no wallet to recover.');
  const recoveryMember = wallet.members.find((m) => m.role === 'recovery');
  if (!recoveryMember) {
    refuse('This wallet has no recovery contact, so only its own keys can act. Self-recovery is the backup passkey.');
  }
  if (recoveryMember.userId !== input.requestedByUserId) {
    refuse('Only the named recovery contact can ask for a recovery.');
  }
  const members = validateMembers(input.proposedMembers);
  // The insider rule is checked NOW, not only at the ceremony: a request whose
  // proposed wallet could never be created must not freeze the wallet in
  // `migrating` for 72 hours.
  await assertRecoveryMemberAllowed(db, members);
  if (deriveOrgWalletAddress(members).toLowerCase() === wallet.address) {
    refuse('The proposed members are the current wallet — nothing to recover to.');
  }

  const now = input.nowMs ?? Date.now();
  const recovery: OrgWalletRecovery = {
    requestedBy: input.requestedByUserId,
    requestedAt: new Date(now).toISOString(),
    noticeEndsAt: new Date(now + RECOVERY_NOTICE_MS).toISOString(),
    proposedMembers: members,
    reason: input.reason.slice(0, 500),
  };

  const updated = await db
    .update(orgWallets)
    .set({ status: 'migrating', recovery, updatedAt: new Date() })
    .where(and(eq(orgWallets.id, wallet.id), eq(orgWallets.status, 'active')))
    .returning();
  if (!updated.length) refuse('A recovery is already in progress for this wallet.');
  return { ...wallet, status: 'migrating', recovery };
}

/** The main admin shuts the window. The wallet returns to plain `active`. */
export async function cancelRecovery(
  db: Database,
  input: { orgId: string; byUserId: string },
): Promise<void> {
  const rows = await db
    .select()
    .from(orgWallets)
    .where(and(eq(orgWallets.orgId, input.orgId), eq(orgWallets.status, 'migrating')))
    .limit(1);
  if (!rows.length) refuse('No recovery is in progress.');
  const wallet = rows[0];
  const members = wallet.members as OrgWalletMember[];
  const mayCancel = members.some(
    (m) => (m.role === 'admin' || m.role === 'backup') && m.userId === input.byUserId,
  );
  if (!mayCancel) refuse('Only the main admin can cancel a recovery during its notice.');
  await db
    .update(orgWallets)
    .set({ status: 'active', recovery: null, updatedAt: new Date() })
    .where(and(eq(orgWallets.id, wallet.id as string), eq(orgWallets.status, 'migrating')));
}

/** What the chain says about the sweep, checked by the caller (it needs a
 *  node). `ok` only when the old wallet holds no USDC any more. */
export type SweepEvidence = { ok: true; sweepDigest: string | null } | { ok: false; reason: string };

/**
 * After the notice AND the executed sweep: the migration record. One
 * transaction retires the migrating row (keeping its recovery record plus the
 * sweep digest) and creates the proposed wallet — no window in which the org
 * has no current wallet, and never on a request that was cancelled and
 * replaced since it was read. The funds moved on chain beforehand, signed
 * recovery-contact + cold, NEVER by anything in this process.
 */
export async function completeRecovery(
  db: Database,
  input: {
    orgId: string;
    nowMs?: number;
    confirmSweep: (sweep: { from: string; to: string }) => Promise<SweepEvidence>;
  },
): Promise<{ retired: OrgWalletRow; wallet: OrgWalletRow }> {
  const wallet = await migratingWallet(db, input.orgId);
  if (!wallet) refuse('No recovery is in progress.');
  const recovery = wallet.recovery;
  if (!recovery) refuse('The migrating wallet carries no recovery request.');
  if (!recoveryNoticeOver(recovery, input.nowMs)) {
    refuse('The 72-hour notice has not ended yet.');
  }
  const to = deriveOrgWalletAddress(recovery.proposedMembers).toLowerCase();
  const evidence = await input.confirmSweep({ from: wallet.address, to });
  if (!evidence.ok) refuse(evidence.reason);
  return migrateOrgWallet(db, {
    orgId: input.orgId,
    members: recovery.proposedMembers,
    from: 'migrating',
    recoveryRequestedAt: recovery.requestedAt,
    completion: { completedAt: new Date(input.nowMs ?? Date.now()).toISOString(), sweepDigest: evidence.sweepDigest },
  });
}
