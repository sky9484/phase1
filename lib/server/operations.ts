export type TransferIntentState =
  | 'AUTHORIZED'
  | 'DEPOSIT_CONFIRMED'
  | 'EXCHANGING'
  | 'EXCHANGED'
  | 'QUEUED'
  | 'SETTLING'
  | 'SETTLED'
  | 'DISBURSED'
  | 'FAILED'
  | 'REFUNDING'
  | 'REFUNDED';

export type TransferIntentRecord = {
  id: string;
  state: TransferIntentState;
  recipientName: string;
  targetCurrency: string;
  targetAmount: string;
  sourceAmountUsd: string;
  quoteId: string | null;
  exchangeRate: string | null;
  sourceStablecoin: 'USDC' | 'USDT';
  stablecoinAmountMicro: number;
  daxProvider: 'LABUAN' | 'STRIPE' | 'AIRWALLEX';
  daxTier: string | null;
  pegChecked: boolean;
  verificationReference: string | null;
  receiptObjectId: string | null;
  suiTxDigest: string | null;
  failureReason: string | null;
  failedAtState: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BatchRecord = {
  id: string;
  state: TransferIntentState;
  rowCount: number;
  acceptedRows: number;
  blockedRows: number;
  totalAmount: string;
  digest: string | null;
  packageId: string | null;
  explorer: { suiVisionTxUrl: string | null; suiScanTxUrl: string | null };
  createdAt: string;
};

export type RecipientRecord = {
  id: string;
  name: string;
  country: string;
  bank: string;
  swift: string;
  account: string;
  createdAt: string;
};

export type TransactionRecord = {
  id: string;
  kind: 'transfer' | 'batch';
  state: TransferIntentState;
  module: string;
  functionName: string;
  amount: string;
  digest: string | null;
  packageId: string | null;
  explorer: { suiVisionTxUrl: string | null; suiScanTxUrl: string | null };
  createdAt: string;
};

type OperationStore = {
  transfers: Map<string, TransferIntentRecord>;
  batches: Map<string, BatchRecord>;
  recipients: Map<string, RecipientRecord>;
};

const globalStore = globalThis as typeof globalThis & { splashOperations?: OperationStore };

export const operations = globalStore.splashOperations ?? {
  transfers: new Map<string, TransferIntentRecord>(),
  batches: new Map<string, BatchRecord>(),
  recipients: new Map<string, RecipientRecord>(),
};

globalStore.splashOperations = operations;

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function explorerLinks(digest: string | null) {
  return {
    suiVisionTxUrl: digest ? `https://testnet.suivision.xyz/txblock/${digest}` : null,
    suiScanTxUrl: digest ? `https://suiscan.xyz/testnet/tx/${digest}` : null,
  };
}

// ── Transfer intents ──────────────────────────────────────────────────────────

export function createTransferIntent(input: {
  recipientName: string;
  targetCurrency: string;
  targetAmount: string;
  sourceAmountUsd?: string;
  quoteId?: string | null;
  exchangeRate?: string | null;
  sourceStablecoin?: 'USDC' | 'USDT';
  stablecoinAmountMicro?: number;
  daxTier?: string | null;
  pegChecked?: boolean;
}) {
  const now = new Date().toISOString();
  const record: TransferIntentRecord = {
    id: uid('ti'),
    state: 'AUTHORIZED',
    recipientName: input.recipientName,
    targetCurrency: input.targetCurrency,
    targetAmount: input.targetAmount,
    sourceAmountUsd: input.sourceAmountUsd ?? '0.00',
    quoteId: input.quoteId ?? null,
    exchangeRate: input.exchangeRate ?? null,
    sourceStablecoin: input.sourceStablecoin ?? 'USDC',
    stablecoinAmountMicro: input.stablecoinAmountMicro ?? 0,
    daxProvider: 'LABUAN',
    daxTier: input.daxTier ?? null,
    pegChecked: input.pegChecked ?? false,
    verificationReference: null,
    receiptObjectId: null,
    suiTxDigest: null,
    failureReason: null,
    failedAtState: null,
    createdAt: now,
    updatedAt: now,
  };

  operations.transfers.set(record.id, record);

  return record;
}

export function readTransferIntent(intentId: string) {
  return operations.transfers.get(intentId) ?? null;
}

export function updateTransferIntent(intentId: string, patch: Partial<TransferIntentRecord>): void {
  const record = operations.transfers.get(intentId);
  if (!record) return;
  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  operations.transfers.set(intentId, record);
}

export function listTransfers(): TransferIntentRecord[] {
  return [...operations.transfers.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// ── Batches ───────────────────────────────────────────────────────────────────

export function createBatch(input: {
  rowCount: number;
  acceptedRows: number;
  blockedRows: number;
  totalAmount: string;
}) {
  const record: BatchRecord = {
    id: uid('batch'),
    state: 'QUEUED',
    rowCount: input.rowCount,
    acceptedRows: input.acceptedRows,
    blockedRows: input.blockedRows,
    totalAmount: input.totalAmount,
    digest: null,
    packageId: null,
    explorer: explorerLinks(null),
    createdAt: new Date().toISOString(),
  };

  operations.batches.set(record.id, record);

  return record;
}

export function readBatch(batchId: string): BatchRecord | null {
  return operations.batches.get(batchId) ?? null;
}

export function updateBatch(batchId: string, patch: Partial<BatchRecord>): void {
  const record = operations.batches.get(batchId);
  if (!record) return;
  Object.assign(record, patch);
  operations.batches.set(batchId, record);
}

export function listBatches(): BatchRecord[] {
  return [...operations.batches.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// ── Recipients ────────────────────────────────────────────────────────────────

export function createRecipient(input: {
  name: string;
  country: string;
  bank: string;
  swift: string;
  account: string;
}): RecipientRecord {
  const record: RecipientRecord = {
    id: uid('rcpt'),
    name: input.name,
    country: input.country,
    bank: input.bank,
    swift: input.swift,
    account: input.account,
    createdAt: new Date().toISOString(),
  };

  operations.recipients.set(record.id, record);

  return record;
}

export function listRecipients(): RecipientRecord[] {
  return [...operations.recipients.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function findRecipient(recipientId: string): RecipientRecord | null {
  return operations.recipients.get(recipientId) ?? null;
}

export function deleteRecipient(recipientId: string): void {
  operations.recipients.delete(recipientId);
}

// ── Unified transaction log ───────────────────────────────────────────────────

export function listTransactions(): TransactionRecord[] {
  const fromTransfers: TransactionRecord[] = listTransfers().map((t) => ({
    id: t.id,
    kind: 'transfer' as const,
    state: t.state,
    module: 'settlement',
    functionName: 'settle_payment',
    amount: `$${t.sourceAmountUsd}`,
    digest: t.suiTxDigest,
    packageId: process.env.SPLASH_PACKAGE_ID ?? null,
    explorer: explorerLinks(t.suiTxDigest),
    createdAt: t.createdAt,
  }));

  const fromBatches: TransactionRecord[] = listBatches().map((b) => ({
    id: b.id,
    kind: 'batch' as const,
    state: b.state,
    module: 'settlement',
    functionName: 'settle_batch',
    amount: `$${b.totalAmount}`,
    digest: b.digest,
    packageId: b.packageId,
    explorer: b.explorer,
    createdAt: b.createdAt,
  }));

  return [...fromTransfers, ...fromBatches].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
