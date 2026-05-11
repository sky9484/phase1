import { createHmac } from 'crypto';

const SC_BASE = process.env.HATA_SC_BASE_URL ?? 'https://api.hata.io/v1/my';
const LAB_BASE = process.env.HATA_LABUAN_BASE_URL ?? 'https://api.hata.io/v1/global';

const SC_KEY = process.env.HATA_SC_API_KEY ?? '';
const SC_SECRET = process.env.HATA_SC_API_SECRET ?? '';
const LAB_KEY = process.env.HATA_LABUAN_API_KEY ?? '';
const LAB_SECRET = process.env.HATA_LABUAN_API_SECRET ?? '';

const TIER2_MIN_MYR = Number.parseFloat(process.env.HATA_TIER2_MIN_MYR ?? '5000');
const OTC_MIN_MYR = Number.parseFloat(process.env.HATA_OTC_MIN_MYR ?? '200000');
const TIMEOUT_MS = 30_000;

export type HataTier = 'sc_spot' | 'labuan_swap' | 'otc';

export interface HataConversionResult {
  success: boolean;
  tier: HataTier;
  myrAmount: string;
  usdcAmount: string;
  exchangeRate: string;
  feeUsdc: string;
  txReference: string;
  hataOrderId: string;
  error: string | null;
}

export interface HataQuote {
  quoteId: string;
  rate: string;
  usdcAmount: string;
  feeUsdc: string;
  expiresAt: number;
}

type JsonRecord = Record<string, unknown>;

