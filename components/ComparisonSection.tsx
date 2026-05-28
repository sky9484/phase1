'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { WiseLogo, SuiLogo } from '@/components/BrandLogos';

const services = [
  { name: 'Traditional Bank', logo: '🏦', color: 'text-[#326273]' },
  { name: 'Wise', logo: null, color: 'text-[#163300]', WiseLogo: WiseLogo },
  { name: 'Splash', logo: null, color: 'text-[#5C9EAD]', SuiLogo: SuiLogo, highlight: true },
];

type FeatureRow = {
  label: string;
  bank: string | boolean;
  wise: string | boolean;
  splash: string | boolean;
};

const features: FeatureRow[] = [
  { label: 'Settlement Speed', bank: '2–5 days', wise: '1–2 days', splash: '400ms' },
  { label: 'Starting Fee', bank: '3–5%', wise: '0.5–1.5%', splash: '1%' },
  { label: 'FX Transparency', bank: 'Hidden markup', wise: 'Mid-market', splash: 'Live + Pyth oracle' },
  { label: 'Batch Payments', bank: false, wise: false, splash: true },
  { label: 'Atomic Settlement', bank: false, wise: false, splash: true },
  { label: 'Hot-Potato Safety', bank: false, wise: false, splash: true },
  { label: 'AI Treasury Copilot', bank: false, wise: false, splash: true },
  { label: 'Yield on Idle USD', bank: false, wise: false, splash: '4.8% APY' },
  { label: 'Walrus Audit Trail', bank: false, wise: false, splash: true },
  { label: 'On-chain Receipts', bank: false, wise: false, splash: true },
];

function CellValue({ value }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-[#5C9EAD]" />
    ) : (
      <X className="mx-auto h-5 w-5 text-[#326273]/25" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function ComparisonSection() {
  return (
    <section id="comparison" className="bg-[#F6F0ED] py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl"
        >
          <h2 className="mb-3 text-4xl font-extrabold tracking-[-0.03em] text-[#326273]">
            Built for business, not consumers.
          </h2>
          <p className="text-[#326273]/70">
            Splash competes with Wise on price, beats banks on speed, and offers primitives — hot-potato atomicity, on-chain receipts, AI copilot, yield — that neither can match.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-[#326273]/10 bg-white shadow-xl"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#326273]/10 bg-[#F6F0ED]">
                <th className="p-4 text-left text-xs font-bold uppercase tracking-widest text-[#326273]/50">
                  Feature
                </th>
                {services.map((service) => (
                  <th
                    key={service.name}
                    className={`p-4 text-center ${service.highlight ? 'bg-[#5C9EAD]/8' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {service.WiseLogo ? (
                        <service.WiseLogo size={28} />
                      ) : service.SuiLogo ? (
                        <service.SuiLogo size={28} />
                      ) : (
                        <span className="text-2xl">{service.logo}</span>
                      )}
                      <span className={`text-sm font-bold ${service.color}`}>{service.name}</span>
                      {service.highlight && (
                        <span className="rounded-full bg-[#5C9EAD] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Best for B2B
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.label} className={`border-b border-[#326273]/5 last:border-0 ${index % 2 === 0 ? '' : 'bg-[#F6F0ED]/40'}`}>
                  <td className="p-4 text-sm font-semibold text-[#326273]">{feature.label}</td>
                  <td className="p-4 text-center text-[#326273]/50">
                    <CellValue value={feature.bank} />
                  </td>
                  <td className="p-4 text-center text-[#326273]/50">
                    <CellValue value={feature.wise} />
                  </td>
                  <td className={`p-4 text-center font-semibold text-[#5C9EAD] ${index % 2 === 0 ? 'bg-[#5C9EAD]/5' : 'bg-[#5C9EAD]/8'}`}>
                    <CellValue value={feature.splash} highlight />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/5 p-6">
            <h3 className="mb-3 text-lg font-bold text-[#326273]">Why 1% flat?</h3>
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
              <div className="flex justify-between border-t border-[#326273]/10 pt-2"><span className="text-[#326273]/70">Splash:</span><span className="font-semibold text-[#5C9EAD]">$500 fee + 400ms</span></div>
            </div>
            <div className="mt-3 rounded-xl bg-[#5C9EAD]/10 p-3 text-xs font-semibold text-[#4A8895]">
              + Yield on balance: +$200/month at 4.8% APY on $50K held
            </div>
          </div>

          <div className="rounded-xl border border-[#E39774]/20 bg-[#E39774]/5 p-5">
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
