'use client';

import { motion } from 'framer-motion';
import { FileSignature, Globe2, Layers, ShieldCheck, Wallet, Zap, type LucideIcon } from 'lucide-react';

const items: { icon: LucideIcon; title: string; desc: string; span?: string }[] = [
  { icon: Zap, title: '400ms Settlement', desc: 'Sub-second on-chain finality on the Sui Layer-1.', span: 'md:col-span-2' },
  { icon: Layers, title: 'Atomic Batching', desc: 'One signature, hundreds of vendors. Pass-or-revert.' },
  { icon: ShieldCheck, title: 'On-Chain KYB', desc: 'SSM-anchored business identity, admin-verified.' },
  { icon: Globe2, title: 'SEA Corridors', desc: 'MYR · PHP · IDR · SGD with local rail integrations.' },
  { icon: Wallet, title: '1.5% Flat Fee', desc: 'No FX markup. No hidden lift charges.' },
  { icon: FileSignature, title: 'Auditable Receipts', desc: 'Every settlement event signed and exportable.', span: 'md:col-span-2' },
];

export default function BentoGrid() {
  return (
    <section id="features" className="bg-[#F6F0ED] py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-3 max-w-2xl text-4xl font-extrabold text-[#326273]">An infrastructure-grade payment stack.</h2>
        <p className="mb-12 max-w-xl text-[#326273]/70">Built on Sui. Designed for the SEA exporter, marketplace, and BPO operator.</p>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, span }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`${span ?? ''} rounded-2xl border border-[#326273]/10 bg-white/60 p-7 transition-all hover:border-[#5C9EAD]/40`}
            >
              <Icon className="mb-4 h-7 w-7 text-[#E39774]" />
              <div className="mb-2 text-xl font-bold text-[#326273]">{title}</div>
              <div className="text-sm text-[#326273]/70">{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
