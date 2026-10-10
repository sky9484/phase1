import { formatUsdc, parseUsdcMinor } from './stablecoin-lane.ts';

/**
 * Funding a Splash wallet with USDC from another chain — a planner, not a
 * bridge. It says whether a route exists, what the person does on each side,
 * how long it waits, and what arrives. It moves nothing.
 *
 * ─── The facts it encodes (Circle developer docs, re-read 2026-10-10) ────────
 *
 * - CCTP burns USDC on one chain and mints native USDC on another. It carries
 *   USDC only: USDT must be swapped to USDC on the source chain first.
 * - Sui is on **CCTP V2**, domain 8: Circle's release note of 2026-10-08 added
 *   Sui mainnet and testnet, and its supported-chains table lists Sui with
 *   Standard Transfer (Fast Transfer N/A as a source). Package ids are in
 *   `cctp-v2-sui.ts`.
 * - V1 (legacy) deprecation begins 31 October 2026 and completes 1 December
 *   2026. V1 and V2 don't interoperate, so every route here is V2.
 * - Standard Transfer waits for the source chain's finality before Circle
 *   attests: about 13–20 minutes from Ethereum and the Ethereum rollups, well
 *   under a minute from Solana. Circle charges no fee on Standard Transfer.
 *   Fast Transfer (Ethereum, Arbitrum, Base, Solana as sources) attests in
 *   seconds for a variable Circle fee; read it from Circle's fee endpoint
 *   before offering it.
 * - Someone must submit the mint on Sui (Circle has no Forwarding Service into
 *   Sui). Splash's relayer will submit it with Enoki-sponsored gas; until that
 *   is live, the person claims it with a little SUI.
 *
 * The recommended funding route stays the simplest one: send native USDC on
 * Sui straight to the Splash wallet address.
 */

export type FundingChain = 'SUI' | 'ETHEREUM' | 'ARBITRUM' | 'BASE' | 'SOLANA' | 'APTOS';
export type FundingAsset = 'USDC' | 'USDT';

export const SUI_CCTP_DOMAIN = 8;

interface ChainFacts {
  label: string;
  cctpDomain: number | null;
  /** Which CCTP versions have live contracts on this chain. */
  versions: ReadonlyArray<'V1' | 'V2'>;
  /** Rough wait for Circle's Standard Transfer attestation (source-chain finality). */
  finalityLabel: string;
  /** Wallets that sign on this chain. */
  wallet: string;
}

export const FUNDING_CHAINS: Record<Exclude<FundingChain, 'SUI'>, ChainFacts> = {
  ETHEREUM: { label: 'Ethereum', cctpDomain: 0, versions: ['V1', 'V2'], finalityLabel: 'about 13–20 minutes', wallet: 'MetaMask' },
  ARBITRUM: { label: 'Arbitrum', cctpDomain: 3, versions: ['V1', 'V2'], finalityLabel: 'about 13–20 minutes', wallet: 'MetaMask' },
  BASE: { label: 'Base', cctpDomain: 6, versions: ['V1', 'V2'], finalityLabel: 'about 13–20 minutes', wallet: 'MetaMask' },
  SOLANA: { label: 'Solana', cctpDomain: 5, versions: ['V1', 'V2'], finalityLabel: 'under a minute', wallet: 'a Solana wallet (Phantom, Solflare, or MetaMask for Solana)' },
  APTOS: { label: 'Aptos', cctpDomain: 9, versions: ['V2'], finalityLabel: '—', wallet: 'an Aptos wallet (Petra)' },
};

/** Sui is on CCTP V2 (Circle release note 2026-10-08). V1 routes are no longer planned. */
const SUI_VERSIONS: ReadonlyArray<'V1' | 'V2'> = ['V2'];

export interface FundingStep {
  where: string;
  action: string;
}

export type FundingPlan =
  | {
      available: true;
      route: 'DIRECT' | 'CCTP_V2';
      source: FundingChain;
      asset: FundingAsset;
      amountMinor: bigint;
      /** What reaches the Splash wallet, before gas (paid separately in each chain's native token). */
      arrivesMinor: bigint;
      /** When USDT must first become USDC, the least USDC the swap may return. */
      minUsdcAfterSwapMinor: bigint | null;
      wait: string;
      steps: FundingStep[];
      warnings: string[];
      cctp: { sourceDomain: number; destinationDomain: number; mintRecipient: string } | null;
    }
  | { available: false; source: FundingChain; asset: FundingAsset; reason: string; alternatives: string[] };

export class FundingPlanError extends Error {}

/** A Sui address as CCTP's 32-byte mintRecipient. Sui addresses already are 32 bytes. */
export function suiMintRecipient(address: string): string {
  const hex = address.toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(hex)) throw new FundingPlanError('The Splash wallet address is not a 32-byte Sui address.');
  return hex;
}

