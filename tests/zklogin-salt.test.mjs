/**
 * resolveUserSalt (v15 WS1) on PGlite: the stored copy first, else Enoki —
 * and every divergence refused. Enoki is a scripted fetch; nothing here
 * reaches the network.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

import * as schema from '../lib/db/schema.ts';
import { deriveZkLoginAddress } from '../lib/auth/zklogin.ts';
import { ZkLoginProverError } from '../lib/auth/zklogin-prover.ts';
import { ZkLoginSaltError, resolveUserSalt } from '../lib/auth/zklogin-salt.ts';
import { openSalt, sealSalt } from '../lib/server/salt-vault.ts';

const ENV_KEYS = ['SALT_ENCRYPTION_KEY', 'ENOKI_API_KEY', 'ENOKI_API_URL'];
const savedEnv = {};
const realFetch = globalThis.fetch;
test.before(() => {
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
  process.env.SALT_ENCRYPTION_KEY = 'd'.repeat(64);
  process.env.ENOKI_API_KEY = 'test-enoki-key';
  process.env.ENOKI_API_URL = 'https://enoki.invalid';
});
test.afterEach(() => {
  globalThis.fetch = realFetch;
  process.env.SALT_ENCRYPTION_KEY = 'd'.repeat(64);
  process.env.ENOKI_API_KEY = 'test-enoki-key';
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

const ISS = 'https://accounts.google.com';
const AUD = 'splash-test-client';
const b64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwtFor = (sub) => [b64url({ alg: 'RS256', kid: 'k1' }), b64url({ iss: ISS, aud: AUD, sub }), 'sig'].join('.');
const identityFor = (sub) => ({ issuer: ISS, audience: AUD, subject: sub });

/** Enoki answering /v1/zklogin with this salt (and, by default, its true address). */
function scriptEnoki(answer) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: init?.headers });
    if (answer === 'down') throw new TypeError('fetch failed');
    return new Response(JSON.stringify({ data: answer }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return calls;
}

async function storeRow(db, sub, salt, address) {
  await db.insert(schema.userSalts).values({
    id: `usalt_${sub}`,
    issuer: ISS,
    audience: AUD,
    subject: sub,
    saltCiphertext: sealSalt(salt),
    address,
    authority: 'enoki',
  });
}

test('a stored salt is used as-is, without asking the authority', async () => {
  const { db, client } = await migratedDb();
  const jwt = jwtFor('1001');
  const address = (await deriveZkLoginAddress(jwt, '424242')).toLowerCase();
  await storeRow(db, '1001', '424242', address);
  const calls = scriptEnoki('down');

  const resolved = await resolveUserSalt(db, { jwt, identity: identityFor('1001') });
  assert.deepEqual(resolved, { salt: '424242', address, source: 'stored' });
  assert.equal(calls.length, 0, 'an Enoki outage cannot touch a returning user');
  await client.close();
});

test('a stored salt that no longer derives the stored address is refused', async () => {
  const { db, client } = await migratedDb();
  const jwt = jwtFor('1002');
  await storeRow(db, '1002', '424242', `0x${'ab'.repeat(32)}`);
  await assert.rejects(resolveUserSalt(db, { jwt, identity: identityFor('1002') }), (error) => {
    assert.ok(error instanceof ZkLoginSaltError);
    assert.equal(error.code, 'salt_divergence');
    return true;
  });
  await client.close();
});

test('storedOnly never asks the authority and never writes', async () => {
  const { db, client } = await migratedDb();
  const jwt = jwtFor('1003');
  const calls = scriptEnoki({ salt: '999', address: '' });
  const resolved = await resolveUserSalt(db, { jwt, identity: identityFor('1003'), storedOnly: true });
  assert.equal(resolved, null);
  assert.equal(calls.length, 0);
  assert.equal((await db.select().from(schema.userSalts)).length, 0);
  await client.close();
});

test('first contact: the Enoki salt is checked against its address, sealed and stored', async () => {
  const { db, client } = await migratedDb();
  const jwt = jwtFor('1004');
  const address = (await deriveZkLoginAddress(jwt, '777001')).toLowerCase();
  const calls = scriptEnoki({ salt: '777001', address });
  await db.insert(schema.users).values({ id: 'op_a@x.test', email: 'a@x.test', name: 'A' });

  const resolved = await resolveUserSalt(db, { jwt, identity: identityFor('1004'), userId: 'op_a@x.test' });
  assert.deepEqual(resolved, { salt: '777001', address, source: 'enoki' });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/v1\/zklogin$/);

  const [row] = await db.select().from(schema.userSalts);
  assert.equal(row.address, address);
  assert.equal(row.userId, 'op_a@x.test');
  assert.notEqual(row.saltCiphertext, '777001', 'only ciphertext is stored');
  assert.equal(openSalt(row.saltCiphertext), '777001');

  // The second sign-in reads the copy: Enoki may be down.
  scriptEnoki('down');
  assert.equal((await resolveUserSalt(db, { jwt, identity: identityFor('1004') }))?.source, 'stored');
  await client.close();
});

