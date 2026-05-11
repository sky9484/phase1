import { randomUUID } from 'crypto';

import { getMyrToUsdcRate } from '@/lib/server/hata';
import { getCachedJson, setCachedJson } from '@/lib/server/redis-cache';

const PHP_PER_USDC_DEFAULT = Number.parseFloat(process.env.PHP_PER_USDC ?? '56.5');
const PLATFORM_FEE_BPS = Number.parseInt(process.env.PLATFORM_FEE_BPS ?? '140', 10);
const FIXED_FEE_SEN = Number.parseInt(process.env.FIXED_FEE_SEN ?? '450', 10);
const QUOTE_TTL_SECONDS = Number.parseInt(process.env.QUOTE_TTL_SECONDS ?? '30', 10);

const fallbackRates: Record<string, number> = {
  MYR: 1,
  PHP: 12.0345,
  IDR: 3361.14,
  SGD: 0.285,
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
  source: 'hata' | 'fallback';
};

export async function getLiveMyrToTargetRate(targetCurrency = 'PHP'): Promise<{ rate: number; source: 'hata' | 'fallback' }> {
  const normalized = targetCurrency.toUpperCase();
  const cacheKey = `fx:myr:${normalized}`;

  if (normalized === 'MYR') return { rate: 1, source: 'fallback' };

  const cached = await getCachedJson<{ rate: number; source: 'hata' | 'fallback' }>(cacheKey);
  if (cached && Number.isFinite(cached.rate) && cached.rate > 0) return cached;

  try {
    const myrPerUsdc = await getMyrToUsdcRate();
    const usdcToTarget = normalized === 'PHP' ? PHP_PER_USDC_DEFAULT : fallbackRates[normalized] / fallbackRates.PHP * PHP_PER_USDC_DEFAULT;
    const rate = myrPerUsdc * usdcToTarget;

    if (Number.isFinite(rate) && rate > 0) {
      const live = { rate, source: 'hata' as const };
      await setCachedJson(cacheKey, live, 20);

      return live;
    }
  } catch {
  }

  const fallback = { rate: fallbackRates[normalized] ?? fallbackRates.PHP, source: 'fallback' as const };
  await setCachedJson(cacheKey, fallback, 20);

  return fallback;
}

export async function calculateQuote(fromAmountSen: number, recipientId?: string, targetCurrency = 'PHP'): Promise<QuoteData> {
  const { rate, source } = await getLiveMyrToTargetRate(targetCurrency);
  const percentageFee = Math.floor((fromAmountSen * PLATFORM_FEE_BPS) / 10_000);
  const platformFee = percentageFee + FIXED_FEE_SEN;
  const netSen = Math.max(fromAmountSen - platformFee, 0);
  const toAmount = Math.floor((netSen / 100) * rate * 100) / 100;
  const expiresAt = new Date(Date.now() + QUOTE_TTL_SECONDS * 1000).toISOString();

  return {
    quoteId: randomUUID(),
    fromAmount: fromAmountSen,
    toAmount,
    exchangeRate: rate.toFixed(4),
    platformFee,
    networkFee: 0,
    fixedFee: FIXED_FEE_SEN,
    expiresAt,
    ttl: QUOTE_TTL_SECONDS,
    recipientId,
    targetCurrency: targetCurrency.toUpperCase(),
    source,
  };
}
