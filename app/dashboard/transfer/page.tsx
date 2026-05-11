'use client';

import { useCallback, useState } from 'react';

import StepAmount from '@/components/transfer/StepAmount';
import StepQuote from '@/components/transfer/StepQuote';
import StepReceipt from '@/components/transfer/StepReceipt';
import StepRecipient from '@/components/transfer/StepRecipient';
import StepStatus from '@/components/transfer/StepStatus';

export type TransferState = {
  step: 1 | 2 | 3 | 4 | 5;
  recipient: {
    name: string;
    country: 'MY' | 'PH' | 'ID' | 'SG';
    rail: 'partner' | 'bank';
    partnerReference?: string;
    bank?: { swift: string; account: string };
  };
  amount: { value: string; sourceCurrency: 'MYR'; targetCurrency: 'MYR' | 'PHP' | 'IDR' | 'SGD' };
  quote?: { fxRate: number; netReceived: string; fee: string };
  txDigest?: string;
  txStatus?: 'pending' | 'success' | 'failed';
  transferIntentId?: string;
  receiptObjectId?: string;
};

const initial: TransferState = {
  step: 1,
  recipient: { name: '', country: 'PH', rail: 'partner' },
  amount: { value: '', sourceCurrency: 'MYR', targetCurrency: 'PHP' },
};

export default function TransferPage() {
  const [state, setState] = useState<TransferState>(initial);
  const set = useCallback((patch: Partial<TransferState>) => {
    setState((previous) => ({ ...previous, ...patch }));
  }, []);
  const go = useCallback((step: TransferState['step']) => {
    set({ step });
  }, [set]);

  return (
    <div className="mx-auto max-w-2xl">
      <Stepper current={state.step} />
      <div className="mt-6 rounded-2xl border border-[#326273]/10 bg-white p-8">
        {state.step === 1 && <StepRecipient state={state} set={set} next={() => go(2)} />}
        {state.step === 2 && <StepAmount state={state} set={set} prev={() => go(1)} next={() => go(3)} />}
        {state.step === 3 && <StepQuote state={state} set={set} prev={() => go(2)} next={() => go(4)} />}
        {state.step === 4 && <StepStatus state={state} set={set} next={() => go(5)} />}
        {state.step === 5 && <StepReceipt state={state} reset={() => setState(initial)} />}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  const labels = ['Beneficiary', 'Amount', 'Quote & Send', 'Status', 'Receipt'];

  return (
    <ol className="flex items-center gap-2 text-xs font-semibold">
      {labels.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const done = step < current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-[#5C9EAD] text-white' : active ? 'bg-[#E39774] text-white' : 'bg-[#326273]/10 text-[#326273]/60'}`}>
              {step}
            </span>
            <span className={`hidden md:inline ${active ? 'text-[#326273]' : 'text-[#326273]/50'}`}>{label}</span>
            {step < labels.length && <span className="h-px flex-1 bg-[#326273]/15" />}
          </li>
        );
      })}
    </ol>
  );
}
