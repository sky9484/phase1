'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Rocket, Zap, Globe2 } from 'lucide-react';

const phases = [
  {
    phase: 'Phase 0',
    status: 'live',
    statusLabel: 'Live',
    title: 'USD → SEA Payments',
    subtitle: 'The foundation — on-chain, compliant, atomic',
    icon: CheckCircle2,
    color: '#5C9EAD',
    features: [
      'USD → PHP, MYR, IDR, VND, THB, SGD',
      'Hot-potato PaymentIntent (Sui)',
      'On-chain immutable receipts',
      'KYB via Sumsub',
      'AML/KYT screening',
      '0.80% starting fee, live corridors',
    ],
  },
  {
    phase: 'Phase 1',
    status: 'current',
    statusLabel: 'Building now',
    title: 'AI + Yield + Global',
    subtitle: 'The hackathon milestone — the full Splash stack',
    icon: Rocket,
    color: '#E39774',
    features: [
      'AI Treasury Copilot (Claude + MemWal)',
      'Walrus invoice storage + audit anchoring',
      'Smart Treasury 4.8% APY on idle USD',
      'USD → EUR + GBP (Phase 1 global)',
      'Stripe + Airwallex deposit rails',
      'Global corridor architecture',
    ],
    highlight: true,
  },
  {
    phase: 'Phase 2',
    status: 'roadmap',
    statusLabel: 'Roadmap',
    title: '200+ Countries',
    subtitle: 'Full-scale global clearing',
    icon: Globe2,
    color: '#326273',
    features: [
      '200+ country corridors',
      'Labuan FSA license (live yield)',
      'B2B marketplace API',
      'Enterprise treasury integrations',
      'INR, AUD, JPY, and more',
      'Seed round deployment',
    ],
  },
];

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="relative overflow-hidden bg-white/45 py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#326273]/15 bg-[#326273]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#326273]">
            <Zap className="h-3.5 w-3.5" />
            Product roadmap
          </div>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
            A stablecoin-first roadmap, <br />
            <span className="text-[#5C9EAD]">purpose-built on Sui.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-[#326273]/75">
            Zero gas fees. Persistent AI via MemWal. 4.8% yield on idle USD. Hot-potato atomicity that no other chain can offer.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {phases.map(({ phase, status, statusLabel, title, subtitle, icon: Icon, color, features, highlight }, i) => (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-3xl border p-7 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
                highlight
                  ? 'border-[#E39774]/40 bg-gradient-to-b from-[#E39774]/5 to-white/90 ring-2 ring-[#E39774]/20'
                  : status === 'live'
                  ? 'border-[#5C9EAD]/20 bg-white/80'
                  : 'border-[#326273]/10 bg-white/60'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#E39774] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E39774]/30">
                  Sui Overflow Hackathon 2026
                </div>
              )}

              <div className="mb-5 flex items-center justify-between">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl shadow"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    status === 'live'
                      ? 'bg-green-50 text-green-700'
                      : status === 'current'
                      ? 'bg-[#E39774]/15 text-[#C97A56]'
                      : 'border border-[#326273]/15 bg-[#F6F0ED] text-[#6E8A95]'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mb-1 font-mono text-xs font-bold uppercase tracking-widest" style={{ color }}>
                {phase}
              </div>
              <h3 className="text-xl font-bold text-[#1F4452]">{title}</h3>
              <p className="mb-5 mt-1 text-xs text-[#6E8A95]">{subtitle}</p>

              <ul className="flex-1 space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <span className="text-sm text-[#326273]/80">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid gap-4 rounded-3xl border border-[#1F4452]/10 bg-[#1F4452] p-8 text-[#F6F0ED] md:grid-cols-3"
        >
          <div className="md:col-span-2">
            <div className="mb-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#E39774]">
              Raising seed
            </div>
            <h3 className="text-2xl font-bold text-white">
              We're deploying capital from Seed to Phase 2.
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Phase 1 is live on testnet. Phase 0 corridors are clearing real volume. Talk to us about the seed round.
            </p>
          </div>
          <div className="flex flex-col items-end justify-center gap-3">
            <a
              href="mailto:invest@splashz.xyz"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E39774] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39774]/30 transition-all hover:-translate-y-0.5 hover:bg-[#C97A56]"
            >
              Investor deck →
            </a>
            <a
              href="mailto:hello@splashz.xyz"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-white/15"
            >
              Get in touch
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
