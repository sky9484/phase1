import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

import { pythAdapter } from '@/lib/server/pyth';
import { buildUpdatePriceTx } from '@/lib/sui/contracts';
import { executeSponsoredTransaction } from '@/lib/sui/gas';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * This endpoint mutates protocol state (the on-chain peg monitor) and spends
 * sponsored gas, so it must only ever be driven by the scheduler. We require a
 * shared bearer secret (CRON_SECRET) — the same header Vercel Cron sends when
 * CRON_SECRET is configured — and fail closed if it is unset or mismatched.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false; // fail closed: no secret configured → no access

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const provided = Buffer.from(token);
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

async function handlePegUpdate(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { usdc, usdt } = await pythAdapter.getStablecoinPrices();
    const tx = buildUpdatePriceTx(usdc.price, usdt.price);
    const result = await executeSponsoredTransaction({
      kind: 'peg_monitor::update_peg',
      sender: process.env.OPERATOR_SUI_ADDRESS ?? '',
      payload: tx,
    });

    return NextResponse.json({
      success: true,
      usdc_price: usdc.price,
      usdt_price: usdt.price,
      usdc_source: usdc.source,
      usdt_source: usdt.source,
      tx_digest: result?.digest ?? null,
    });
  } catch (error) {
    // Log full detail server-side only; never reflect internal error strings
    // (object IDs, RPC/sponsor messages) back to the caller.
    console.error('[cron/update-peg] peg update failed:', error);
    return NextResponse.json({ success: false, error: 'peg update failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handlePegUpdate(request);
}

export async function POST(request: Request) {
  return handlePegUpdate(request);
}
