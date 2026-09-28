/**
 * Per-user zkLogin salts (v15 WS1) — the replacement for the retired global
 * ZKLOGIN_USER_SALT.
 *
 * Resolution order, per identity (iss, aud, sub):
 *
 *   1. the stored copy in user_salts (decrypted with SALT_ENCRYPTION_KEY) —
 *      so a logged-in-before user survives an Enoki outage with the same
 *      address;
 *   2. else Enoki, the salt authority — and the fresh salt is immediately
 *      re-derived, checked against Enoki's own address, sealed and stored.
 *
 * Divergence is refused loudly in both directions: a stored salt that no
 * longer derives the stored address (key or row tampering), or an authority
 * salt that disagrees with an existing row (authority drift), must reach a
 * human — silently accepting either would strand or rebind a wallet member.
 */
import { createHash } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';

import { userSalts } from '../db/schema.ts';
import type * as schemaModule from '../db/schema.ts';
import { enokiConfigured, enokiSalt } from './zklogin-prover.ts';
import { deriveZkLoginAddress } from './zklogin.ts';
import { openSalt, sealSalt, saltVaultConfigured } from '../server/salt-vault.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = PgDatabase<any, typeof schemaModule, any>;

export type ZkLoginIdentity = { issuer: string; audience: string; subject: string };

export class ZkLoginSaltError extends Error {
  readonly code: 'salt_divergence' | 'vault_unconfigured';
  constructor(message: string, code: 'salt_divergence' | 'vault_unconfigured') {
    super(message);
    this.code = code;
  }
}

/** Deterministic, so concurrent first logins converge on one row (wid_ pattern). */
function saltRowId(identity: ZkLoginIdentity): string {
  const digest = createHash('sha256')
    .update(`${identity.issuer}|${identity.subject}|${identity.audience}`)
    .digest('hex');
  return `usalt_${digest.slice(0, 40)}`;
}

/**
 * The salt and address for this identity, or null when neither a stored copy
 * nor the authority can provide one (the login then proceeds with no signer
 * recorded, exactly like the old no-salt path).
 */
export async function resolveUserSalt(
  db: Database,
  input: {
    jwt: string;
    identity: ZkLoginIdentity;
    userId?: string;
    /** Never ask the authority or write a row: only the copy sign-in stored
     *  counts (the prove route — a proof there is signing authority). */
    storedOnly?: boolean;
  },
): Promise<{ salt: string; address: string; source: 'stored' | 'enoki' } | null> {
  const { identity } = input;

  const stored = await db
    .select()
    .from(userSalts)
    .where(
      and(
        eq(userSalts.issuer, identity.issuer),
        eq(userSalts.audience, identity.audience),
        eq(userSalts.subject, identity.subject),
      ),
    )
    .limit(1);

  if (stored.length) {
    const row = stored[0];
    const salt = openSalt(row.saltCiphertext);
    const address = await deriveZkLoginAddress(input.jwt, salt);
    if (address.toLowerCase() !== row.address.toLowerCase()) {
      throw new ZkLoginSaltError(
        'The stored salt no longer derives the stored address for this identity — refusing to sign anyone in against it.',
        'salt_divergence',
      );
    }
    if (input.userId && !row.userId) {
      await db
        .update(userSalts)
        .set({ userId: input.userId, updatedAt: new Date() })
        .where(and(eq(userSalts.id, row.id), isNull(userSalts.userId)));
    }
    return { salt, address: row.address, source: 'stored' };
  }

  if (input.storedOnly || !enokiConfigured()) return null;
  if (!saltVaultConfigured()) {
    // Fetching a salt we cannot store would mint an address we might never
    // recover — worse than no signer at all.
    throw new ZkLoginSaltError(
      'SALT_ENCRYPTION_KEY is not set, so a fresh Enoki salt could not be kept. Set it before enabling zkLogin sign-ins.',
      'vault_unconfigured',
    );
  }

  const authority = await enokiSalt(input.jwt);
  const derived = await deriveZkLoginAddress(input.jwt, authority.salt);
  if (authority.address && derived.toLowerCase() !== authority.address.toLowerCase()) {
    throw new ZkLoginSaltError(
      'Enoki returned a salt that does not derive the address it claims for it.',
      'salt_divergence',
    );
  }

  await db
    .insert(userSalts)
    .values({
      id: saltRowId(identity),
      issuer: identity.issuer,
      audience: identity.audience,
      subject: identity.subject,
      saltCiphertext: sealSalt(authority.salt),
      address: derived.toLowerCase(),
      authority: 'enoki',
      userId: input.userId ?? null,
    })
    .onConflictDoNothing();

  // Re-read rather than trust our own insert: a concurrent first login may
  // have won the race, and the row that exists is the one that counts.
  const settled = await db
    .select({ saltCiphertext: userSalts.saltCiphertext, address: userSalts.address })
    .from(userSalts)
    .where(
      and(
        eq(userSalts.issuer, identity.issuer),
        eq(userSalts.audience, identity.audience),
        eq(userSalts.subject, identity.subject),
      ),
    )
    .limit(1);
  const winner = settled[0];
  const salt = openSalt(winner.saltCiphertext);
  if (salt !== authority.salt) {
    throw new ZkLoginSaltError(
      'Two salts exist for one identity (a racing login stored a different one) — a human must reconcile before this identity signs.',
      'salt_divergence',
    );
  }
  return { salt, address: winner.address, source: 'enoki' };
}
