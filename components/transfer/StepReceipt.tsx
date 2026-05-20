'use client';

import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ExternalLink } from 'lucide-react';

import Receipt from '@/components/Receipt';
import type { TransferState } from '@/app/dashboard/transfer/page';

export default function StepReceipt({ state, reset }: { state: TransferState; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [issuedAt, setIssuedAt] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    // Initial values are set on mount to avoid SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIssuedAt(new Date().toISOString());
    setReference(`SPL-${Date.now().toString(36).toUpperCase()}`);
  }, []);
  const print = useReactToPrint({ contentRef: ref, documentTitle: `splash-receipt-${state.txDigest?.slice(0, 8) ?? 'draft'}` });

  const digest = state.txDigest ?? null;
  const explorerUrl = digest ? `https://testnet.suivision.xyz/txblock/${digest}` : null;

  return (
    <div className="space-y-5">
      <Receipt
        ref={ref}
        txDigest={digest ?? state.receiptObjectId ?? 'Pending'}
        sender="Splash operator"
        recipient={state.recipient.bank?.account ?? state.recipient.name}
        amount={state.quote?.netReceived ?? state.amount.value}
        currency={state.amount.targetCurrency}
        fee={state.quote?.fee ?? '0.00'}
        timestamp={issuedAt}
        reference={reference}
        explorerUrl={explorerUrl}
      />
      <div className="flex flex-wrap gap-3">
        <button onClick={() => print()} className="flex-1 min-w-[140px] rounded-lg bg-[#5C9EAD] py-3 font-bold text-white hover:bg-[#4A8B9A]">Download PDF</button>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg border border-[#5C9EAD] bg-white py-3 font-bold text-[#326273] hover:bg-[#5C9EAD]/10"
          >
            View on Sui Explorer
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <button onClick={reset} className="flex-1 min-w-[140px] rounded-lg border border-[#326273]/20 py-3 font-semibold text-[#326273] hover:border-[#5C9EAD]">New transfer</button>
      </div>
    </div>
  );
}
