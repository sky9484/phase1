/**
 * The multisig seam in submit (v15 §4): a member's browser signature goes in,
 * the COMBINED wallet signature reaches the chain; a stranger's signature is
 * refused by name before the approval is spent. The harness is the
 * stablecoin-send scripted chain with one addition — execute records the
 * signature it was handed.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { fromBase64, toBase64 } from '@mysten/sui/utils';
import { drizzle } from 'drizzle-orm/pglite';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';
import { verifyTransactionSignature } from '@mysten/sui/verify';
import { sha256 } from '@noble/hashes/sha2.js';

import * as schema from '../lib/db/schema.ts';
import { quoteWalletTransfer, submitWalletTransfer } from '../lib/server/stablecoin-send.ts';
import { ROLE_WEIGHT, deriveOrgWalletAddress } from '../lib/wallet/org-wallet-rules.ts';

const RECIPIENT = `0x${'22'.repeat(32)}`;
const T0 = Date.UTC(2026, 8, 28, 12, 0, 0);

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

/** A passkey the test can sign with: a scripted WebAuthn provider over a
 *  secp256r1 key, producing the assertion a real authenticator would (the SDK verifies
 *  it). */
function derOf(compact) {
  const int = (bytes) => {
    let i = 0;
    while (i < bytes.length - 1 && bytes[i] === 0) i += 1;
    const trimmed = bytes.slice(i);
    const body = trimmed[0] & 0x80 ? [0, ...trimmed] : [...trimmed];
    return [0x02, body.length, ...body];
  };
  const seq = [...int(compact.slice(0, 32)), ...int(compact.slice(32))];
  return new Uint8Array([0x30, seq.length, ...seq]);
}

function testPasskey() {
  const device = new Secp256r1Keypair();
  const publicKey = device.getPublicKey().toRawBytes();
  const provider = {
    async create() {
      throw new Error('not used');
    },
    async get(challenge) {
      const authenticatorData = new Uint8Array(37);
      authenticatorData[32] = 0x05; // user present + verified
      const clientDataJSON = new TextEncoder().encode(
        JSON.stringify({ type: 'webauthn.get', challenge: Buffer.from(challenge).toString('base64url'), origin: 'http://localhost', crossOrigin: false }),
      );
      // Secp256r1Keypair signs sha256(message) — WebAuthn's own digest rule.
      const compact = await device.sign(new Uint8Array([...authenticatorData, ...sha256(clientDataJSON)]));
      const signature = derOf(compact);
      return { response: { authenticatorData, clientDataJSON, signature } };
    },
  };
  return new PasskeyKeypair(publicKey, provider);
}

/** The org multisig the quotes will send from: the admin's passkey (weight
 *  2, signs alone) and Splash's cold key (weight 1, never alone). */
function testWallet() {
  const admin = testPasskey();
  const cold = new Ed25519Keypair();
  const members = [
    {
      kind: 'passkey',
      role: 'admin',
      publicKey: admin.getPublicKey().toSuiPublicKey(),
      weight: ROLE_WEIGHT.admin,
      userId: 'u_owner',
      label: 'Main admin (passkey)',
    },
    {
      kind: 'cold',
      role: 'splash-cold',
      publicKey: cold.getPublicKey().toSuiPublicKey(),
      weight: ROLE_WEIGHT['splash-cold'],
      label: 'Splash recovery',
    },
  ];
  return { members, admin, cold, address: deriveOrgWalletAddress(members).toLowerCase() };
}

async function setup(wallet) {
  const { client, db } = await migratedDb();
  await client.exec(`INSERT INTO organizations (id, name, kyb_lifecycle) VALUES ('org_m', 'M Co', 'REGISTERED')`);
  await client.exec(`INSERT INTO users (id, email, name) VALUES ('u_owner', 'owner@m.test', 'Owner')`);
  await client.exec(`INSERT INTO suppliers (id, org_id, name, country, payout_method, wallet_address, wallet_provider)
    VALUES ('rcpt_m', 'org_m', 'Maria', 'PH', 'WALLET', '${RECIPIENT}', 'SLUSH')`);
  const recipient = {
    id: 'rcpt_m', orgId: 'org_m', name: 'Maria', country: 'PH', bank: '', swift: '', account: '', tier: 'PAYOUT_ONLY',
    kybStatus: 'none', createdVia: 'manual', createdAt: new Date(T0).toISOString(),
    payoutMethod: 'WALLET', walletAddress: RECIPIENT, walletProvider: 'SLUSH', screeningVerdict: 'CLEAR',
  };

  const executed = [];
  const landed = new Map();
  const decode = (bytes) => JSON.parse(new TextDecoder().decode(bytes));
  const observe = (bytes) => {
    const tx = decode(bytes);
    const total = tx.legs.reduce((s, l) => s + BigInt(l.amountMinor), 0n);
    return {
      digest: createHash('sha256').update(bytes).digest('hex'),
      success: true,
      error: null,
      sender: tx.sender,
      balanceChanges: [
        { coinType: tx.coinType, address: tx.sender, amount: (-total).toString() },
        ...tx.legs.map((l) => ({ coinType: tx.coinType, address: l.address, amount: String(l.amountMinor) })),
      ],
    };
  };
  const approvals = { consumed: 0, released: 0 };
  const deps = {
    db,
    chain: {
      async build(input) {
        return new TextEncoder().encode(
          JSON.stringify({ ...input, legs: input.legs.map((l) => ({ ...l, amountMinor: l.amountMinor.toString() })) }),
        );
      },
      async simulate(bytes) {
        return observe(bytes);
      },
      async execute(bytes, signature) {
        executed.push(signature);
        const o = observe(bytes);
        landed.set(o.digest, o);
        return o;
      },
      async read(digest) {
        return landed.get(digest) ?? null;
      },
      digestOf: (bytes) => createHash('sha256').update(bytes).digest('hex'),
      senderOf: (bytes) => decode(bytes).sender,
      describeBuildError: (e) => String(e.message),
    },
    approval: {
      consume: async () => {
        approvals.consumed += 1;
        return true;
      },
      release: async () => {
        approvals.released += 1;
      },
    },
    readRecipient: async (orgId, id) => (orgId === 'org_m' && id === 'rcpt_m' ? recipient : null),
    feeAddress: () => undefined,
    isSplashWallet: async () => false,
    multisig: {
      bySender: async (address) => (address === wallet.address ? { members: wallet.members } : null),
    },
    now: () => T0,
  };
  return { client, deps, executed, approvals };
}

