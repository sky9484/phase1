/**
 * The business wallet's membership law (v15 §4), as pure functions:
 * lib/wallet/org-wallet-rules.ts. The acceptance matrix — Splash's cold key
 * alone fails, recovery contact + cold passes, the admin alone passes — is
 * checked in REAL cryptography (signatures verified against the derived
 * multisig), not just arithmetic, because the arithmetic is what an
 * implementation bug would get wrong quietly.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { MultiSigPublicKey } from '@mysten/sui/multisig';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { PasskeyPublicKey } from '@mysten/sui/keypairs/passkey';
import { genAddressSeed, toZkLoginPublicIdentifier } from '@mysten/sui/zklogin';

import {
  ORG_WALLET_THRESHOLD,
  OrgWalletRuleError,
  ROLE_WEIGHT,
  combineSignatures,
  deriveOrgWalletAddress,
  memberPublicKey,
  orgWalletPublicKey,
  passkeyMemberOf,
  rolesMeetThreshold,
  validateMembers,
  zkLoginMemberOf,
} from '../lib/wallet/org-wallet-rules.ts';

const AUD = 'splash-test-client-id.apps.googleusercontent.com';
const ISS = 'https://accounts.google.com';

function zkMember(role, { sub, salt, userId }) {
  const seed = genAddressSeed(BigInt(salt), 'sub', sub, AUD);
  const identifier = toZkLoginPublicIdentifier(seed, ISS, { legacyAddress: false });
  return { kind: 'zklogin', role, publicKey: identifier.toSuiPublicKey(), weight: ROLE_WEIGHT[role], userId, label: role };
}

function passkeyBackup(userId) {
  const device = new Secp256r1Keypair();
  const publicKey = new PasskeyPublicKey(device.getPublicKey().toRawBytes());
  return {
    member: { kind: 'passkey', role: 'backup', publicKey: publicKey.toSuiPublicKey(), weight: 2, userId, label: 'backup' },
    device,
  };
}

function coldMember(keypair = new Ed25519Keypair()) {
  return {
    member: { kind: 'cold', role: 'splash-cold', publicKey: keypair.getPublicKey().toSuiPublicKey(), weight: 1, label: 'Splash recovery' },
    keypair,
  };
}

function fullWallet() {
  const admin = zkMember('admin', { sub: '111111111', salt: '13579', userId: 'op_admin@acme.test' });
  const backup = passkeyBackup('op_admin@acme.test');
  const recovery = zkMember('recovery', { sub: '22222222', salt: '2468', userId: 'op_second@acme.test' });
  const cold = coldMember();
  return { members: [admin, backup.member, recovery, cold.member], backup, cold, admin, recovery };
}

test('the four-member wallet derives one address, and any membership change moves it', () => {
  const { members } = fullWallet();
  const address = deriveOrgWalletAddress(members);
  assert.match(address, /^0x[0-9a-f]{64}$/);
  assert.equal(deriveOrgWalletAddress(members), address, 'derivation is deterministic');

  const replacedCold = [...members.slice(0, 3), coldMember().member];
  assert.notEqual(deriveOrgWalletAddress(replacedCold), address, 'a new cold key is a new wallet');
});

test('every member round-trips through the stored public key form', () => {
  for (const member of fullWallet().members) {
    assert.equal(memberPublicKey(member).toSuiPublicKey(), member.publicKey);
  }
});

test('membership law: what validateMembers refuses, by name', () => {
  const { members } = fullWallet();
  const refuse = (mutate, pattern) => {
    const copy = structuredClone(members);
    mutate(copy);
    assert.throws(() => validateMembers(copy), (e) => e instanceof OrgWalletRuleError && pattern.test(e.message), String(pattern));
  };

  refuse((m) => m.push({ ...m[0], publicKey: zkMember('admin', { sub: '3333', salt: '77', userId: 'op_x@x.test' }).publicKey }), /exactly one main admin/);
  refuse((m) => { m[0].weight = 1; }, /weighs 2/);
  refuse((m) => { m[2].kind = 'passkey'; }, /cannot be a passkey key/);
  refuse((m) => { m[3].userId = 'op_staff@splash.test'; }, /no user account/);
  refuse((m) => { delete m[2].userId; }, /names the user/);
  refuse((m) => { m[1].publicKey = m[0].publicKey; }, /share one public key/);
  // Recovery + cold only: dies on the admin rule first — the weight-2 rule
  // behind it is defence for a future weight change, not a reachable state.
  refuse((m) => m.splice(0, 2), /exactly one main admin/);
  assert.equal(validateMembers(members), members, 'the valid set passes through');
});

test('Splash can never meet the threshold by itself, whatever subset it holds', () => {
  assert.equal(rolesMeetThreshold(['splash-cold']), false);
  assert.equal(rolesMeetThreshold(['recovery', 'splash-cold']), true, 'recovery + cold IS the recovery path');
  assert.equal(rolesMeetThreshold(['admin']), true);
  assert.equal(rolesMeetThreshold(['backup']), true);
  assert.equal(rolesMeetThreshold(['recovery']), false);
});

test('acceptance: cold alone fails verification; recovery+cold passes; the admin-weight key alone passes', async () => {
  // Signable stand-ins with the EXACT v15 weights (2/2/1/1, threshold 2):
  // ed25519 for the weight-2 and weight-1 members, so every signature is
  // real and verification is the SDK's, not this test's.
  const admin = new Ed25519Keypair();
  const backup = new Ed25519Keypair();
  const recovery = new Ed25519Keypair();
  const cold = new Ed25519Keypair();
  const wallet = MultiSigPublicKey.fromPublicKeys({
    threshold: ORG_WALLET_THRESHOLD,
    publicKeys: [
      { publicKey: admin.getPublicKey(), weight: 2 },
      { publicKey: backup.getPublicKey(), weight: 2 },
      { publicKey: recovery.getPublicKey(), weight: 1 },
      { publicKey: cold.getPublicKey(), weight: 1 },
    ],
  });
  const bytes = new TextEncoder().encode('splash acceptance probe');
  const sig = async (kp) => (await kp.signPersonalMessage(bytes)).signature;

  const verified = (combined) => wallet.verifyPersonalMessage(bytes, combined).then((ok) => ok, () => false);

  assert.equal(await verified(wallet.combinePartialSignatures([await sig(cold)])), false, 'Splash cold alone moves nothing');
  assert.equal(await verified(wallet.combinePartialSignatures([await sig(recovery)])), false, 'the recovery contact alone moves nothing');
  assert.equal(await verified(wallet.combinePartialSignatures([await sig(recovery), await sig(cold)])), true, 'recovery + cold is the migration pair');
  assert.equal(await verified(wallet.combinePartialSignatures([await sig(admin)])), true, 'the main admin signs alone');
  assert.equal(await verified(wallet.combinePartialSignatures([await sig(backup)])), true, 'the backup passkey signs alone');
});

test('combineSignatures refuses an empty set and a stranger, and accepts a member', async () => {
  const { members, cold } = fullWallet();
  assert.throws(() => combineSignatures(members, []), OrgWalletRuleError);

  const bytes = new TextEncoder().encode('combine probe');
  const { signature: coldSig } = await cold.keypair.signPersonalMessage(bytes);
  const combined = combineSignatures(members, [coldSig]);
  assert.equal(typeof combined, 'string');

  const stranger = await new Ed25519Keypair().signPersonalMessage(bytes);
  assert.throws(() => combineSignatures(members, [stranger.signature]));
});

test('member lookups: by passkey key and by user id', () => {
  const { members, backup } = fullWallet();
  const suiForm = new PasskeyPublicKey(backup.device.getPublicKey().toRawBytes()).toSuiPublicKey();
  assert.equal(passkeyMemberOf(members, suiForm)?.role, 'backup');
  assert.equal(passkeyMemberOf(members, 'AAAA'), null);
  assert.equal(zkLoginMemberOf(members, 'op_second@acme.test')?.role, 'recovery');
  assert.equal(zkLoginMemberOf(members, 'op_nobody@acme.test'), null);
});

test('orgWalletPublicKey always validates first', () => {
  const { members } = fullWallet();
  const broken = structuredClone(members);
  broken[0].weight = 1;
  assert.throws(() => orgWalletPublicKey(broken), OrgWalletRuleError);
});
