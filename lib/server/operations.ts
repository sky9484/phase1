export type TransferIntentState = 'AUTHORIZED' | 'QUEUED' | 'SETTLING' | 'SETTLED' | 'FAILED';

export type TransferIntentRecord = {
  id: string;
  state: TransferIntentState;
  recipientName: string;
  targetCurrency: string;
  targetAmount: string;
  sourceAmountMyr: string;
  quoteId: string | null;
  exchangeRate: string | null;
  sourceStablecoin: 'USDC' | 'USDT';
  stablecoinAmountMicro: number;
  daxProvider: 'HATA';
  daxTier: string | null;
  pegChecked: boolean;
  verificationReference: string | null;
  receiptObjectId: string | null;
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
  createdAt: string;
};

type OperationStore = {
  transfers: Map<string, TransferIntentRecord>;
  batches: Map<string, BatchRecord>;
};

const globalStore = globalThis as typeof globalThis & { splashOperations?: OperationStore };

export const operations = globalStore.splashOperations ?? {
  transfers: new Map<string, TransferIntentRecord>(),
  batches: new Map<string, BatchRecord>(),
};

globalStore.splashOperations = operations;

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createTransferIntent(input: {
  recipientName: string;
  targetCurrency: string;
  targetAmount: string;
  sourceAmountMyr?: string;
  quoteId?: string | null;
  exchangeRate?: string | null;
  sourceStablecoin?: 'USDC' | 'USDT';
  stablecoinAmountMicro?: number;
  daxTier?: string | null;
  pegChecked?: boolean;
}) {
  const now = new Date().toISOString();
  const record: TransferIntentRecord = {
    id: id('ti'),
    state: 'AUTHORIZED',
    recipientName: input.recipientName,
    targetCurrency: input.targetCurrency,
    targetAmount: input.targetAmount,
    sourceAmountMyr: input.sourceAmountMyr ?? '0.00',
    quoteId: input.quoteId ?? null,
    exchangeRate: input.exchangeRate ?? null,
    sourceStablecoin: input.sourceStablecoin ?? 'USDC',
    stablecoinAmountMicro: input.stablecoinAmountMicro ?? 0,
    daxProvider: 'HATA',
    daxTier: input.daxTier ?? null,
    pegChecked: input.pegChecked ?? false,
    verificationReference: null,
    receiptObjectId: null,
    createdAt: now,
    updatedAt: now,
  };

  operations.transfers.set(record.id, record);

  return record;
}

export function readTransferIntent(intentId: string) {
  const record = operations.transfers.get(intentId);

  if (!record) {
    return null;
  }

  const elapsed = Date.now() - new Date(record.createdAt).getTime();

  if (elapsed > 3500) {
    record.state = 'SETTLED';
    record.verificationReference = record.verificationReference ?? `sui_${record.id}`;
    record.receiptObjectId = record.receiptObjectId ?? `receipt_${record.id}`;
  } else if (elapsed > 1400) {
    record.state = 'SETTLING';
  } else if (elapsed > 500) {
    record.state = 'QUEUED';
  }

  record.updatedAt = new Date().toISOString();
  operations.transfers.set(record.id, record);

  return record;
}

export function createBatch(input: { rowCount: number; acceptedRows: number; blockedRows: number; totalAmount: string }) {
  const record: BatchRecord = {
    id: id('batch'),
    state: 'QUEUED',
    rowCount: input.rowCount,
    acceptedRows: input.acceptedRows,
    blockedRows: input.blockedRows,
    totalAmount: input.totalAmount,
    createdAt: new Date().toISOString(),
  };

  operations.batches.set(record.id, record);

  return record;
}
