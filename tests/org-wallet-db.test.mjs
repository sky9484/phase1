/**
 * org_wallets and user_salts against the real migrations (v15 §4):
 * lib/wallet/org-wallet.ts and org-wallet-recovery.ts on PGlite, the same
 * code production runs. The acceptance items that need a database live here —
 * the silent wallet step, one-active-per-org, the salt round trip whose
 * recomputed address must equal the stored one, migration-as-new-row, and
 * the 72-hour recovery with its insider rule.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { PasskeyPublicKey } from '@mysten/sui/keypairs/passkey';
import { toBase64 } from '@mysten/sui/utils';

import * as schema from '../lib/db/schema.ts';
import { ensureUserForIdentity, upsertWalletIdentity } from '../lib/db/wallet-identities.ts';
import { deriveZkLoginAddress } from '../lib/auth/zklogin.ts';
import { sealSalt } from '../lib/server/salt-vault.ts';
import { memberPublicKey, OrgWalletRuleError, deriveOrgWalletAddress } from '../lib/wallet/org-wallet-rules.ts';
import {
  assertRecoveryContactAllowed,
  createOrgWallet,
  ensureOrgWalletForUser,
  ensureWalletForAdminLogin,
  migrateOrgWallet,
  orgWalletByAddress,
  passkeyMember,
  proposedAdminMembers,
  readActiveOrgWallet,
  readCurrentOrgWallet,
  splashColdMember,
  zkLoginMember,
} from '../lib/wallet/org-wallet.ts';
import {
  RECOVERY_NOTICE_MS,
  cancelRecovery,
  completeRecovery,
  pendingRecovery,
  requestRecovery,
} from '../lib/wallet/org-wallet-recovery.ts';
import { isSplashWallet } from '../lib/server/stablecoin-deps.ts';
import { issuerUsdcAddress } from '../lib/server/usdc-invoice-payments.ts';

const ENV_KEYS = ['SALT_ENCRYPTION_KEY', 'SPLASH_RECOVERY_PUBKEY', 'ADMIN_EMAIL', 'PASSKEY_RP_ID', 'NEXT_PUBLIC_APP_URL'];
const savedEnv = {};
const coldKeypair = new Ed25519Keypair();
test.before(() => {
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
  process.env.SALT_ENCRYPTION_KEY = 'c'.repeat(64);
  process.env.SPLASH_RECOVERY_PUBKEY = coldKeypair.getPublicKey().toSuiPublicKey();
  delete process.env.PASSKEY_RP_ID;
  delete process.env.NEXT_PUBLIC_APP_URL; // relyingPartyId() → 'localhost'
});
test.after(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

async function migratedDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  const files = (await readdir(new URL('../drizzle', import.meta.url))).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sqlText = await readFile(new URL(`../drizzle/${file}`, import.meta.url), 'utf8');
    for (const statement of sqlText.split('--> statement-breakpoint')) {
      const trimmed = statement.trim();
      if (trimmed) await client.exec(trimmed);
    }
  }
  return { client, db };
}

const GOOGLE = 'https://accounts.google.com';
const AUD = 'splash-test-client';
const b64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwtFor = (sub) =>
  [b64url({ alg: 'RS256', kid: 'k1' }), b64url({ iss: GOOGLE, aud: AUD, sub }), 'sig'].join('.');

let seq = 0;
async function world(db, { withMembership = true } = {}) {
  seq += 1;
  const orgId = `org_w${seq}`;
  const email = `admin${seq}@acme.test`;
  const userId = `op_${email}`;
  await db.insert(schema.organizations).values({ id: orgId, name: `Acme ${seq}` });
  await ensureUserForIdentity(db, { userId, orgId, email });
  if (withMembership) {
    await db.insert(schema.memberships).values({ id: `mem_${seq}`, userId, orgId, role: 'admin' });
  }
  return { orgId, email, userId };
}

async function enrolTestPasskey(db, userId, tag) {
  const device = new Secp256r1Keypair();
  const publicKey = toBase64(device.getPublicKey().toRawBytes());
  const suiAddress = new PasskeyPublicKey(device.getPublicKey().toRawBytes()).toSuiAddress().toLowerCase();
  await db.insert(schema.passkeyCredentials).values({
    id: `pkc_${tag}`,
    userId,
    credentialId: `cred_${tag}`,
    publicKey,
    suiAddress,
    rpId: 'localhost',
  });
  return { publicKey, suiAddress };
}

test('the silent wallet step: an admin passkey becomes the org multisig, once', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId } = await world(db);
  const { suiAddress: rawPasskeyAddress, publicKey } = await enrolTestPasskey(db, userId, 'a1');

  const wallet = await ensureOrgWalletForUser(db, { orgId, userId });
  assert.match(wallet.address, /^0x[0-9a-f]{64}$/);
  assert.notEqual(wallet.address, rawPasskeyAddress, 'the multisig is a NEW address, not the passkey address');
  assert.equal(wallet.threshold, 2);
  assert.deepEqual(
    wallet.members.map((m) => m.role).sort(),
    ['admin', 'splash-cold'],
    'admin passkey + the configured Splash cold member',
  );
  assert.equal(deriveOrgWalletAddress(wallet.members).toLowerCase(), wallet.address, 'stored address re-derives from members');

  const again = await ensureOrgWalletForUser(db, { orgId, userId });
  assert.equal(again.id, wallet.id, 'ensure is idempotent');

  await assert.rejects(
    createOrgWallet(db, { orgId, members: [passkeyMember({ role: 'admin', publicKey, userId, label: 'x' })] }),
    (e) => e instanceof OrgWalletRuleError && /already has an active wallet/.test(e.message),
    'the partial unique index holds',
  );

  // The Splash-wallet predicate: the org wallet counts, and the legacy
  // passkey address still counts.
  assert.equal(await isSplashWallet(db, wallet.address), true);
  assert.equal(await isSplashWallet(db, rawPasskeyAddress), true);
  assert.equal(await isSplashWallet(db, `0x${'9'.repeat(64)}`), false);

  await client.close();
});

test('login-time creation is membership-gated: a mere signer cannot mint the org wallet', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId } = await world(db, { withMembership: false });
  await enrolTestPasskey(db, userId, 'g1');
  assert.equal(await ensureWalletForAdminLogin(db, { orgId, userId }), null);
  await db.insert(schema.memberships).values({ id: 'mem_g1', userId, orgId, role: 'admin' });
  const wallet = await ensureWalletForAdminLogin(db, { orgId, userId });
  assert.ok(wallet, 'the admin membership unlocks the silent step');
  await client.close();
});

test('acceptance: the address recomputed from the stored salt equals the stored address', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId } = await world(db);
  const sub = '109876543210987654321';
  const salt = '424242424242424242424242';
  const jwt = jwtFor(sub);
  const address = (await deriveZkLoginAddress(jwt, salt)).toLowerCase();

  await db.insert(schema.userSalts).values({
    id: 'usalt_t1',
    issuer: GOOGLE,
    audience: AUD,
    subject: sub,
    saltCiphertext: sealSalt(salt),
    address,
    userId,
  });
  await upsertWalletIdentity(db, { userId, orgId, suiAddress: address, oauthIss: GOOGLE, oauthSub: sub, oauthAud: AUD });

  const wallet = await ensureOrgWalletForUser(db, { orgId, userId });
  const admin = wallet.members.find((m) => m.role === 'admin');
  assert.equal(admin?.kind, 'zklogin', 'the sign-in key outranks a passkey as the admin member');
  assert.equal(
    memberPublicKey(admin).toSuiAddress().toLowerCase(),
    address,
    'the wallet member IS the identity the stored salt derives — the round trip the vault exists for',
  );
  await client.close();
});

test('membership change is migration: a new row, a new address, the old one retired', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId } = await world(db);
  await enrolTestPasskey(db, userId, 'm1');
  const v1 = await ensureOrgWalletForUser(db, { orgId, userId });

  const backupDevice = new Secp256r1Keypair();
  const members = [
    ...v1.members,
    passkeyMember({
      role: 'backup',
      publicKey: toBase64(backupDevice.getPublicKey().toRawBytes()),
      userId,
      label: 'Backup passkey',
    }),
  ];
  const { retired, wallet: v2 } = await migrateOrgWallet(db, { orgId, members });
  assert.equal(retired.id, v1.id);
  assert.equal(retired.status, 'retired');
  assert.equal(v2.version, 2);
  assert.notEqual(v2.address, v1.address);
  assert.equal((await readActiveOrgWallet(db, orgId))?.id, v2.id);
  assert.equal(await orgWalletByAddress(db, v1.address), null, 'a retired address is no longer the wallet');
  assert.equal((await orgWalletByAddress(db, v2.address))?.id, v2.id);

  await assert.rejects(
    migrateOrgWallet(db, { orgId, members }),
    /derives the same address/,
    'a no-op member set is refused',
  );
  await client.close();
});

test('the invoice issuer address prefers the org wallet and falls back to the main admin passkey', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId } = await world(db);
  const { suiAddress: passkeyAddress } = await enrolTestPasskey(db, userId, 'i1');
  assert.equal(await issuerUsdcAddress(db, orgId, 'localhost'), passkeyAddress, 'pre-wallet: the pre-v15 model');
  const wallet = await ensureOrgWalletForUser(db, { orgId, userId });
  assert.equal(await issuerUsdcAddress(db, orgId, 'localhost'), wallet.address);
  await client.close();
});

test('recovery: only the named contact opens it, the admin can kill it, and after 72h it migrates to the proposed keys', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId: adminUserId } = await world(db);
  const secondEmail = `second${seq}@acme.test`;
  const secondUserId = `op_${secondEmail}`;
  await ensureUserForIdentity(db, { userId: secondUserId, orgId, email: secondEmail });
  await enrolTestPasskey(db, adminUserId, 'r1');
  await enrolTestPasskey(db, secondUserId, 'r2');

  // A full wallet with a recovery contact (the second person's sign-in key).
  const adminMembers = await proposedAdminMembers(db, { userId: adminUserId, orgId });
  const recoveryMember = zkLoginMember({
    role: 'recovery',
    issuer: GOOGLE,
    audience: AUD,
    subject: '222222222222',
    salt: '777777',
    userId: secondUserId,
    label: 'Recovery contact',
  });
  const cold = splashColdMember();
  const wallet = await createOrgWallet(db, { orgId, members: [...adminMembers, recoveryMember, cold] });

  // The recovered wallet: the contact's key becomes the ADMIN, so they leave
  // the recovery seat — the insider rule (checked at create AND migrate)
  // refuses a wallet whose recovery contact is its own admin.
  const proposed = [
    ...(await proposedAdminMembers(db, { userId: secondUserId, label: 'Recovered admin key' })),
    cold,
  ];

  await assert.rejects(
    requestRecovery(db, { orgId, requestedByUserId: adminUserId, proposedMembers: proposed, reason: 'x' }),
    /named recovery contact/,
    'the admin is not the recovery contact',
  );

  const t0 = Date.UTC(2026, 9, 1);
  const migrating = await requestRecovery(db, {
    orgId,
    requestedByUserId: secondUserId,
    proposedMembers: proposed,
    reason: 'phone lost',
    nowMs: t0,
  });
  assert.equal(migrating.status, 'migrating');
  assert.ok(pendingRecovery(migrating));
  assert.equal(await orgWalletByAddress(db, wallet.address).then((w) => w?.id), wallet.id, 'a migrating wallet still owns its funds');

  // During the notice the migrating wallet is still THE wallet: the silent
  // wallet step must not mint a second one beside it.
  assert.equal((await ensureOrgWalletForUser(db, { orgId, userId: adminUserId })).id, wallet.id, 'no parallel wallet');
  assert.equal((await readCurrentOrgWallet(db, orgId))?.status, 'migrating', 'the admin sees the pending recovery');

  const emptied = async () => ({ ok: true, sweepDigest: null });
  const neverCalled = async () => assert.fail('the chain is not asked before the notice ends');
  await assert.rejects(
    completeRecovery(db, { orgId, nowMs: t0 + RECOVERY_NOTICE_MS - 1, confirmSweep: neverCalled }),
    /notice has not ended/,
  );

  await cancelRecovery(db, { orgId, byUserId: adminUserId });
  assert.equal((await readActiveOrgWallet(db, orgId))?.recovery, null, 'cancelled clean');

  await requestRecovery(db, { orgId, requestedByUserId: secondUserId, proposedMembers: proposed, reason: 'phone lost', nowMs: t0 });
  await assert.rejects(
    cancelRecovery(db, { orgId, byUserId: secondUserId }),
    /main admin/,
    'the requester cannot also be the canceller',
  );

  // The chain says the old wallet still holds USDC: nothing is recorded, and
  // the recovery survives intact for the retry.
  const after = t0 + RECOVERY_NOTICE_MS + 1;
  let asked;
  await assert.rejects(
    completeRecovery(db, {
      orgId,
      nowMs: after,
      confirmSweep: async (sweep) => {
        asked = sweep;
        return { ok: false, reason: 'The old wallet still holds USDC.' };
      },
    }),
    /still holds USDC/,
  );
  assert.equal(asked.from, wallet.address, 'the sweep is checked from the wallet being recovered');
  assert.equal(asked.to, deriveOrgWalletAddress(proposed).toLowerCase(), '...to the proposed wallet');
  const still = await readCurrentOrgWallet(db, orgId);
  assert.equal(still?.id, wallet.id);
  assert.equal(still?.status, 'migrating', 'a refused completion leaves the recovery in place');
  assert.ok(still?.recovery);

  const { wallet: recovered, retired } = await completeRecovery(db, {
    orgId,
    nowMs: after,
    confirmSweep: async () => ({ ok: true, sweepDigest: 'SweepDigest1111111111111111111111111111' }),
  });
  assert.equal(recovered.version, wallet.version + 1);
  assert.equal(recovered.members.find((m) => m.role === 'admin')?.userId, secondUserId, 'the new admin key rules the recovered wallet');
  assert.equal(deriveOrgWalletAddress(recovered.members).toLowerCase(), recovered.address);
  assert.equal(retired.status, 'retired');
  assert.equal(retired.recovery?.sweepDigest, 'SweepDigest1111111111111111111111111111', 'the evidence stays on the retired row');
  assert.equal(retired.recovery?.requestedBy, secondUserId);
  await assert.rejects(completeRecovery(db, { orgId, nowMs: after, confirmSweep: emptied }), /No recovery is in progress/);
  await client.close();
});

test('recovery requests are reviewed at request time, and a completion cannot land on a replaced request', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId: adminUserId } = await world(db);
  const secondEmail = `second${seq}@acme.test`;
  const secondUserId = `op_${secondEmail}`;
  await ensureUserForIdentity(db, { userId: secondUserId, orgId, email: secondEmail });
  await enrolTestPasskey(db, adminUserId, 'rr1');
  await enrolTestPasskey(db, secondUserId, 'rr2');
  const recoveryMember = zkLoginMember({
    role: 'recovery', issuer: GOOGLE, audience: AUD, subject: '444444', salt: '55', userId: secondUserId, label: 'Recovery contact',
  });
  const cold = splashColdMember();
  const adminMembers = await proposedAdminMembers(db, { userId: adminUserId, orgId });
  await createOrgWallet(db, { orgId, members: [...adminMembers, recoveryMember, cold] });

  // Proposing the contact as BOTH the new admin and the recovery seat: the
  // insider rule refuses it now, so the wallet is never frozen for 72h on a
  // proposal the ceremony could not create.
  const selfGuarded = [
    ...(await proposedAdminMembers(db, { userId: secondUserId, label: 'Recovered admin key' })),
    recoveryMember,
    cold,
  ];
  await assert.rejects(
    requestRecovery(db, { orgId, requestedByUserId: secondUserId, proposedMembers: selfGuarded, reason: 'x' }),
    /second person/,
  );
  assert.equal((await readCurrentOrgWallet(db, orgId))?.status, 'active', 'a refused request freezes nothing');

  const proposed = [...(await proposedAdminMembers(db, { userId: secondUserId, label: 'Recovered admin key' })), cold];
  const row = await requestRecovery(db, { orgId, requestedByUserId: secondUserId, proposedMembers: proposed, reason: 'x' });
  await assert.rejects(
    migrateOrgWallet(db, {
      orgId,
      members: proposed,
      from: 'migrating',
      recoveryRequestedAt: new Date(Date.parse(row.recovery.requestedAt) - 1000).toISOString(),
    }),
    /recovery changed/,
    'a stale read of the request cannot complete the current one',
  );
  assert.equal((await readCurrentOrgWallet(db, orgId))?.status, 'migrating');
  await client.close();
});

test('the insider rule is enforced where wallets are written, not just exported', async () => {
  const { db, client } = await migratedDb();
  const { orgId, userId: adminUserId } = await world(db);
  await enrolTestPasskey(db, adminUserId, 'ins1');
  const adminMembers = await proposedAdminMembers(db, { userId: adminUserId, orgId });
  // A recovery contact who IS the admin: refused at createOrgWallet itself.
  const selfRecovery = zkLoginMember({
    role: 'recovery', issuer: GOOGLE, audience: AUD, subject: '333', salt: '99', userId: adminUserId, label: 'self',
  });
  await assert.rejects(
    createOrgWallet(db, { orgId, members: [...adminMembers, selfRecovery, splashColdMember()] }),
    /second person/,
  );
  await client.close();
});

test('the insider rule: the recovery contact is a second person at the business, never Splash', () => {
  assert.throws(
    () => assertRecoveryContactAllowed({ userId: 'op_a@x.test', email: 'a@x.test', adminUserId: 'op_a@x.test' }),
    /second person/,
  );
  assert.throws(
    () =>
      assertRecoveryContactAllowed({
        userId: 'op_staff@splash.test',
        email: 'Staff@Splash.test',
        adminUserId: 'op_a@x.test',
        env: { ADMIN_EMAIL: 'staff@splash.test' },
      }),
    /Splash staff/,
  );
  assertRecoveryContactAllowed({
    userId: 'op_b@x.test',
    email: 'b@x.test',
    adminUserId: 'op_a@x.test',
    env: { ADMIN_EMAIL: 'staff@splash.test' },
  });
});
