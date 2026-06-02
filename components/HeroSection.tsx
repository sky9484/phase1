'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SuiLogo } from '@/components/BrandLogos';

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Corridors', href: '#corridors' },
  { label: 'Features', href: '#features' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'Roadmap', href: '#roadmap' },
];

const initialCorridors = [
  { from: 'USD', to: 'PHP', rate: '56.42', speed: 398, volume: 4.21 },
  { from: 'USD', to: 'IDR', rate: '16,284', speed: 421, volume: 1.82 },
  { from: 'USD', to: 'SGD', rate: '1.345', speed: 374, volume: 0.94 },
  { from: 'USD', to: 'MYR', rate: '4.71', speed: 438, volume: 0.72 },
  { from: 'USD', to: 'VND', rate: '25,385', speed: 446, volume: 0.61 },
  { from: 'USD', to: 'EUR', rate: '0.924', speed: 405, volume: 0.28 },
  { from: 'USD', to: 'GBP', rate: '0.789', speed: 412, volume: 0.19 },
  { from: 'USD', to: 'THB', rate: '35.82', speed: 390, volume: 0.48 },
];

const stackLogos = [
  { Logo: SuiLogo, label: 'Sui' },
];

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false);
  const [liveCorridors, setLiveCorridors] = useState(initialCorridors);
  const [blockHeight, setBlockHeight] = useState(248019);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
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
          volume: Math.max(0.1, corridor.volume + Math.random() * 0.06),
        }))
      );
      setBlockHeight((h) => h + Math.ceil(Math.random() * 3));
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

      {/* Nav */}
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-[#326273]/10 bg-[#F6F0ED]/92 shadow-sm backdrop-blur-md' : 'border-b border-transparent bg-transparent'}`}>
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-8 px-6 py-3 lg:px-14">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#1F4452]">
            <Image src="/splash-logo.png" alt="Splash" width={56} height={56} className="h-10 w-10 rounded-xl object-contain" priority unoptimized />
            <span>Splash</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-[#326273] lg:flex">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-[#4A8895]">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F4452] px-4 py-2.5 text-sm font-semibold text-[#F6F0ED] shadow-lg shadow-[#1F4452]/20 transition-all hover:-translate-y-0.5 hover:bg-[#326273] hover:shadow-xl"
            >
              Log in
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 6 L9 6 M6 3 L9 6 L6 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero body */}
      <div className="relative flex flex-1 items-center overflow-hidden pb-20 pt-16 lg:min-h-0">
        {/* Background */}
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
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#F6F0ED_0%,rgba(246,240,237,0.97)_25%,rgba(246,240,237,0.80)_42%,rgba(246,240,237,0.18)_62%,rgba(246,240,237,0)_76%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,240,237,0)_65%,rgba(246,240,237,0.65)_88%,#F6F0ED_100%)]" />

          <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
            <path className="animate-[splashFlow_8s_linear_infinite]" d="M 80 200 C 250 180, 380 280, 520 300" fill="none" stroke="#E39774" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
            <path className="animate-[splashFlow_9s_linear_infinite]" d="M 120 460 C 280 470, 420 440, 540 420" fill="none" stroke="#E39774" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
            <path className="animate-[splashFlow_10s_linear_infinite]" d="M 900 180 C 800 220, 720 260, 620 300" fill="none" stroke="#E39774" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
          </svg>

          {/* Floating badges */}
          <div className="absolute right-[7%] top-[22%] hidden animate-[splashFloat_5s_ease-in-out_infinite] rounded-xl border border-[#326273]/15 bg-white/85 px-2.5 py-1.5 shadow-xl shadow-[#326273]/10 backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#6E8A95]">USD → PHP · Live</div>
                <div className="text-xs font-bold text-[#1F4452]">${liveCorridors[0].volume.toFixed(2)}M cleared</div>
              </div>
            </div>
          </div>

          <div className="absolute right-[5%] top-[44%] hidden animate-[splashFloat_5.8s_ease-in-out_infinite] rounded-xl border border-[#E39774]/25 bg-white/85 px-2.5 py-1.5 shadow-xl shadow-[#326273]/10 backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E39774]" />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#6E8A95]">Hot-Potato PTB</div>
                <div className="text-xs font-bold text-[#1F4452]">Settle or revert <span className="text-[#C97A56]">· Sui only</span></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[28%] right-[14%] hidden animate-[splashFloat_6.2s_ease-in-out_infinite] rounded-xl border border-[#326273]/15 bg-white/85 px-2.5 py-1.5 shadow-xl shadow-[#326273]/10 backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7]" />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#6E8A95]">Block #{blockHeight.toLocaleString()}</div>
                <div className="text-xs font-bold text-[#1F4452]">finalized <span className="text-[#C97A56]">· {liveCorridors[0].speed}ms</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-20 w-full max-w-[760px] px-6 py-16 md:pl-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex w-full max-w-[700px] flex-col items-start"
          >
            {/* Live badge */}
            <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#E39774]/30 bg-white/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E39774]/40 bg-[#E39774]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C97A56]">
                <span className="h-1.5 w-1.5 animate-[splashGlow_1.6s_ease-in-out_infinite] rounded-full bg-[#E39774]" />
                Live
              </span>
              <span className="font-mono text-[#326273]">USD → MYR</span>
            </div>

            <h1 className="mt-3 text-[42px] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#1F4452] sm:text-[58px]">
              <span className="block">The USD-First</span>
              <span className="relative inline-block italic text-[#5C9EAD]">
                Settlement Engine.
                <span aria-hidden="true" className="absolute bottom-[0.04em] left-0 h-[0.07em] w-full rounded-full bg-gradient-to-r from-transparent via-[#5C9EAD]/40 to-transparent" />
              </span>
            </h1>

            <p className="mt-4 w-full max-w-[560px] text-[15px] leading-6 text-[#326273]">
              Splash moves USD to 8 local currencies in{' '}
              <strong className="font-semibold text-[#1F4452]">400ms</strong> with hot-potato atomicity —
              a settlement guarantee{' '}
              <strong className="font-semibold text-[#1F4452]">only Sui can offer</strong>. AI Copilot, Walrus audit trail, and 4.8% yield on idle USD included —{' '}
              <strong className="font-semibold text-[#1F4452]">regulated for serious Business</strong>.
            </p>

            {/* Live stats pill */}
            <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-[#326273]/10 bg-white/65 px-3.5 py-2.5 text-sm text-[#326273] shadow-lg shadow-[#326273]/5 backdrop-blur">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-[splashGlow_1.6s_ease-in-out_infinite] rounded-full bg-[#E39774] opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E39774]" />
              </span>
              <span className="font-mono font-bold text-[#C97A56]">400ms</span>
              <span>settlement · Sui</span>
              <span className="hidden h-4 w-px bg-[#326273]/20 sm:block" />
              <span className="font-mono font-bold text-[#1F4452]">0.80%</span>
              <span>low cost · all corridors</span>
              <span className="hidden h-4 w-px bg-[#326273]/20 sm:block" />
              <span className="font-mono font-bold text-[#1F4452]">4.8%</span>
              <span>APY on idle USD</span>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-[50px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5C9EAD] px-7 text-base font-semibold text-white shadow-lg shadow-[#5C9EAD]/35 transition-all hover:-translate-y-0.5 hover:bg-[#4A8895]"
              >
                Start sending USD →
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-[50px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#326273]/15 bg-white/70 px-6 text-base font-medium text-[#1F4452] backdrop-blur transition-all hover:border-[#5C9EAD]/30 hover:bg-white/90"
              >
                See how it works
              </a>
            </div>

            {/* Tech stack */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6E8A95]">Built on</span>
              <span className="h-px w-8 bg-gradient-to-r from-[#326273]/40 to-transparent" />
              <div className="flex items-center gap-3">
                {stackLogos.map(({ Logo, label }) => (
                  <div key={label} className="flex items-center gap-1.5" title={label}>
                    <Logo size={24} />
                    <span className="text-xs font-medium text-[#326273]/70">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Live corridors ticker */}
      <div className="absolute top-[85%] left-0 right-0 z-20 mx-auto w-full max-w-[1440px] px-6 lg:px-14">
        <div className="flex items-center gap-4 overflow-hidden rounded-2xl border border-[#326273]/10 bg-white/65 px-5 py-3.5 shadow-xl shadow-[#326273]/10 backdrop-blur">
          <div className="shrink-0 border-r border-[#326273]/15 pr-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6E8A95]">
            Live rates
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-[splashMarquee_32s_linear_infinite] items-center gap-10 whitespace-nowrap hover:paused">
              {[...liveCorridors, ...liveCorridors].map(({ from, to, rate, speed }, index) => (
                <span key={`${from}-${to}-${index}`} className="inline-flex items-center gap-2 font-mono text-xs text-[#326273]">
                  <span className="font-bold text-[#1F4452]">{from}</span>
                  <span className="font-bold text-[#C97A56]">→</span>
                  <span className="font-bold text-[#1F4452]">{to}</span>
                  <span className="text-[#326273]/60">{rate}</span>
                  <span className="rounded-full bg-[#5C9EAD]/12 px-2 py-0.5 text-[#5C9EAD]">{speed}ms</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
