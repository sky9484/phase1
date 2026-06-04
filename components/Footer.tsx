import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { SuiLogo, WalrusLogo, MemWalLogo } from '@/components/BrandLogos';

const productLinks = [
  { label: 'Cross-border payouts', href: '/login' },
  { label: 'Batch payment desk', href: '/login' },
  { label: 'Treasury account', href: '/login' },
  { label: 'Invoice archive', href: '#walrus' },
  { label: 'AI payment copilot', href: '/login' },
];

const useCaseLinks = [
  { label: 'Payroll and contractor payouts', href: '#how-it-works' },
  { label: 'Vendor payments', href: '#corridors' },
  { label: 'USD treasury operations', href: '#features' },
  { label: 'Audit-ready payment records', href: '#compliance' },
];

const trustLinks = [
  { label: 'KYB and AML workflow', href: '#compliance' },
  { label: 'Settlement safeguards', href: '#features' },
  { label: 'Phase 1 roadmap', href: '#roadmap' },
  { label: 'Contact operations', href: 'mailto:hello@splashz.xyz' },
];

const footerStats = [
  { label: 'phase 1 corridors', value: '8' },
  { label: 'starting fee', value: '0.80%' },
  { label: 'audit retention', value: '7 yrs' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#326273]/10 bg-[#1F4452] text-[#F6F0ED]/80">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Image src="/splash-logo.png" alt="Splash" width={44} height={44} className="h-10 w-10 rounded-lg object-contain" unoptimized />
                  <div>
                    <div className="text-2xl font-black text-white">Splash</div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F6F0ED]/45">
                      Payment operations for USD businesses
                    </div>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-[#F6F0ED]/65">
                  Send payouts, manage USD liquidity, check compliance status, and keep payment records audit-ready from one operating desk. Splash keeps the crypto infrastructure in the background so finance teams can work in familiar payment language.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#F6F0ED] px-4 text-sm font-bold text-[#1F4452] transition hover:bg-white"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:hello@splashz.xyz"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-4 text-sm font-bold text-white/80 transition hover:border-[#5C9EAD]/50 hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  Contact team
                </a>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {footerStats.map((stat) => (
                <div key={stat.label} className="rounded-md border border-white/10 bg-black/10 p-4">
                  <div className="font-mono text-2xl font-bold text-[#F6F0ED]">{stat.value}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F6F0ED]/45">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#E39774]/25 bg-[#E39774]/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E39774]/30 bg-[#E39774]/15">
                <ShieldCheck className="h-5 w-5 text-[#E39774]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Built for controlled rollout</div>
                <div className="text-xs text-[#F6F0ED]/50">Phase 1 testnet and operator validation</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#F6F0ED]/65">
              Businesses should not need to become crypto users to get faster payout and treasury operations. Splash keeps Sui, Walrus, and MemWal in the infrastructure layer while the product stays familiar to finance teams.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SuiLogo size={28} className="text-[#F6F0ED]" />
              <WalrusLogo size={28} />
              <MemWalLogo size={28} />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-3">
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Use cases" links={useCaseLinks} />
          <FooterColumn title="Trust and operations" links={trustLinks} />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#F6F0ED]/40 md:flex-row md:items-center md:justify-between">
          <div>
            &copy; 2026 Splash Finance. Not a deposit-taking institution. Regulatory and banking partner relationships subject to jurisdictional approval.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>splashz.xyz</span>
            <a href="mailto:hello@splashz.xyz" className="transition hover:text-white/70">hello@splashz.xyz</a>
            <a href="https://github.com/mega-ideas/latest-splash" className="transition hover:text-white/70" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/50">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            {href.startsWith('/') ? (
              <Link href={href} className="text-sm text-[#F6F0ED]/70 transition hover:text-white">
                {label}
              </Link>
            ) : (
              <a href={href} className="text-sm text-[#F6F0ED]/70 transition hover:text-white">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
