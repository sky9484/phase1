'use client';

import { useMemo } from 'react';
import { ArrowDown } from 'lucide-react';
import type { TransferState } from '@/app/dashboard/transfer/page';

type TransferPatch = (patch: Partial<TransferState>) => void;

const RATES: Record<TransferState['amount']['targetCurrency'], number> = {
  MYR: 4.71,
  PHP: 56.42,
  IDR: 16284,
  SGD: 1.345,
  VND: 25385,
  THB: 35.82,
  EUR: 0.924,
  GBP: 0.789,
};

export default function StepBeneficiary({ state, set, next }: { state: TransferState; set: TransferPatch; next: () => void }) {
  const recipient = state.recipient;
  const amount = state.amount;
  const valid =
    recipient.name.length > 1 &&
    Boolean(recipient.bank?.account) &&
    Number.parseFloat(amount.value || '0') > 0;

  const converted = useMemo(() => {
    const value = Number.parseFloat(amount.value || '0');
    if (!Number.isFinite(value) || value <= 0) return null;
    const rate = RATES[amount.targetCurrency];
    return (value * rate).toLocaleString(undefined, {
      maximumFractionDigits: amount.targetCurrency === 'IDR' ? 0 : 2,
    });
  }, [amount.value, amount.targetCurrency]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) next();
      }}
      className="space-y-5"
    >
      <h2 className="text-xl font-bold text-[#326273]">Who are you paying?</h2>

      <Field label="Recipient name">
        <input
          value={recipient.name}
          onChange={(event) => set({ recipient: { ...recipient, name: event.target.value } })}
          className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
          placeholder="Acme Trading Sdn Bhd"
          required
        />
      </Field>

      <Field label="Country">
        <select
          value={recipient.country}
          onChange={(event) => {
            const country = event.target.value as TransferState['recipient']['country'];
            const currencyMap = { MY: 'MYR', PH: 'PHP', ID: 'IDR', SG: 'SGD', VN: 'VND', TH: 'THB', EU: 'EUR', GB: 'GBP' } as const;
            set({
              recipient: { ...recipient, country },
              amount: { ...amount, targetCurrency: currencyMap[country] },
            });
          }}
          className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
        >
          <option value="MY">Malaysia</option>
          <option value="PH">Philippines</option>
          <option value="ID">Indonesia</option>
          <option value="SG">Singapore</option>
          <option value="VN">Vietnam</option>
          <option value="TH">Thailand</option>
          <option value="EU">European Union</option>
          <option value="GB">United Kingdom</option>
        </select>
      </Field>

      <Field label="Bank account">
        <input
          value={recipient.bank?.swift ?? ''}
          onChange={(event) =>
            set({
              recipient: {
                ...recipient,
                bank: { ...(recipient.bank ?? { account: '' }), swift: event.target.value },
              },
            })
          }
          className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
          placeholder="SWIFT/BIC (optional)"
        />
        <input
          value={recipient.bank?.account ?? ''}
          onChange={(event) =>
            set({
              recipient: {
                ...recipient,
                bank: { ...(recipient.bank ?? { swift: '' }), account: event.target.value },
              },
            })
          }
          className="mt-2 w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 font-mono text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
          placeholder="Account number"
          required
        />
      </Field>

      <div className="space-y-3">
        <div className="rounded-xl border border-[#326273]/10 bg-[#F6F0ED] p-5">
          <div className="mb-2 text-xs text-[#326273]/60">You send (USD)</div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount.value}
            onChange={(event) => set({ amount: { ...amount, value: event.target.value } })}
            className="w-full bg-transparent text-3xl font-extrabold text-[#326273] focus:outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5C9EAD]/10 text-[#5C9EAD]">
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/5 p-5">
          <div className="mb-2 text-xs text-[#326273]/60">Recipient receives ({amount.targetCurrency})</div>
          {converted ? (
            <div className="text-3xl font-extrabold text-[#5C9EAD]">
              {converted} <span className="text-lg">{amount.targetCurrency}</span>
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-[#326273]/30">0.00 <span className="text-lg">{amount.targetCurrency}</span></div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-lg bg-[#5C9EAD] px-4 py-3 font-bold text-white hover:bg-[#4A8B9A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue →
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#326273]/70">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
