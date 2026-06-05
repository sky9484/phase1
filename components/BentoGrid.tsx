'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Database,
  Landmark,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  AirwallexLogo,
  MemWalLogo,
  PythLogo,
  StripeLogo,
  SuiLogo,
  SumsubLogo,
  WalrusLogo,
} from '@/components/BrandLogos';
import AmbientBackground from '@/components/AmbientBackground';

type StackLayer = {
  id: string;
  number: string;
  title: string;
  label: string;
  summary: string;
  proof: string;
  icon: LucideIcon;
  partners: string[];
  stats: { label: string; value: string }[];
};

const stackLayers: StackLayer[] = [
  {
    id: 'request',
    number: '01',
    title: 'Payment request',
    label: 'Amount, corridor, recipient',
    summary:
      'Finance teams start with familiar payment inputs: who to pay, which corridor to use, how much to send, and what the recipient receives.',
    proof: 'The user experience stays close to a banking dashboard. The settlement engine handles atomic execution behind the scenes.',
    icon: Zap,
    partners: ['Sui'],
    stats: [
      { label: 'settlement', value: '400ms' },
      { label: 'fee floor', value: '0.80%' },
    ],
  },
  {
    id: 'risk',
    number: '02',
    title: 'Risk checks',
    label: 'KYB, limits, peg health',
    summary:
      'Before a payout moves, Splash checks business verification, corridor limits, treasury state, and stablecoin peg conditions.',
    proof: 'This is the language Web2 buyers expect: approval, controls, limits, and exception handling.',
    icon: ShieldCheck,
    partners: ['Sumsub', 'Pyth'],
    stats: [
      { label: 'peg guard', value: '30bps' },
      { label: 'freshness', value: '60s' },
    ],
  },
  {
    id: 'treasury',
    number: '03',
    title: 'Treasury routing',
    label: 'USD liquidity and stablecoin rails',
    summary:
      'Idle USD, payout liquidity, and stablecoin inventory are separated so operations can scale without mixing customer actions with treasury controls.',
    proof: 'Treasury is presented as cash management, not token management.',
    icon: Landmark,
    partners: ['Sui', 'Airwallex'],
    stats: [
      { label: 'treasury APY', value: '4.8%' },
      { label: 'USDT hold', value: '30m' },
    ],
  },
  {
    id: 'audit',
    number: '04',
    title: 'Audit record',
    label: 'Receipts, invoices, retention',
    summary:
      'Every payment can connect to a receipt, invoice record, and tamper-evident storage trail for finance, compliance, and audit teams.',
    proof: 'The value is simple: faster reconciliation and cleaner evidence when a buyer, auditor, or regulator asks for proof.',
    icon: Database,
    partners: ['Walrus', 'Sui'],
    stats: [
      { label: 'retention', value: '7 yrs' },
      { label: 'anchors', value: 'daily' },
    ],
  },
  {
    id: 'operator',
    number: '05',
    title: 'Operator support',
    label: 'AI suggestions, human approval',
    summary:
      'The copilot helps operators spot corridor timing, invoice context, and payment patterns, while final approval stays with the business user.',
    proof: 'AI proposes. Operators approve. That is the right control model for institutional users.',
    icon: Brain,
    partners: ['MemWal'],
    stats: [
      { label: 'AI mode', value: 'advise' },
      { label: 'approval', value: 'human' },
    ],
  },
  {
    id: 'rails',
    number: '06',
    title: 'Funding and payout rails',
    label: 'Card, bank, wallet, local payout',
    summary:
      'Funding and off-ramp partners connect the product to payment methods businesses already understand.',
    proof: 'The product should feel like a modern finance desk, not a wallet tutorial.',
    icon: Network,
    partners: ['Stripe', 'Airwallex'],
    stats: [
      { label: 'phase 1', value: '8 corridors' },
      { label: 'interface', value: 'Web2' },
    ],
  },
];

const stackPartners = [
  { Logo: SuiLogo, name: 'Sui', role: 'settlement' },
  { Logo: WalrusLogo, name: 'Walrus', role: 'audit storage' },
  { Logo: MemWalLogo, name: 'MemWal', role: 'operator memory' },
  { Logo: PythLogo, name: 'Pyth', role: 'peg data' },
  { Logo: StripeLogo, name: 'Stripe', role: 'USD funding' },
  { Logo: AirwallexLogo, name: 'Airwallex', role: 'payment rails' },
  { Logo: SumsubLogo, name: 'Sumsub', role: 'KYB review' },
];

const operatingSteps = [
  'Create payment',
  'Check business risk',
  'Route treasury',
  'Approve payout',
  'Archive proof',
];

