/**
 * The recovery migration's money move (v15 §4 step 6): ONE transaction
 * sweeping the old wallet's USDC to the recovered wallet, prepared here and
 * signed in the ceremony — the recovery contact's zkLogin partial plus the
 * Splash cold key's offline partial (1 + 1 = threshold), combined and
 * executed by whoever holds them. Nothing in this process signs.
 *
 * Gasless, like every wallet transfer: `balance::send_funds` of the FULL
 * balance leaves zero behind, which Sui's gasless dust rule allows, and the
 * build dry-runs itself, so a transfer Sui would refuse dies here rather
 * than in front of the ceremony.
 */
import { normalizeStructTag, normalizeSuiAddress, toBase64 } from '@mysten/sui/utils';

import { SUI_USDC_COIN_TYPE, STABLECOIN_NETWORK } from '../payments/stablecoin-lane.ts';
import { buildTransferBytes, laneClient, readTransfer } from '../server/stablecoin-chain.ts';
import type { SweepEvidence } from './org-wallet-recovery.ts';

export type RecoverySweep = {
  from: string;
  to: string;
  coinType: string;
  amountMinor: string;
  /** Unsigned transaction bytes, base64 — what the ceremony signs. */
  transactionBytes: string;
};

export async function prepareRecoverySweep(input: { from: string; to: string }): Promise<RecoverySweep | { empty: true; from: string }> {
  const client = laneClient();
  const coinType = SUI_USDC_COIN_TYPE[STABLECOIN_NETWORK];
  const balance = await client.core.getBalance({ owner: input.from, coinType });
  const amountMinor = BigInt(balance.balance.balance);
  if (amountMinor <= 0n) return { empty: true, from: input.from };

  const bytes = await buildTransferBytes(client, {
    sender: input.from,
    coinType,
    legs: [{ address: input.to, amountMinor }],
    gas: 'GASLESS',
  });
  return {
    from: input.from,
    to: input.to,
    coinType,
    amountMinor: amountMinor.toString(),
    transactionBytes: toBase64(bytes),
  };
}

const sameAddress = (a: string | null | undefined, b: string) =>
  Boolean(a) && normalizeSuiAddress(a as string) === normalizeSuiAddress(b);

/**
 * Before the migration is recorded: the chain, not the caller, says the old
 * wallet is empty. Retiring a wallet that still holds USDC would strand it —
 * no Splash screen would show that address again. When a digest is given it
 * must be a successful transaction FROM the old wallet that credited the new
 * one; it is kept on the retired row as the migration's evidence. An empty
 * wallet needs no sweep, so the digest is optional — the zero balance is not.
 */
export async function confirmRecoverySweep(input: { from: string; to: string; digest?: string | null }): Promise<SweepEvidence> {
  const client = laneClient();
  const coinType = SUI_USDC_COIN_TYPE[STABLECOIN_NETWORK];
  let sweepDigest: string | null = null;
  if (input.digest) {
    const seen = await readTransfer(client, input.digest);
    if (!seen) return { ok: false, reason: 'The chain has not seen that sweep transaction.' };
    if (!seen.success) return { ok: false, reason: 'That sweep transaction failed on chain.' };
    if (!sameAddress(seen.sender, input.from)) {
      return { ok: false, reason: 'That transaction was not sent from the wallet being recovered.' };
    }
    const credited = seen.balanceChanges.some(
      (c) => normalizeStructTag(c.coinType) === normalizeStructTag(coinType) && sameAddress(c.address, input.to) && BigInt(c.amount) > 0n,
    );
    if (!credited) return { ok: false, reason: 'That transaction did not pay USDC into the recovered wallet.' };
    sweepDigest = seen.digest || input.digest;
  }
  const balance = await client.core.getBalance({ owner: input.from, coinType });
  if (BigInt(balance.balance.balance) > 0n) {
    return {
      ok: false,
      reason: 'The old wallet still holds USDC. Execute the sweep first, then complete the migration.',
    };
  }
  return { ok: true, sweepDigest };
}
