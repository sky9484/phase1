'use client';

import type { TransferState } from '@/app/dashboard/transfer/page';

type TransferPatch = (patch: Partial<TransferState>) => void;

export default function StepRecipient({ state, set, next }: { state: TransferState; set: TransferPatch; next: () => void }) {
  const recipient = state.recipient;
  const valid = recipient.name.length > 1 && (recipient.rail === 'partner' ? Boolean(recipient.partnerReference) : Boolean(recipient.bank?.account));

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (valid) next(); }} className="space-y-5">
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
        <select value={recipient.country} onChange={(event) => set({ recipient: { ...recipient, country: event.target.value as TransferState['recipient']['country'] } })} className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none">
          <option value="MY">Malaysia</option>
          <option value="PH">Philippines</option>
          <option value="ID">Indonesia</option>
          <option value="SG">Singapore</option>
        </select>
      </Field>
      <Field label="Settlement rail">
        <div className="flex gap-3">
          {(['partner', 'bank'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => set({ recipient: { ...recipient, rail: option } })}
              className={`flex-1 rounded-lg border py-3 text-sm font-semibold ${recipient.rail === option ? 'border-[#5C9EAD] bg-[#5C9EAD] text-white' : 'border-[#326273]/20 bg-white text-[#326273] hover:border-[#5C9EAD]'}`}
            >
              {option === 'partner' ? 'Partner rail' : 'Bank Account'}
            </button>
          ))}
        </div>
      </Field>
      {recipient.rail === 'partner' ? (
        <Field label="Partner reference">
          <input
            value={recipient.partnerReference ?? ''}
            onChange={(event) => set({ recipient: { ...recipient, partnerReference: event.target.value } })}
            className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 font-mono text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
            placeholder="Coins.ph / GCash / payout reference"
            required
          />
        </Field>
      ) : (
        <>
          <Field label="SWIFT/BIC">
            <input value={recipient.bank?.swift ?? ''} onChange={(event) => set({ recipient: { ...recipient, bank: { ...(recipient.bank ?? { account: '' }), swift: event.target.value } } })} className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none" required />
          </Field>
          <Field label="Account number">
            <input value={recipient.bank?.account ?? ''} onChange={(event) => set({ recipient: { ...recipient, bank: { ...(recipient.bank ?? { swift: '' }), account: event.target.value } } })} className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 font-mono text-[#326273] focus:border-[#5C9EAD] focus:outline-none" required />
          </Field>
        </>
      )}
      <button type="submit" disabled={!valid} className="w-full rounded-lg bg-[#5C9EAD] px-4 py-3 font-bold text-white hover:bg-[#4A8B9A] disabled:cursor-not-allowed disabled:opacity-50">Continue →</button>
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
