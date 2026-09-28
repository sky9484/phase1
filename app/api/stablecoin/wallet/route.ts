import { NextResponse } from 'next/server';
import { fromBase64 } from '@mysten/sui/utils';
import { PasskeyPublicKey } from '@mysten/sui/keypairs/passkey';

import { resolveAuthorityForSession, UnauthorizedError } from '@/lib/auth/authority';
import { normaliseSuiAddress, StablecoinLaneError, SUI_USDC_COIN_TYPE, STABLECOIN_NETWORK } from '@/lib/payments/stablecoin-lane';
import { requireCustomerRequest } from '@/lib/server/customer-auth';
import { requireSessionAccount } from '@/lib/server/session-account';
import { RATE_LIMITS, enforceRateLimit } from '@/lib/server/rate-limit';
import { laneClient } from '@/lib/server/stablecoin-chain';

export const dynamic = 'force-dynamic';

/**
 * A wallet's USDC and SUI on mainnet, for the send screen.
 *
 * With no `address`: the BUSINESS WALLET — the organisation's multisig
 * (v15 §4) when it exists, else the caller's own passkey address, the
 * pre-v15 model. Either way the keys live with the business; Splash stores
 * only public halves, so this is a wallet in Splash, not a balance held by
 * Splash. Anyone can fund it by sending USDC on Sui to the address, from
 * MetaMask (Sui Snap), Slush, an exchange — any source that sends Sui USDC.
 *
 * With `address`: a connected external wallet's balances (public chain data).
 */
export async function GET(request: Request) {
  const auth = await requireCustomerRequest(request);
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit({ rule: RATE_LIMITS.stablecoinQuoteUser, key: auth.session.email });
  if (limited) return limited;

  const url = new URL(request.url);
  const asked = url.searchParams.get('address');

  let address: string | null = null;
  let source: 'SPLASH_WALLET' | 'SPLASH_PASSKEY' | 'EXTERNAL' = 'EXTERNAL';
  // For signing in the browser: a passkey signature embeds its public key, and
  // the authenticator never hands it out again after enrolment. A public key
  // is not a secret — the private half never leaves the device.
  let passkey: { publicKey: string; rpId: string } | null = null;
  // The business multisig, when the org has one (v15 §4): what the desk shows
  // and which of the caller's keys can sign for it.
  let wallet: { version: number; threshold: number; memberCount: number; signers: { passkey: boolean; zklogin: boolean } } | null = null;
  if (asked) {
    try {
      address = normaliseSuiAddress(asked);
    } catch (error) {
      if (error instanceof StablecoinLaneError) return NextResponse.json({ error: error.message }, { status: 400 });
      throw error;
    }
  } else {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'The Splash wallet needs the database.' }, { status: 503 });
    let userId: string;
    try {
      userId = (await resolveAuthorityForSession(auth.session)).userId;
    } catch (error) {
      if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'No workspace membership yet.' }, { status: 403 });
      throw error;
    }
    const [{ getDb }, { findCredential, relyingPartyId }, { readCurrentOrgWallet }, { passkeyMemberOf, zkLoginMemberOf, signsAlone }] =
      await Promise.all([
        import('@/lib/db/client'),
        import('@/lib/auth/passkey'),
        import('@/lib/wallet/org-wallet'),
        import('@/lib/wallet/org-wallet-rules'),
      ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getDb() as any;
    const credential = await findCredential(db, { userId, rpId: relyingPartyId() });
    if (credential) passkey = { publicKey: credential.publicKey, rpId: credential.rpId };

    const accountCheck = await requireSessionAccount(auth.session);
    if (accountCheck.response) return accountCheck.response;
    // Active, or migrating during a recovery notice: the funds are still at
    // this address either way.
    const active = await readCurrentOrgWallet(db, accountCheck.account.orgId);
    if (active) {
      // The business wallet. The caller signs it as a MEMBER, and only with a
      // key that moves money ALONE (weight ≥ threshold): a weight-1 recovery
      // key is never offered — its signature would be refused at submit.
      address = active.address;
      source = 'SPLASH_WALLET';
      const passkeySigner = Boolean(
        credential &&
          signsAlone(
            passkeyMemberOf(active.members, new PasskeyPublicKey(fromBase64(credential.publicKey)).toSuiPublicKey()),
          ),
      );
      if (!passkeySigner) passkey = null;
      wallet = {
        version: active.version,
        threshold: active.threshold,
        memberCount: active.members.length,
        signers: { passkey: passkeySigner, zklogin: signsAlone(zkLoginMemberOf(active.members, userId)) },
      };
    } else if (credential) {
      // Pre-org-wallet fallback: the enrolled passkey's own address is the
      // wallet, exactly as before v15.
      address = normaliseSuiAddress(credential.suiAddress);
      source = 'SPLASH_PASSKEY';
    } else {
      return NextResponse.json({
        address: null,
        source: 'SPLASH_PASSKEY',
        reason:
          'Create a passkey in Settings → Security to open your Splash wallet. Its Sui address comes from the passkey, and only your device can sign for it.',
      });
    }
  }

  try {
    const client = laneClient();
    const [usdc, sui] = await Promise.all([
      client.core.getBalance({ owner: address, coinType: SUI_USDC_COIN_TYPE[STABLECOIN_NETWORK] }),
      client.core.getBalance({ owner: address }),
    ]);
    return NextResponse.json({
      address,
      source,
      passkey,
      wallet,
      network: STABLECOIN_NETWORK,
      usdcMinor: usdc.balance.balance,
      suiMist: sui.balance.balance,
      // A transfer costs a few thousandths of a SUI in gas. Below this the
      // wallet can hold USDC but not send it.
      gasLow: BigInt(sui.balance.balance) < 5_000_000n,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json(
      { address, source, error: `Could not read the balance from Sui: ${error instanceof Error ? error.message : 'unknown error'}` },
      { status: 502 },
    );
  }
}