test('a member partial is combined into the wallet signature the chain receives', async () => {
  const wallet = testWallet();
  const { client, deps, executed, approvals } = await setup(wallet);

  const quote = await quoteWalletTransfer(deps, {
    orgId: 'org_m', userId: 'u_owner', role: 'OWNER', recipientId: 'rcpt_m', amount: '1000', senderAddress: wallet.address,
  });
  assert.ok(quote.ok, JSON.stringify(quote));

  const bytes = fromBase64(quote.transactionBytes);
  const { signature: partial } = await wallet.admin.signTransaction(bytes);

  const sent = await submitWalletTransfer(deps, {
    orgId: 'org_m', role: 'OWNER', outflowId: quote.outflowId, transactionBytes: quote.transactionBytes, signature: partial,
  });
  assert.equal(sent.status, 'CONFIRMED', JSON.stringify(sent));
  assert.equal(executed.length, 1);
  assert.notEqual(executed[0], partial, 'the chain never sees the bare partial');
  const combinedBytes = fromBase64(executed[0]);
  assert.equal(combinedBytes[0], 0x03, 'the combined form carries the multisig flag');
  // The combined signature is one Sui itself accepts for the wallet address.
  const signer = await verifyTransactionSignature(bytes, executed[0]);
  assert.equal(signer.toSuiAddress().toLowerCase(), wallet.address);
  assert.equal(approvals.consumed, 1);
  await client.close();
});

test('a member key that cannot meet the threshold alone is 400 below_threshold, before anything is spent', async () => {
  const wallet = testWallet();
  const { client, deps, executed, approvals } = await setup(wallet);

  const quote = await quoteWalletTransfer(deps, {
    orgId: 'org_m', userId: 'u_owner', role: 'OWNER', recipientId: 'rcpt_m', amount: '1000', senderAddress: wallet.address,
  });
  assert.ok(quote.ok);
  // The Splash cold key weighs 1: a genuine member signature the chain would
  // still refuse. Refused here, so no approval burns and no digest is bound.
  const { signature: coldPartial } = await wallet.cold.signTransaction(fromBase64(quote.transactionBytes));
  const refused = await submitWalletTransfer(deps, {
    orgId: 'org_m', role: 'OWNER', outflowId: quote.outflowId, transactionBytes: quote.transactionBytes, signature: coldPartial,
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'below_threshold');
  assert.equal(executed.length, 0, 'nothing reached the chain');
  assert.equal(approvals.consumed, 0, 'refused before the approval was spent');

  // The same quote still goes through with a key that can sign alone.
  const { signature: adminPartial } = await wallet.admin.signTransaction(fromBase64(quote.transactionBytes));
  const sent = await submitWalletTransfer(deps, {
    orgId: 'org_m', role: 'OWNER', outflowId: quote.outflowId, transactionBytes: quote.transactionBytes, signature: adminPartial,
  });
  assert.equal(sent.status, 'CONFIRMED', JSON.stringify(sent));
  await client.close();
});

test("a stranger's signature is 400 not_a_member, and no approval is spent on it", async () => {
  const wallet = testWallet();
  const { client, deps, executed, approvals } = await setup(wallet);

  const quote = await quoteWalletTransfer(deps, {
    orgId: 'org_m', userId: 'u_owner', role: 'OWNER', recipientId: 'rcpt_m', amount: '1000', senderAddress: wallet.address,
  });
  assert.ok(quote.ok);
  const { signature: strangerSig } = await new Ed25519Keypair().signTransaction(fromBase64(quote.transactionBytes));

  const refused = await submitWalletTransfer(deps, {
    orgId: 'org_m', role: 'OWNER', outflowId: quote.outflowId, transactionBytes: quote.transactionBytes, signature: strangerSig,
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'not_a_member');
  assert.equal(executed.length, 0, 'nothing reached the chain');
  assert.equal(approvals.consumed, 0, 'refused before the approval was spent');
  await client.close();
});

test('a sender with no org wallet passes its signature through untouched', async () => {
  const wallet = testWallet();
  const { client, deps, executed } = await setup(wallet);
  const external = `0x${'44'.repeat(32)}`;

  const quote = await quoteWalletTransfer(deps, {
    orgId: 'org_m', userId: 'u_owner', role: 'OWNER', recipientId: 'rcpt_m', amount: '1000', senderAddress: external,
  });
  assert.ok(quote.ok);
  const { signature } = await new Ed25519Keypair().signTransaction(fromBase64(quote.transactionBytes));
  const sent = await submitWalletTransfer(deps, {
    orgId: 'org_m', role: 'OWNER', outflowId: quote.outflowId, transactionBytes: quote.transactionBytes, signature,
  });
  assert.equal(sent.status, 'CONFIRMED');
  assert.equal(executed[0], signature, 'an external wallet signs for itself, as before v15');
  assert.equal(toBase64(fromBase64(executed[0])), executed[0]);
  await client.close();
});
