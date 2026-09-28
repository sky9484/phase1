/**
 * The prover pair (lib/auth/zklogin-prover.ts): Enoki first, Shinami as the
 * fallback WITH THE SAME SALT — the property that keeps an address still
 * while a provider is down — plus the wire shapes both services actually
 * take, pinned so a refactor cannot drift them.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { genAddressSeed } from '@mysten/sui/zklogin';

import {
  ZkLoginProverError,
  addressSeedFor,
  proveZkLogin,
  shinamiProve,
} from '../lib/auth/zklogin-prover.ts';

const b64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const JWT = [
  b64url({ alg: 'RS256', kid: 'k1', typ: 'JWT' }),
  b64url({ iss: 'https://accounts.google.com', aud: 'client-id.test', sub: '109876543210987654321', email: 'admin@acme.test' }),
  'signature-not-checked-here',
].join('.');
const SALT = '13579246801357924680';

const REQUEST = { jwt: JWT, extendedEphemeralPublicKey: 'A'.repeat(44), maxEpoch: 1234, randomness: '987654321' };

const PROOF_BODY = {
  proofPoints: { a: ['1', '2', '3'], b: [['1', '2'], ['3', '4'], ['5', '6']], c: ['7', '8', '9'] },
  issBase64Details: { value: 'aXNz', indexMod4: 2 },
  headerBase64: 'aGVhZGVy',
};

function withEnv(vars, run) {
  const saved = {};
  for (const [key, value] of Object.entries(vars)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });
}

function withFetch(handler, run) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init, calls.length);
  };
  return Promise.resolve()
    .then(() => run(calls))
    .finally(() => {
      globalThis.fetch = original;
    });
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('the address seed is the same function of (salt, sub, aud) both provers must agree on', () => {
  const seed = addressSeedFor(JWT, SALT);
  assert.equal(seed, genAddressSeed(BigInt(SALT), 'sub', '109876543210987654321', 'client-id.test').toString());
  assert.notEqual(addressSeedFor(JWT, '999'), seed, 'a different salt is a different address seed');
});

test('Enoki proves when healthy, and its seed is checked against the stored salt', async () => {
  await withEnv({ ENOKI_API_KEY: 'enoki-test-key', SHINAMI_ACCESS_KEY: undefined, ENOKI_API_URL: undefined, SHINAMI_ZKPROVER_URL: undefined }, () =>
    withFetch(
      (url, init) => {
        assert.match(url, /^https:\/\/api\.enoki\.mystenlabs\.com\/v1\/zklogin\/zkp$/);
        assert.equal(init.headers['zklogin-jwt'], JWT);
        assert.equal(init.headers.Authorization, 'Bearer enoki-test-key');
        const body = JSON.parse(init.body);
        assert.deepEqual(Object.keys(body).sort(), ['ephemeralPublicKey', 'maxEpoch', 'network', 'randomness']);
        return json({ data: { ...PROOF_BODY, addressSeed: addressSeedFor(JWT, SALT) } });
      },
      async () => {
        const { proof, prover } = await proveZkLogin(REQUEST, SALT);
        assert.equal(prover, 'enoki');
        assert.equal(proof.addressSeed, addressSeedFor(JWT, SALT));
      },
    ),
  );
});

test('an Enoki seed that disagrees with the stored salt is refused, not accepted quietly', async () => {
  await withEnv({ ENOKI_API_KEY: 'enoki-test-key', SHINAMI_ACCESS_KEY: undefined }, () =>
    withFetch(
      () => json({ data: { ...PROOF_BODY, addressSeed: '42' } }),
      async () => {
        await assert.rejects(
          proveZkLogin(REQUEST, SALT),
          (e) => e instanceof ZkLoginProverError && /different address seed/.test(e.message),
        );
      },
    ),
  );
});

test('Enoki down falls back to Shinami with the SAME salt, in Shinami wire order', async () => {
  await withEnv({ ENOKI_API_KEY: 'enoki-test-key', SHINAMI_ACCESS_KEY: 'shinami-test-key', SHINAMI_ZKPROVER_URL: undefined }, () =>
    withFetch(
      (url, init, n) => {
        if (n === 1) return json({ error: 'down' }, 503);
        assert.match(url, /^https:\/\/api\.us1\.shinami\.com\/sui\/zkprover\/v1$/);
        assert.equal(init.headers['X-API-Key'], 'shinami-test-key');
        const body = JSON.parse(init.body);
        assert.equal(body.method, 'shinami_zkp_createZkLoginProof');
        assert.deepEqual(body.params, [JWT, REQUEST.maxEpoch, REQUEST.extendedEphemeralPublicKey, REQUEST.randomness, SALT, 'sub']);
        return json({ result: { zkProof: PROOF_BODY } });
      },
      async (calls) => {
        const { proof, prover } = await proveZkLogin(REQUEST, SALT);
        assert.equal(prover, 'shinami');
        assert.equal(calls.length, 2);
        // Shinami returns no addressSeed; ours comes from the same salt.
        assert.equal(proof.addressSeed, addressSeedFor(JWT, SALT));
      },
    ),
  );
});

test('with only Shinami configured, it is used directly', async () => {
  await withEnv({ ENOKI_API_KEY: undefined, SHINAMI_ACCESS_KEY: 'shinami-test-key' }, () =>
    withFetch(
      () => json({ result: { zkProof: PROOF_BODY } }),
      async (calls) => {
        const { prover } = await proveZkLogin(REQUEST, SALT);
        assert.equal(prover, 'shinami');
        assert.equal(calls.length, 1);
      },
    ),
  );
});

test('with neither prover configured, the error names the service and leaks nothing', async () => {
  await withEnv({ ENOKI_API_KEY: undefined, SHINAMI_ACCESS_KEY: undefined }, async () => {
    await assert.rejects(proveZkLogin(REQUEST, SALT), (e) => {
      assert.ok(e instanceof ZkLoginProverError);
      assert.ok(!e.message.includes(SALT) && !e.message.includes(JWT));
      return true;
    });
    await assert.rejects(shinamiProve(REQUEST, SALT), /SHINAMI_ACCESS_KEY/);
  });
});

test('a Shinami JSON-RPC error is a refusal with its code, never a half-proof', async () => {
  await withEnv({ ENOKI_API_KEY: undefined, SHINAMI_ACCESS_KEY: 'shinami-test-key' }, () =>
    withFetch(
      () => json({ error: { code: -32602, message: 'bad params' } }),
      async () => {
        await assert.rejects(
          proveZkLogin(REQUEST, SALT),
          (e) => e instanceof ZkLoginProverError && e.service === 'shinami' && /-32602/.test(e.message),
        );
      },
    ),
  );
});
