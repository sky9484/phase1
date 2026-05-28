import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ABORT_CODES: Record<number, string> = {
  1: 'E_ALREADY_VERIFIED — BusinessAccount is already KYB-verified on-chain.',
  100: 'E_NOT_VERIFIED — BusinessAccount is not KYB-verified. Call verify_business with AdminCap first.',
  101: 'E_INSUFFICIENT_FUNDS — Coin value too small (fee > payment). Send a larger coin.',
  102: 'E_EMPTY_BATCH — Empty payments vector. Add at least one payment.',
  300: 'E_PEG_BROKEN_USDC — USDC deviation > 30 bps. Update peg with valid data.',
  301: 'E_PEG_BROKEN_USDT — USDT deviation > 30 bps. Update peg with valid data.',
  302: 'E_PEG_STALE — Peg price update is older than 60 seconds. The app refreshes it automatically; verify SPLASH_ADMIN_CAP_ID and SPLASH_PEG_STATE_ID if this appears.',
};

function humanizeSuiError(rawError: string | undefined | null, stderr: string): string {
  const error = [rawError, stderr].filter(Boolean).join('\n') || 'Unknown Sui error';
  const abortMatch = error.match(/MoveAbort\([^)]*?,\s*(\d+)\)/) ?? error.match(/with code\s+(\d+)/i);
  if (abortMatch) {
    const code = Number.parseInt(abortMatch[1], 10);
    const human = ABORT_CODES[code];
    const fnMatch = error.match(/function_name:\s*Some\("([^"]+)"\)/) ?? error.match(/within function\s+'([^']+)'/i);
    const fnName = fnMatch?.[1] ?? '';
    if (human) return `${human}${fnName ? ` (in ${fnName})` : ''}`;
    return `MoveAbort code ${code}${fnName ? ` in ${fnName}` : ''} — ${error}`;
  }
  if (/InsufficientGas/i.test(error)) return 'InsufficientGas — increase --gas-budget.';
  if (/ObjectNotFound/i.test(error)) return `ObjectNotFound — one of the configured object IDs does not exist on the network. Verify .env.local.`;
  if (/ObjectID hex string must start with 0x/i.test(error)) return 'Invalid Sui object ID — one of the configured IDs is missing the 0x prefix. Check SPLASH_PACKAGE_ID, SPLASH_TREASURY_ID, SPLASH_PEG_STATE_ID, SPLASH_BUSINESS_ACCOUNT_ID, SPLASH_TRANSFER_COIN_ID, and SPLASH_ADMIN_CAP_ID in .env.local.';
  return error;
}

async function runSuiCommand(args: string[], maxBuffer = 1024 * 1024 * 10) {
  try {
    return await execFileAsync('sui', args, {
      cwd: process.cwd(),
      windowsHide: true,
      maxBuffer,
    });
  } catch (error) {
    const commandError = error as { message?: string; stdout?: string; stderr?: string };
    throw new Error(humanizeSuiError(commandError.stdout ?? commandError.message, commandError.stderr ?? ''));
  }
}

type OperatorGasCoin = { id: string; balance: number };

export async function getOperatorWalletInfo(): Promise<{
  address: string;
  totalMist: number;
  totalSui: string;
  coinCount: number;
}> {
  const { stdout } = await runSuiCommand(['client', 'active-address']);
  const address = stdout.trim();

  const coins = await listOperatorGasCoins();
  const totalMist = coins.reduce((sum, c) => sum + c.balance, 0);

  return {
    address,
    totalMist,
    totalSui: (totalMist / 1_000_000_000).toFixed(6),
    coinCount: coins.length,
  };
}

