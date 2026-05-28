'use client';

import { motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';

const seaCorridors = [
  { flag: '🇵🇭', currency: 'PHP', name: 'Philippines', rate: '56.42', status: 'active', volume: '$4.2M' },
  { flag: '🇲🇾', currency: 'MYR', name: 'Malaysia', rate: '4.71', status: 'active', volume: '$1.8M' },
  { flag: '🇮🇩', currency: 'IDR', name: 'Indonesia', rate: '16,284', status: 'active', volume: '$2.1M' },
  { flag: '🇻🇳', currency: 'VND', name: 'Vietnam', rate: '25,385', status: 'active', volume: '$0.9M' },
  { flag: '🇹🇭', currency: 'THB', name: 'Thailand', rate: '35.82', status: 'active', volume: '$0.7M' },
  { flag: '🇸🇬', currency: 'SGD', name: 'Singapore', rate: '1.345', status: 'active', volume: '$0.4M' },
];

const globalCorridors = [
  { flag: '🇪🇺', currency: 'EUR', name: 'Eurozone', rate: '0.924', status: 'active', volume: '$0.3M' },
  { flag: '🇬🇧', currency: 'GBP', name: 'United Kingdom', rate: '0.789', status: 'active', volume: '$0.2M' },
  { flag: '🇮🇳', currency: 'INR', name: 'India', rate: '83.42', status: 'soon', volume: null },
  { flag: '🇦🇺', currency: 'AUD', name: 'Australia', rate: '1.54', status: 'soon', volume: null },
  { flag: '🇯🇵', currency: 'JPY', name: 'Japan', rate: '157.2', status: 'soon', volume: null },
  { flag: '🇧🇩', currency: 'BDT', name: 'Bangladesh', rate: '109.5', status: 'soon', volume: null },
];

function CorridorRow({
  flag, currency, name, rate, status, volume, index,
}: {
  flag: string; currency: string; name: string; rate: string;
  status: 'active' | 'soon'; volume: string | null; index: number;
}) {
  const isActive = status === 'active';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isActive
          ? 'border-[#326273]/10 bg-white/80'
          : 'border-[#326273]/5 bg-white/40 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{flag}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#1F4452]">USD → {currency}</span>
            {isActive && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500">
                <span className="inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
              </span>
            )}
          </div>
          <div className="text-xs text-[#6E8A95]">{name}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-[#326273]">{rate}</div>
          <div className="text-xs text-[#6E8A95]">{currency}/USD</div>
        </div>
        {isActive ? (
          <div className="hidden sm:block">
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {volume} / mo
            </span>
          </div>
        ) : (
          <span className="rounded-full border border-[#326273]/10 bg-[#F6F0ED] px-3 py-1 text-xs font-medium text-[#6E8A95]">
            Coming Soon
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function GlobalCorridorsSection() {
  return (
    <section id="corridors" className="relative overflow-hidden bg-white/45 py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <div className="mb-12 grid gap-12 lg:grid-cols-[1fr_2fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A8895]">
              <Globe2 className="h-3.5 w-3.5" />
              Global network
            </div>
            <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
              One platform. <br />Every corridor.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#326273]/75">
              USD is the universal sender currency. Recipients receive their local currency directly. Every corridor uses the same hot-potato settlement guarantee.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4">
                <div className="font-mono text-2xl font-semibold text-[#C97A56]">8</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6E8A95]">Active corridors</div>
              </div>
              <div className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4">
                <div className="font-mono text-2xl font-semibold text-[#C97A56]">200+</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6E8A95]">Phase 2 target</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4">
                <div className="font-mono text-2xl font-semibold text-[#C97A56]">$10.4M</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6E8A95]">Monthly cleared volume</div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6E8A95]">Southeast Asia</span>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">6 Active</span>
              </div>
              <div className="space-y-2">
                {seaCorridors.map((c, i) => (
                  <CorridorRow key={c.currency} {...c} status="active" index={i} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6E8A95]">Global</span>
                <span className="rounded-full bg-[#5C9EAD]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#4A8895]">2 Active · 4 Soon</span>
              </div>
              <div className="space-y-2">
                {globalCorridors.map((c, i) => (
                  <CorridorRow
                    key={c.currency}
                    {...c}
                    status={c.status as 'active' | 'soon'}
                    index={i + seaCorridors.length}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#5C9EAD]/20 bg-gradient-to-r from-[#5C9EAD]/10 to-transparent p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1F4452]">Architecture-first global design</h3>
              <p className="mt-1 max-w-xl text-sm text-[#326273]/70">
                Every corridor shares the same <code className="rounded bg-[#326273]/10 px-1 text-xs">PaymentIntent</code> hot-potato,
                the same Walrus audit anchoring, and the same 1% fee structure.
                Adding a new corridor is adding a new FX rate — not rebuilding the stack.
              </p>
            </div>
            <div className="shrink-0">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5C9EAD] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#5C9EAD]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A8895]"
              >
                Start sending →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
