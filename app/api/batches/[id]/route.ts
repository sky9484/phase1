import { NextResponse } from 'next/server';

import { readBatch } from '@/lib/server/operations';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = readBatch(id);

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
  }

  return NextResponse.json(batch);
}
