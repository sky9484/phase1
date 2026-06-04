'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CheckCircle2, Globe2, Rocket, ShieldCheck, Zap } from 'lucide-react';
import AmbientBackground from '@/components/AmbientBackground';

const phases = [
  {
    phase: 'Phase 0',
    status: 'live',
    statusLabel: 'Live foundation',
    title: 'SEA payout engine',
    subtitle: 'The rails and control plane that prove the core motion works.',
    icon: CheckCircle2,
    color: '#5C9EAD',
    proof: ['6 SEA corridors', 'KYB workflow', 'On-chain settlement receipts', '0.80% fee floor'],
    outcome: 'A business can fund USD and clear local-currency payouts through a governed console.',
  },
  {
    phase: 'Phase 1',
    status: 'current',
    statusLabel: 'Current build',
    title: 'Institutional protocol stack',
    subtitle: 'The Sui Overflow milestone: settlement, risk, treasury, audit, and AI in one path.',
    icon: Rocket,
    color: '#D9A441',
    proof: ['Hot-potato PaymentIntent', 'Peg freshness guard', 'Walrus audit anchoring', 'MemWal treasury copilot', 'USDC yield / USDT TTL'],
    outcome: 'Splash stops looking like a payment app and starts behaving like settlement infrastructure.',
    highlight: true,
  },
  {
    phase: 'Phase 2',
    status: 'roadmap',
    statusLabel: 'Post-seed',
    title: 'Global treasury network',
    subtitle: 'Scale corridors, licensing, and enterprise integration after the protocol base is solid.',
    icon: Globe2,
    color: '#E39774',
    proof: ['200+ country target', 'Labuan FSA path', 'Enterprise APIs', 'INR / AUD / JPY expansion'],
    outcome: 'A global operating layer for business settlement, treasury inventory, and audit exports.',
  },
];

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="relative overflow-hidden bg-[#F7FAFB] py-18">
      <AmbientBackground variant="gold" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#326273]/15 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#326273]">
              <Zap className="h-3.5 w-3.5" />
              Product roadmap
            </div>
            <h2 className="max-w-xl text-4xl font-black leading-tight text-[#1F4452] md:text-5xl">
              Phase 1 is the credibility layer.
            </h2>
          </div>
          <p className="max-w-2xl self-end text-base leading-7 text-[#326273]/75">
            The weak version of this product is a dashboard with DeFi words sprinkled on top. The strong version is a protocol-grade operating path where settlement, risk, treasury, storage, and AI each have a clear job.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {phases.map(({ phase, status, statusLabel, title, subtitle, icon: Icon, color, proof, outcome, highlight }, index) => (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className={`relative flex min-h-[430px] flex-col rounded-lg border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                highlight ? 'border-[#5C9EAD]/50 bg-[#1F4452] text-white shadow-[#5C9EAD]/10' : 'border-[#326273]/12 bg-white text-[#326273]'
              }`}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-md border ${highlight ? 'border-[#5C9EAD]/30 bg-[#5C9EAD]/12' : 'border-[#326273]/10 bg-[#F6F0ED]'}`}
                  style={{ color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    status === 'live'
                      ? 'bg-green-50 text-green-700'
                      : status === 'current'
                      ? 'bg-[#5C9EAD]/14 text-[#A9D4DC]'
                      : 'border border-[#326273]/12 bg-[#F6F0ED] text-[#6E8A95]'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="font-mono text-xs font-bold uppercase tracking-[0.16em]" style={{ color }}>
                {phase}
              </div>
              <h3 className={`mt-2 text-2xl font-black ${highlight ? 'text-white' : 'text-[#1F4452]'}`}>{title}</h3>
              <p className={`mt-2 text-sm leading-6 ${highlight ? 'text-white/60' : 'text-[#326273]/70'}`}>{subtitle}</p>

              <div className="my-6 h-px w-full bg-current opacity-10" />

              <ul className="space-y-2.5">
                {proof.map((item) => (
                  <li key={item} className={`flex items-start gap-2.5 text-sm ${highlight ? 'text-white/80' : 'text-[#326273]/80'}`}>
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className={`mt-auto rounded-md border p-4 text-sm leading-6 ${highlight ? 'border-[#5C9EAD]/25 bg-[#5C9EAD]/10 text-[#DCEFF2]' : 'border-[#326273]/10 bg-[#F6F0ED] text-[#326273]/80'}`}>
                {outcome}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.55 }}
          className="mt-8 grid gap-5 rounded-lg border border-[#1F4452]/10 bg-[#1F4452] p-6 text-white md:grid-cols-[1fr_auto]"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#A9D4DC]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Investor clarity
            </div>
            <h3 className="text-2xl font-black">Seed capital funds Phase 2 only after Phase 1 proves the protocol.</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              That is the right sequencing: first make the contract and operating stack credible, then scale corridors and licenses.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <a
              href="mailto:invest@splashz.xyz"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#5C9EAD] px-4 text-sm font-bold text-[#1F4452] transition hover:-translate-y-0.5 hover:bg-[#A9D4DC]"
            >
              Investor deck
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:hello@splashz.xyz"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/[0.08] px-4 text-sm font-bold text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Talk to Splash
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
