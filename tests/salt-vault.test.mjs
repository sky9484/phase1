/**
 * The salt vault (lib/server/salt-vault.ts): a zkLogin salt survives the
 * round trip byte-for-byte, nothing but the right key opens it, and the
 * failure messages never quote the salt — losing one loses a wallet member,
 * leaking one links an identity to an address.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { SaltVaultError, openSalt, saltVaultConfigured, sealSalt } from '../lib/server/salt-vault.ts';

const KEY = { SALT_ENCRYPTION_KEY: 'a'.repeat(64) };
const OTHER = { SALT_ENCRYPTION_KEY: 'b'.repeat(64) };
const SALT = '129390038577185583942388216820280642146';

test('a salt round-trips exactly, under a fresh envelope every time', () => {
  const first = sealSalt(SALT, KEY);
  const second = sealSalt(SALT, KEY);
  assert.notEqual(first, second, 'a fresh iv per seal');
  assert.equal(openSalt(first, KEY), SALT);
  assert.equal(openSalt(second, KEY), SALT);
});

test('only the right key opens it, and the wrong-key message names the key, not the salt', () => {
  const sealed = sealSalt(SALT, KEY);
  assert.throws(
    () => openSalt(sealed, OTHER),
    (e) => e instanceof SaltVaultError && /SALT_ENCRYPTION_KEY/.test(e.message) && !e.message.includes(SALT),
  );
});

test('a truncated envelope and a non-decimal salt are refused by name', () => {
  assert.throws(() => openSalt('AAAA', KEY), /truncated/);
  assert.throws(() => sealSalt('0x1234', KEY), /decimal/);
  assert.throws(() => sealSalt('', KEY), /decimal/);
});

test('the vault says whether it can operate, without throwing', () => {
  assert.equal(saltVaultConfigured(KEY), true);
  assert.equal(saltVaultConfigured({ SALT_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64') }), true);
  assert.equal(saltVaultConfigured({}), false);
  assert.equal(saltVaultConfigured({ SALT_ENCRYPTION_KEY: 'short' }), false);
});

test('sealing without a key names what to generate', () => {
  assert.throws(() => sealSalt(SALT, {}), /openssl rand -hex 32/);
});
