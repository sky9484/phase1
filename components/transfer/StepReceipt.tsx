'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import Receipt from '@/components/Receipt';
import type { TransferState } from '@/app/dashboard/transfer/page';

export default function StepReceipt({ state, reset }: { state: TransferState; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [issuedAt] = useState(() => new Date().toISOString());
  const [reference] = useState(() => `SPL-${Date.now().toString(36).toUpperCase()}`);
  const print = useReactToPrint({ contentRef: ref, documentTitle: `splash-receipt-${state.txDigest?.slice(0, 8) ?? 'draft'}` });

  return (
    <div className="space-y-5">
      <Receipt
        ref={ref}
        txDigest={state.txDigest ?? state.receiptObjectId ?? 'Pending'}
        sender="Splash operator"
        recipient={state.recipient.partnerReference ?? state.recipient.bank?.account ?? state.recipient.name}
        amount={state.quote?.netReceived ?? state.amount.value}
        currency={state.amount.targetCurrency}
        fee={state.quote?.fee ?? '0.00'}
        timestamp={issuedAt}
        reference={reference}
      />
      <div className="flex gap-3">
        <button onClick={() => print()} className="flex-1 rounded-lg bg-[#5C9EAD] py-3 font-bold text-white hover:bg-[#4A8B9A]">Download PDF</button>
        <button onClick={reset} className="flex-1 rounded-lg border border-[#326273]/20 py-3 font-semibold text-[#326273] hover:border-[#5C9EAD]">New transfer</button>
      </div>
    </div>
  );
}
