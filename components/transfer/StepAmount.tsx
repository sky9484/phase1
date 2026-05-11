'use client';

import type { TransferState } from '@/app/dashboard/transfer/page';

export default function StepAmount({ state, set, prev, next }: { state: TransferState; set: (patch: Partial<TransferState>) => void; prev: () => void; next: () => void }) {
  const amount = state.amount;
  const valid = Number.parseFloat(amount.value || '0') > 0;

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (valid) next(); }} className="space-y-5">
      <h2 className="text-xl font-bold text-[#326273]">How much are you sending?</h2>
      <div className="rounded-xl border border-[#326273]/10 bg-[#F6F0ED] p-5">
        <div className="mb-2 text-xs text-[#326273]/60">You send (MYR)</div>
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
      <div>
        <label className="text-xs font-semibold text-[#326273]/70">Recipient receives in</label>
        <select value={amount.targetCurrency} onChange={(event) => set({ amount: { ...amount, targetCurrency: event.target.value as TransferState['amount']['targetCurrency'] } })} className="mt-1 w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none">
          <option value="MYR">Malaysian Ringgit (MYR)</option>
          <option value="PHP">Philippine Peso (PHP)</option>
          <option value="IDR">Indonesian Rupiah (IDR)</option>
          <option value="SGD">Singapore Dollar (SGD)</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={prev} className="flex-1 rounded-lg border border-[#326273]/20 py-3 font-semibold text-[#326273] hover:border-[#5C9EAD]">← Back</button>
        <button type="submit" disabled={!valid} className="flex-1 rounded-lg bg-[#5C9EAD] py-3 font-bold text-white hover:bg-[#4A8B9A] disabled:opacity-50">Continue →</button>
      </div>
    </form>
  );
}
