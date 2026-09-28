/**
 * The org_wallets ledger — server half of the business wallet (v15 §4).
 *
 * Rules and derivation live in lib/wallet/org-wallet-rules.ts (pure); this
 * module owns the rows. It takes the Database as an argument the way
 * lib/auth/authority.ts does, so PGlite tests exercise the same code that
 * runs in production.
 *
 * A wallet's members define its address, so membership never mutates in
 * place: `migrateOrgWallet` retires the active row and inserts version + 1,
 * inside one transaction, and the partial unique index (org_wallets_one_current)
 * makes a double-create a database error rather than a race.
 */
import { and, eq, inArray } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { fromBase64 } from '@mysten/sui/utils';
import { PasskeyPublicKey } from '@mysten/sui/keypairs/passkey';
import { genAddressSeed, toZkLoginPublicIdentifier } from '@mysten/sui/zklogin';

import { memberships, orgWallets, passkeyCredentials, users, userSalts, walletIdentities } from '../db/schema.ts';
import type * as schemaModule from '../db/schema.ts';

/** Accepts the node-postgres db and the PGlite test db alike (repo pattern,
 *  lib/db/wallet-identities.ts). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = PgDatabase<any, typeof schemaModule, any>;
import {
  deriveOrgWalletAddress,
  memberPublicKey,
  ORG_WALLET_THRESHOLD,
  OrgWalletRuleError,
  ROLE_WEIGHT,
  validateMembers,
  type OrgWalletMember,
  type OrgWalletStatus,
} from './org-wallet-rules.ts';
import { openSalt } from '../server/salt-vault.ts';
import { relyingPartyId } from '../auth/passkey.ts';

export type OrgWalletRecovery = {
  requestedBy: string;
  requestedAt: string;
  noticeEndsAt: string;
  proposedMembers: OrgWalletMember[];
  reason: string;
  /** Set on the retired row when the recovery completes. */
  completedAt?: string;
  sweepDigest?: string | null;
};

export type OrgWalletRow = {
  id: string;
  orgId: string;
  address: string;
  members: OrgWalletMember[];
  threshold: number;
  version: number;
  status: OrgWalletStatus;
  recovery: OrgWalletRecovery | null;
  createdAt: Date;
  updatedAt: Date;
};

