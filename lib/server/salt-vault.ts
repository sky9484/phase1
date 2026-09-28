/**
 * Encrypted storage for zkLogin salts (v15 §3).
 *
 * The salt is the second factor of a zkLogin address: whoever holds it can
 * link the OAuth subject to the on-chain address, and LOSING it loses the
 * wallet permanently. Enoki is the salt authority; this vault keeps an
 * envelope-encrypted copy in Splash's own database so that
 *
 *   - the address survives an Enoki outage (login falls back to the stored
 *     salt, the fallback prover receives the SAME salt, the address is
 *     unchanged), and
 *   - a divergent salt from the authority is detected before it silently
 *     derives a different wallet.
 *
 * AES-256-GCM under SALT_ENCRYPTION_KEY, laid out iv(12) ‖ tag(16) ‖ ct as
 * one base64 string — the same shape lib/server/seal.ts uses, so an operator
 * inspecting rows meets one convention. The plaintext salt is a decimal
 * string and MUST never reach a log line; every error here speaks about the
 * salt without quoting it.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const IV_BYTES = 12;
const TAG_BYTES = 16;

export class SaltVaultError extends Error {}

function vaultKey(env: NodeJS.ProcessEnv = process.env): Buffer {
  const raw = (env.SALT_ENCRYPTION_KEY ?? '').trim();
  if (!raw) {
    throw new SaltVaultError(
      'SALT_ENCRYPTION_KEY is not set. Generate 32 random bytes (openssl rand -hex 32) — losing this key strands every stored salt.',
    );
  }
  const key = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new SaltVaultError('SALT_ENCRYPTION_KEY must be 32 bytes, hex or base64.');
  }
  return key;
}

/** True when the vault can operate; lets callers refuse before touching salts. */
export function saltVaultConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  try {
    vaultKey(env);
    return true;
  } catch {
    return false;
  }
}

/** A salt is a decimal string (a field element). Refuse anything else early. */
function assertSaltShape(salt: string): string {
  if (!/^[0-9]{1,78}$/.test(salt)) {
    throw new SaltVaultError('A zkLogin salt is a decimal string.');
  }
  return salt;
}

export function sealSalt(salt: string, env: NodeJS.ProcessEnv = process.env): string {
  assertSaltShape(salt);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', vaultKey(env), iv);
  const ciphertext = Buffer.concat([cipher.update(salt, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}

export function openSalt(sealed: string, env: NodeJS.ProcessEnv = process.env): string {
  const payload = Buffer.from(sealed, 'base64');
  if (payload.length <= IV_BYTES + TAG_BYTES) {
    throw new SaltVaultError('The stored salt envelope is truncated.');
  }
  const decipher = createDecipheriv('aes-256-gcm', vaultKey(env), payload.subarray(0, IV_BYTES));
  decipher.setAuthTag(payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
  try {
    const salt = Buffer.concat([
      decipher.update(payload.subarray(IV_BYTES + TAG_BYTES)),
      decipher.final(),
    ]).toString('utf8');
    return assertSaltShape(salt);
  } catch (error) {
    if (error instanceof SaltVaultError) throw error;
    // A GCM tag mismatch: the key changed or the row was tampered with.
    throw new SaltVaultError('The stored salt does not decrypt under SALT_ENCRYPTION_KEY.');
  }
}
