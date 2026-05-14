import { NextResponse } from 'next/server';

import { setAdminSessionCookie, validateAdminCredentials } from '@/lib/server/admin-auth';

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? '');
  const password = String(body.password ?? '');
  const session = validateAdminCredentials(email, password);

  if (!session) {
    return NextResponse.json({ error: 'Invalid staff credentials' }, { status: 401 });
  }

  await setAdminSessionCookie();

  return NextResponse.json({ session });
}
