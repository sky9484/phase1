'use client';

import { motion } from 'framer-motion';
import { CreditCard, Flame, ArrowRight, Database, CheckCircle2, Brain } from 'lucide-react';
import AmbientBackground from '@/components/AmbientBackground';

const steps = [
  {
    step: '01',
    icon: CreditCard,
    title: 'Deposit USD',
    subtitle: 'Stripe · Airwallex · Wire',
    desc: 'Fund your Splash treasury in USD via Stripe card, Stripe ACH, or Airwallex wire. Funds appear as USDsui on Sui immediately.',
    color: '#5C9EAD',
    tag: 'Stripe / Airwallex',
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI Copilot Advises',
    subtitle: 'MemWal · Claude API',
    desc: 'Treasury Copilot checks live FX rates, your pending invoices from Walrus, and your behavioral patterns to suggest optimal timing.',
    color: '#2B3A67',
    tag: 'MemWal patterns',
  },
  {
    step: '03',
    icon: Flame,
    title: 'Hot-Potato Settlement',
    subtitle: 'Sui PTB · PaymentIntent',
    desc: 'A hot-potato PaymentIntent is created with NO store/drop/key ability. It MUST be consumed — settled to recipient or refunded — in the same PTB. Funds cannot get stuck.',
    color: '#E39774',
    tag: 'Only on Sui',
    highlight: true,
  },
  {
    step: '04',
    icon: Database,
    title: 'Walrus Audit Anchor',
    subtitle: 'Walrus · AuditAnchor on Sui',
    desc: 'The immutable PaymentReceipt is frozen on Sui. Daily Merkle trees of all events are Seal-encrypted and stored on Walrus, anchored on-chain as AuditAnchor objects.',
    color: '#0284C7',
    tag: 'Tamper-evident',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden splash-page-bg py-16">
      <AmbientBackground variant="teal" grid />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E39774]/25 bg-[#E39774]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
            <Flame className="h-3.5 w-3.5" />
            Phase 1 · How it works
          </div>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
            USD in. Local currency out. <br />
            <span className="text-[#5C9EAD]">Guaranteed.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#326273]/75">
            Every Splash payment flows through a four-step process backed by Sui&apos;s hot-potato object model. Funds move atomically — no partial fills, no stuck capital, no manual reconciliation.
          </p>
        </motion.div>

        <div className="relative grid gap-6 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-[#326273]/10 to-transparent lg:block" />

          {steps.map(({ step, icon: Icon, title, subtitle, desc, color, tag, highlight }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-3xl border p-6 shadow-lg backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl ${
                highlight
                  ? 'border-[#E39774]/40 bg-gradient-to-b from-[#E39774]/10 to-white/80 ring-1 ring-[#E39774]/20'
                  : 'border-[#326273]/10 bg-white/75'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#E39774] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E39774]/30">
                  Sui-only primitive
                </div>
              )}
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#326273]/30">{step}</span>
                <span className="rounded-full border border-[#326273]/10 bg-[#F6F0ED] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                  {tag}
                </span>
              </div>

              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-bold text-[#1F4452]">{title}</h3>
              <div className="mb-2 text-xs font-semibold text-[#6E8A95]">{subtitle}</div>
              <p className="text-sm leading-6 text-[#326273]/70">{desc}</p>

              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-14 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-white shadow-md lg:flex">
                  <ArrowRight className="h-3.5 w-3.5 text-[#326273]/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#173742] to-[#0e2731] p-6 text-[#F6F0ED] shadow-2xl shadow-[#0e2731]/40 ring-1 ring-white/5"
        >
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr_0.95fr]">
            {/* Code block — editor window */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b2027] shadow-lg">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-[11px] text-white/55">payment_intent.move</span>
                <span className="ml-auto rounded-full bg-[#E39774]/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#E39774]">Move</span>
              </div>
              <div className="p-4 font-mono text-xs leading-5 text-green-300">
                <span className="text-[#6E8A95]">{'/// HOT POTATO — no store, no drop, no key'}</span><br />
                <span className="text-[#5C9EAD]">public struct</span> <span className="text-white">PaymentIntent</span>
                <span className="text-[#6E8A95]">{'<phantom T>'}</span> {'{'}<br />
                {'    '}<span className="text-[#E39774]">coin</span>: <span className="text-[#5C9EAD]">Coin</span>
                <span className="text-[#6E8A95]">{'<T>'}</span>,<br />
                {'    '}<span className="text-[#E39774]">amount_usd</span>: <span className="text-[#5C9EAD]">u64</span>,<br />
                {'    '}<span className="text-[#E39774]">corridor</span>: <span className="text-[#5C9EAD]">vector</span>
                <span className="text-[#6E8A95]">{'<u8>'}</span>, <span className="text-[#6E8A95]">{'// "USD-PHP"'}</span><br />
                {'    '}<span className="text-[#E39774]">local_currency</span>: <span className="text-[#5C9EAD]">vector</span>
                <span className="text-[#6E8A95]">{'<u8>'}</span>,<br />
                {'}'} <span className="text-[#6E8A95]">{'// ← no `has store, drop, key` = physically cannot get stuck'}</span>
              </div>
            </div>

            {/* Flow diagram */}
            <div>
              <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#5C9EAD]">
                Atomic flow · single PTB
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="space-y-2.5 text-xs">
                  {[
                    { step: '1', label: 'Mint PaymentIntent', sub: 'USD locked, hot-potato active' },
                    { step: '2', label: 'Quote + KYB check', sub: 'AML screen · corridor policy' },
                    { step: '3', label: 'Settle to recipient', sub: 'Local currency delivered' },
                    { step: '4', label: 'Freeze PaymentReceipt', sub: 'Immutable on Sui · Walrus anchor' },
                  ].map((item, idx) => (
                    <div key={item.step} className="relative flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5C9EAD]/20 font-mono text-[10px] font-bold text-[#5C9EAD]">
                          {item.step}
                        </span>
                        {idx < 3 && <span className="mt-1 h-4 w-px bg-[#5C9EAD]/25" />}
                      </div>
                      <div className="pb-1">
                        <div className="font-semibold text-white">{item.label}</div>
                        <div className="text-[10px] text-white/55">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div>
              <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#E39774]">
                Guarantees
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Settle or revert', sub: 'Hot-potato enforces consumption' },
                  { label: 'No stuck funds', sub: 'Physically cannot persist' },
                  { label: 'Immutable receipt', sub: 'Frozen on-chain proof' },
                  { label: 'Walrus audit anchor', sub: 'Tamper-evident Merkle tree' },
                ].map(({ label, sub }) => (
                  <div key={label} className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">{label}</div>
                      <div className="text-[10px] text-white/55">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