test('an Enoki salt that does not derive the address Enoki claims is refused and not stored', async () => {
  const { db, client } = await migratedDb();
  const jwt = jwtFor('1005');
  scriptEnoki({ salt: '777002', address: `0x${'cd'.repeat(32)}` });
  await assert.rejects(resolveUserSalt(db, { jwt, identity: identityFor('1005') }), (error) => {
    assert.ok(error instanceof ZkLoginSaltError);
    assert.equal(error.code, 'salt_divergence');
    return true;
  });
  assert.equal((await db.select().from(schema.userSalts)).length, 0);
  await client.close();
});

test('an authority salt that disagrees with a row a racing login stored is refused', async () => {
  const { db, client } = await migratedDb();
  const jwt = jwtFor('1006');
  const address = (await deriveZkLoginAddress(jwt, '777003')).toLowerCase();
  // Enoki answers, but by the time we insert, a racing login's row exists.
  globalThis.fetch = async () => {
    const racedAddress = (await deriveZkLoginAddress(jwt, '555555')).toLowerCase();
    await storeRow(db, '1006', '555555', racedAddress);
    return new Response(JSON.stringify({ data: { salt: '777003', address } }), { status: 200 });
  };
  await assert.rejects(resolveUserSalt(db, { jwt, identity: identityFor('1006') }), /Two salts exist/);
  await client.close();
});

test('Enoki down on first contact is a prover error — the sign-in route proceeds without a signer', async () => {
  const { db, client } = await migratedDb();
  scriptEnoki('down');
  await assert.rejects(resolveUserSalt(db, { jwt: jwtFor('1007'), identity: identityFor('1007') }), (error) => {
    assert.ok(error instanceof ZkLoginProverError, 'not a salt divergence');
    assert.equal(error.fatal, false);
    return true;
  });
  await client.close();
});

test('no vault key: a fresh salt is never fetched, because it could not be kept', async () => {
  const { db, client } = await migratedDb();
  delete process.env.SALT_ENCRYPTION_KEY;
  const calls = scriptEnoki({ salt: '1', address: '' });
  await assert.rejects(resolveUserSalt(db, { jwt: jwtFor('1008'), identity: identityFor('1008') }), (error) => {
    assert.ok(error instanceof ZkLoginSaltError);
    assert.equal(error.code, 'vault_unconfigured');
    return true;
  });
  assert.equal(calls.length, 0);
  await client.close();
});

test('no Enoki key and no stored copy: no salt, no error', async () => {
  const { db, client } = await migratedDb();
  delete process.env.ENOKI_API_KEY;
  assert.equal(await resolveUserSalt(db, { jwt: jwtFor('1009'), identity: identityFor('1009') }), null);
  await client.close();
});
