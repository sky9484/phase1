/**
 * AI Treasury Copilot with layered intelligence.
 * Phase 1 scaffold: Invoice parsing, FX forecasting, batch optimization, treasury advice.
 * Rule: User must sign before any execution; Copilot only suggests.
 */

export interface CopilotSuggestion {
  suggestionId: string;
  type: 'timing' | 'batch' | 'treasury' | 'invoice';
  title: string;
  description: string;
  confidence: number;
  requiresAuth: boolean;
  suggestedAction?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function parseInvoice(_invoiceText: string): Promise<{ amount: number; currency: string; recipient: string }> {
  // Phase 1 scaffold: AI invoice parsing
  return { amount: 0, currency: 'USD', recipient: '' };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function forecastFxRate(_corridor: string, _horizonHours: number): Promise<{ predictedRate: number; confidence: number }> {
  // Phase 1 scaffold: AI FX rate forecasting
  return { predictedRate: 1, confidence: 0.5 };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function optimizeBatch(_rows: Array<{ amount: number; corridor: string }>): Promise<{ suggestedGrouping: number[][]; savingsEstimate: number }> {
  // Phase 1 scaffold: AI batch optimization for better FX rates
  return { suggestedGrouping: [], savingsEstimate: 0 };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function suggestTreasuryAction(_currentBalance: number, _pendingOutflows: number): Promise<CopilotSuggestion> {
  // Phase 1 scaffold: AI treasury advice (e.g., rebalance, add liquidity)
  return {
    suggestionId: `cop_${Date.now()}`,
    type: 'treasury',
    title: 'Rebalance treasury',
    description: 'Consider adding USDC liquidity to cover pending outflows',
    confidence: 0.8,
    requiresAuth: true,
    suggestedAction: 'Add $10,000 USDC to treasury',
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCopilotSuggestions(_userIdHash: string): Promise<CopilotSuggestion[]> {
  // Phase 1 scaffold: Retrieve personalized suggestions based on MemWal patterns
  return [];
}