function walletId(): string {
  return `owlt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function asRow(row: typeof orgWallets.$inferSelect): OrgWalletRow {
  return {
    ...row,
    members: row.members as OrgWalletMember[],
    status: row.status as OrgWalletStatus,
    recovery: (row.recovery as OrgWalletRecovery | null) ?? null,
  };
}

/** The org's one active wallet, or null before it exists. */
export async function readActiveOrgWallet(db: Database, orgId: string): Promise<OrgWalletRow | null> {
  const rows = await db
    .select()
    .from(orgWallets)
    .where(and(eq(orgWallets.orgId, orgId), eq(orgWallets.status, 'active')))
    .limit(1);
  return rows.length ? asRow(rows[0]) : null;
}

/**
 * The org's CURRENT wallet: the active one, or — during a recovery notice —
 * the migrating one. Everything that shows, receives on, or sends from "the
 * business wallet" reads this: during the 72-hour notice the funds are still
 * at the migrating address, the admin must see the recovery to cancel it,
 * and receivables must not fall back to anyone's personal key.
 */
export async function readCurrentOrgWallet(db: Database, orgId: string): Promise<OrgWalletRow | null> {
  const rows = await db
    .select()
    .from(orgWallets)
    .where(and(eq(orgWallets.orgId, orgId), inArray(orgWallets.status, ['active', 'migrating'])))
    .limit(1);
  return rows.length ? asRow(rows[0]) : null;
}

/**
 * The wallet a Sui address belongs to. `migrating` rows count: their funds
 * sit at the old address until the migration transaction sweeps them, and a
 * payment arriving there is still the business's money.
 */
export async function orgWalletByAddress(db: Database, address: string): Promise<OrgWalletRow | null> {
  const rows = await db
    .select()
    .from(orgWallets)
    .where(and(eq(orgWallets.address, address.toLowerCase()), inArray(orgWallets.status, ['active', 'migrating'])))
    .limit(1);
  return rows.length ? asRow(rows[0]) : null;
}

/* ── Member builders ────────────────────────────────────────────────────── */

/** A zkLogin member from the identity triple and its (decrypted) salt. */
export function zkLoginMember(input: {
  role: 'admin' | 'recovery';
  issuer: string;
  audience: string;
  subject: string;
  salt: string;
  userId: string;
  label: string;
}): OrgWalletMember {
  const seed = genAddressSeed(BigInt(input.salt), 'sub', input.subject, input.audience);
  const identifier = toZkLoginPublicIdentifier(seed, input.issuer, { legacyAddress: false });
  return {
    kind: 'zklogin',
    role: input.role,
    publicKey: identifier.toSuiPublicKey(),
    weight: ROLE_WEIGHT[input.role],
    userId: input.userId,
    label: input.label,
  };
}

/** A passkey member from an enrolled credential's compressed P-256 key. */
export function passkeyMember(input: {
  role: 'admin' | 'backup';
  publicKey: string;
  userId: string;
  label: string;
}): OrgWalletMember {
  const key = new PasskeyPublicKey(fromBase64(input.publicKey));
  return {
    kind: 'passkey',
    role: input.role,
    publicKey: key.toSuiPublicKey(),
    weight: ROLE_WEIGHT[input.role],
    userId: input.userId,
    label: input.label,
  };
}

/**
 * Splash's cold recovery member, when the ceremony key is configured. The
 * private half is ceremony-held offline (Sky + Sebastian) and never on a
 * server; weight 1 keeps it powerless alone, by validateMembers as well as
 * by arithmetic.
 */
export function splashColdMember(env: NodeJS.ProcessEnv = process.env): OrgWalletMember | null {
  const configured = (env.SPLASH_RECOVERY_PUBKEY ?? '').trim();
  if (!configured) return null;
  const member: OrgWalletMember = {
    kind: 'cold',
    role: 'splash-cold',
    publicKey: configured,
    weight: ROLE_WEIGHT['splash-cold'],
    label: 'Splash recovery (cannot act alone)',
  };
  // Throws on malformed bytes, so a typo in the env is caught at wallet
  // creation, not at the recovery ceremony.
  memberPublicKey(member);
  return member;
}

/**
 * The insider rule, mirrored from `business_account.move`'s
 * E_RECOVERY_IS_INSIDER: a recovery contact must be a second person AT THE
 * BUSINESS — never the admin whose loss they cover, and never Splash staff,
 * or "recovery contact + Splash" would be Splash alone.
 */
export function assertRecoveryContactAllowed(input: {
  userId: string;
  email: string;
  adminUserId: string;
  env?: NodeJS.ProcessEnv;
}): void {
  if (input.userId === input.adminUserId) {
    throw new OrgWalletRuleError('The recovery contact must be a second person, not the main admin.');
  }
  const staffEmail = ((input.env ?? process.env).ADMIN_EMAIL ?? '').trim().toLowerCase();
  if (staffEmail && input.email.trim().toLowerCase() === staffEmail) {
    throw new OrgWalletRuleError('Splash staff cannot be a recovery contact — the two Splash-side keys would meet the threshold together.');
  }
}

/* ── Creation and migration ─────────────────────────────────────────────── */

/**
 * The insider rule, applied at the ONLY two places a member set becomes a
 * wallet. validateMembers cannot check it — it needs the contact's email —
 * so a set with a recovery member passes through here or not at all.
 */
export async function assertRecoveryMemberAllowed(db: Database, members: OrgWalletMember[]): Promise<void> {
  const recovery = members.find((m) => m.role === 'recovery');
  if (!recovery?.userId) return;
  const admin = members.find((m) => m.role === 'admin');
  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, recovery.userId))
    .limit(1);
  assertRecoveryContactAllowed({
    userId: recovery.userId,
    email: rows[0]?.email ?? '',
    adminUserId: admin?.userId ?? '',
  });
}

export async function createOrgWallet(
  db: Database,
  input: { orgId: string; members: OrgWalletMember[] },
): Promise<OrgWalletRow> {
  const members = validateMembers(input.members);
  await assertRecoveryMemberAllowed(db, members);
  const address = deriveOrgWalletAddress(members).toLowerCase();
  try {
    const inserted = await db
      .insert(orgWallets)
      .values({
        id: walletId(),
        orgId: input.orgId,
        address,
        members,
        threshold: ORG_WALLET_THRESHOLD,
      })
      .returning();
    return asRow(inserted[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new OrgWalletRuleError('The organisation already has an active wallet — change members by migration, not by a second create.');
    }
    throw error;
  }
}

/** Postgres 23505, wherever the driver put it — node-postgres sets `code` on
 *  the error, drizzle's wrapper keeps the original on `cause`. */
function isUniqueViolation(error: unknown): boolean {
  for (let cursor = error, depth = 0; cursor && depth < 4; depth += 1) {
    const code = (cursor as { code?: unknown }).code;
    if (code === '23505') return true;
    cursor = (cursor as { cause?: unknown }).cause;
  }
  return false;
}

/**
 * The org's wallet, created from the keys its admin already holds when none
 * exists yet (the WS2 "silent wallet step", and the backfill for orgs that
 * predate org_wallets). Members, in preference order:
 *
 *   - the admin's zkLogin identity (wallet_identities + its stored salt),
 *   - else the admin's enrolled passkey, as the weight-2 admin key;
 *   - plus Splash's cold member when SPLASH_RECOVERY_PUBKEY is set.
 *
 * A wallet created with fewer than the full four members is deliberately
 * valid: adding the backup passkey or recovery contact later is a MIGRATION
 * (new address), and the UI says so before the first deposit.
 */
export async function ensureOrgWalletForUser(
  db: Database,
  input: { orgId: string; userId: string; label?: string },
): Promise<OrgWalletRow> {
  // Current, not just active: during a recovery notice the org HAS a wallet
  // (migrating), and minting a parallel one would strand the recovery.
  const existing = await readCurrentOrgWallet(db, input.orgId);
  if (existing) return existing;

  const members = await proposedAdminMembers(db, {
    userId: input.userId,
    orgId: input.orgId,
    label: input.label,
  });

  const cold = splashColdMember();
  if (cold) members.push(cold);

  return createOrgWallet(db, { orgId: input.orgId, members });
}

/**
 * The admin member a user's existing keys can supply: their zkLogin identity
 * (with its stored salt) first, else their enrolled passkey. Used at wallet
 * creation and again by recovery, where the NEW admin's keys shape the wallet
 * the ceremony will migrate to.
 */
export async function proposedAdminMembers(
  db: Database,
  input: { userId: string; orgId?: string; label?: string },
): Promise<OrgWalletMember[]> {
  const identities = await db
    .select({
      issuer: walletIdentities.oauthIss,
      subject: walletIdentities.oauthSub,
      audience: walletIdentities.oauthAud,
    })
    .from(walletIdentities)
    .where(
      input.orgId
        ? and(eq(walletIdentities.userId, input.userId), eq(walletIdentities.orgId, input.orgId))
        : eq(walletIdentities.userId, input.userId),
    )
    .limit(1);
  if (identities.length) {
    const identity = identities[0];
    const saltRows = await db
      .select({ saltCiphertext: userSalts.saltCiphertext })
      .from(userSalts)
      .where(
        and(
          eq(userSalts.issuer, identity.issuer),
          eq(userSalts.audience, identity.audience),
          eq(userSalts.subject, identity.subject),
        ),
      )
      .limit(1);
    if (saltRows.length) {
      return [
        zkLoginMember({
          role: 'admin',
          issuer: identity.issuer,
          audience: identity.audience,
          subject: identity.subject,
          salt: openSalt(saltRows[0].saltCiphertext),
          userId: input.userId,
          label: input.label ?? 'Main admin (sign-in key)',
        }),
      ];
    }
  }

  const credentials = await db
    .select({ publicKey: passkeyCredentials.publicKey })
    .from(passkeyCredentials)
    .where(and(eq(passkeyCredentials.userId, input.userId), eq(passkeyCredentials.rpId, relyingPartyId())))
    .limit(1);
  if (credentials.length) {
    return [
      passkeyMember({
        role: 'admin',
        publicKey: credentials[0].publicKey,
        userId: input.userId,
        label: input.label ?? 'Main admin (passkey)',
      }),
    ];
  }

  throw new OrgWalletRuleError(
    'No key to build the wallet from: the admin needs a zkLogin identity (with its stored salt) or an enrolled passkey first.',
  );
}

/**
 * The login-time silent wallet step (v15 §3), gated on an ADMIN membership:
 * a signer who has merely signed in holds no authority and must not mint the
 * organisation's wallet around its admin. Non-fatal by design — a wallet
 * hiccup must never cost anyone their sign-in — so failures are logged and
 * swallowed here, and the Settings screen offers the explicit retry.
 */
export async function ensureWalletForAdminLogin(
  db: Database,
  input: { userId: string; orgId: string },
): Promise<OrgWalletRow | null> {
  try {
    const admin = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, input.userId),
          eq(memberships.orgId, input.orgId),
          eq(memberships.role, 'admin'),
        ),
      )
      .limit(1);
    if (!admin.length) return null;
    return await ensureOrgWalletForUser(db, { orgId: input.orgId, userId: input.userId });
  } catch (error) {
    console.warn('[org-wallet] silent wallet step skipped', {
      orgId: input.orgId,
      reason: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Replace the member set: retire the active wallet, insert version + 1 with
 * the new members (and therefore a new address), in one transaction. Funds
 * move in the migration transaction on chain — never here.
 */
export async function migrateOrgWallet(
  db: Database,
  input: {
    orgId: string;
    members: OrgWalletMember[];
    /** Which current row this migration replaces: a plain membership change
     *  replaces the active wallet; a completed recovery replaces the
     *  migrating one. The status is checked under the row lock, inside the
     *  same transaction as the retire and the insert — no half-state. */
    from?: 'active' | 'migrating';
    /** For a recovery: the request being completed. A cancel and a fresh
     *  request between the caller's read and this lock must not let the old
     *  proposal land on the new request's row. */
    recoveryRequestedAt?: string;
    /** Evidence kept on the retired row's recovery record (sweep digest). */
    completion?: { completedAt: string; sweepDigest: string | null };
  },
): Promise<{ retired: OrgWalletRow; wallet: OrgWalletRow }> {
  const from = input.from ?? 'active';
  const members = validateMembers(input.members);
  await assertRecoveryMemberAllowed(db, members);
  const address = deriveOrgWalletAddress(members).toLowerCase();

  return db.transaction(async (tx) => {
    const current = await tx
      .select()
      .from(orgWallets)
      .where(and(eq(orgWallets.orgId, input.orgId), eq(orgWallets.status, from)))
      .for('update')
      .limit(1);
    if (!current.length) {
      throw new OrgWalletRuleError(
        from === 'migrating' ? 'No recovery is in progress.' : 'No active wallet to migrate — create one first.',
      );
    }
    const old = asRow(current[0]);
    if (old.address === address) {
      throw new OrgWalletRuleError('The new member set derives the same address — nothing to migrate.');
    }
    if (from === 'migrating' && old.recovery?.requestedAt !== input.recoveryRequestedAt) {
      throw new OrgWalletRuleError('The recovery changed under this migration — read it again.');
    }

    const retired = await tx
      .update(orgWallets)
      .set({
        status: 'retired',
        recovery: from === 'migrating' && old.recovery ? { ...old.recovery, ...(input.completion ?? {}) } : null,
        updatedAt: new Date(),
      })
      .where(and(eq(orgWallets.id, old.id), eq(orgWallets.status, from)))
      .returning();
    if (!retired.length) {
      throw new OrgWalletRuleError('The wallet changed under this migration — read it again.');
    }

    const inserted = await tx
      .insert(orgWallets)
      .values({
        id: walletId(),
        orgId: input.orgId,
        address,
        members,
        threshold: ORG_WALLET_THRESHOLD,
        version: old.version + 1,
      })
      .returning();
    return { retired: asRow(retired[0]), wallet: asRow(inserted[0]) };
  });
}
