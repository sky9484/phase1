import { NextResponse } from 'next/server';

import { pythAdapter } from '@/lib/server/pyth';
import { buildUpdatePriceTx } from '@/lib/sui/contracts';
import { executeSponsoredTransaction } from '@/lib/sui/gas';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
