'use client';

import { useCallback, useState } from 'react';
import { Check, ShieldCheck, Sparkles, Timer } from 'lucide-react';

import StepBeneficiary from '@/components/transfer/StepBeneficiary';
import StepQuote from '@/components/transfer/StepQuote';
import StepReceipt from '@/components/transfer/StepReceipt';
import StepStatus from '@/components/transfer/StepStatus';

export type TransferState = {
  step: 1 | 2 | 3 | 4;
  recipient: {
    name: string;
    country: 'MY' | 'PH' | 'ID' | 'SG';
    rail: 'bank';
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
  recipient: { name: '', country: 'PH', rail: 'bank' },
  amount: { value: '', sourceCurrency: 'MYR', targetCurrency: 'PHP' },
};

const stepLabels = ['Beneficiary', 'Quote & Send', 'Status', 'Receipt'] as const;

const sidePanels = [
  {
    icon: ShieldCheck,
    title: 'No stored credentials',
    body: 'Splash never holds your bank login. Each authorization happens directly with PayNet FPX.',
  },
  {
    icon: Timer,
    title: 'Quote valid 30s',
    body: 'Live FX is locked at authorization. We re-quote if the rate moves before you sign.',
  },
  {
    icon: Sparkles,
    title: 'Sui finality',
    body: 'Cross-border legs settle on Sui in ~400ms with on-chain receipts you can audit.',
  },
];

export default function TransferPage() {
  const [state, setState] = useState<TransferState>(initial);
  const set = useCallback((patch: Partial<TransferState>) => {
    setState((previous) => ({ ...previous, ...patch }));
  }, []);
  const go = useCallback((step: TransferState['step']) => {
    set({ step });
  }, [set]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 inline-flex rounded-full bg-[#5C9EAD]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#5C9EAD]">
            Transfer
          </div>
          <h1 className="text-2xl font-extrabold text-[#326273]">Send a payout</h1>
          <p className="mt-0.5 text-xs text-[#326273]/60">
            Capture a beneficiary, lock the quote, authorize via PayNet FPX, then download the on-chain receipt.
          </p>
        </div>
        <div className="rounded-xl border border-[#326273]/10 bg-white px-3 py-2 text-xs font-semibold text-[#326273]">
          Step {state.step} of 4 · {stepLabels[state.step - 1]}
        </div>
      </header>

      <Stepper current={state.step} />

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-[#326273]/10 bg-white p-6 md:p-8">
          {state.step === 1 && <StepBeneficiary state={state} set={set} next={() => go(2)} />}
          {state.step === 2 && <StepQuote state={state} set={set} prev={() => go(1)} next={() => go(3)} />}
          {state.step === 3 && <StepStatus state={state} set={set} next={() => go(4)} />}
          {state.step === 4 && <StepReceipt state={state} reset={() => setState(initial)} />}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#326273]/10 bg-[#326273] p-5 text-white">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">Live transfer</div>
            <div className="mt-2 text-lg font-extrabold">
              {state.amount.value ? `MYR ${state.amount.value}` : 'Awaiting amount'}
            </div>
            <div className="mt-1 text-xs text-white/65">
              {state.recipient.name ? `To ${state.recipient.name}` : 'No beneficiary selected'} · MY → {state.recipient.country}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <Pill label="Source" value="MYR" />
              <Pill label="Target" value={state.amount.targetCurrency} />
            </div>
          </div>

          {sidePanels.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-[#326273]/10 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C9EAD]/10 text-[#5C9EAD]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#326273]">{title}</div>
                  <p className="mt-1 text-xs leading-5 text-[#326273]/65">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </aside>
      </section>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-white/55">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-0 overflow-hidden rounded-2xl border border-[#326273]/10 bg-white">
      {stepLabels.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const done = step < current;
        const last = step === stepLabels.length;

        return (
          <li
            key={label}
            className={`relative flex flex-col items-center justify-center gap-1.5 px-1.5 py-3 text-center transition-colors sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-4 sm:text-left ${active ? 'bg-[#326273]/5' : 'bg-white'} ${last ? '' : 'border-r border-[#326273]/10'}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all sm:h-8 sm:w-8 sm:text-xs ${done
                ? 'bg-[#5C9EAD] text-white shadow-md shadow-[#5C9EAD]/30'
                : active
                ? 'bg-[#E39774] text-white shadow-md shadow-[#E39774]/30'
                : 'bg-[#326273]/8 text-[#326273]/55'}`}
            >
              {done ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : step}
            </span>
            <div className="min-w-0 sm:flex-1">
              <div className={`hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block ${active ? 'text-[#E39774]' : done ? 'text-[#5C9EAD]' : 'text-[#326273]/45'}`}>
                Step {step}
              </div>
              <div className={`truncate text-[10px] font-bold leading-tight sm:text-sm ${active || done ? 'text-[#326273]' : 'text-[#326273]/55'}`}>
                {label}
              </div>
            </div>
            {active && (
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#E39774]" aria-hidden="true" />
            )}
            {done && (
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#5C9EAD]" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
