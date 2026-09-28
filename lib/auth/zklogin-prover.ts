/**
 * zkLogin salt and proof services (v15 §3): Enoki is the salt authority and
 * the primary prover; Shinami is the fallback prover, called with the SAME
 * salt so the derived address cannot change when the primary is down.
 *
 * Server-side only — both API keys live here and the client talks to
 * /api/auth/zklogin/* proxies. Nothing in this file logs a JWT, a salt or a
 * key; errors name the service and the HTTP status, never the payload.
 *
 * Contracts (read 2026-09-28):
 *   Enoki   GET  {ENOKI_API_URL}/v1/zklogin        headers: Authorization Bearer, zklogin-jwt
 *           → { data: { salt, address } }
 *           POST {ENOKI_API_URL}/v1/zklogin/zkp    body: { network, ephemeralPublicKey, maxEpoch, randomness }
 *           → { data: ZkLoginSignatureInputs }      (addressSeed included)
 *   Shinami POST {SHINAMI_ZKPROVER_URL}            header: X-API-Key
 *           JSON-RPC shinami_zkp_createZkLoginProof
 *           params [jwt, maxEpoch, extendedEphemeralPublicKey, jwtRandomness, salt, keyClaimName]
 *           → { result: { zkProof: { proofPoints, issBase64Details, headerBase64 } } }
 *           (no addressSeed — computed locally from the same salt, which is
 *           exactly why the fallback preserves the address)
 */
import { decodeJwt, genAddressSeed } from '@mysten/sui/zklogin';

import { SUI_NETWORK } from '../sui.ts';

/** The Groth16 inputs `getZkLoginSignature` wants, addressSeed included. */
export type ZkLoginProof = {
  proofPoints: { a: string[]; b: string[][]; c: string[] };
  issBase64Details: { value: string; indexMod4: number };
  headerBase64: string;
  addressSeed: string;
};

export type ProofRequest = {
  jwt: string;
  /** Flag-prefixed ephemeral public key, base64 (`getExtendedEphemeralPublicKey`). */
  extendedEphemeralPublicKey: string;
  maxEpoch: number;
  /** The nonce randomness, decimal string. */
  randomness: string;
};

export class ZkLoginProverError extends Error {
  readonly service: 'enoki' | 'shinami';
  readonly status?: number;
  /** True for refusals no fallback may swallow (address-seed divergence). */
  fatal = false;
  constructor(message: string, service: 'enoki' | 'shinami', status?: number) {
    super(message);
    this.service = service;
    this.status = status;
  }
}

const env = (key: string) => (process.env[key] ?? '').trim();

export function enokiConfigured(): boolean {
  return env('ENOKI_API_KEY') !== '';
}

export function shinamiConfigured(): boolean {
  return env('SHINAMI_ACCESS_KEY') !== '';
}

function enokiUrl(path: string): string {
  const base = env('ENOKI_API_URL') || 'https://api.enoki.mystenlabs.com';
  return `${base.replace(/\/$/, '')}${path}`;
}

const TIMEOUT_MS = 20_000;

