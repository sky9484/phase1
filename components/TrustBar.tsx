'use client';

import { motion } from 'framer-motion';
import {
  SuiLogo, WalrusLogo, WiseLogo, StripeLogo,
  AirwallexLogo, SumsubLogo, MemWalLogo, PythLogo,
} from '@/components/BrandLogos';

const partners = [
  {
    Logo: SuiLogo,
    name: 'Sui',
    desc: '400ms settlement layer',
  },
  {
    Logo: WalrusLogo,
    name: 'Walrus',
    desc: 'Decentralized storage',
  },
  {
    Logo: StripeLogo,
    name: 'Stripe',
    desc: 'USD deposit rail',
  },
  {
    Logo: AirwallexLogo,
    name: 'Airwallex',
    desc: 'Wire + FPX off-ramp',
  },
  {
    Logo: WiseLogo,
    name: 'Wise',
    desc: 'FX benchmark',
  },
  {
    Logo: SumsubLogo,
    name: 'Sumsub',
    desc: 'KYB / KYC compliance',
  },
  {
    Logo: MemWalLogo,
    name: 'MemWal',
    desc: 'AI pattern memory',
  },
  {
    Logo: PythLogo,
    name: 'Pyth',
    desc: 'Real-time FX oracle',
  },
];

const trustStats = [
  { value: '$40M+', label: 'processed' },
  { value: '8', label: 'live corridors' },
  { value: '99.8%', label: 'settlement success' },
  { value: '400ms', label: 'avg settlement' },
];

export default function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y border-[#326273]/8 bg-white/50 py-10">
      {/* Numbers strip — social proof by metrics (Goodface hack #18) */}
      <div className="container mx-auto mb-8 px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-stretch justify-center divide-x divide-[#326273]/10">
          {trustStats.map((s) => (
            <div key={s.label} className="px-6 py-1 text-center sm:px-10">
              <div className="font-mono text-2xl font-extrabold tracking-tight text-[#1F4452] md:text-3xl">{s.value}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E8A95]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6E8A95]">
          Built on · integrated with
        </span>
      </div>
      <div className="relative flex overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
          className="flex min-w-max items-center gap-16 px-8"
        >
          {[...partners, ...partners].map(({ Logo, name, desc }, index) => (
            <div
              key={`${name}-${index}`}
              className="group flex cursor-default items-center gap-3 opacity-55 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <Logo size={36} className="shrink-0" />
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-base font-bold text-[#1F4452]">{name}</span>
                <span className="text-[11px] text-[#6E8A95]">{desc}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