async function listOperatorGasCoins(): Promise<OperatorGasCoin[]> {
  const { stdout } = await runSuiCommand(['client', 'gas', '--json']);
  const jsonStart = stdout.indexOf('[');
  if (jsonStart === -1) throw new Error(`'sui client gas --json' returned no JSON. stdout: ${stdout.substring(0, 200)}`);
  const coins = JSON.parse(stdout.slice(jsonStart)) as Array<{ gasCoinId: string; mistBalance: number | string }>;
  return coins
    .map((coin) => ({ id: coin.gasCoinId, balance: Number(coin.mistBalance) }))
    .filter((coin) => Number.isFinite(coin.balance) && coin.balance > 0)
    .sort((a, b) => b.balance - a.balance);
}

/**
 * Pick the largest operator coin to use as gas, and return any extra coins
 * that must be merged into it inside the PTB to cover `neededMist`.
 *
 * Throws if the operator's total balance is insufficient.
 */
async function planGasCoin(neededMist: number): Promise<{ primaryId: string; mergeIds: string[] }> {
  const coins = await listOperatorGasCoins();
  if (coins.length === 0) {
    throw new Error('Operator wallet has no SUI coins. Fund the operator address.');
  }

  const total = coins.reduce((sum, coin) => sum + coin.balance, 0);
  if (total < neededMist) {
    throw new Error(`Operator wallet has ${total} MIST but transfer needs ${neededMist} MIST (payment + gas). Top up the operator wallet.`);
  }

  const [primary, ...rest] = coins;
  const mergeIds: string[] = [];
  let accumulated = primary.balance;

  for (const coin of rest) {
    if (accumulated >= neededMist) break;
    mergeIds.push(coin.id);
    accumulated += coin.balance;
  }

  return { primaryId: primary.id, mergeIds };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updatePegOnSui(): Promise<void> {
  const SPLASH_PACKAGE_ID = optionalEnvObjectId('SPLASH_PACKAGE_ID');
  const SPLASH_PEG_STATE_ID = optionalEnvObjectId('SPLASH_PEG_STATE_ID');
  const SPLASH_ADMIN_CAP_ID = optionalEnvObjectId('SPLASH_ADMIN_CAP_ID');

  if (!SPLASH_ADMIN_CAP_ID) {
    console.warn('[Sui Peg Update] SPLASH_ADMIN_CAP_ID not set — skipping auto peg refresh. Settlement may fail with E_PEG_STALE.');
    return;
  }
  if (!SPLASH_PACKAGE_ID || !SPLASH_PEG_STATE_ID) {
    console.warn('[Sui Peg Update] Package or peg state not configured — skipping peg refresh.');
    return;
  }

  // Deviation in ppm from $1.00: 0 = healthy peg, max allowed on-chain = 3,000 ppm (0.30%).
  // Function signature: update_peg(peg_state, admin_cap, usdc_deviation_ppm, usdt_deviation_ppm, clock)
  const usdcDeviationPpm = process.env.SPLASH_PEG_USDC_DEVIATION_PPM ?? '0';
  const usdtDeviationPpm = process.env.SPLASH_PEG_USDT_DEVIATION_PPM ?? '0';

  console.log('[Sui Peg Update] Refreshing peg (USDC dev:', usdcDeviationPpm, 'ppm, USDT dev:', usdtDeviationPpm, 'ppm)...');
  const { stdout, stderr } = await runSuiCommand([
    'client', 'call',
    '--package', SPLASH_PACKAGE_ID,
    '--module', 'peg_monitor',
    '--function', 'update_peg',
    '--args', SPLASH_PEG_STATE_ID, SPLASH_ADMIN_CAP_ID, usdcDeviationPpm, usdtDeviationPpm, '0x6',
    '--gas-budget', process.env.SUI_PEG_UPDATE_GAS_BUDGET ?? '10000000',
    '--json',
  ], 1024 * 1024 * 5);

  const jsonStart = stdout.indexOf('{');
  if (jsonStart === -1) {
    throw new Error(`Peg refresh produced no JSON. stdout: ${stdout.substring(0, 200)} stderr: ${stderr.substring(0, 200)}`);
  }

  const output = JSON.parse(stdout.slice(jsonStart)) as SuiCliCallOutput;
  if (output.effects?.status?.status !== 'success') {
    throw new Error(`Peg refresh failed: ${humanizeSuiError(output.effects?.status?.error, stderr)}`);
  }
  console.log('[Sui Peg Update] Peg refreshed:', output.digest);
}

export type SettlementBatchRow = {
  name?: string;
  address?: string;
  country?: string;
  purpose?: string;
  amount?: string;
};

type SuiCliCallOutput = {
  digest?: string;
  effects?: {
    transactionDigest?: string;
    status?: {
      status?: string;
      error?: string;
    };
  };
};

function moneyToMinor(value: number) {
  return Math.max(0, Math.round(value * 100));
}

function requireSuiAddress(value: string, label: string) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error(`${label} must be a 32-byte Sui wallet address (0x + 64 hex chars). Got: "${value}". Set SPLASH_TEST_RECIPIENT_ADDRESS to a real wallet address — not an object ID.`);
  }

  return value;
}

