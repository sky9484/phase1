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

export default function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y border-[#326273]/8 bg-white/50 py-8">
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
