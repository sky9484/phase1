'use client';

import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Radar, XCircle } from 'lucide-react';

type Result = 'PASS' | 'REVIEW' | 'BLOCK';

type Check = {
  label: string;
  result: Result;
  detail: string;
};

const sentinelNames = ['sanction', 'blocked', 'pep hit', 'watchlist'];
const supportedCountries = new Set(['MY', 'PH', 'ID', 'SG']);

function strongest(checks: Check[]): Result {
  if (checks.some((check) => check.result === 'BLOCK')) return 'BLOCK';
  if (checks.some((check) => check.result === 'REVIEW')) return 'REVIEW';
  return 'PASS';
}

function resultClass(result: Result) {
  if (result === 'PASS') return 'border-[#5C9EAD]/30 bg-[#5C9EAD]/10 text-[#5C9EAD]';
  if (result === 'REVIEW') return 'border-[#E39774]/30 bg-[#E39774]/10 text-[#E39774]';
  return 'border-red-500/30 bg-red-500/10 text-red-600';
}

function scoreFor(result: Result) {
  if (result === 'PASS') return 96;
  if (result === 'REVIEW') return 62;
  return 18;
}

export default function AmlKytHealthPreview() {
  const [beneficiary, setBeneficiary] = useState('Coins.ph Vendor');
  const [country, setCountry] = useState('PH');
  const [amount, setAmount] = useState('12000');
  const [purpose, setPurpose] = useState('supplier_payment');
  const [repeatCount, setRepeatCount] = useState('1');

  const checks = useMemo<Check[]>(() => {
    const numericAmount = Number.parseFloat(amount || '0');
    const numericRepeatCount = Number.parseInt(repeatCount || '0', 10);
    const lowerName = beneficiary.toLowerCase();

    return [
      {
        label: 'AML sanctions / PEP',
        result: sentinelNames.some((term) => lowerName.includes(term)) ? 'BLOCK' : 'PASS',
        detail: sentinelNames.some((term) => lowerName.includes(term)) ? 'Potential list match found' : 'No sentinel list match',
      },
      {
        label: 'KYT amount threshold',
        result: numericAmount > 20000 ? 'REVIEW' : numericAmount > 0 ? 'PASS' : 'BLOCK',
        detail: numericAmount > 20000 ? 'Above Tier 1 single-transfer threshold' : numericAmount > 0 ? 'Within Tier 1 threshold' : 'Amount must be greater than zero',
      },
      {
        label: 'KYT structuring',
        result: numericRepeatCount >= 4 ? 'REVIEW' : 'PASS',
        detail: numericRepeatCount >= 4 ? 'Repeated beneficiary pattern detected' : 'No structuring pattern',
      },
      {
        label: 'Corridor allowlist',
        result: supportedCountries.has(country) ? 'PASS' : 'BLOCK',
        detail: supportedCountries.has(country) ? `${country} corridor is enabled` : `${country || 'Unknown'} corridor is not enabled`,
      },
      {
        label: 'Purpose code',
        result: purpose ? 'PASS' : 'REVIEW',
        detail: purpose ? purpose : 'Purpose required before authorization',
      },
    ];
  }, [amount, beneficiary, country, purpose, repeatCount]);

  const result = strongest(checks);
  const score = scoreFor(result);

  return (
    <section className="rounded-2xl border border-[#326273]/10 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-[#5C9EAD]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#5C9EAD]">Live preview</div>
          <h2 className="text-xl font-bold text-[#326273]">AML / KYT health check</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#326273]/60">Edit a sample transfer and watch the compliance result update before the user reaches 2FA authorization.</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${resultClass(result)}`}>
          {result === 'PASS' && <CheckCircle2 size={16} />}
          {result === 'REVIEW' && <AlertTriangle size={16} />}
          {result === 'BLOCK' && <XCircle size={16} />}
          {result}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl bg-[#F6F0ED] p-5">
          <Field label="Beneficiary name">
            <input value={beneficiary} onChange={(event) => setBeneficiary(event.target.value)} className="w-full rounded-lg border border-[#326273]/20 bg-white px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none" />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Destination country">
              <select value={country} onChange={(event) => setCountry(event.target.value)} className="w-full rounded-lg border border-[#326273]/20 bg-white px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none">
                <option value="PH">Philippines</option>
                <option value="ID">Indonesia</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="XX">Unsupported corridor</option>
              </select>
            </Field>
            <Field label="Amount (MYR)">
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} className="w-full rounded-lg border border-[#326273]/20 bg-white px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Purpose code">
              <input value={purpose} onChange={(event) => setPurpose(event.target.value)} className="w-full rounded-lg border border-[#326273]/20 bg-white px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none" />
            </Field>
            <Field label="Repeated rows">
              <input inputMode="numeric" value={repeatCount} onChange={(event) => setRepeatCount(event.target.value.replace(/\D/g, ''))} className="w-full rounded-lg border border-[#326273]/20 bg-white px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none" />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#326273] p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-white/60">Compliance health score</div>
                <div className="mt-1 text-4xl font-extrabold">{score}%</div>
              </div>
              <Activity className="text-[#5C9EAD]" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#5C9EAD] transition-all" style={{ width: `${score}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.label} className="flex items-start justify-between gap-4 rounded-xl border border-[#326273]/10 bg-white p-4">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-[#326273]">
                    <Radar size={16} className="text-[#5C9EAD]" />
                    {check.label}
                  </div>
                  <div className="mt-1 text-xs text-[#326273]/60">{check.detail}</div>
                </div>
                <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${resultClass(check.result)}`}>{check.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#326273]/70">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
