'use client';

import { motion } from 'framer-motion';
import { Building2, Globe2, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';

const partners: { name: string; desc: string; icon: LucideIcon }[] = [
  { name: 'HATA', desc: 'Licensed Digital Asset Exchange', icon: Building2 },
  { name: 'Coins.ph', desc: '18M+ Users in Philippines', icon: Globe2 },
  { name: 'Sui Foundation', desc: '400ms Settlement Layer', icon: Zap },
  { name: 'Bank Negara', desc: 'MSB Framework Pending', icon: ShieldCheck },
];

export default function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y border-[#326273]/5 bg-white/40 py-10">
      <div className="flex overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="flex min-w-max gap-20 px-8 md:gap-32"
        >
          {[...partners, ...partners].map(({ name, desc, icon: Icon }, index) => (
            <div
              key={`${name}-${index}`}
              className="flex cursor-pointer items-center gap-4 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            >
              <Icon className="h-8 w-8 text-[#5C9EAD]" />
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-xl font-bold text-[#326273]">{name}</span>
                <span className="text-xs text-[#E39774]">{desc}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
