import { NextResponse } from 'next/server';

import { createBatch } from '@/lib/server/operations';

type BatchRow = {
  name?: string;
  address?: string;
  amount?: string;
};

export async function POST(request: Request) {
  const body = await request.json();
  const rows = Array.isArray(body.rows) ? (body.rows as BatchRow[]) : [];
  const totp = String(body.totp ?? '');

  if (!/^\d{6}$/.test(totp)) {
    return NextResponse.json({ error: 'A valid 6-digit authorization code is required' }, { status: 400 });
  }

  const acceptedRows = rows.filter((row) => row.name && row.address && Number.parseFloat(String(row.amount ?? '0')) > 0);
  const total = acceptedRows.reduce((sum, row) => sum + Number.parseFloat(String(row.amount ?? '0')), 0);
  const batch = createBatch({
    rowCount: rows.length,
    acceptedRows: acceptedRows.length,
    blockedRows: rows.length - acceptedRows.length,
    totalAmount: total.toFixed(2),
  });

  return NextResponse.json(batch);
}