function requireSuiObjectId(value: string, label: string) {
  if (!/^0x[a-fA-F0-9]+$/.test(value)) {
    throw new Error(`${label} must be a Sui object/package ID starting with 0x. Got: "${value}". Check ${label} in .env.local.`);
  }

  return value;
}

function envOrThrow(key: string): string {
  const value = (process.env[key] ?? '').trim();
  if (!value) throw new Error(`${key} is not configured in .env.local. Set it and restart the server.`);
  return value;
}

function envObjectIdOrThrow(key: string): string {
  return requireSuiObjectId(envOrThrow(key), key);
}

function optionalEnvObjectId(key: string): string {
  const value = (process.env[key] ?? '').trim();
  return value ? requireSuiObjectId(value, key) : '';
}

export async function recordSingleTransferOnSui(input: {
  transferId: string;
  recipient: string;
  amountUsd: number;
  stablecoinAmountMicro: number;
}) {
  const SPLASH_PACKAGE_ID = envObjectIdOrThrow('SPLASH_PACKAGE_ID');
  const SPLASH_TREASURY_ID = envObjectIdOrThrow('SPLASH_TREASURY_ID');
  const SPLASH_PEG_STATE_ID = envObjectIdOrThrow('SPLASH_PEG_STATE_ID');
  const SPLASH_BUSINESS_ACCOUNT_ID = envObjectIdOrThrow('SPLASH_BUSINESS_ACCOUNT_ID');
  const USDC_TYPE = envOrThrow('USDC_TYPE');
  const SPLASH_TEST_RECIPIENT_ADDRESS = process.env.SPLASH_TEST_RECIPIENT_ADDRESS ?? '';

  const recipientAddress = SPLASH_TEST_RECIPIENT_ADDRESS || input.recipient;
  requireSuiAddress(recipientAddress, 'Transfer recipient');

  // Use at least 1_000 MIST so the fee calc (150 bps) leaves a positive net amount.
  const paymentMist = Math.max(1_000_000, input.stablecoinAmountMicro);

  // Peg refresh is bundled into the same PTB below — no separate tx, no staleness race.
  const SPLASH_ADMIN_CAP_ID = envObjectIdOrThrow('SPLASH_ADMIN_CAP_ID');
  const usdcDeviationPpm = process.env.SPLASH_PEG_USDC_DEVIATION_PPM ?? '0';
  const usdtDeviationPpm = process.env.SPLASH_PEG_USDT_DEVIATION_PPM ?? '0';

  const gasBudget = process.env.SUI_RECORD_SETTLEMENT_GAS_BUDGET ?? '10000000';

  // The PTB will split `paymentMist` from the gas coin and burn up to
  // `gasBudget` MIST for fees, so the chosen gas coin must cover both.
  const { primaryId, mergeIds } = await planGasCoin(paymentMist + Number(gasBudget));

  // PTB: optionally merge fragmented coins into the gas coin, then split the
  // payment from gas and call settle_payment. This avoids a static
  // SPLASH_TRANSFER_COIN_ID that gets consumed after one use, and lets a
  // wallet with many small coins still fund a large transfer.
  const ptbArgs: string[] = ['client', 'ptb'];
  if (mergeIds.length > 0) {
    ptbArgs.push('--merge-coins', 'gas', `[${mergeIds.map((id) => `@${id}`).join(',')}]`);
  }
  ptbArgs.push(
    // 1. Push fresh Pyth-derived peg reading on chain (atomic with settle below)
    '--move-call',
    `${SPLASH_PACKAGE_ID}::peg_monitor::update_peg`,
    `@${SPLASH_PEG_STATE_ID}`,
    `@${SPLASH_ADMIN_CAP_ID}`,
    usdcDeviationPpm,
    usdtDeviationPpm,
    '@0x6',
    // 2. Split payment from gas
    '--split-coins', 'gas', `[${paymentMist}]`,
    '--assign', 'payment',
    // 3. Settle — assert_pegged reads the freshly-updated PegState from step 1
    '--move-call',
    `${SPLASH_PACKAGE_ID}::settlement::settle_payment`,
    `<${USDC_TYPE}>`,
    `@${SPLASH_TREASURY_ID}`,
    `@${SPLASH_BUSINESS_ACCOUNT_ID}`,
    `@${SPLASH_PEG_STATE_ID}`,
    'payment.0',
    `@${recipientAddress}`,
    '@0x6',
    '--gas-coin', `@${primaryId}`,
    '--gas-budget', gasBudget,
    '--json',
  );

  console.log('[Sui Single Transfer] Calling sui client ptb with:', {
    package: SPLASH_PACKAGE_ID,
    usdcType: USDC_TYPE,
    function: 'settle_payment',
    paymentMist,
    recipient: recipientAddress,
    gasCoin: primaryId,
    mergedCoinCount: mergeIds.length,
  });

  const { stdout, stderr } = await runSuiCommand(ptbArgs);

  console.log('[Sui Single Transfer] CLI stdout:', stdout.substring(0, 500));
  console.log('[Sui Single Transfer] CLI stderr:', stderr.substring(0, 500));

  const jsonStart = stdout.indexOf('{');

  if (jsonStart === -1) {
    throw new Error(`Sui CLI did not return JSON output. stdout: ${stdout.substring(0, 200)}, stderr: ${stderr.substring(0, 200)}`);
  }

  const output = JSON.parse(stdout.slice(jsonStart)) as SuiCliCallOutput;
  const digest = output.digest ?? output.effects?.transactionDigest ?? null;
  const status = output.effects?.status?.status;

  if (!digest || status !== 'success') {
    const errorMsg = humanizeSuiError(output.effects?.status?.error, stderr);
    console.error('[Sui Single Transfer] Transaction failed:', errorMsg);
    throw new Error(errorMsg);
  }

  console.log('[Sui Single Transfer] Transaction successful:', digest);

  return {
    digest,
    packageId: SPLASH_PACKAGE_ID,
    treasuryId: SPLASH_TREASURY_ID,
  };
}

