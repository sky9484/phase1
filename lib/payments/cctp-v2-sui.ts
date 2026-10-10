import { coinWithBalance, Transaction, type TransactionArgument } from '@mysten/sui/transactions';

/**
 * Circle CCTP V2 on Sui (domain 8): package ids, state objects and the two PTBs.
 *
 * ─── Where the ids come from ────────────────────────────────────────────────
 * Circle's Sui packages reference (developers.circle.com/cctp/references/sui-packages),
 * as copied into Mysten's `@mysten-incubation/cctp-kit` (MystenLabs/ts-sdks-incubation
 * PR #53, commit bb734b4, `packages/cctp-kit/src/chains/sui.ts`, "checked 2026-10-05").
 * Contract source: circlefin/sui-cctp PR #32 (packages message_transmitter_v2,
 * token_messenger_minter_v2, stablecoin_handler, cctp_extensions).
 * Circle's release note of 2026-10-08 added Sui mainnet and testnet to CCTP; its
 * supported-chains table lists Sui with Standard Transfer, Fast Transfer N/A as a source.
 *
 * NOT YET VERIFIED BY SPLASH ON-CHAIN. Before the first mainnet burn, read each object
 * with `sui client object <id>` and confirm its type belongs to the package listed here,
 * and that the USDC coin type matches Circle's native USDC. A wrong id aborts; it can't
 * redirect funds, because the mint recipient is fixed inside Circle's signed message.
 *
 * If Circle upgrades a package, the state object's compatible versions decide which ids
 * still work; an outdated id aborts with EIncompatibleVersion. Update this file then.
 *
 * The PTB shapes follow cctp-kit's engine (Apache-2.0, © Mysten Labs).
 */

export const SUI_CCTP_V2_DOMAIN = 8;

export type SuiCctpNetwork = 'mainnet' | 'testnet';

export interface SuiCctpV2Config {
  network: SuiCctpNetwork;
  domain: typeof SUI_CCTP_V2_DOMAIN;
  /** Circle lists Fast Transfer as N/A with Sui as the source: standard attestation is already quick. */
  fastTransferAsSource: false;
  usdcCoinType: string;
  packages: {
    messageTransmitterV2: string;
    tokenMessengerMinterV2: string;
    stablecoinHandler: string;
  };
  objects: {
    messageTransmitterState: string;
    tokenMessengerMinterState: string;
    stablecoinHandlerState: string;
    treasury: string;
    denyList: string;
    clock: string;
  };
}

export const SUI_CCTP_V2: Record<SuiCctpNetwork, SuiCctpV2Config> = {
  mainnet: {
    network: 'mainnet',
    domain: SUI_CCTP_V2_DOMAIN,
    fastTransferAsSource: false,
    usdcCoinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    packages: {
      messageTransmitterV2: '0x16bcfcfc465f96281663a344641c017de84529370e11aa3879d0dce43ad6db87',
      tokenMessengerMinterV2: '0xeb14978abfe93a37c5d5bf86a0623b923553a5f0e794daac7724f1e2fdbfb830',
      stablecoinHandler: '0x185ed207c4d64fc594882ab927f9f3c6ff957aad03df8a731ba64378faeeb2bf',
    },
    objects: {
      messageTransmitterState: '0x0c067f7d325e5b60e3179712e7783534ba1556cbb3d359d8161497e37689230c',
      tokenMessengerMinterState: '0x06fb166941cd7bc095edc019d054a753ec3f1e4c25f28f2ecc4a6cfa0a9b1167',
      stablecoinHandlerState: '0xa32de8a6dd0178fb05f662929d55cddb69a25c26bde4b83f89e36d17ead94c41',
      treasury: '0x57d6725e7a8b49a7b2a612f6bd66ab5f39fc95332ca48be421c3229d514a6de7',
      denyList: '0x403',
      clock: '0x6',
    },
  },
  testnet: {
    network: 'testnet',
    domain: SUI_CCTP_V2_DOMAIN,
    fastTransferAsSource: false,
    usdcCoinType: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    packages: {
      messageTransmitterV2: '0xe9678cd42a81886e18e21361088071f275105636a4d3751e1d7f255211f73bbe',
      tokenMessengerMinterV2: '0x267d3c0cb776eace2840f27e4d33da9c6d952f9749403f1fe6579f4962ed3c64',
      stablecoinHandler: '0xbe8479044396a45e07de2c7f14789c35b8338406eebc53b2527da56839a91561',
    },
    objects: {
      messageTransmitterState: '0xfee3a2b47f9ef2de2405fc63d79194307945f8ea768815cfc46083bc20fbe6ed',
      tokenMessengerMinterState: '0x72cb55cd14d01e6361386d6ea93eecda9fa1efc3c202b8dd69c1e4683e4c0ca0',
      stablecoinHandlerState: '0xfbd9c0517c4f0e1817445ee2be598806e3c392a465d7e3d773d1055f3f0eed32',
      treasury: '0x7170137d4a6431bf83351ac025baf462909bffe2877d87716374fb42b9629ebe',
      denyList: '0x403',
      clock: '0x6',
    },
  },
};