/**
 * Plan getting `amount` of `asset` on `source` into the Splash wallet at
 * `destination`. `swapSlippageBps` bounds a USDT→USDC swap on the source
 * chain (the person's own DEX); it is ignored for USDC.
 */
export function planFunding(input: {
  source: FundingChain;
  asset: FundingAsset;
  amount: string;
  destination: string;
  swapSlippageBps?: number;
}): FundingPlan {
  const amountMinor = parseUsdcMinor(input.amount);
  if (amountMinor <= 0n) throw new FundingPlanError('Enter an amount above zero.');
  const slippage = input.swapSlippageBps ?? 50;
  if (!Number.isInteger(slippage) || slippage < 0 || slippage > 500) throw new FundingPlanError('Swap slippage must be 0–5%.');
  const mintRecipient = suiMintRecipient(input.destination);

  if (input.source === 'SUI') {
    if (input.asset === 'USDT') {
      return {
        available: false,
        source: 'SUI',
        asset: 'USDT',
        reason: 'There is no native USDT on Sui — only bridge-wrapped versions, which Splash does not settle in.',
        alternatives: ['Send native USDC on Sui instead.', 'Swap to native USDC on Sui first, then send it.'],
      };
    }
    return {
      available: true,
      route: 'DIRECT',
      source: 'SUI',
      asset: 'USDC',
      amountMinor,
      arrivesMinor: amountMinor,
      minUsdcAfterSwapMinor: null,
      wait: 'seconds',
      steps: [{ where: 'Your Sui wallet or exchange', action: `Send ${formatUsdc(amountMinor)} native USDC on Sui to ${mintRecipient}.` }],
      warnings: ['Send USDC on the Sui network only. USDC sent on another network to this address is not recoverable by Splash.'],
      cctp: null,
    };
  }

  const chain = FUNDING_CHAINS[input.source];
  const shared = chain.versions.filter((v) => SUI_VERSIONS.includes(v));
  if (shared.length === 0) {
    return {
      available: false,
      source: input.source,
      asset: input.asset,
      reason: `${chain.label} has no CCTP V2 contracts, and Sui is on CCTP V2 only; there is no CCTP route from ${chain.label} to Sui.`,
      alternatives: [
        `Move the USDC from ${chain.label} to Ethereum, Arbitrum, Base or Solana first, then use CCTP to Sui from there.`,
        'Buy or withdraw native USDC on Sui from an exchange and send it to the Splash wallet directly.',
      ],
    };
  }

  const steps: FundingStep[] = [];
  let usdcMinor = amountMinor;
  let minUsdcAfterSwapMinor: bigint | null = null;
  if (input.asset === 'USDT') {
    // A 1:1 swap is the fair value; the floor is what the person should
    // accept from their DEX at this slippage. Fees are the venue's.
    minUsdcAfterSwapMinor = (amountMinor * BigInt(10_000 - slippage)) / 10_000n;
    usdcMinor = minUsdcAfterSwapMinor;
    steps.push({
      where: `${chain.label} · ${chain.wallet}`,
      action: `Swap ${formatUsdc(amountMinor)} USDT to USDC on ${chain.label}. Accept no less than ${formatUsdc(minUsdcAfterSwapMinor)} USDC (${slippage / 100}% slippage). CCTP carries USDC only.`,
    });
  }
  steps.push(
    {
      where: `${chain.label} · ${chain.wallet}`,
      action: `Burn ${input.asset === 'USDT' ? 'the' : formatUsdc(usdcMinor)} USDC with CCTP V2 Standard Transfer (depositForBurn): destination domain ${SUI_CCTP_DOMAIN} (Sui), mintRecipient ${mintRecipient}.`,
    },
    { where: 'Circle', action: `Wait for Circle's attestation — ${chain.finalityLabel} on ${chain.label}.` },
    { where: 'Sui · Splash wallet', action: 'Claim the mint on Sui (receive_message with the attestation). Splash’s relayer will do this with sponsored gas once live; until then it needs a little SUI.' },
  );

  return {
    available: true,
    route: 'CCTP_V2',
    source: input.source,
    asset: input.asset,
    amountMinor,
    arrivesMinor: usdcMinor,
    minUsdcAfterSwapMinor,
    wait: chain.finalityLabel,
    steps,
    warnings: [
      'This route uses CCTP V2. CCTP V1 (legacy) is deprecated from 31 October 2026 and stops on 1 December 2026, so don’t start a V1 transfer from another app.',
      'The burn and the claim each cost gas on their own chain, paid in that chain’s native token.',
      'Sending USDC straight to the Splash wallet on Sui is faster and has no bridge step.',
    ],
    cctp: { sourceDomain: chain.cctpDomain as number, destinationDomain: SUI_CCTP_DOMAIN, mintRecipient },
  };
}
