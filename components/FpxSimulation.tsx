'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const steps = [
  { label: 'Your Bank (MYR)', sub: 'Maybank · CIMB · Public Bank' },
  { label: 'FPX Rail', sub: 'PayNet • Real-time' },
  { label: 'Splash Engine', sub: 'Sui · USDC' },
  { label: 'Local Partner', sub: 'Coins.ph · HATA' },
  { label: 'Recipient', sub: 'PHP · IDR · SGD' },
];

export default function FpxSimulation() {
  return (
    <section id="pricing" className="bg-[#F6F0ED] py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-3 text-center text-4xl font-extrabold text-[#326273]">From your bank to anywhere.</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[#326273]/70">FPX payment authorization in MYR. Auto-converted to USDC on Sui. Settled at the recipient in local currency. One flow, two rails, zero spreadsheet wizardry.</p>
        <div className="mx-auto grid max-w-5xl items-center gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <motion.div key={step.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="relative">
              <div className="rounded-xl border border-[#326273]/10 bg-white p-4 text-center">
                <div className="text-sm font-bold text-[#326273]">{step.label}</div>
                <div className="mt-1 text-xs text-[#326273]/60">{step.sub}</div>
              </div>
              {index < steps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[#5C9EAD] md:block" size={20} />}
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-[#326273]/10 bg-white p-6">
          <div className="mb-2 text-xs text-[#326273]/60">Quote · Live</div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-[#326273]">RM 10,000</div>
              <div className="text-xs text-[#326273]/60">You send</div>
            </div>
            <ArrowRight className="text-[#E39774]" />
            <div>
              <div className="text-2xl font-bold text-[#5C9EAD]">₱ 124,830</div>
              <div className="text-xs text-[#326273]/60">They receive</div>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-[#326273]/10 pt-4 text-xs text-[#326273]/70">
            <span>Splash fee (1.5%)</span>
            <span className="font-mono">RM 150.00</span>
          </div>
        </div>
      </div>
    </section>
  );
}
