/**
 * MemWal integration for behavioral pattern learning (non-PII only).
 * Phase 1 scaffold: Stores anonymized transfer patterns for AI Copilot.
 * Rule: No PII in MemWal; only behavioral patterns like timing, corridor, amount buckets.
 */

export interface BehavioralPattern {
  patternId: string;
  userIdHash: string; // Hashed user ID, not raw identifier
  corridor: string;
  amountBucket: 'micro' | 'small' | 'medium' | 'large';
  timeOfDay: string;
  dayOfWeek: string;
  frequency: number;
  lastSeen: string;
}

export async function recordTransferPattern(pattern: Omit<BehavioralPattern, 'patternId' | 'frequency' | 'lastSeen'>): Promise<BehavioralPattern> {
  const MEMWAL_API_KEY = process.env.MEMWAL_API_KEY;
  if (!MEMWAL_API_KEY) {
    throw new Error('MEMWAL_API_KEY not configured');
  }

  // Phase 1 scaffold: Replace with actual MemWal API call
  const patternId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return {
    patternId,
    ...pattern,
    frequency: 1,
    lastSeen: new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserPatterns(_userIdHash: string): Promise<BehavioralPattern[]> {
  // Phase 1 scaffold: Retrieve patterns for AI Copilot suggestions
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function suggestOptimalTiming(_userIdHash: string, _corridor: string): Promise<{ suggestedHour: number; confidence: number }> {
  // Phase 1 scaffold: AI Copilot timing suggestion based on MemWal patterns
  return { suggestedHour: 10, confidence: 0.75 };
}
