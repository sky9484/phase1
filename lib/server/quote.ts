import { randomUUID } from 'crypto';

import { getUsdCorridorByCurrency } from '@/lib/fx/corridors';
import { getCachedJson, setCachedJson } from '@/lib/server/redis-cache';

const PLATFORM_FEE_BPS = Number.parseInt(process.env.PLATFORM_FEE_BPS ?? '140', 10);
const FIXED_FEE_CENTS = Number.parseInt(process.env.FIXED_FEE_CENTS ?? '450', 10);
const QUOTE_TTL_SECONDS = Number.parseInt(process.env.QUOTE_TTL_SECONDS ?? '30', 10);

const fallbackRates: Record<string, number> = {
  USD: 1,
  PHP: 56.42,
  MYR: 4.71,
  IDR: 16284,
  VND: 25385,
  THB: 35.82,
  SGD: 1.345,
  EUR: 0.924,
  GBP: 0.789,
};

export type QuoteData = {
  quoteId: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: string;
  platformFee: number;
  networkFee: number;
  fixedFee: number;
  expiresAt: string;
  ttl: number;
  recipientId?: string;
  targetCurrency: string;
  source: 'corridor' | 'fallback';
};

export async function getLiveUsdToTargetRate(targetCurrency = 'PHP'): Promise<{ rate: number; source: 'corridor' | 'fallback' }> {
  const normalized = targetCurrency.toUpperCase();
  const cacheKey = `fx:usd:${normalized}`;

  if (normalized === 'USD') return { rate: 1, source: 'fallback' };

  const cached = await getCachedJson<{ rate: number; source: 'corridor' | 'fallback' }>(cacheKey);
  if (cached && Number.isFinite(cached.rate) && cached.rate > 0) return cached;

  try {
    const rate = getUsdCorridorByCurrency(normalized)?.rate ?? fallbackRates[normalized];

    if (Number.isFinite(rate) && rate > 0) {
      const live = { rate, source: 'corridor' as const };
      await setCachedJson(cacheKey, live, 20);

      return live;
    }
  } catch {
  }

  const fallback = { rate: fallbackRates[normalized] ?? fallbackRates.PHP, source: 'fallback' as const };
  await setCachedJson(cacheKey, fallback, 20);

  return fallback;
}

export async function calculateQuote(fromAmountCents: number, recipientId?: string, targetCurrency = 'PHP'): Promise<QuoteData> {
  const { rate, source } = await getLiveUsdToTargetRate(targetCurrency);
  const percentageFee = Math.floor((fromAmountCents * PLATFORM_FEE_BPS) / 10_000);
  const platformFee = percentageFee + FIXED_FEE_CENTS;
  const netCents = Math.max(fromAmountCents - platformFee, 0);
  const toAmount = Math.floor((netCents / 100) * rate * 100) / 100;
  const expiresAt = new Date(Date.now() + QUOTE_TTL_SECONDS * 1000).toISOString();

  return {
    quoteId: randomUUID(),
    fromAmount: fromAmountCents,
    toAmount,
    exchangeRate: rate.toFixed(4),
    platformFee,
    networkFee: 0,
    fixedFee: FIXED_FEE_CENTS,
    expiresAt,
    ttl: QUOTE_TTL_SECONDS,
    recipientId,
    targetCurrency: targetCurrency.toUpperCase(),
    source,
  };
}
