'use client';

import { motion } from 'framer-motion';
import { Zap, Lock, Brain, type LucideIcon } from 'lucide-react';

const features: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: '400ms Settlement', desc: 'Sub-second on-chain finality on Sui Layer-1.', icon: Zap },
  { title: 'Immutable Audit Trail', desc: 'Walrus-anchored invoices and receipts for full auditability.', icon: Lock },
  { title: 'AI Copilot', desc: 'MemWal-powered behavioral insights for optimal timing and batching.', icon: Brain },
];

const metrics = [
  { value: '400ms', label: 'settlement finality' },
  { value: '0.8%+', label: 'starting fees' },
  { value: '~5%', label: 'yield on deposits' },
];

export default function BentoGrid() {
  return (
    <section id="features" className="relative overflow-hidden bg-white/45 py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto grid items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A8895]">
            <Zap className="h-3.5 w-3.5" />
            Infrastructure layer
          </div>
          <h2 className="max-w-2xl text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">An infrastructure-grade payment stack.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#326273]/75">
            Built on Sui with Walrus, MemWal, and Sumsub for enterprise-grade global cross-border payments. ASEAN Power House of Settlement Engine.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4 shadow-sm">
                <div className="font-mono text-2xl font-semibold text-[#C97A56]">{metric.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6E8A95]">{metric.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ title, desc, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.5 }}
              className="group rounded-3xl border border-[#326273]/10 bg-white/75 p-6 shadow-lg shadow-[#326273]/5 backdrop-blur transition-all hover:-translate-y-1 hover:border-[#5C9EAD]/30 hover:shadow-xl"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#326273] text-[#F6F0ED] shadow-lg shadow-[#326273]/20 transition-colors group-hover:bg-[#5C9EAD]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1F4452]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#326273]/70">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-[#326273]/10 bg-[#1F4452] p-6 text-[#F6F0ED] shadow-2xl shadow-[#326273]/15 lg:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#E39774]">
                <Zap className="h-3.5 w-3.5" />
                Technology partners
              </div>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/80">Powered by Sui, Walrus, MemWal, and Sumsub for enterprise-grade global cross-border payments.</p>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center text-xs text-white/65">
              {['Sui', 'Walrus', 'MemWal', 'Sumsub'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-mono text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