/** CCTP domains Splash may burn to from Sui (payout partners' chains). */
export const CCTP_V2_DESTINATION_DOMAINS = {
  ETHEREUM: 0,
  ARBITRUM: 3,
  SOLANA: 5,
  BASE: 6,
  POLYGON: 7,
} as const;

export type CctpDestination = keyof typeof CCTP_V2_DESTINATION_DOMAINS;

export class CctpV2SuiError extends Error {}

/** CCTP's minimum-finality threshold for a standard (finalized) transfer. */
export const STANDARD_FINALITY_THRESHOLD = 2000;

const HEX32 = /^0x[0-9a-f]{64}$/;

/**
 * A recipient as CCTP's 32-byte field: an EVM address left-padded to 32 bytes, or an
 * already-32-byte address (Sui, or a Solana account given as hex).
 */
export function toBytes32Address(address: string): string {
  const hex = address.toLowerCase();
  if (/^0x[0-9a-f]{40}$/.test(hex)) return `0x${'0'.repeat(24)}${hex.slice(2)}`;
  if (HEX32.test(hex)) return hex;
  throw new CctpV2SuiError('The recipient must be a 20-byte EVM address or a 32-byte hex address.');
}

export interface SuiBurnParams {
  /** Smallest USDC units (6 decimals). */
  amountMinor: bigint;
  destination: CctpDestination;
  /** The payout partner's one-payment deposit address on the destination chain. */
  mintRecipient: string;
  /**
   * Who may submit the mint on the destination. Zero lets anyone mint (the funds still go
   * to `mintRecipient`). Set it when a partner wants only its own relayer to mint.
   */
  destinationCaller?: string;
  /** Standard Transfer from Sui: maxFee 0 (Circle charges no fee on Standard). */
  maxFeeMinor?: bigint;
  minFinalityThreshold?: number;
}

/**
 * Append the 3-call CCTP V2 burn to an existing PTB, so the policy check, the approval
 * and the burn are one atomic transaction that can't be split:
 *   token_messenger_minter_v2::deposit_for_burn::deposit_for_burn
 *   → stablecoin_handler::handler::burn
 *   → token_messenger_minter_v2::deposit_for_burn::complete_burn
 *
 * Pass `coin` when an earlier command in the PTB already produced the USDC (for example a
 * Splash policy call that releases it); otherwise the coin is taken from the sender's balance.
 */
