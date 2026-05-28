'use client';

import { motion } from 'framer-motion';
import { Zap, Lock, Brain, Flame, TrendingUp, Globe2, type LucideIcon } from 'lucide-react';
import { SuiLogo, WalrusLogo, MemWalLogo, SumsubLogo, StripeLogo, AirwallexLogo } from '@/components/BrandLogos';

const features: { title: string; desc: string; icon: LucideIcon; tag?: string; highlight?: boolean }[] = [
  {
    title: 'Hot-Potato Settlement',
    desc: 'PaymentIntent has no store, drop, or key ability. It must be consumed in the same PTB or the transaction aborts. Funds physically cannot get stuck — a primitive only Sui can offer.',
    icon: Flame,
    tag: 'Sui-only',
    highlight: true,
  },
  {
    title: '400ms Finality',
    desc: 'Sub-second on-chain finality on Sui Layer-1. No gas fees. No block congestion. Every settlement is final and verifiable on-chain.',
    icon: Zap,
  },
  {
    title: 'Walrus Audit Trail',
    desc: 'Invoices are Seal-encrypted and stored on Walrus permanently. Daily Merkle roots are anchored on Sui as frozen AuditAnchor objects — tamper-evident for regulators.',
    icon: Lock,
  },
  {
    title: 'AI Treasury Copilot',
    desc: 'MemWal stores your behavioral patterns across sessions. Claude API generates rate alerts, batch suggestions, and invoice-driven forecasts — AI proposes, you sign.',
    icon: Brain,
  },
  {
    title: 'Smart Treasury 4.8% APY',
    desc: 'Idle USD earns yield in USDsui via Sui DeFi. Your balance, accrued yield, and withdrawal history are tracked on-chain per user in SmartTreasury objects.',
    icon: TrendingUp,
  },
  {
    title: '8 Live Corridors',
    desc: 'USD → PHP, MYR, IDR, VND, THB, SGD, EUR, GBP. One platform, one fee structure, one API. Every corridor is designed from Day 1 to scale to 200+ countries.',
    icon: Globe2,
  },
];

const metrics = [
  { value: '400ms', label: 'settlement finality' },
  { value: '0.80%', label: 'starting fee, all corridors' },
  { value: '4.8%', label: 'APY on idle USD' },
];

export default function BentoGrid() {
  return (
    <section id="features" className="relative overflow-hidden bg-white/45 py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-28"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A8895]">
              <Zap className="h-3.5 w-3.5" />
              Phase 1 · Infrastructure
            </div>
            <h2 className="max-w-lg text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
              Six primitives no competitor has together.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#326273]/75">
              Hot-potato atomicity. Walrus audit anchoring. MemWal AI memory. Smart treasury yield. Global corridors. All in one USD-first platform on Sui.
            </p>
            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4 shadow-sm">
                  <div className="font-mono text-2xl font-semibold text-[#C97A56]">{metric.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6E8A95]">{metric.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ title, desc, icon: Icon, tag, highlight }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
                className={`group relative rounded-3xl border p-6 shadow-lg shadow-[#326273]/5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl ${
                  highlight
                    ? 'border-[#E39774]/40 bg-gradient-to-b from-[#E39774]/8 to-white/90 ring-1 ring-[#E39774]/20'
                    : 'border-[#326273]/10 bg-white/75 hover:border-[#5C9EAD]/30'
                }`}
              >
                {tag && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#E39774]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C97A56]">
                    {tag}
                  </span>
                )}
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-colors ${
                    highlight
                      ? 'bg-[#E39774] text-white group-hover:bg-[#C97A56]'
                      : 'bg-[#326273] text-[#F6F0ED] group-hover:bg-[#5C9EAD]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1F4452]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#326273]/70">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-3xl border border-[#326273]/10 bg-[#1F4452] p-7 text-[#F6F0ED] shadow-2xl shadow-[#326273]/15"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#E39774]">
                <Zap className="h-3.5 w-3.5" />
                Technology stack
              </div>
              <p className="mt-4 max-w-lg text-lg leading-8 text-white/80">
                Powered by Sui, Walrus, MemWal, Pyth, Stripe, Airwallex, and Sumsub — built as an infrastructure layer, not a consumer app.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { Logo: SuiLogo, name: 'Sui' },
                { Logo: WalrusLogo, name: 'Walrus' },
                { Logo: MemWalLogo, name: 'MemWal' },
                { Logo: SumsubLogo, name: 'Sumsub' },
                { Logo: StripeLogo, name: 'Stripe' },
                { Logo: AirwallexLogo, name: 'Airwallex' },
              ].map(({ Logo, name }) => (
                <div key={name} className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all hover:bg-white/10">
                  <Logo size={28} />
                  <span className="text-xs font-semibold text-white/80">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
