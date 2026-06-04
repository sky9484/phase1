'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, FileCheck2, KeyRound, Landmark, LockKeyhole, ShieldCheck, Database, type LucideIcon } from 'lucide-react';
import { WalrusLogo, SuiLogo, SumsubLogo } from '@/components/BrandLogos';
import AmbientBackground from '@/components/AmbientBackground';

const controls: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'KYB case management', desc: 'Business registration, ownership structure, and risk scoring via Sumsub before any funds move.', icon: BadgeCheck },
  { title: 'AML & sanctions screening', desc: 'Corridor-level policy checks on counterparties, purpose codes, and high-risk transaction patterns.', icon: ShieldCheck },
  { title: 'Walrus audit anchoring', desc: 'Every day\'s events are Merkle-hashed, Seal-encrypted, stored on Walrus, and anchored as frozen AuditAnchor on Sui.', icon: Database },
  { title: 'Secure PTB authorization', desc: 'Role-aware access controls, 2FA signing flows, and operator-grade wallet safeguards for every settlement.', icon: LockKeyhole },
];

const metrics = [
  { value: '24/7', label: 'AML screening' },
  { value: '< 1s', label: 'policy decisioning' },
  { value: '7 yr', label: 'Walrus retention' },
];

export default function ComplianceSection() {
  return (
    <section id="compliance" className="relative overflow-hidden bg-white/45 py-16">
      <AmbientBackground variant="indigo" sheen />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container relative mx-auto grid items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A8895]">
            <Landmark className="h-3.5 w-3.5" />
            Compliance layer
          </div>
          <h2 className="max-w-2xl text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
            Bank-grade compliance. Chain-anchored audit.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#326273]/75">
            Splash combines Sumsub KYB, AML screening, on-chain receipts, and Walrus audit anchoring so finance teams can move capital without losing governance. Every event is verifiable by regulators without trusting Splash&apos;s servers.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/80 p-4 shadow-sm">
                <div className="font-mono text-2xl font-semibold text-[#C97A56]">{metric.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6E8A95]">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#6E8A95]">
              <SumsubLogo size={24} />
              <span>KYB by Sumsub</span>
            </div>
            <div className="h-3 w-px bg-[#326273]/20" />
            <div className="flex items-center gap-2 text-xs text-[#6E8A95]">
              <WalrusLogo size={24} />
              <span>Audit on Walrus</span>
            </div>
            <div className="h-3 w-px bg-[#326273]/20" />
            <div className="flex items-center gap-2 text-xs text-[#6E8A95]">
              <SuiLogo size={24} />
              <span>Anchored on Sui</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {controls.map(({ title, desc, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.5 }}
              className="group rounded-3xl border border-[#326273]/10 bg-white/75 p-6 shadow-lg shadow-[#326273]/5 backdrop-blur transition-all hover:-translate-y-1 hover:border-[#5C9EAD]/30 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#326273] text-[#F6F0ED] shadow-lg shadow-[#326273]/20 transition-colors group-hover:bg-[#5C9EAD]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1F4452]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#326273]/70">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-[#326273]/10 bg-[#1F4452] p-7 text-[#F6F0ED] shadow-2xl shadow-[#326273]/15 lg:col-span-2"
        >
          <div className="grid gap-7 lg:grid-cols-[1.05fr_1.15fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#E39774]">
                <KeyRound className="h-3.5 w-3.5" />
                Audit-ready · Regulator-verifiable
              </div>
              <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
                Export signed receipts, Walrus blob IDs, Merkle proofs, and KYB records from one operating layer. Any auditor can verify the entire trail against the AuditAnchor on Sui — without trusting our servers.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: 'KYB', sublabel: 'Sumsub' },
                  { label: 'AML', sublabel: 'KYT screening' },
                  { label: 'Walrus', sublabel: 'Daily anchor' },
                ].map(({ label, sublabel }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                    <div className="font-mono text-sm font-bold text-white">{label}</div>
                    <div className="mt-1 text-[10px] text-white/45">{sublabel}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <a
                  href="#compliance"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E39774] px-4 py-2 font-semibold text-white shadow-lg shadow-[#E39774]/25 transition-all hover:-translate-y-0.5 hover:bg-[#C97A56]"
                >
                  <FileCheck2 className="h-3.5 w-3.5" />
                  Export audit pack
                </a>
                <a
                  href="#compliance"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-medium text-white/80 transition-all hover:bg-white/10"
                >
                  Verify on Sui →
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#E39774]">
                  Audit pack manifest
                </div>
                <div className="font-mono text-[10px] text-white/40">2026-05-29 · 04:00 UTC</div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/[0.04] text-left text-[10px] uppercase tracking-widest text-white/45">
                      <th className="px-3 py-2 font-semibold">Artifact</th>
                      <th className="px-3 py-2 font-semibold">Source</th>
                      <th className="px-3 py-2 text-right font-semibold">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { artifact: 'KYB records', source: 'Sumsub API', state: 'Signed' },
                      { artifact: 'AML screening logs', source: 'KYT engine', state: 'Hashed' },
                      { artifact: 'PaymentReceipt set', source: 'Sui object pool', state: 'Frozen' },
                      { artifact: 'Daily Merkle root', source: 'Splash batcher', state: 'Anchored' },
                      { artifact: 'Encrypted blob', source: 'Walrus storage', state: 'Pinned 7y' },
                      { artifact: 'AuditAnchor object', source: 'Sui mainnet', state: 'Immutable' },
                    ].map(({ artifact, source, state }) => (
                      <tr key={artifact} className="border-t border-white/[0.06]">
                        <td className="px-3 py-2 font-semibold text-white">{artifact}</td>
                        <td className="px-3 py-2 font-mono text-white/55">{source}</td>
                        <td className="px-3 py-2 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-green-300">
                            <BadgeCheck className="h-3 w-3" />
                            {state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-white/55">
                <span>Anchor tx</span>
                <span className="text-[#5C9EAD]">0xa7c2…f91d</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
