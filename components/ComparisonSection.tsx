'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Banknote, Check, X } from 'lucide-react';
import { WiseLogo } from '@/components/BrandLogos';
import AmbientBackground from '@/components/AmbientBackground';

type FeatureRow = {
  label: string;
  bank: string | boolean;
  agent: string | boolean;
  wise: string | boolean;
  splash: string | boolean;
};

const features: FeatureRow[] = [
  { label: 'Settlement Speed', bank: '2–5 days', agent: '1–3 days', wise: '1–2 days', splash: '400ms' },
  { label: 'Starting Fee', bank: '3–5%', agent: '2–4%', wise: '0.5–1.5%', splash: '0.80%' },
  { label: 'FX Transparency', bank: 'Hidden markup', agent: 'Cash spread', wise: 'Mid-market', splash: 'Pyth oracle' },
  { label: 'Batch Payments', bank: false, agent: false, wise: false, splash: true },
  { label: 'Atomic Settlement', bank: false, agent: false, wise: false, splash: true },
  { label: 'Hot-Potato Safety', bank: false, agent: false, wise: false, splash: true },
  { label: 'AI Treasury Copilot', bank: false, agent: false, wise: false, splash: true },
  { label: 'Yield on Idle USD', bank: false, agent: false, wise: false, splash: '4.8% APY' },
  { label: 'Walrus Audit Trail', bank: false, agent: false, wise: false, splash: true },
  { label: 'On-chain Receipts', bank: false, agent: false, wise: false, splash: true },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-[#5C9EAD]" />
    ) : (
      <X className="mx-auto h-4 w-4 text-[#326273]/25" />
    );
  }
  return <span className="text-xs">{value}</span>;
}

export default function ComparisonSection() {
  return (
    <section id="comparison" className="relative overflow-hidden splash-page-bg py-16">
      <AmbientBackground variant="mint" />
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 max-w-2xl"
        >
          <h2 className="mb-3 text-4xl font-extrabold tracking-[-0.03em] text-[#326273]">
            Built for Business, to Scale, Faster!
          </h2>
          <p className="text-[#326273]/70">
            Splash competes with Wise on price, beats banks on speed, and offers primitives — hot-potato atomicity, on-chain receipts, AI copilot, yield — that none can match.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#326273]/15 bg-white shadow-xl"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F6F0ED]">
                <th className="border-b border-r border-[#326273]/15 p-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#326273]/55">
                  Feature
                </th>
                <th className="border-b border-r border-[#326273]/15 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">🏦</span>
                    <span className="text-xs font-bold text-[#326273]">Bank</span>
                  </div>
                </th>
                <th className="border-b border-r border-[#326273]/15 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Banknote className="h-4 w-4 text-[#C97A56]" />
                    <span className="text-xs font-bold text-[#326273]">Money Agent</span>
                  </div>
                </th>
                <th className="border-b border-r border-[#326273]/15 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <WiseLogo size={18} />
                    <span className="text-xs font-bold text-[#163300]">Wise</span>
                  </div>
                </th>
                <th className="border-b border-[#326273]/15 bg-[#5C9EAD]/10 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Image src="/splash-logo.png" alt="Splash" width={20} height={20} className="h-5 w-5 rounded object-contain" unoptimized />
                    <span className="text-xs font-bold text-[#5C9EAD]">Splash</span>
                    <span className="rounded-full bg-[#5C9EAD] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">B2B</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.label} className={index % 2 === 0 ? '' : 'bg-[#F6F0ED]/35'}>
                  <td className="border-b border-r border-[#326273]/10 p-3 text-xs font-semibold text-[#326273]">
                    {feature.label}
                  </td>
                  <td className="border-b border-r border-[#326273]/10 p-3 text-center text-[#326273]/55">
                    <CellValue value={feature.bank} />
                  </td>
                  <td className="border-b border-r border-[#326273]/10 p-3 text-center text-[#326273]/55">
                    <CellValue value={feature.agent} />
                  </td>
                  <td className="border-b border-r border-[#326273]/10 p-3 text-center text-[#326273]/55">
                    <CellValue value={feature.wise} />
                  </td>
                  <td className={`border-b border-[#326273]/10 p-3 text-center font-semibold text-[#5C9EAD] ${index % 2 === 0 ? 'bg-[#5C9EAD]/5' : 'bg-[#5C9EAD]/8'}`}>
                    <CellValue value={feature.splash} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#326273]/10 bg-white p-5 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6E8A95]">Why 0.80% starting?</div>
            <div className="space-y-2 text-sm text-[#326273]/70">
              <p><strong className="text-[#326273]">Volume pricing:</strong> Larger batches share infrastructure costs — better rates at scale.</p>
              <p><strong className="text-[#326273]">Yield offset:</strong> Your idle USD earns 4.8% APY, effectively reducing your net cost of payment.</p>
              <p><strong className="text-[#326273]">No FX spread:</strong> We use Pyth oracle mid-market rates. No hidden markup on the currency side.</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#326273]/10 bg-white p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6E8A95]">Example: $50,000 to Philippines</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#326273]/70">Traditional bank:</span><span className="font-semibold text-red-500">$2,000 fee + 2-5 days</span></div>
              <div className="flex justify-between"><span className="text-[#326273]/70">Wise:</span><span className="font-semibold text-[#326273]">$625 fee + 1-2 days</span></div>
              <div className="flex justify-between border-t border-[#326273]/10 pt-2"><span className="text-[#326273]/70">Splash:</span><span className="font-semibold text-[#5C9EAD]">$400 fee + 400ms</span></div>
            </div>
            <div className="mt-3 rounded-xl bg-[#5C9EAD]/10 p-3 text-xs font-semibold text-[#4A8895]">
              + Yield on balance: +$200/month at 4.8% APY on $50K held
            </div>
          </div>

          <div className="rounded-xl border border-[#326273]/10 bg-white p-5 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6E8A95]">Sui differentiator</div>
            <div className="space-y-2 text-sm text-[#326273]/70">
              <p><strong className="text-[#326273]">Hot-potato:</strong> PaymentIntent with no store/drop/key — funds cannot get stuck. Only Sui.</p>
              <p><strong className="text-[#326273]">Zero gas:</strong> Splash pays gas for your transactions. No hidden chain fees.</p>
              <p><strong className="text-[#326273]">MemWal:</strong> AI remembers your patterns across sessions — cross-session context no other platform has.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
