import Link from 'next/link';
import Image from 'next/image';
import { SuiLogo, WalrusLogo, MemWalLogo } from '@/components/BrandLogos';

const productLinks = [
  { label: 'Batch Payout', href: '/login' },
  { label: 'Cross-Border Transfer', href: '/login' },
  { label: 'Smart Treasury', href: '/login' },
  { label: 'AI Copilot', href: '/login' },
  { label: 'Global Corridors', href: '#corridors' },
];

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'Hackathon', href: '#roadmap' },
  { label: 'Contact', href: 'mailto:hello@splashz.xyz' },
];

const techLinks = [
  { label: 'Sui Explorer', href: '#' },
  { label: 'Walrus Storage', href: '#' },
  { label: 'MemWal Patterns', href: '#' },
  { label: 'Pyth Oracle', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#326273]/10 bg-[#1F4452] pt-16 pb-8 text-[#F6F0ED]/80">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <Image src="/splash-logo.png" alt="Splash" width={40} height={40} className="h-9 w-9 rounded-xl object-contain" unoptimized />
              <span className="text-2xl font-extrabold text-white">Splash<span className="text-[#5C9EAD]">.</span></span>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-6 text-[#F6F0ED]/60">
              The USD-first settlement engine for global B2B payments. Built on Sui with Walrus, MemWal, and Pyth for enterprise-grade cross-border infrastructure.
            </p>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E39774]/30 bg-[#E39774]/15 px-3 py-1.5 text-xs font-semibold text-[#E39774]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E39774]" />
              Sui Overflow Hackathon 2025 · DeFi & Payments
            </div>
            <div className="flex items-center gap-3">
              <SuiLogo size={28} />
              <WalrusLogo size={28} />
              <MemWalLogo size={28} />
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-[#F6F0ED]/70 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-[#F6F0ED]/70 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">Tech Stack</h4>
            <ul className="space-y-2.5">
              {techLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-[#F6F0ED]/70 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-[#F6F0ED]/40">
              © 2025 Splash Finance. All rights reserved. Splash operates under Bank Negara MSB framework application. Not a deposit-taking institution.
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#F6F0ED]/40">
              <span>splashz.xyz</span>
              <span>·</span>
              <a href="mailto:hello@splashz.xyz" className="hover:text-white/70">hello@splashz.xyz</a>
              <span>·</span>
              <a href="https://github.com/mega-ideas/latest-splash" className="hover:text-white/70" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
