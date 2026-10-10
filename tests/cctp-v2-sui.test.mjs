import assert from 'node:assert/strict';
import test from 'node:test';

import { Transaction } from '@mysten/sui/transactions';

import {
  appendSuiCctpV2Burn,
  buildSuiCctpV2ReceiveTransaction,
  CCTP_V2_DESTINATION_DOMAINS,
  SUI_CCTP_V2,
  SUI_CCTP_V2_DOMAIN,
  toBytes32Address,
} from '../lib/payments/cctp-v2-sui.ts';

const HEX32 = /^0x[0-9a-f]{64}$/;
const SENDER = `0x${'ab'.repeat(32)}`;
const PARTNER_EVM = '0x209693bc6afc0c5328ba36faf03c514ef312287c';

test('Sui is CCTP V2 domain 8 on both networks, with well-formed ids', () => {
  assert.equal(SUI_CCTP_V2_DOMAIN, 8);
  for (const net of ['mainnet', 'testnet']) {
    const c = SUI_CCTP_V2[net];
    assert.equal(c.domain, 8);
    assert.equal(c.fastTransferAsSource, false, 'Circle lists Fast Transfer as N/A from Sui');
    for (const id of Object.values(c.packages)) assert.match(id, HEX32, `${net} package id`);
    for (const [k, id] of Object.entries(c.objects)) {
      if (k === 'denyList' || k === 'clock') continue;
      assert.match(id, HEX32, `${net} ${k}`);
    }
    assert.match(c.usdcCoinType, /^0x[0-9a-f]{64}::usdc::USDC$/);
  }
  assert.equal(SUI_CCTP_V2.mainnet.objects.denyList, '0x403');
  assert.equal(SUI_CCTP_V2.mainnet.objects.clock, '0x6');
  assert.notEqual(SUI_CCTP_V2.mainnet.packages.tokenMessengerMinterV2, SUI_CCTP_V2.testnet.packages.tokenMessengerMinterV2);
});

test('V2 ids differ from the legacy V1 mainnet packages', () => {
  const v1 = [
    '0x08d87d37ba49e785dde270a83f8e979605b03dc552b5548f26fdf2f49bf7ed1b', // V1 MessageTransmitter
    '0x2aa6c5d56376c371f88a6cc42e852824994993cb9bab8d3e6450cbe3cb32b94e', // V1 TokenMessengerMinter
  ];
  for (const id of Object.values(SUI_CCTP_V2.mainnet.packages)) assert.ok(!v1.includes(id));
});

test('destination domains match Circle: Ethereum 0, Arbitrum 3, Solana 5, Base 6, Polygon 7', () => {
  assert.deepEqual(CCTP_V2_DESTINATION_DOMAINS, { ETHEREUM: 0, ARBITRUM: 3, SOLANA: 5, BASE: 6, POLYGON: 7 });
});

test('recipients become 32 bytes: EVM addresses are left-padded, 32-byte hex passes through', () => {
  assert.equal(toBytes32Address(PARTNER_EVM), `0x${'0'.repeat(24)}${PARTNER_EVM.slice(2)}`);
  assert.equal(toBytes32Address(SENDER), SENDER);
  assert.throws(() => toBytes32Address('0x1234'), /20-byte EVM address or a 32-byte/);
});

test('the burn appends to an existing PTB, so a policy call and the burn are one transaction', () => {
  const tx = new Transaction();
  tx.setSender(SENDER);
  // Stand-in for Splash's policy check, which must run in the same PTB before the burn.
  tx.moveCall({ target: `0x${'1'.repeat(64)}::policy::assert_allowed`, arguments: [] });
  appendSuiCctpV2Burn(tx, SUI_CCTP_V2.mainnet, { amountMinor: 1_000_000n, destination: 'POLYGON', mintRecipient: PARTNER_EVM });
  const calls = tx.getData().commands.filter((c) => c.$kind === 'MoveCall').map((c) => `${c.MoveCall.module}::${c.MoveCall.function}`);
  assert.deepEqual(calls, ['policy::assert_allowed', 'deposit_for_burn::deposit_for_burn', 'handler::burn', 'deposit_for_burn::complete_burn']);
  const first = tx.getData().commands.find((c) => c.$kind === 'MoveCall' && c.MoveCall.function === 'deposit_for_burn');
  assert.equal(first.MoveCall.package, SUI_CCTP_V2.mainnet.packages.tokenMessengerMinterV2);
});

test('the burn refuses a zero amount and a fee at or above the amount', () => {
  const tx = new Transaction();
  assert.throws(() => appendSuiCctpV2Burn(tx, SUI_CCTP_V2.testnet, { amountMinor: 0n, destination: 'SOLANA', mintRecipient: SENDER }), /above zero/);
  assert.throws(() => appendSuiCctpV2Burn(tx, SUI_CCTP_V2.testnet, { amountMinor: 10n, destination: 'SOLANA', mintRecipient: SENDER, maxFeeMinor: 10n }), /maxFee/);
});

test('the receive PTB is the 4-call mint sequence and needs a message and attestation', () => {
  const tx = buildSuiCctpV2ReceiveTransaction(SUI_CCTP_V2.mainnet, new Uint8Array([1, 2, 3]), new Uint8Array([4, 5]));
  const calls = tx.getData().commands.map((c) => `${c.MoveCall.module}::${c.MoveCall.function}`);
  assert.deepEqual(calls, ['receive_message::receive_message', 'handle_receive_message::prepare_mint', 'handler::mint', 'handle_receive_message::complete_mint']);
  assert.throws(() => buildSuiCctpV2ReceiveTransaction(SUI_CCTP_V2.mainnet, new Uint8Array(), new Uint8Array([1])), /required/);
});