export function appendSuiCctpV2Burn(
  tx: Transaction,
  config: SuiCctpV2Config,
  params: SuiBurnParams,
  coin?: TransactionArgument,
): void {
  if (params.amountMinor <= 0n) throw new CctpV2SuiError('Burn amount must be above zero.');
  const maxFee = params.maxFeeMinor ?? 0n;
  if (maxFee < 0n || maxFee >= params.amountMinor) throw new CctpV2SuiError('maxFee must be at least 0 and below the amount.');
  const destinationDomain = CCTP_V2_DESTINATION_DOMAINS[params.destination];
  if (destinationDomain === undefined) throw new CctpV2SuiError(`Unknown destination ${String(params.destination)}.`);
  const mintRecipient = toBytes32Address(params.mintRecipient);
  const destinationCaller = params.destinationCaller ? toBytes32Address(params.destinationCaller) : `0x${'0'.repeat(64)}`;
  const { packages, objects, usdcCoinType } = config;

  const usdc = coin ?? tx.add(coinWithBalance({ type: usdcCoinType, balance: params.amountMinor }));

  const [burnReceipt, returnedCoin] = tx.moveCall({
    target: `${packages.tokenMessengerMinterV2}::deposit_for_burn::deposit_for_burn`,
    arguments: [
      usdc,
      tx.pure.u32(destinationDomain),
      tx.pure.address(mintRecipient),
      tx.pure.address(destinationCaller),
      tx.pure.u256(maxFee),
      tx.pure.u32(params.minFinalityThreshold ?? STANDARD_FINALITY_THRESHOLD),
      tx.pure.vector('u8', []),
      tx.object(objects.tokenMessengerMinterState),
    ],
    typeArguments: [usdcCoinType],
  });

  const [completeBurnTicket] = tx.moveCall({
    target: `${packages.stablecoinHandler}::handler::burn`,
    arguments: [
      tx.object(objects.stablecoinHandlerState),
      burnReceipt,
      returnedCoin,
      tx.object(objects.denyList),
      tx.object(objects.treasury),
    ],
  });

  tx.moveCall({
    target: `${packages.tokenMessengerMinterV2}::deposit_for_burn::complete_burn`,
    arguments: [completeBurnTicket, tx.object(objects.tokenMessengerMinterState), tx.object(objects.messageTransmitterState)],
    typeArguments: [usdcCoinType, `${packages.stablecoinHandler}::handler::Auth`],
  });
}

/**
 * The 4-call CCTP V2 receive PTB, for USDC arriving on Sui. Anyone may submit it when the
 * message's destination caller is zero; USDC is minted to the recipient inside Circle's
 * message, not to the submitter. Splash's relayer submits it with Enoki-sponsored gas
 * (Sky, 11 Oct): the mint calls Circle's package, so it is not a gas-free transfer.
 */
export function buildSuiCctpV2ReceiveTransaction(config: SuiCctpV2Config, message: Uint8Array, attestation: Uint8Array): Transaction {
  if (message.length === 0 || attestation.length === 0) throw new CctpV2SuiError('Message and attestation are required.');
  const tx = new Transaction();
  const { packages, objects, usdcCoinType } = config;

  const [receipt] = tx.moveCall({
    target: `${packages.messageTransmitterV2}::receive_message::receive_message`,
    arguments: [tx.pure.vector('u8', Array.from(message)), tx.pure.vector('u8', Array.from(attestation)), tx.object(objects.messageTransmitterState)],
  });

  const [mintReceipt] = tx.moveCall({
    target: `${packages.tokenMessengerMinterV2}::handle_receive_message::prepare_mint`,
    arguments: [receipt, tx.object(objects.tokenMessengerMinterState), tx.object(objects.clock)],
    typeArguments: [usdcCoinType],
  });

  const [completeMintTicket] = tx.moveCall({
    target: `${packages.stablecoinHandler}::handler::mint`,
    arguments: [
      tx.object(objects.stablecoinHandlerState),
      mintReceipt,
      tx.object(objects.tokenMessengerMinterState),
      tx.object(objects.treasury),
      tx.object(objects.denyList),
    ],
  });

  tx.moveCall({
    target: `${packages.tokenMessengerMinterV2}::handle_receive_message::complete_mint`,
    arguments: [completeMintTicket, tx.object(objects.tokenMessengerMinterState), tx.object(objects.messageTransmitterState)],
    typeArguments: [usdcCoinType, `${packages.stablecoinHandler}::handler::Auth`],
  });

  return tx;
}
