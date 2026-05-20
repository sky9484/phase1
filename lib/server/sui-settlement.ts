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
    '--args', SPLASH_PEG_STATE_ID, SPLASH_ADMIN_CAP_ID, usdcDeviationPpm, usdtDeviationPpm, '@0x6',
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
  amountMyr: number;
  stablecoinAmountMicro: number;
}) {
  const SPLASH_PACKAGE_ID = envObjectIdOrThrow('SPLASH_PACKAGE_ID');
  const SPLASH_TREASURY_ID = envObjectIdOrThrow('SPLASH_TREASURY_ID');
  const SPLASH_PEG_STATE_ID = envObjectIdOrThrow('SPLASH_PEG_STATE_ID');
  const SPLASH_BUSINESS_ACCOUNT_ID = envObjectIdOrThrow('SPLASH_BUSINESS_ACCOUNT_ID');
  const SPLASH_TRANSFER_COIN_ID = envObjectIdOrThrow('SPLASH_TRANSFER_COIN_ID');
  const USDC_TYPE = envOrThrow('USDC_TYPE');
  const SPLASH_TEST_RECIPIENT_ADDRESS = process.env.SPLASH_TEST_RECIPIENT_ADDRESS ?? '';

  const recipientAddress = SPLASH_TEST_RECIPIENT_ADDRESS || input.recipient;

  requireSuiAddress(recipientAddress, 'Transfer recipient');

  await updatePegOnSui();

  const gasBudget = process.env.SUI_RECORD_SETTLEMENT_GAS_BUDGET ?? '10000000';

  console.log('[Sui Single Transfer] Calling sui client call with:', {
    package: SPLASH_PACKAGE_ID,
    usdcType: USDC_TYPE,
    module: 'settlement',
    function: 'settle_payment',
    args: [SPLASH_TREASURY_ID, SPLASH_BUSINESS_ACCOUNT_ID, SPLASH_PEG_STATE_ID, SPLASH_TRANSFER_COIN_ID, recipientAddress, '@0x6'],
  });

  const { stdout, stderr } = await runSuiCommand([
    'client',
    'call',
    '--package',
    SPLASH_PACKAGE_ID,
    '--module',
    'settlement',
    '--function',
    'settle_payment',
    '--type-args',
    USDC_TYPE,
    '--args',
    SPLASH_TREASURY_ID,
    SPLASH_BUSINESS_ACCOUNT_ID,
    SPLASH_PEG_STATE_ID,
    SPLASH_TRANSFER_COIN_ID,
    recipientAddress,
    '@0x6',
    '--gas-budget',
    gasBudget,
    '--json',
  ]);

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
  totalMyr: number;
}) {
  const SPLASH_PACKAGE_ID = envObjectIdOrThrow('SPLASH_PACKAGE_ID');
  const SPLASH_TREASURY_ID = envObjectIdOrThrow('SPLASH_TREASURY_ID');
  const SPLASH_PEG_STATE_ID = envObjectIdOrThrow('SPLASH_PEG_STATE_ID');
  const SPLASH_BUSINESS_ACCOUNT_ID = envObjectIdOrThrow('SPLASH_BUSINESS_ACCOUNT_ID');
  const USDC_TYPE = envOrThrow('USDC_TYPE');
  const SPLASH_TEST_RECIPIENT_ADDRESS = process.env.SPLASH_TEST_RECIPIENT_ADDRESS ?? '';

  await updatePegOnSui();

  const gasBudget = process.env.SUI_RECORD_SETTLEMENT_GAS_BUDGET ?? '10000000';

  const paymentObjects = input.rows.map((row) => {
    const amount = moneyToMinor(Number.parseFloat(row.amount ?? '0'));
    const recipient = requireSuiAddress(SPLASH_TEST_RECIPIENT_ADDRESS || row.address || '', `Batch recipient ${row.name ?? row.address ?? ''}`.trim());
    return { recipient, amount };
  });

  const ptbArgs = ['client', 'ptb'];

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
