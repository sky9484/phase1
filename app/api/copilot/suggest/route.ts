/**
 * 0xWal personalized suggestions — drawn from MemWal behavioral memory (with
 * grounded defaults). Powers the swipeable recommendation cards on the copilot
 * page. Suggest-only: each card links to a screen where the user authorizes.
 */

import { NextResponse } from 'next/server';

import { getCopilotSuggestions } from '@/lib/server/copilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = new URL(request.url).searchParams.get('user') ?? 'patterns';
  const suggestions = await getCopilotSuggestions(user);
  return NextResponse.json({ suggestions });
}