export async function recordBatchSettlementOnSui(input: {
  batchId: string;
  rows: SettlementBatchRow[];
  totalUsd: number;
}) {
  const SPLASH_PACKAGE_ID = envObjectIdOrThrow('SPLASH_PACKAGE_ID');
  const SPLASH_TREASURY_ID = envObjectIdOrThrow('SPLASH_TREASURY_ID');
  const SPLASH_PEG_STATE_ID = envObjectIdOrThrow('SPLASH_PEG_STATE_ID');
  const SPLASH_BUSINESS_ACCOUNT_ID = envObjectIdOrThrow('SPLASH_BUSINESS_ACCOUNT_ID');
  const USDC_TYPE = envOrThrow('USDC_TYPE');
  const SPLASH_TEST_RECIPIENT_ADDRESS = process.env.SPLASH_TEST_RECIPIENT_ADDRESS ?? '';

  // Peg refresh is bundled into the same PTB below — no separate tx, no staleness race.
  const SPLASH_ADMIN_CAP_ID = envObjectIdOrThrow('SPLASH_ADMIN_CAP_ID');
  const usdcDeviationPpm = process.env.SPLASH_PEG_USDC_DEVIATION_PPM ?? '0';
  const usdtDeviationPpm = process.env.SPLASH_PEG_USDT_DEVIATION_PPM ?? '0';

  const gasBudget = process.env.SUI_RECORD_SETTLEMENT_GAS_BUDGET ?? '10000000';

  const paymentObjects = input.rows.map((row) => {
    const amount = moneyToMinor(Number.parseFloat(row.amount ?? '0'));
    const recipient = requireSuiAddress(SPLASH_TEST_RECIPIENT_ADDRESS || row.address || '', `Batch recipient ${row.name ?? row.address ?? ''}`.trim());
    return { recipient, amount };
  });

  const ptbArgs = ['client', 'ptb',
    // 1. Push fresh Pyth-derived peg reading on chain (atomic with settle_batch below)
    '--move-call',
    `${SPLASH_PACKAGE_ID}::peg_monitor::update_peg`,
    `@${SPLASH_PEG_STATE_ID}`,
    `@${SPLASH_ADMIN_CAP_ID}`,
    usdcDeviationPpm,
    usdtDeviationPpm,
    '@0x6',
  ];

  paymentObjects.forEach((payment, index) => {
    ptbArgs.push(
      '--move-call',
      `${SPLASH_PACKAGE_ID}::settlement::new_payment`,
      `@${payment.recipient}`,
      payment.amount.toString(),
      '--assign',
      `payment_${index}`,
    );
  });

  ptbArgs.push(
    '--make-move-vec',
    `<${SPLASH_PACKAGE_ID}::settlement::Payment>`,
    `[${paymentObjects.map((_, index) => `payment_${index}`).join(',')}]`,
    '--assign',
    'payments',
    '--move-call',
    `${SPLASH_PACKAGE_ID}::settlement::settle_batch`,
    `<${USDC_TYPE}>`,
    `@${SPLASH_TREASURY_ID}`,
    `@${SPLASH_BUSINESS_ACCOUNT_ID}`,
    `@${SPLASH_PEG_STATE_ID}`,
    'payments',
    '@0x6',
    '--gas-budget',
    gasBudget,
    '--json',
  );

  console.log('[Sui Batch Settlement] Calling sui client call with:', {
    package: SPLASH_PACKAGE_ID,
    module: 'settlement',
    function: 'settle_batch',
    args: ptbArgs,
  });

  const { stdout, stderr } = await runSuiCommand(ptbArgs);

  console.log('[Sui Batch Settlement] CLI stdout:', stdout.substring(0, 500));
  console.log('[Sui Batch Settlement] CLI stderr:', stderr.substring(0, 500));

  const jsonStart = stdout.indexOf('{');

  if (jsonStart === -1) {
    throw new Error(`Sui CLI did not return JSON output. stdout: ${stdout.substring(0, 200)}, stderr: ${stderr.substring(0, 200)}`);
  }

  const output = JSON.parse(stdout.slice(jsonStart)) as SuiCliCallOutput;
  const digest = output.digest ?? output.effects?.transactionDigest ?? null;
  const status = output.effects?.status?.status;

  if (!digest || status !== 'success') {
    const errorMsg = humanizeSuiError(output.effects?.status?.error, stderr);
    console.error('[Sui Batch Settlement] Transaction failed:', errorMsg);
    throw new Error(errorMsg);
  }

  console.log('[Sui Batch Settlement] Transaction successful:', digest);

  return {
    digest,
    packageId: SPLASH_PACKAGE_ID,
    treasuryId: SPLASH_TREASURY_ID,
  };
}
