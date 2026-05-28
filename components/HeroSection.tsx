'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'Network', href: '#network' },
  { label: 'Platform', href: '#features' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#customers' },
];

const initialCorridors = [
  { from: 'USD', to: 'PHP', speed: 398, volume: 4.21 },
  { from: 'USD', to: 'IDR', speed: 421, volume: 1.82 },
  { from: 'USD', to: 'SGD', speed: 374, volume: 0.94 },
  { from: 'USD', to: 'THB', speed: 438, volume: 0.72 },
  { from: 'USD', to: 'VND', speed: 446, volume: 0.61 },
  { from: 'USD', to: 'EUR', speed: 405, volume: 0.28 },
];

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  const [liveCorridors, setLiveCorridors] = useState(initialCorridors);
  const [blockHeight, setBlockHeight] = useState(248019);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    const frame = window.requestAnimationFrame(handleScroll);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveCorridors((current) =>
        current.map((corridor) => ({
          ...corridor,
          speed: Math.max(320, Math.round(corridor.speed + (Math.random() - 0.45) * 20)),
          volume: Math.max(0.1, corridor.volume + Math.random() * 0.08),
        }))
      );
      setBlockHeight((height) => height + Math.ceil(Math.random() * 3));
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#F6F0ED] text-[#326273]">
      <style>{`
        @keyframes splashGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(227,151,116,0.55), 0 0 10px rgba(227,151,116,0.55); }
          50% { box-shadow: 0 0 0 8px rgba(227,151,116,0), 0 0 18px rgba(227,151,116,0.85); }
        }
        @keyframes splashFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes splashFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -80; }
        }
        @keyframes splashMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-[#326273]/10 bg-[#F6F0ED]/90 shadow-sm backdrop-blur-md' : 'border-b border-transparent bg-transparent'}`}>
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-8 px-6 py-3 lg:px-14">
          <Link href="/" className="flex items-center gap-2 text-2xl font-medium tracking-tight text-[#1F4452]">
            <Image src="/splash-logo.png" alt="Splash" width={56} height={56} className="h-11 w-11 rounded-xl object-contain" priority unoptimized />
            <span>Splash</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-[#326273] lg:flex">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className="inline-flex items-center gap-1 transition-colors hover:text-[#4A8895]">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#1F4452] px-4 py-2.5 text-sm font-medium text-[#F6F0ED] shadow-lg shadow-[#1F4452]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              Log in
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 6 L9 6 M6 3 L9 6 L6 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative flex flex-1 items-center overflow-hidden pb-12 pt-16 lg:min-h-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-y-0 right-0 h-full w-[1565px] max-w-[calc(100vw+520px)]">
            <Image
              src="/settlement-engine.png"
              alt=""
              fill
              sizes="1565px"
              className="object-scale-down object-right brightness-[1.08] contrast-[0.96] saturate-[1.04]"
              priority
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#F6F0ED_0%,rgba(246,240,237,0.96)_22%,rgba(246,240,237,0.78)_40%,rgba(246,240,237,0.18)_60%,rgba(246,240,237,0)_74%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,240,237,0)_68%,rgba(246,240,237,0.62)_90%,#F6F0ED_100%)]" />
          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
            <path className="animate-[splashFlow_8s_linear_infinite]" d="M 80 200 C 250 180, 380 280, 520 300" fill="none" stroke="#E39774" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
            <path className="animate-[splashFlow_9s_linear_infinite]" d="M 120 460 C 280 470, 420 440, 540 420" fill="none" stroke="#E39774" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
            <path className="animate-[splashFlow_10s_linear_infinite]" d="M 900 180 C 800 220, 720 260, 620 300" fill="none" stroke="#E39774" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx="80" cy="200" r="2.5" fill="#E39774" opacity="0.7" />
            <circle cx="120" cy="460" r="2.5" fill="#E39774" opacity="0.7" />
            <circle cx="900" cy="180" r="2.5" fill="#E39774" opacity="0.7" />
          </svg>

          <div className="absolute right-[6%] top-[25%] hidden animate-[splashFloat_5s_ease-in-out_infinite] rounded-xl border border-[#326273]/15 bg-white/80 px-3 py-2 text-xs text-[#1F4452] shadow-xl shadow-[#326273]/10 backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#5C9EAD] opacity-80" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E8A95]">Corridor USD → PHP</div>
                <div className="font-semibold">$ {liveCorridors[0].volume.toFixed(2)}M cleared</div>
              </div>
            </div>
          </div>
          <div className="absolute right-[4%] top-[45%] hidden animate-[splashFloat_5.8s_ease-in-out_infinite] rounded-xl border border-[#326273]/15 bg-white/80 px-3 py-2 text-xs text-[#1F4452] shadow-xl shadow-[#326273]/10 backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E39774] opacity-80" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E8A95]">FX Spread</div>
                <div className="font-semibold">0.18% <span className="text-[#C97A56]">↓ mid-market</span></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[25%] right-[15%] hidden animate-[splashFloat_6.2s_ease-in-out_infinite] rounded-xl border border-[#326273]/15 bg-white/80 px-3 py-2 text-xs text-[#1F4452] shadow-xl shadow-[#326273]/10 backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#326273] opacity-80" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E8A95]">Block #{blockHeight.toLocaleString()}</div>
                <div className="font-semibold">finalized <span className="text-[#C97A56]">· {liveCorridors[2].speed}ms</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-[720px] px-6 py-16 md:pl-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex w-full max-w-[680px] flex-col items-start"
          >
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#326273]/15 bg-white/70 px-2 py-1 text-xs font-medium text-[#326273] backdrop-blur">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E39774]/30 bg-[#E39774]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#C97A56]">
                <span className="h-1.5 w-1.5 animate-[splashGlow_1.6s_ease-in-out_infinite] rounded-full bg-[#E39774]" />
                Live
              </span>
              <span>New corridor · Manila</span>
              <span className="rounded-full border border-[#326273]/15 bg-[#F6F0ED] px-2 py-1 font-mono text-[11px]">USD → PHP</span>
            </div>

            <h1 className="mt-4 text-[42px] font-medium leading-[1.02] tracking-[-0.025em] text-[#1F4452] sm:text-[56px]">
              <span className="block whitespace-normal min-[520px]:whitespace-nowrap">The Settlement Engine</span>
              <span className="relative inline-block whitespace-normal italic text-[#5C9EAD] min-[520px]:whitespace-nowrap">
                for Global Business.
                <span aria-hidden="true" className="absolute bottom-[0.04em] left-0 h-[0.08em] w-full rounded-full bg-linear-to-r from-transparent via-[#5C9EAD]/45 to-transparent" />
              </span>
            </h1>

            <p className="mt-4 w-full max-w-[540px] text-[16px] leading-7 text-[#326273]">
              Splash is the institutional clearing layer for cross-border B2B payments — moving capital across <strong className="font-semibold text-[#1F4452]">global corridors</strong> with cryptographic finality, transparent FX, and bank-grade compliance built in. ASEAN Power House of Settlement Engine.
            </p>

            <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-[#326273]/10 bg-white/60 px-3 py-2 text-sm text-[#326273] shadow-lg shadow-[#326273]/5 backdrop-blur">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-[splashGlow_1.6s_ease-in-out_infinite] rounded-full bg-[#E39774] opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E39774]" />
              </span>
              <span className="font-mono font-semibold text-[#1F4452]"><span className="text-[#C97A56]">400ms</span></span>
              <span>settlement speed finality</span>
              <span className="hidden h-4 w-px bg-[#326273]/20 sm:block" />
              <span className="font-mono font-semibold text-[#1F4452]">99.997%</span>
              <span>corridor uptime</span>
            </div>

            <div className="mt-6 grid w-full max-w-[252px] grid-cols-1 gap-3">
              <Link
                href="/login"
                className="inline-flex h-[53px] w-full max-w-[252.359px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5C9EAD] px-6 text-base font-medium text-white shadow-lg shadow-[#5C9EAD]/35 transition-all hover:-translate-y-0.5 hover:bg-[#4A8895] sm:w-[252.359px]"
              >
                <span>Log in to Splash</span>
                <svg className="h-4 w-4 shrink-0 transition-transform" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-[#6E8A95]">
              <span>Live on</span>
              <span className="h-px w-9 bg-linear-to-r from-[#326273]/40 to-transparent" />
              <div className="flex flex-wrap gap-5 normal-case tracking-tight text-[#326273]">
                {['Singapore', 'Jakarta', 'Bangkok', 'Manila'].map((city) => (
                  <span key={city} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#326273]/40" />
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-[90%] left-0 right-0 z-20 mx-auto w-full max-w-[1440px] px-6 lg:px-14">
        <div className="flex items-center gap-4 overflow-hidden rounded-2xl border border-[#326273]/10 bg-white/60 px-6 py-4 shadow-xl shadow-[#326273]/10 backdrop-blur">
          <div className="border-r border-[#326273]/15 pr-5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#6E8A95]">Live corridors</div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-[splashMarquee_28s_linear_infinite] items-center gap-8 whitespace-nowrap hover:paused">
              {[...liveCorridors, ...liveCorridors].map(({ from, to, speed, volume }, index) => (
                <span key={`${from}-${to}-${index}`} className="inline-flex items-center gap-2 font-mono text-xs text-[#326273]">
                  <span className="font-semibold text-[#1F4452]">{from}</span>
                  <span className="font-semibold text-[#C97A56]">→</span>
                  <span className="font-semibold text-[#1F4452]">{to}</span>
                  <span className="text-[#6E8A95]">{speed}ms</span>
                  <span className="rounded-full bg-[#5C9EAD]/10 px-2 py-0.5 text-[#5C9EAD]">${volume.toFixed(2)}M</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