export default function BentoGrid() {
  const [activeId, setActiveId] = useState(stackLayers[0].id);
  const activeLayer = useMemo(
    () => stackLayers.find((layer) => layer.id === activeId) ?? stackLayers[0],
    [activeId]
  );
  const ActiveIcon = activeLayer.icon;

  return (
    <section id="features" className="relative overflow-hidden bg-white/45 py-16 text-[#326273]">
      <AmbientBackground variant="gold" grid />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="max-w-xl lg:sticky lg:top-28">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5C9EAD]">
              <Layers3 className="h-3.5 w-3.5" />
              Phase 1 stack
            </div>
            <h2 className="max-w-lg text-4xl font-extrabold text-[#1F4452] md:text-5xl">
              The payment desk Web2 businesses can understand.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#326273]/75">
              Phase 1 should not read like a protocol diagram. It should show a clean operating path: request, risk checks, treasury routing, approval, and audit proof.
            </p>

            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {[
                { value: '8', label: 'corridors' },
                { value: '0.80%', label: 'fee floor' },
                { value: '7 yrs', label: 'audit retention' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4 shadow-sm">
                  <div className="font-mono text-2xl font-semibold text-[#C97A56]">{metric.value}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#326273]/55">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#5C9EAD] px-4 text-sm font-semibold text-white shadow-lg shadow-[#5C9EAD]/25 transition hover:-translate-y-0.5 hover:bg-[#326273]"
              >
                Open payment desk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#roadmap"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#326273]/15 bg-white/70 px-4 text-sm font-semibold text-[#1F4452] transition hover:border-[#5C9EAD]/30 hover:bg-white"
              >
                View rollout
                <BadgeCheck className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-[#326273]/10 bg-white/80 shadow-2xl shadow-[#326273]/10 backdrop-blur">
            <div className="flex items-center justify-between border-b border-[#326273]/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5C9EAD]/12 text-[#5C9EAD]">
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#326273]/45">Selected layer</div>
                  <div className="text-sm font-bold text-[#1F4452]">{activeLayer.title}</div>
                </div>
              </div>
              <div className="rounded-full border border-[#E39774]/30 bg-[#E39774]/12 px-3 py-1 font-mono text-xs font-bold text-[#C97A56]">
                {activeLayer.number}
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-[#326273]/10 p-3 lg:border-b-0 lg:border-r">
                <div className="grid gap-2">
                  {stackLayers.map((layer) => {
                    const Icon = layer.icon;
                    const isActive = layer.id === activeId;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActiveId(layer.id)}
                        className={`group grid min-h-[82px] grid-cols-[42px_1fr] items-start gap-3 rounded-2xl border p-3 text-left transition ${
                          isActive
                            ? 'border-[#E39774]/35 bg-[#E39774]/10 text-[#1F4452] shadow-lg shadow-[#E39774]/10'
                            : 'border-[#326273]/10 bg-[#F6F0ED]/65 text-[#326273] hover:border-[#5C9EAD]/30 hover:bg-white'
                        }`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-[11px] font-bold ${
                          isActive ? 'bg-[#E39774] text-white' : 'bg-[#326273] text-[#F6F0ED]'
                        }`}>
                          {layer.number}
                        </span>
                        <span>
                          <span className="flex items-center gap-2 text-sm font-bold">
                            <Icon className={isActive ? 'h-4 w-4 text-[#C97A56]' : 'h-4 w-4 text-[#5C9EAD]'} />
                            {layer.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#326273]/65">{layer.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5">
                <div className="min-h-[318px] rounded-3xl border border-[#326273]/10 bg-[#F6F0ED]/70 p-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
                        {activeLayer.label}
                      </div>
                      <h3 className="mt-2 text-2xl font-extrabold text-[#1F4452]">{activeLayer.title}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5C9EAD]/12 text-[#5C9EAD]">
                      <ActiveIcon className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-[#326273]/75">{activeLayer.summary}</p>
                  <div className="mt-5 rounded-2xl border border-[#5C9EAD]/18 bg-white/65 p-4 text-sm leading-6 text-[#1F4452]">
                    {activeLayer.proof}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {activeLayer.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-[#326273]/10 bg-white/70 p-3">
                        <div className="font-mono text-xl font-semibold text-[#C97A56]">{stat.value}</div>
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#326273]/55">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {activeLayer.partners.map((partner) => (
                      <span key={partner} className="rounded-full border border-[#326273]/10 bg-white/70 px-2.5 py-1 text-xs font-semibold text-[#326273]/70">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-10 rounded-3xl border border-[#326273]/10 bg-white/85 p-6 shadow-xl shadow-[#326273]/10 backdrop-blur sm:p-8"
        >
          {/* Operating flow — top, centered */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              <LockKeyhole className="h-3.5 w-3.5" />
              Operating flow
            </div>
            <h3 className="mt-1 text-xl font-extrabold text-[#1F4452] md:text-2xl">One governed path from request to proof</h3>
          </div>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 md:grid-cols-5">
            {operatingSteps.map((step, index) => (
              <div key={step} className="relative rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/70 p-3 transition hover:border-[#5C9EAD]/30 hover:bg-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5C9EAD]/12 font-mono text-[11px] font-bold text-[#5C9EAD]">0{index + 1}</div>
                <div className="mt-3 min-h-[44px] text-sm font-semibold leading-5 text-[#1F4452]">{step}</div>
                {index < operatingSteps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-[#5C9EAD]/35 md:block" />
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />

          {/* Integrated with — bottom, centered */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#326273]/50">
              <Network className="h-3.5 w-3.5 text-[#5C9EAD]" />
              Integrated with
            </div>
            <h3 className="mt-1 text-xl font-extrabold text-[#1F4452] md:text-2xl">Phase 1 partners</h3>
          </div>
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
            {stackPartners.map(({ Logo, name, role }) => (
              <div key={name} className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/65 p-3 transition hover:border-[#5C9EAD]/30 hover:bg-white">
                <div className="flex items-center gap-2">
                  <Logo size={22} className="shrink-0" />
                  <span className="text-sm font-bold text-[#1F4452]">{name}</span>
                </div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#326273]/55">{role}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
