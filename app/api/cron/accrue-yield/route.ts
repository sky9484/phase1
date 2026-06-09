/**
 * Daily Smart Treasury yield accrual.
 *
 * Mirrors cron/update-peg: scheduler-only (CRON_SECRET bearer, fail-closed).
 * Each run reads the floating USDY redemption value, allocates net yield on the
 * end-of-day treasury balance pro-rata, moves the disclosed spread to operating,
 * and emits a yield snapshot to anchor on Walrus (audit_anchor.move).
 */

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

import { accrueDailyYield } from '@/lib/server/treasury';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false; // fail closed
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const provided = Buffer.from(token);
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

async function handleAccrual(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const snapshot = await accrueDailyYield();
    // TODO: anchor `snapshot` to Walrus via audit_anchor (daily Merkle batch).
    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    console.error('[cron/accrue-yield] accrual failed:', error);
    return NextResponse.json({ success: false, error: 'yield accrual failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleAccrual(request);
}

export async function POST(request: Request) {
  return handleAccrual(request);
}
