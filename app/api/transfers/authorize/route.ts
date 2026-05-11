import { NextResponse } from 'next/server';

import { convertMyrToUsdc, myrSenToUsdcMicro } from '@/lib/server/hata';
import { createTransferIntent } from '@/lib/server/operations';
import { pythAdapter } from '@/lib/server/pyth';
import { calculateQuote } from '@/lib/server/quote';
import { selectStablecoin } from '@/lib/server/stable-router';

export async function POST(request: Request) {
  const body = await request.json();
  const totp = String(body.totp ?? '');
  const paymentRail = String(body.paymentRail ?? '');

  // FPX PayNet flow does not require TOTP in Phase 1
  if (paymentRail !== 'FPX_PAYNET' && !/^\d{6}$/.test(totp)) {
    return NextResponse.json({ error: 'A valid 6-digit authorization code is required' }, { status: 400 });
  }

  const recipient = body.recipient as { name?: string } | undefined;
  const amount = body.amount as { value?: string; targetCurrency?: string } | undefined;
  const quote = body.quote as { netReceived?: string } | undefined;
  const sourceAmount = Number.parseFloat(amount?.value ?? '0');
  const sourceAmountSen = Math.round(sourceAmount * 100);
  const serverQuote = sourceAmountSen > 0 ? await calculateQuote(sourceAmountSen, undefined, amount?.targetCurrency ?? 'PHP') : null;
  const pegStatus = await pythAdapter.getPegStatus();

  if (!pegStatus.pegged) {
    return NextResponse.json(
      {
        error: `Settlement blocked: stablecoin peg deviation too high (${pegStatus.deviationPpm} ppm).`,
      },
      { status: 409 },
    );
  }

  const stablecoinAmountMicro = sourceAmountSen > 0 ? await myrSenToUsdcMicro(sourceAmountSen) : 0;
  const conversion = sourceAmount > 0 ? await convertMyrToUsdc(sourceAmount) : null;
  const usdcAvailableMicro = Number.parseInt(process.env.USDC_AVAILABLE_MICRO ?? '1000000000000000', 10);
  const usdtAvailableMicro = Number.parseInt(process.env.USDT_AVAILABLE_MICRO ?? '0', 10);
  const usdtBufferAgeMs = Number.parseInt(process.env.USDT_BUFFER_AGE_MS ?? '0', 10);
  const kycTier = Number.parseInt(String(body.kycTier ?? process.env.DEFAULT_KYC_TIER ?? '1'), 10);
  const sourceStablecoin = selectStablecoin({
    kycTier,
    usdcSpreadBps: 0,
    usdtSpreadBps: -pegStatus.spreadBps,
    usdcAvailableMicro,
    usdtAvailableMicro,
    transferAmountMicro: stablecoinAmountMicro,
    usdtBufferAgeMs,
  });

  const intent = createTransferIntent({
    recipientName: recipient?.name ?? 'Recipient',
    targetCurrency: serverQuote?.targetCurrency ?? amount?.targetCurrency ?? 'PHP',
    targetAmount: serverQuote ? serverQuote.toAmount.toFixed(2) : quote?.netReceived ?? '0.00',
    sourceAmountMyr: Number.isFinite(sourceAmount) ? sourceAmount.toFixed(2) : '0.00',
    quoteId: serverQuote?.quoteId ?? null,
    exchangeRate: serverQuote?.exchangeRate ?? null,
    sourceStablecoin,
    stablecoinAmountMicro,
    daxTier: conversion?.tier ?? null,
    pegChecked: true,
  });

  return NextResponse.json({
    transferIntentId: intent.id,
    state: intent.state,
    quote: serverQuote,
    stablecoinUsed: sourceStablecoin,
    daxProvider: intent.daxProvider,
    daxTier: intent.daxTier,
  });
}