async function enokiRequest<T>(path: string, jwt: string, init?: RequestInit): Promise<T> {
  if (!enokiConfigured()) {
    throw new ZkLoginProverError('ENOKI_API_KEY is not set.', 'enoki');
  }
  let response: Response;
  try {
    response = await fetch(enokiUrl(path), {
      ...init,
      headers: {
        Authorization: `Bearer ${env('ENOKI_API_KEY')}`,
        'zklogin-jwt': jwt,
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ZkLoginProverError('Enoki is unreachable.', 'enoki');
  }
  if (!response.ok) {
    throw new ZkLoginProverError(`Enoki answered ${response.status}.`, 'enoki', response.status);
  }
  const body = (await response.json().catch(() => null)) as { data?: T } | null;
  if (!body?.data) throw new ZkLoginProverError('Enoki answered without a data field.', 'enoki');
  return body.data;
}

/** The salt (and derived address) for a JWT, from the salt authority. */
export async function enokiSalt(jwt: string): Promise<{ salt: string; address: string }> {
  const data = await enokiRequest<{ salt: string; address: string }>('/v1/zklogin', jwt);
  if (!/^[0-9]+$/.test(data.salt ?? '')) {
    throw new ZkLoginProverError('Enoki returned a salt that is not a decimal string.', 'enoki');
  }
  return { salt: data.salt, address: data.address };
}

export async function enokiProve(request: ProofRequest): Promise<ZkLoginProof> {
  const data = await enokiRequest<ZkLoginProof>('/v1/zklogin/zkp', request.jwt, {
    method: 'POST',
    body: JSON.stringify({
      network: SUI_NETWORK,
      ephemeralPublicKey: request.extendedEphemeralPublicKey,
      maxEpoch: request.maxEpoch,
      randomness: request.randomness,
    }),
  });
  if (!data.proofPoints || !data.addressSeed) {
    throw new ZkLoginProverError('Enoki returned an incomplete proof.', 'enoki');
  }
  return data;
}

/** The address seed both provers must agree on: same salt ⇒ same seed. */
export function addressSeedFor(jwt: string, salt: string): string {
  const decoded = decodeJwt(jwt);
  if (!decoded.sub || !decoded.aud) {
    throw new ZkLoginProverError('The JWT is missing sub or aud.', 'shinami');
  }
  const aud = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
  return genAddressSeed(BigInt(salt), 'sub', decoded.sub, aud).toString();
}

export async function shinamiProve(request: ProofRequest, salt: string): Promise<ZkLoginProof> {
  if (!shinamiConfigured()) {
    throw new ZkLoginProverError('SHINAMI_ACCESS_KEY is not set.', 'shinami');
  }
  const url = env('SHINAMI_ZKPROVER_URL') || 'https://api.us1.shinami.com/sui/zkprover/v1';
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-API-Key': env('SHINAMI_ACCESS_KEY') },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'shinami_zkp_createZkLoginProof',
        params: [
          request.jwt,
          request.maxEpoch,
          request.extendedEphemeralPublicKey,
          request.randomness,
          salt,
          'sub',
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ZkLoginProverError('Shinami is unreachable.', 'shinami');
  }
  if (!response.ok) {
    throw new ZkLoginProverError(`Shinami answered ${response.status}.`, 'shinami', response.status);
  }
  const body = (await response.json()) as {
    result?: { zkProof?: Omit<ZkLoginProof, 'addressSeed'> };
    error?: { message?: string; code?: number };
  };
  if (body.error || !body.result?.zkProof?.proofPoints) {
    throw new ZkLoginProverError(
      `Shinami refused the proof request${body.error?.code ? ` (code ${body.error.code})` : ''}.`,
      'shinami',
    );
  }
  return { ...body.result.zkProof, addressSeed: addressSeedFor(request.jwt, salt) };
}

/**
 * A proof from the primary, or from the fallback WITH THE SAME SALT. The
 * caller supplies the salt it already holds (stored copy or fresh from
 * Enoki), so a mid-flight provider swap can never move the address.
 */
export async function proveZkLogin(request: ProofRequest, salt: string): Promise<{ proof: ZkLoginProof; prover: 'enoki' | 'shinami' }> {
  const expectedSeed = addressSeedFor(request.jwt, salt);
  if (enokiConfigured()) {
    try {
      const proof = await enokiProve(request);
      if (proof.addressSeed !== expectedSeed) {
        // The authority and our stored salt disagree. This is not an outage
        // to fall back from — it must reach a human — so it is marked fatal
        // and rethrown past the Shinami fallback below.
        const divergence = new ZkLoginProverError(
          'Enoki proved a different address seed than the stored salt derives.',
          'enoki',
        );
        divergence.fatal = true;
        throw divergence;
      }
      return { proof, prover: 'enoki' };
    } catch (error) {
      if (error instanceof ZkLoginProverError && error.fatal) throw error;
      if (!shinamiConfigured()) throw error;
      console.warn('[zklogin] enoki prover failed; using shinami with the stored salt', {
        status: error instanceof ZkLoginProverError ? error.status ?? null : null,
      });
    }
  }
  return { proof: await shinamiProve(request, salt), prover: 'shinami' };
}
