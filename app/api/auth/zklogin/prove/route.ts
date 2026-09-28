import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ZkLoginVerificationError,
  expectedNonce,
  hashSubjectForLog,
  verifyZkLoginJwt,
  zkLoginEnabled,
} from '@/lib/auth/zklogin';
import { fetchEpochInfo } from '@/lib/auth/zklogin-epoch';
import { ZkLoginProverError, proveZkLogin } from '@/lib/auth/zklogin-prover';
import { ZkLoginSaltError, resolveUserSalt } from '@/lib/auth/zklogin-salt';
import { requireCustomerRequest } from '@/lib/server/customer-auth';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/rate-limit';
import { readJsonBody } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * A ZK proof for the signed-in user's own zkLogin key (v15 WS1).
 *
 * The browser holds the ephemeral key; this route holds the prover keys and
 * the salt. It will only prove:
 *   - a JWT whose nonce binds the ephemeral key presented (mandatory here,
 *     unlike sign-in — a proof IS signing authority in the multisig);
 *   - the session holder's own identity (the JWT email must be the session
 *     email), against the salt already stored for it. No salt is minted
 *     here — first contact with the authority happens at sign-in.
 *
 * The response is the Groth16 input block `getZkLoginSignature` consumes.
 * One proof serves the whole epoch; the client caches it (sessionStorage),
 * and the rate rule assumes it does.
 */
const proveSchema = z.object({
  jwt: z.string().trim().min(1).max(8192),
  ephemeralPublicKey: z.string().trim().min(1).max(512),
  maxEpoch: z.number().int().nonnegative(),
  randomness: z.string().trim().min(1).max(256),
});

export async function POST(request: Request) {
  if (!zkLoginEnabled()) {
    return NextResponse.json(
      { error: 'zkLogin is not enabled in this environment.', code: 'zklogin_disabled' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const auth = await requireCustomerRequest(request);
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit({ rule: RATE_LIMITS.zkProveUser, key: auth.session.email });
  if (limited) return limited;

  const parsed = proveSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'A JWT and the ephemeral key material are required.', code: 'invalid_input' },
      { status: 400 },
    );
  }
  const { jwt, ephemeralPublicKey, maxEpoch, randomness } = parsed.data;

  try {
    // Binding is not optional on this route: an unbound proof would let a
    // stolen JWT be proven against a key the phisher chose. The nonce uses
    // the RAW ephemeral public key (as sign-in does); the provers want the
    // flag-prefixed EXTENDED form — derived here so the client sends one
    // shape everywhere.
    const nonce = await expectedNonce({ ephemeralPublicKeyB64: ephemeralPublicKey, maxEpoch, randomness });
    const claims = await verifyZkLoginJwt({ jwt, provider: 'google', expectedNonce: nonce });
    const [{ Ed25519PublicKey }, { getExtendedEphemeralPublicKey }] = await Promise.all([
      import('@mysten/sui/keypairs/ed25519'),
      import('@mysten/sui/zklogin'),
    ]);
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
      new Ed25519PublicKey(ephemeralPublicKey),
    );

    const email = (claims.email ?? '').trim().toLowerCase();
    if (!email || email !== auth.session.email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'The token belongs to a different account than this session.', code: 'wrong_identity' },
        { status: 403 },
      );
    }

    // A proof lives as long as its maxEpoch. Sign-in never picks more than
    // current + 2 (chooseMaxEpoch), so nothing longer is proven here either:
    // a far-future maxEpoch would be a signing credential that outlives every
    // session and logout.
    const epochInfo = await fetchEpochInfo();
    if (!epochInfo) {
      return NextResponse.json(
        { error: 'The network epoch could not be read — try again shortly.', code: 'epoch_unavailable' },
        { status: 503 },
      );
    }
    if (maxEpoch < epochInfo.epoch || maxEpoch > epochInfo.epoch + 2) {
      return NextResponse.json(
        { error: 'That signing key’s lifetime is outside what sign-in issues — sign in again.', code: 'max_epoch_out_of_range' },
        { status: 400 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Proving needs the database for the stored salt.', code: 'ledger_unavailable' },
        { status: 503 },
      );
    }
    const { getDb } = await import('@/lib/db/client');
    const db = getDb() as never;

    const resolved = await resolveUserSalt(db, {
      jwt,
      identity: { issuer: claims.iss, audience: claims.aud, subject: claims.sub },
      storedOnly: true,
    });
    if (!resolved) {
      // A fresh salt minted at prove time would be a wallet member nobody
      // reviewed at sign-in. Send them back through login, which stores it.
      return NextResponse.json(
        { error: 'No stored salt for this identity yet — sign in again first.', code: 'salt_missing' },
        { status: 409 },
      );
    }

    const { proof, prover } = await proveZkLogin(
      { jwt, extendedEphemeralPublicKey, maxEpoch, randomness },
      resolved.salt,
    );

    console.info('[zklogin] proof issued', {
      prover,
      maxEpoch,
      subject: hashSubjectForLog(claims.iss, claims.sub, claims.aud),
    });
    return NextResponse.json(
      {
        inputs: proof,
        maxEpoch,
        address: resolved.address,
        // When maxEpoch ends (nominally) — the browser drops the signer then
        // instead of offering a signature the network will refuse.
        validUntilMs:
          epochInfo.epochStartMs + (maxEpoch - epochInfo.epoch + 1) * epochInfo.epochDurationMs,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof ZkLoginVerificationError) {
      console.warn('[zklogin] prove refused', { code: error.code });
      return NextResponse.json({ error: 'The token could not be verified.', code: error.code }, { status: 401 });
    }
    if (error instanceof ZkLoginSaltError) {
      console.error('[zklogin] prove salt failure', { code: error.code });
      return NextResponse.json(
        { error: 'The stored signing salt could not be used. Contact support.', code: error.code },
        { status: 409 },
      );
    }
    if (error instanceof ZkLoginProverError) {
      console.error('[zklogin] prover unavailable', { service: error.service, status: error.status ?? null });
      return NextResponse.json(
        { error: 'The proving service is unavailable — try again shortly.', code: 'prover_unavailable' },
        { status: 502 },
      );
    }
    console.error('[zklogin] prove failed', error);
    return NextResponse.json({ error: 'Proving failed.' }, { status: 500 });
  }
}
