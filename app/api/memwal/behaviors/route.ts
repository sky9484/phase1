import { NextResponse } from 'next/server';

import { recallMemories } from '@/lib/server/memwal';

const demoBehaviors = [
  'Pays PH suppliers weekly',
  'Batches on Friday',
  'Prefers USD settlement',
];

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const recalled = await recallMemories('business payment behavior patterns', 3);
  const memories = recalled.length > 0
    ? recalled.slice(0, 3).map((memory) => ({ text: memory.text, confidence: Math.max(0, 1 - memory.distance), demo: false }))
    : demoBehaviors.map((text, index) => ({ text, confidence: 0.94 - index * 0.03, demo: true }));
  return NextResponse.json({ memories });
}
