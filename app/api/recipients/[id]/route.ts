import { NextResponse } from 'next/server';

import { deleteRecipient, findRecipient } from '@/lib/server/operations';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exists = findRecipient(id);
  if (!exists) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }
  deleteRecipient(id);
  return NextResponse.json({ ok: true });
}