function stringField(data: JsonRecord, key: string, fallback = '') {
  const value = data[key];

  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function numberField(data: JsonRecord, key: string, fallback: number) {
  const value = data[key];
  const parsed = typeof value === 'string' || typeof value === 'number' ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildHeaders(apiKey: string, apiSecret: string, body = ''): Record<string, string> {
  const nonce = Date.now().toString();
  const signature = createHmac('sha256', apiSecret)
    .update(nonce + apiKey + body)
    .digest('hex');

  return {
    'X-API-KEY': apiKey,
    'X-NONCE': nonce,
    'X-SIGNATURE': signature,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function postJson(url: string, key: string, secret: string, body: object): Promise<JsonRecord> {
  const bodyStr = JSON.stringify(body);
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(key, secret, bodyStr),
    body: bodyStr,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Hata ${response.status} from ${url}: ${await response.text()}`);
  }

  return response.json() as Promise<JsonRecord>;
}

export async function getHataQuote(myrAmount: number): Promise<HataQuote> {
  if (!LAB_KEY || !LAB_SECRET) return mockQuote(myrAmount);

  const data = await postJson(`${LAB_BASE}/quote`, LAB_KEY, LAB_SECRET, {
    from: 'MYR',
    to: 'USDC',
    amount: myrAmount.toString(),
  });

  return {
    quoteId: stringField(data, 'quote_id', `hata-${Date.now()}`),
    rate: stringField(data, 'rate', '0.213'),
    usdcAmount: stringField(data, 'to_amount', (myrAmount * 0.213).toFixed(6)),
    feeUsdc: stringField(data, 'fee', '0'),
    expiresAt: numberField(data, 'expires_at', Math.floor(Date.now() / 1000) + 30),
  };
}

export async function convertMyrToUsdc(myrAmount: number): Promise<HataConversionResult> {
  if ((!SC_KEY || !SC_SECRET) && (!LAB_KEY || !LAB_SECRET)) return mockConversion(myrAmount);

  try {
    if (myrAmount >= OTC_MIN_MYR) return await otcUsdc(myrAmount);
    if (myrAmount >= TIER2_MIN_MYR) return await labuanSwapUsdc(myrAmount);

    return await scSpotUsdc(myrAmount);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Hata error';

    return {
      success: false,
      tier: myrAmount >= OTC_MIN_MYR ? 'otc' : myrAmount >= TIER2_MIN_MYR ? 'labuan_swap' : 'sc_spot',
      myrAmount: myrAmount.toString(),
      usdcAmount: '0',
      exchangeRate: '0',
      feeUsdc: '0',
      txReference: '',
      hataOrderId: '',
      error: message,
    };
  }
}

export async function getMyrToUsdcRate(): Promise<number> {
  try {
    const quote = await getHataQuote(1000);
    const parsed = Number.parseFloat(quote.rate);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.213;
  } catch {
    return 0.213;
  }
}

export async function myrSenToUsdcMicro(myrSen: number): Promise<number> {
  const rate = await getMyrToUsdcRate();
  const myr = myrSen / 100;

  return Math.floor(myr * rate * 1_000_000);
}

async function scSpotUsdc(myrAmount: number): Promise<HataConversionResult> {
  const data = await postJson(`${SC_BASE}/orders`, SC_KEY, SC_SECRET, {
    pair: 'USDC_MYR',
    side: 'buy',
    type: 'market',
    amount: myrAmount.toString(),
    currency: 'MYR',
  });
  const received = Number.parseFloat(stringField(data, 'executed_amount', '0'));
  const fee = Number.parseFloat(stringField(data, 'fee', '0'));
  const rate = received > 0 ? myrAmount / received : 0;
  const orderId = stringField(data, 'order_id');

  return {
    success: true,
    tier: 'sc_spot',
    myrAmount: myrAmount.toString(),
    usdcAmount: received.toString(),
    exchangeRate: rate.toFixed(6),
    feeUsdc: fee.toString(),
    txReference: orderId,
    hataOrderId: orderId,
    error: null,
  };
}

async function labuanSwapUsdc(myrAmount: number): Promise<HataConversionResult> {
  const quote = await postJson(`${LAB_BASE}/quote`, LAB_KEY, LAB_SECRET, {
    from: 'MYR',
    to: 'USDC',
    amount: myrAmount.toString(),
  });
  const result = await postJson(`${LAB_BASE}/swap/execute`, LAB_KEY, LAB_SECRET, {
    quote_id: stringField(quote, 'quote_id'),
    source_currency: 'MYR',
    target_currency: 'USDC',
    source_amount: myrAmount.toString(),
  });
  const swapId = stringField(result, 'swap_id');

  return {
    success: true,
    tier: 'labuan_swap',
    myrAmount: myrAmount.toString(),
    usdcAmount: stringField(result, 'target_amount', '0'),
    exchangeRate: stringField(quote, 'rate', '0'),
    feeUsdc: stringField(result, 'fee', '0'),
    txReference: swapId,
    hataOrderId: swapId,
    error: null,
  };
}

async function otcUsdc(myrAmount: number): Promise<HataConversionResult> {
  const data = await postJson(`${LAB_BASE}/otc/request`, LAB_KEY, LAB_SECRET, {
    trade_type: 'myr_to_usdc',
    myr_amount: myrAmount.toString(),
    execution: 'immediate',
    client_ref: `splash-${Date.now()}`,
  });
  const status = stringField(data, 'status');
  const success = ['confirmed', 'pending_confirmation'].includes(status);
  const otcId = stringField(data, 'otc_id');

  return {
    success,
    tier: 'otc',
    myrAmount: myrAmount.toString(),
    usdcAmount: stringField(data, 'usdc_amount', '0'),
    exchangeRate: stringField(data, 'rate', '0'),
    feeUsdc: stringField(data, 'fee', '0'),
    txReference: otcId,
    hataOrderId: otcId,
    error: success ? null : `OTC status: ${status}`,
  };
}

function mockQuote(myrAmount: number): HataQuote {
  const rate = 0.213;

  return {
    quoteId: `mock-${Date.now()}`,
    rate: rate.toString(),
    usdcAmount: (myrAmount * rate).toFixed(6),
    feeUsdc: '0',
    expiresAt: Math.floor(Date.now() / 1000) + 30,
  };
}

function mockConversion(myrAmount: number): HataConversionResult {
  const rate = 0.213;
  const usdc = (myrAmount * rate).toFixed(6);
  const ref = `MOCK-${Date.now()}`;

  return {
    success: true,
    tier: myrAmount >= OTC_MIN_MYR ? 'otc' : myrAmount >= TIER2_MIN_MYR ? 'labuan_swap' : 'sc_spot',
    myrAmount: myrAmount.toString(),
    usdcAmount: usdc,
    exchangeRate: rate.toString(),
    feeUsdc: '0',
    txReference: ref,
    hataOrderId: ref,
    error: null,
  };
}
